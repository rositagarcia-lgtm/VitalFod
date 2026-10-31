// useSession es la sesión sellada de h3, no un hook de React
import { useSession as openSession } from "@tanstack/react-start/server";
import { db } from "./db";
import { canAccess } from "@/lib/permissions";
import type { Modulo, SessionUser } from "@/lib/types";

type SessionData = {
  /** Usuario con sesión completa (contraseña + verificación en dos pasos). */
  userId?: number;
  /** Usuario que pasó la contraseña y aún debe completar la verificación en dos pasos. */
  pendingUserId?: number;
  pendingAt?: number;
  /** Secreto propuesto mientras el usuario configura su app de autenticación (cifrado). */
  setupSecret?: string;
};

/** Minutos disponibles para ingresar el código después de la contraseña. */
const PENDING_TTL_MS = 10 * 60 * 1000;

export function getAppSession() {
  const password = process.env["SESSION_SECRET"];
  if (!password || password.length < 32) {
    throw new Error("SESSION_SECRET debe tener al menos 32 caracteres");
  }
  return openSession<SessionData>({
    password,
    name: "vf_session",
    maxAge: 60 * 60 * 8,
    cookie: {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env["NODE_ENV"] === "production",
      path: "/",
    },
  });
}

export async function getSessionUser(): Promise<SessionUser | null> {
  const session = await getAppSession();
  const userId = session.data.userId;
  if (!userId) return null;

  const rows = await db()`
    SELECT id, nombre, email, rol, permisos FROM usuarios
    WHERE id = ${userId} AND activo = TRUE AND totp_activo = TRUE
  `;
  const user = rows[0] as SessionUser | undefined;
  if (!user) {
    await session.clear();
    return null;
  }
  return user;
}

/** Usuario que ingresó la contraseña y está a mitad de la verificación en dos pasos. */
export async function getPendingUserId(): Promise<number | null> {
  const session = await getAppSession();
  const { pendingUserId, pendingAt } = session.data;
  if (!pendingUserId || !pendingAt || Date.now() - pendingAt > PENDING_TTL_MS) return null;
  return pendingUserId;
}

export async function requireUser(): Promise<SessionUser> {
  const user = await getSessionUser();
  if (!user) throw new Error("Tu sesión expiró. Vuelve a iniciar sesión.");
  return user;
}

export async function requireAdmin(): Promise<SessionUser> {
  const user = await requireUser();
  if (user.rol !== "admin") throw new Error("No tienes permisos para esta acción.");
  return user;
}

export async function requireModule(modulo: Modulo): Promise<SessionUser> {
  const user = await requireUser();
  if (!canAccess(user, modulo)) throw new Error("No tienes permiso para modificar esta sección.");
  return user;
}
