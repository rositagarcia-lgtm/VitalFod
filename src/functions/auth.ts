import { createServerFn } from "@tanstack/react-start";
import bcrypt from "bcryptjs";
import QRCode from "qrcode";
import { z } from "zod";
import { db } from "@/server/db";
import { getAppSession, getPendingUserId, getSessionUser, requireUser } from "@/server/session";
import { validate } from "@/server/validation";
import { isCloudinaryConfigured } from "@/server/cloudinary";
import { logActivity } from "@/server/activity";
import { generateSecret, otpauthUrl, verifyCode } from "@/server/totp";
import { open, seal } from "@/server/secretbox";

const MAX_INTENTOS = 5;
const BLOQUEO_MINUTOS = 15;

// Se compara contra un hash de relleno aunque el correo no exista,
// para no revelar qué cuentas existen por el tiempo de respuesta
let dummyHash: Promise<string> | undefined;
const getDummyHash = () => (dummyHash ??= bcrypt.hash("vital-foods", 12));

type AuthRow = {
  id: number;
  nombre: string;
  email: string;
  password_hash: string;
  activo: boolean;
  totp_activo: boolean;
  totp_secreto: string | null;
  totp_ultimo_paso: string | null;
  bloqueado: boolean;
};

async function findAuthUser(where: { email: string } | { id: number }) {
  const sql = db();
  const rows =
    "email" in where
      ? await sql`
          SELECT id, nombre, email, password_hash, activo, totp_activo, totp_secreto, totp_ultimo_paso,
                 COALESCE(bloqueado_hasta > CURRENT_TIMESTAMP, FALSE) AS bloqueado
          FROM usuarios WHERE lower(email) = ${where.email}`
      : await sql`
          SELECT id, nombre, email, password_hash, activo, totp_activo, totp_secreto, totp_ultimo_paso,
                 COALESCE(bloqueado_hasta > CURRENT_TIMESTAMP, FALSE) AS bloqueado
          FROM usuarios WHERE id = ${where.id}`;
  return rows[0] as AuthRow | undefined;
}

const LOCKED_MESSAGE = `Por seguridad, la cuenta se bloqueó durante ${BLOQUEO_MINUTOS} minutos tras varios intentos fallidos.`;

/** Suma un intento fallido y bloquea la cuenta temporalmente al llegar al máximo. */
async function registerFailure(userId: number) {
  await db()`
    UPDATE usuarios
    SET bloqueado_hasta = CASE
          WHEN intentos_fallidos + 1 >= ${MAX_INTENTOS}
          THEN CURRENT_TIMESTAMP + make_interval(mins => ${BLOQUEO_MINUTOS})
          ELSE bloqueado_hasta END,
        intentos_fallidos = CASE WHEN intentos_fallidos + 1 >= ${MAX_INTENTOS} THEN 0 ELSE intentos_fallidos + 1 END
    WHERE id = ${userId}
  `;
}

export const getCurrentUser = createServerFn({ method: "GET" }).handler(() => getSessionUser());

export const getPanelSession = createServerFn({ method: "GET" }).handler(async () => ({
  user: await getSessionUser(),
  cloudinary: isCloudinaryConfigured(),
}));

export const login = createServerFn({ method: "POST" })
  .validator(
    validate(
      z.object({
        email: z.string().trim().toLowerCase().email("Ingresa un correo válido."),
        password: z.string().min(1, "Ingresa tu contraseña."),
      }),
    ),
  )
  .handler(async ({ data }) => {
    const user = await findAuthUser({ email: data.email });
    const valid = await bcrypt.compare(
      data.password,
      user?.password_hash ?? (await getDummyHash()),
    );

    if (user?.bloqueado) throw new Error(LOCKED_MESSAGE);
    if (!user || !valid || !user.activo) {
      if (user && !valid) await registerFailure(user.id);
      throw new Error("Correo o contraseña incorrectos.");
    }

    // La contraseña es solo el primer paso: la sesión se completa con el código de la app
    const session = await getAppSession();
    await session.clear();
    await session.update({ pendingUserId: user.id, pendingAt: Date.now() });
    return { next: user.totp_activo ? ("verificar" as const) : ("configurar" as const) };
  });

