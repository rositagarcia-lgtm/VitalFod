import { neon, type NeonQueryFunction } from "@neondatabase/serverless";

let client: NeonQueryFunction<false, false> | undefined;

export function db() {
  if (!client) {
    const url = process.env["DATABASE_URL"];
    if (!url) throw new Error("DATABASE_URL no está configurada");
    client = neon(url);
  }
  return client;
}

/** Convierte errores de restricciones de Postgres en mensajes legibles. */
export function dbErrorMessage(error: unknown): string {
  const code = (error as { code?: string } | null)?.code;
  if (code === "23505") return "Ya existe un registro con ese nombre.";
  if (code === "23503" || code === "23001")
    return "No se puede eliminar porque tiene registros asociados.";
  if (code === "23514") return "Algún valor no es válido.";
  return error instanceof Error ? error.message : "Error en la base de datos.";
}
