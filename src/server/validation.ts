import type { ZodType, ZodTypeDef } from "zod";

/** Validador para server functions que devuelve el primer mensaje de error legible. */
export function validate<T>(schema: ZodType<T, ZodTypeDef, unknown>) {
  return (data: unknown): T => {
    const result = schema.safeParse(data);
    if (!result.success) {
      throw new Error(result.error.issues[0]?.message ?? "Datos no válidos.");
    }
    return result.data;
  };
}
