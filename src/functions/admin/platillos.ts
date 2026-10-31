import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { db, dbErrorMessage } from "@/server/db";
import { destroyImage } from "@/server/cloudinary";
import { requireModule } from "@/server/session";
import { validate } from "@/server/validation";
import { imageFields } from "@/server/schemas";
import { logActivity } from "@/server/activity";
import type { Platillo } from "@/lib/types";

const platilloSchema = z
  .object({
    id: z.number().int().positive().optional(),
    categoria_id: z
      .number({ message: "Elige una categoría." })
      .int()
      .positive("Elige una categoría."),
    nombre: z
      .string()
      .trim()
      .min(2, "El nombre es obligatorio.")
      .max(100, "Máximo 100 caracteres."),
    descripcion: z.string().trim().max(1000, "Máximo 1000 caracteres.").nullable(),
    precio: z
      .number({ message: "Ingresa un precio válido." })
      .min(0, "El precio no puede ser negativo.")
      .max(99999, "Precio demasiado alto."),
    precio_oferta: z.number({ message: "Ingresa un precio de oferta válido." }).min(0).nullable(),
    disponible: z.boolean(),
    destacado: z.boolean(),
    orden: z.number().int().min(0).max(999),
    ...imageFields,
  })
  .refine((v) => v.precio_oferta === null || v.precio_oferta < v.precio, {
    message: "El precio de oferta debe ser menor que el precio normal.",
  });

export type PlatilloInput = z.infer<typeof platilloSchema>;

const money = (n: number) => `S/ ${n.toFixed(2)}`;

export const listPlatillos = createServerFn({ method: "GET" }).handler(async () => {
  await requireModule("platillos");
  const rows = await db()`
    SELECT p.id, p.categoria_id, c.nombre AS categoria, p.nombre, p.descripcion,
           p.precio::float8 AS precio, p.precio_oferta::float8 AS precio_oferta,
           p.imagen_url, p.imagen_public_id, p.disponible, p.destacado, p.orden,
           p.precio_actualizado_at::text,
           (p.precio_actualizado_at > p.created_at + interval '1 minute' AND p.precio_actualizado_at > CURRENT_TIMESTAMP - interval '7 days') AS precio_reciente
    FROM platillos p
    JOIN categorias c ON c.id = p.categoria_id
    ORDER BY c.orden, p.orden, p.nombre
  `;
  return rows as Platillo[];
});

export const savePlatillo = createServerFn({ method: "POST" })
  .validator(validate(platilloSchema))
  .handler(async ({ data }) => {
    const user = await requireModule("platillos");
    const sql = db();
    const descripcion = data.descripcion || null;
    try {
      if (data.id) {
        const prev = await sql`
          SELECT imagen_public_id, precio::float8 AS precio, precio_oferta::float8 AS precio_oferta
          FROM platillos WHERE id = ${data.id}
        `;
        await sql`
          UPDATE platillos
          SET categoria_id = ${data.categoria_id}, nombre = ${data.nombre}, descripcion = ${descripcion},
              precio = ${data.precio}, precio_oferta = ${data.precio_oferta}, disponible = ${data.disponible},
              destacado = ${data.destacado}, orden = ${data.orden},
              imagen_url = ${data.imagen_url}, imagen_public_id = ${data.imagen_public_id}
          WHERE id = ${data.id}
        `;
        const old = prev[0] ?? {};
        const oldId = old["imagen_public_id"] as string | null | undefined;
        if (oldId && oldId !== data.imagen_public_id) await destroyImage(oldId);

        const cambios: string[] = [];
        if (old["precio"] !== data.precio)
          cambios.push(`precio ${money(Number(old["precio"]))} → ${money(data.precio)}`);
        if ((old["precio_oferta"] ?? null) !== data.precio_oferta) {
          cambios.push(
            data.precio_oferta === null ? "quitó la oferta" : `oferta ${money(data.precio_oferta)}`,
          );
        }
        await logActivity(
          user,
          "editar",
          "Platillos",
          `${data.nombre}${cambios.length ? ` (${cambios.join(", ")})` : ""}`,
        );
      } else {
        await sql`
          INSERT INTO platillos (categoria_id, nombre, descripcion, precio, precio_oferta, disponible,
                                 destacado, orden, imagen_url, imagen_public_id)
          VALUES (${data.categoria_id}, ${data.nombre}, ${descripcion}, ${data.precio}, ${data.precio_oferta},
                  ${data.disponible}, ${data.destacado}, ${data.orden}, ${data.imagen_url}, ${data.imagen_public_id})
        `;
        await logActivity(user, "crear", "Platillos", `${data.nombre} (${money(data.precio)})`);
      }
    } catch (error) {
      throw new Error(dbErrorMessage(error));
    }
    return { ok: true };
  });

export const togglePlatillo = createServerFn({ method: "POST" })
  .validator(validate(z.object({ id: z.number().int().positive(), disponible: z.boolean() })))
  .handler(async ({ data }) => {
    const user = await requireModule("platillos");
    const rows = await db()`
      UPDATE platillos SET disponible = ${data.disponible} WHERE id = ${data.id} RETURNING nombre
    `;
    await logActivity(
      user,
      "editar",
      "Platillos",
      `${String(rows[0]?.["nombre"] ?? "")} ${data.disponible ? "disponible" : "no disponible"}`,
    );
    return { ok: true };
  });

export const deletePlatillo = createServerFn({ method: "POST" })
  .validator(validate(z.object({ id: z.number().int().positive() })))
  .handler(async ({ data }) => {
    const user = await requireModule("platillos");
    const rows = await db()`
      DELETE FROM platillos WHERE id = ${data.id} RETURNING nombre, imagen_public_id
    `;
    await destroyImage(rows[0]?.["imagen_public_id"] as string | null | undefined);
    await logActivity(user, "eliminar", "Platillos", String(rows[0]?.["nombre"] ?? ""));
    return { ok: true };
  });
