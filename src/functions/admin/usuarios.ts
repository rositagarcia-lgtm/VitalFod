import { createServerFn } from "@tanstack/react-start";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { db, dbErrorMessage } from "@/server/db";
import { requireAdmin } from "@/server/session";
import { validate } from "@/server/validation";
import type { Usuario } from "@/lib/types";

const usuarioSchema = z.object({
  id: z.number().int().positive().optional(),
  nombre: z.string().trim().min(2, "El nombre es obligatorio.").max(100),
  email: z.string().trim().toLowerCase().email("Ingresa un correo válido.").max(150),
  rol: z.enum(["admin", "editor"]),
  activo: z.boolean(),
  // Obligatoria al crear; al editar, vacía significa "no cambiar"
  password: z
    .string()
    .refine((v) => v === "" || v.length >= 8, "La contraseña debe tener al menos 8 caracteres."),
});

export type UsuarioInput = z.infer<typeof usuarioSchema>;

export const listUsuarios = createServerFn({ method: "GET" }).handler(async () => {
  await requireAdmin();
  const rows = await db()`
    SELECT id, nombre, email, rol, activo, ultimo_acceso::text, created_at::text
    FROM usuarios ORDER BY nombre
  `;
  return rows as Usuario[];
});

export const saveUsuario = createServerFn({ method: "POST" })
  .validator(validate(usuarioSchema))
  .handler(async ({ data }) => {
    const me = await requireAdmin();
    const sql = db();

    if (data.id === me.id && (!data.activo || data.rol !== "admin")) {
      throw new Error("No puedes desactivarte ni quitarte el rol de administrador.");
    }
    if (!data.id && !data.password) throw new Error("Define una contraseña para el nuevo usuario.");

    const hash = data.password ? await bcrypt.hash(data.password, 12) : null;
    try {
      if (data.id) {
        await sql`
          UPDATE usuarios
          SET nombre = ${data.nombre}, email = ${data.email}, rol = ${data.rol}, activo = ${data.activo},
              password_hash = COALESCE(${hash}, password_hash)
          WHERE id = ${data.id}
        `;
      } else {
        await sql`
          INSERT INTO usuarios (nombre, email, rol, activo, password_hash)
          VALUES (${data.nombre}, ${data.email}, ${data.rol}, ${data.activo}, ${hash})
        `;
      }
    } catch (error) {
      const message = dbErrorMessage(error);
      throw new Error(
        message.startsWith("Ya existe") ? "Ya existe un usuario con ese correo." : message,
      );
    }
    return { ok: true };
  });

export const deleteUsuario = createServerFn({ method: "POST" })
  .validator(validate(z.object({ id: z.number().int().positive() })))
  .handler(async ({ data }) => {
    const me = await requireAdmin();
    if (data.id === me.id) throw new Error("No puedes eliminar tu propia cuenta.");
    await db()`DELETE FROM usuarios WHERE id = ${data.id}`;
    return { ok: true };
  });
