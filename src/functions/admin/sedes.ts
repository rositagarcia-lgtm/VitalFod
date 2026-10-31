import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { db, dbErrorMessage } from "@/server/db";
import { requireModule } from "@/server/session";
import { logActivity } from "@/server/activity";
import { validate } from "@/server/validation";
import { optionalUrl } from "@/server/schemas";
import type { Sede } from "@/lib/types";

const sedeSchema = z.object({
  id: z.number().int().positive().optional(),
  nombre: z.string().trim().min(2, "El nombre es obligatorio.").max(80),
  direccion: z.string().trim().min(2, "La dirección es obligatoria.").max(200),
  horario: z.string().trim().min(2, "El horario es obligatorio.").max(120),
  referencia: z.string().trim().max(200).nullable(),
  mapa_url: optionalUrl,
  orden: z.number().int().min(0).max(999),
  activo: z.boolean(),
});

export type SedeInput = z.infer<typeof sedeSchema>;

export const listSedes = createServerFn({ method: "GET" }).handler(async () => {
  await requireModule("sedes");
  const rows = await db()`
    SELECT id, nombre, direccion, horario, referencia, mapa_url, orden, activo
    FROM sedes ORDER BY orden, nombre
  `;
  return rows as Sede[];
});

export const saveSede = createServerFn({ method: "POST" })
  .validator(validate(sedeSchema))
  .handler(async ({ data }) => {
    const user = await requireModule("sedes");
    const referencia = data.referencia || null;
    const mapa = data.mapa_url || null;
    try {
      if (data.id) {
        await db()`
          UPDATE sedes
          SET nombre = ${data.nombre}, direccion = ${data.direccion}, horario = ${data.horario},
              referencia = ${referencia}, mapa_url = ${mapa}, orden = ${data.orden}, activo = ${data.activo}
          WHERE id = ${data.id}
        `;
      } else {
        await db()`
          INSERT INTO sedes (nombre, direccion, horario, referencia, mapa_url, orden, activo)
          VALUES (${data.nombre}, ${data.direccion}, ${data.horario}, ${referencia}, ${mapa}, ${data.orden}, ${data.activo})
        `;
      }
    } catch (error) {
      throw new Error(dbErrorMessage(error));
    }
    await logActivity(user, data.id ? "editar" : "crear", "Sedes", data.nombre);
    return { ok: true };
  });

export const deleteSede = createServerFn({ method: "POST" })
  .validator(validate(z.object({ id: z.number().int().positive() })))
  .handler(async ({ data }) => {
    const user = await requireModule("sedes");
    const deleted = (await db()`DELETE FROM sedes WHERE id = ${data.id} RETURNING nombre`)[0];
    await logActivity(user, "eliminar", "Sedes", String(deleted?.["nombre"] ?? ""));
    return { ok: true };
  });
