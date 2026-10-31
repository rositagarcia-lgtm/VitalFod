import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { db, dbErrorMessage } from "@/server/db";
import { destroyImage } from "@/server/cloudinary";
import { requireModule } from "@/server/session";
import { logActivity } from "@/server/activity";
import { validate } from "@/server/validation";
import { imageFields, optionalUrl } from "@/server/schemas";
import type { Promocion } from "@/lib/types";

const promocionSchema = z.object({
  id: z.number().int().positive().optional(),
  etiqueta: z.string().trim().min(1, "La etiqueta es obligatoria.").max(60),
  titulo: z.string().trim().min(2, "El título es obligatorio.").max(120),
  descripcion: z.string().trim().min(2, "La descripción es obligatoria.").max(300),
  descripcion_secundaria: z.string().trim().max(300).nullable(),
  sticker: z.string().trim().max(20).nullable(),
  texto_boton: z.string().trim().min(2, "El texto del botón es obligatorio.").max(60),
  enlace_boton: optionalUrl,
  variante: z.enum(["launch", "practicality", "organization"]),
  caracteristicas: z.array(z.string().trim().min(1).max(40)).max(6, "Máximo 6 características."),
  orden: z.number().int().min(0).max(999),
  activo: z.boolean(),
  ...imageFields,
});

export type PromocionInput = z.infer<typeof promocionSchema>;

export const listPromociones = createServerFn({ method: "GET" }).handler(async () => {
  await requireModule("promociones");
  const rows = await db()`
    SELECT id, etiqueta, titulo, descripcion, descripcion_secundaria, sticker, texto_boton,
           enlace_boton, imagen_url, imagen_public_id, variante, caracteristicas, orden, activo
    FROM promociones ORDER BY orden, id
  `;
  return rows as Promocion[];
});

export const savePromocion = createServerFn({ method: "POST" })
  .validator(validate(promocionSchema))
  .handler(async ({ data }) => {
    const user = await requireModule("promociones");
    const sql = db();
    const secundaria = data.descripcion_secundaria || null;
    const sticker = data.sticker || null;
    const enlace = data.enlace_boton || "/menu";
    try {
      if (data.id) {
        const prev = await sql`SELECT imagen_public_id FROM promociones WHERE id = ${data.id}`;
        await sql`
          UPDATE promociones
          SET etiqueta = ${data.etiqueta}, titulo = ${data.titulo}, descripcion = ${data.descripcion},
              descripcion_secundaria = ${secundaria}, sticker = ${sticker}, texto_boton = ${data.texto_boton},
              enlace_boton = ${enlace}, variante = ${data.variante}, caracteristicas = ${data.caracteristicas},
              orden = ${data.orden}, activo = ${data.activo},
              imagen_url = ${data.imagen_url}, imagen_public_id = ${data.imagen_public_id}
          WHERE id = ${data.id}
        `;
        const oldId = prev[0]?.["imagen_public_id"] as string | null | undefined;
        if (oldId && oldId !== data.imagen_public_id) await destroyImage(oldId);
      } else {
        await sql`
          INSERT INTO promociones (etiqueta, titulo, descripcion, descripcion_secundaria, sticker, texto_boton,
                                   enlace_boton, variante, caracteristicas, orden, activo, imagen_url, imagen_public_id)
          VALUES (${data.etiqueta}, ${data.titulo}, ${data.descripcion}, ${secundaria}, ${sticker}, ${data.texto_boton},
                  ${enlace}, ${data.variante}, ${data.caracteristicas}, ${data.orden}, ${data.activo},
                  ${data.imagen_url}, ${data.imagen_public_id})
        `;
      }
    } catch (error) {
      throw new Error(dbErrorMessage(error));
    }
    await logActivity(user, data.id ? "editar" : "crear", "Promociones", data.titulo);
    return { ok: true };
  });

export const deletePromocion = createServerFn({ method: "POST" })
  .validator(validate(z.object({ id: z.number().int().positive() })))
  .handler(async ({ data }) => {
    const user = await requireModule("promociones");
    const rows =
      await db()`DELETE FROM promociones WHERE id = ${data.id} RETURNING titulo, imagen_public_id`;
    const deleted = rows[0];
    await destroyImage(rows[0]?.["imagen_public_id"] as string | null | undefined);
    await logActivity(user, "eliminar", "Promociones", String(deleted?.["titulo"] ?? ""));
    return { ok: true };
  });
