import { createServerFn } from "@tanstack/react-start";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { db } from "@/server/db";
import { getAppSession, getSessionUser, requireUser } from "@/server/session";
import { validate } from "@/server/validation";
import { isCloudinaryConfigured } from "@/server/cloudinary";

// Se compara contra un hash de relleno aunque el correo no exista,
// para no revelar qué cuentas existen por el tiempo de respuesta
let dummyHash: Promise<string> | undefined;
const getDummyHash = () => (dummyHash ??= bcrypt.hash("vital-foods", 12));

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
    const rows = await db()`
      SELECT id, password_hash, activo FROM usuarios WHERE lower(email) = ${data.email}
    `;
    const user = rows[0] as { id: number; password_hash: string; activo: boolean } | undefined;
    const valid = await bcrypt.compare(
      data.password,
      user?.password_hash ?? (await getDummyHash()),
    );

    if (!user || !valid || !user.activo) {
      throw new Error("Correo o contraseña incorrectos.");
    }

    await db()`UPDATE usuarios SET ultimo_acceso = CURRENT_TIMESTAMP WHERE id = ${user.id}`;
    const session = await getAppSession();
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
          nueva: z.string().min(8, "La nueva contraseña debe tener al menos 8 caracteres."),
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
    return { ok: true };
  });
