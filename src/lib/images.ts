const CLOUDINARY_MARKER = "/image/upload/";

const isCloudinary = (url: string) =>
  url.includes("res.cloudinary.com") && url.includes(CLOUDINARY_MARKER);

/**
 * Para imágenes de Cloudinary agrega formato y calidad automáticos y limita el ancho,
 * así el navegador recibe WebP/AVIF del tamaño justo. Las rutas locales se devuelven igual.
 */
export function optimizedImage(url: string | null | undefined, width: number): string | undefined {
  if (!url) return undefined;
  if (!isCloudinary(url)) return url;
  return url.replace(CLOUDINARY_MARKER, `${CLOUDINARY_MARKER}f_auto,q_auto,c_limit,w_${width}/`);
}

/** srcset con varios anchos para que cada pantalla descargue solo lo que necesita. */
export function imageSrcSet(url: string | null | undefined, widths: number[]): string | undefined {
  if (!url || !isCloudinary(url)) return undefined;
  return widths.map((w) => `${optimizedImage(url, w)} ${w}w`).join(", ");
}

/** Montos siempre en soles con dos decimales, p. ej. "S/ 24.90". */
export function formatPrice(value: number): string {
  return "S/ " + value.toFixed(2);
}

/** Postgres devuelve "2026-01-10 09:00:00.123+00"; se normaliza a ISO 8601. */
export function parseDbDate(value: string): Date {
  return new Date(value.replace(" ", "T").replace(/([+-]\d{2})$/, "$1:00"));
}
