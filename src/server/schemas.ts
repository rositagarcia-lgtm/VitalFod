import { z } from "zod";

const imageUrl = z
  .string()
  .trim()
  .max(500)
  .refine((v) => v.startsWith("/") || v.startsWith("https://"), "La imagen debe ser una URL https.")
  .nullable();

export const imageFields = {
  imagen_url: imageUrl,
  imagen_public_id: z.string().max(255).nullable(),
};

export const optionalUrl = z
  .string()
  .trim()
  .max(500)
  .refine(
    (v) =>
      v === "" ||
      v.startsWith("https://") ||
      v.startsWith("http://") ||
      v.startsWith("#") ||
      v.startsWith("/"),
    "Ingresa un enlace válido.",
  );
