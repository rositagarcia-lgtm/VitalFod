import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { db, dbErrorMessage } from "@/server/db";
import { requireUser } from "@/server/session";
import { validate } from "@/server/validation";
import type { Categoria } from "@/lib/types";

const categoriaSchema = z.object({
  id: z.number().int().positive().optional(),
  nombre: z.string().trim().min(2, "El nombre es obligatorio.").max(50, "Máximo 50 caracteres."),
  descripcion: z.string().trim().max(150, "Máximo 150 caracteres.").nullable(),
  orden: z.number().int().min(0).max(999),
  activo: z.boolean(),
});

export type CategoriaInput = z.infer<typeof categoriaSchema>;

export const listCategorias = createServerFn({ method: "GET" }).handler(async () => {
  await requireUser();
  const rows = await db()`
    SELECT c.id, c.nombre, c.descripcion, c.orden, c.activo,
           (SELECT count(*)::int FROM platillos p WHERE p.categoria_id = c.id) AS total_platillos
    FROM categorias c
    ORDER BY c.orden, c.nombre
  `;
  return rows as Categoria[];
});

export const saveCategoria = createServerFn({ method: "POST" })
  .validator(validate(categoriaSchema))
  .handler(async ({ data }) => {
    await requireUser();
    const descripcion = data.descripcion || null;
    try {
      if (data.id) {
        await db()`
          UPDATE categorias
          SET nombre = ${data.nombre}, descripcion = ${descripcion}, orden = ${data.orden}, activo = ${data.activo}
          WHERE id = ${data.id}
        `;
      } else {
        await db()`
          INSERT INTO categorias (nombre, descripcion, orden, activo)
          VALUES (${data.nombre}, ${descripcion}, ${data.orden}, ${data.activo})
        `;
      }
    } catch (error) {
      throw new Error(dbErrorMessage(error));
    }
    return { ok: true };
  });

export const deleteCategoria = createServerFn({ method: "POST" })
  .validator(validate(z.object({ id: z.number().int().positive() })))
  .handler(async ({ data }) => {
    await requireUser();
    try {
      await db()`DELETE FROM categorias WHERE id = ${data.id}`;
    } catch (error) {
      const message = dbErrorMessage(error);
      throw new Error(
        message.startsWith("No se puede")
          ? "La categoría tiene platillos. Muévelos o elimínalos primero."
          : message,
      );
    }
    return { ok: true };
  });