/** Estado del segundo paso para la pantalla de verificación. */
export const getMfaState = createServerFn({ method: "GET" }).handler(async () => {
  const userId = await getPendingUserId();
  if (!userId) return null;
  const user = await findAuthUser({ id: userId });
  if (!user || !user.activo) return null;
  return {
    modo: user.totp_activo ? ("verificar" as const) : ("configurar" as const),
    email: user.email,
  };
});

/** Genera el secreto y el código QR para vincular la app de autenticación. */
export const startMfaSetup = createServerFn({ method: "POST" }).handler(async () => {
  const userId = await getPendingUserId();
  if (!userId) throw new Error("Tu sesión expiró. Vuelve a iniciar sesión.");
  const user = await findAuthUser({ id: userId });
  if (!user || user.totp_activo)
    throw new Error("La verificación en dos pasos ya está configurada.");

  const session = await getAppSession();
  let secret = session.data.setupSecret ? await open(session.data.setupSecret) : null;
  if (!secret) {
    secret = generateSecret();
    await session.update({ ...session.data, setupSecret: await seal(secret) });
  }
  const qr = await QRCode.toString(otpauthUrl(secret, user.email), {
    type: "svg",
    margin: 1,
    color: { dark: "#1E2A1FFF", light: "#FFFFFFFF" },
  });
  return { secret, qr };
});

export const verifyMfa = createServerFn({ method: "POST" })
  .validator(
    validate(z.object({ code: z.string().trim().min(6, "Ingresa el código de 6 dígitos.") })),
  )
  .handler(async ({ data }) => {
    const userId = await getPendingUserId();
    if (!userId) throw new Error("Tu sesión expiró. Vuelve a iniciar sesión.");
    const user = await findAuthUser({ id: userId });
    if (!user || !user.activo) throw new Error("Tu sesión expiró. Vuelve a iniciar sesión.");
    if (user.bloqueado) throw new Error(LOCKED_MESSAGE);

    const session = await getAppSession();
    const configurando = !user.totp_activo;
    const sealed = configurando ? session.data.setupSecret : user.totp_secreto;
    if (!sealed) throw new Error("Vuelve a iniciar sesión para configurar la verificación.");
    const secret = await open(sealed);
    const lastStep = user.totp_ultimo_paso === null ? null : Number(user.totp_ultimo_paso);

    const step = await verifyCode(secret, data.code, lastStep);
    if (step === null) {
      await registerFailure(user.id);
      throw new Error(
        "El código no es correcto o ya expiró. Revisa la hora de tu celular e inténtalo de nuevo.",
      );
    }

    await db()`
      UPDATE usuarios
      SET totp_activo = TRUE, totp_secreto = ${sealed}, totp_ultimo_paso = ${step},
          intentos_fallidos = 0, bloqueado_hasta = NULL, ultimo_acceso = CURRENT_TIMESTAMP
      WHERE id = ${user.id}
    `;
    if (configurando) {
      await logActivity(user, "seguridad", "Mi cuenta", "Activó la verificación en dos pasos");
    }
    await session.clear();
    await session.update({ userId: user.id });
    return { ok: true };
  });

export const logout = createServerFn({ method: "POST" }).handler(async () => {
  const session = await getAppSession();
  await session.clear();
  return { ok: true };
});

export const changePassword = createServerFn({ method: "POST" })
  .validator(
    validate(
      z
        .object({
          actual: z.string().min(1, "Ingresa tu contraseña actual."),
          nueva: z.string().min(10, "La nueva contraseña debe tener al menos 10 caracteres."),
          confirmacion: z.string(),
        })
        .refine((v) => v.nueva === v.confirmacion, { message: "Las contraseñas no coinciden." }),
    ),
  )
  .handler(async ({ data }) => {
    const user = await requireUser();
    const rows = await db()`SELECT password_hash FROM usuarios WHERE id = ${user.id}`;
    const hash = rows[0]?.["password_hash"] as string | undefined;
    if (!hash || !(await bcrypt.compare(data.actual, hash))) {
      throw new Error("La contraseña actual no es correcta.");
    }
    const nuevoHash = await bcrypt.hash(data.nueva, 12);
    await db()`UPDATE usuarios SET password_hash = ${nuevoHash} WHERE id = ${user.id}`;
    await logActivity(user, "seguridad", "Mi cuenta", "Cambió su contraseña");
    return { ok: true };
  });
