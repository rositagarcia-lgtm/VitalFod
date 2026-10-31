import { db } from "./db";
import type { Actividad, SessionUser } from "@/lib/types";

/** Registra un cambio hecho desde el panel. Un fallo aquí nunca debe impedir la operación. */
export async function logActivity(
  user: Pick<SessionUser, "id" | "nombre">,
  accion: Actividad["accion"],
  modulo: string,
  detalle: string,
) {
  try {
    await db()`
      INSERT INTO actividad (usuario_id, usuario, accion, modulo, detalle)
      VALUES (${user.id}, ${user.nombre}, ${accion}, ${modulo}, ${detalle.slice(0, 300)})
    `;
  } catch (error) {
    console.error("No se pudo registrar la actividad", error);
  }
}
