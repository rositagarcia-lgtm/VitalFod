// useSession es la sesión sellada de h3, no un hook de React
import { useSession as openSession } from "@tanstack/react-start/server";
import { db } from "./db";
import type { SessionUser } from "@/lib/types";

type SessionData = { userId?: number };

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
    SELECT id, nombre, email, rol FROM usuarios WHERE id = ${userId} AND activo = TRUE
  `;
  const user = rows[0] as SessionUser | undefined;
  if (!user) {
    await session.clear();
    return null;
  }
  return user;
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
