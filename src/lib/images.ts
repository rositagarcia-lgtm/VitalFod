/**
 * Para imágenes de Cloudinary agrega formato y calidad automáticos y limita el ancho,
 * así el navegador recibe WebP/AVIF del tamaño justo. Las rutas locales se devuelven igual.
 */
export function optimizedImage(url: string | null | undefined, width: number): string | undefined {
  if (!url) return undefined;
  const marker = "/image/upload/";
  if (!url.includes("res.cloudinary.com") || !url.includes(marker)) return url;
  return url.replace(marker, `${marker}f_auto,q_auto,c_limit,w_${width}/`);
}

export function formatPrice(value: number): string {
  return `S/ ${value.toFixed(2)}`;
}
