import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { db, dbErrorMessage } from "@/server/db";
import { destroyImage } from "@/server/cloudinary";
import { requireUser } from "@/server/session";
import { validate } from "@/server/validation";
import { imageFields } from "@/server/schemas";
import type { Platillo } from "@/lib/types";

const platilloSchema = z.object({
  id: z.number().int().positive().optional(),
  categoria_id: z
    .number({ message: "Elige una categoría." })
    .int()
    .positive("Elige una categoría."),
  nombre: z.string().trim().min(2, "El nombre es obligatorio.").max(100, "Máximo 100 caracteres."),
  descripcion: z.string().trim().max(1000, "Máximo 1000 caracteres.").nullable(),
  precio: z
    .number({ message: "Ingresa un precio válido." })
    .min(0, "El precio no puede ser negativo.")
    .max(99999, "Precio demasiado alto."),
  disponible: z.boolean(),
  orden: z.number().int().min(0).max(999),
  ...imageFields,
});

export type PlatilloInput = z.infer<typeof platilloSchema>;

export const listPlatillos = createServerFn({ method: "GET" }).handler(async () => {
  await requireUser();
  const rows = await db()`
    SELECT p.id, p.categoria_id, c.nombre AS categoria, p.nombre, p.descripcion,
           p.precio::float8 AS precio, p.imagen_url, p.imagen_public_id, p.disponible, p.orden
    FROM platillos p
    JOIN categorias c ON c.id = p.categoria_id
    ORDER BY c.orden, p.orden, p.nombre
  `;
  return rows as Platillo[];
});

export const savePlatillo = createServerFn({ method: "POST" })
  .validator(validate(platilloSchema))
  .handler(async ({ data }) => {
    await requireUser();
    const sql = db();
    const descripcion = data.descripcion || null;
    try {
      if (data.id) {
        const prev = await sql`SELECT imagen_public_id FROM platillos WHERE id = ${data.id}`;
        await sql`
          UPDATE platillos
          SET categoria_id = ${data.categoria_id}, nombre = ${data.nombre}, descripcion = ${descripcion},
              precio = ${data.precio}, disponible = ${data.disponible}, orden = ${data.orden},
              imagen_url = ${data.imagen_url}, imagen_public_id = ${data.imagen_public_id}
          WHERE id = ${data.id}
        `;
        const oldId = prev[0]?.["imagen_public_id"] as string | null | undefined;
        if (oldId && oldId !== data.imagen_public_id) await destroyImage(oldId);
      } else {
        await sql`
          INSERT INTO platillos (categoria_id, nombre, descripcion, precio, disponible, orden, imagen_url, imagen_public_id)
          VALUES (${data.categoria_id}, ${data.nombre}, ${descripcion}, ${data.precio}, ${data.disponible},
                  ${data.orden}, ${data.imagen_url}, ${data.imagen_public_id})
        `;
      }
    } catch (error) {
      throw new Error(dbErrorMessage(error));
    }
    return { ok: true };
  });

export const togglePlatillo = createServerFn({ method: "POST" })
  .validator(validate(z.object({ id: z.number().int().positive(), disponible: z.boolean() })))
  .handler(async ({ data }) => {
    await requireUser();
    await db()`UPDATE platillos SET disponible = ${data.disponible} WHERE id = ${data.id}`;
    return { ok: true };
  });

export const deletePlatillo = createServerFn({ method: "POST" })
  .validator(validate(z.object({ id: z.number().int().positive() })))
  .handler(async ({ data }) => {
    await requireUser();
    const rows = await db()`DELETE FROM platillos WHERE id = ${data.id} RETURNING imagen_public_id`;
    await destroyImage(rows[0]?.["imagen_public_id"] as string | null | undefined);
    return { ok: true };
  });
