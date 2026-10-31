import { createServerFn } from "@tanstack/react-start";
import { db } from "@/server/db";
import type { Platillo, Promocion, Sede } from "@/lib/types";

// Campos públicos de un platillo (sin datos internos como el id de la imagen en la nube)
const platilloFields = (sql: ReturnType<typeof db>) => sql`
  SELECT p.id, p.categoria_id, c.nombre AS categoria, p.nombre, p.descripcion,
         p.precio::float8 AS precio, p.precio_oferta::float8 AS precio_oferta,
         p.imagen_url, NULL AS imagen_public_id, p.disponible, p.destacado, p.orden,
         p.precio_actualizado_at::text,
         (p.precio_actualizado_at > p.created_at + interval '1 minute' AND p.precio_actualizado_at > CURRENT_TIMESTAMP - interval '7 days') AS precio_reciente
  FROM platillos p
  JOIN categorias c ON c.id = p.categoria_id
  WHERE p.disponible AND c.activo
  ORDER BY c.orden, p.orden, p.nombre
`;

export const getHomeData = createServerFn({ method: "GET" }).handler(async () => {
  const sql = db();
  const [platillos, sedes, promociones] = await Promise.all([
    platilloFields(sql),
    sql`
      SELECT id, nombre, direccion, horario, referencia, mapa_url, orden, activo
      FROM sedes WHERE activo ORDER BY orden, nombre
    `,
    sql`
      SELECT id, etiqueta, titulo, descripcion, descripcion_secundaria, sticker, texto_boton,
             enlace_boton, imagen_url, imagen_public_id, variante, caracteristicas, orden, activo
      FROM promociones WHERE activo ORDER BY orden, id
    `,
  ]);

  const disponibles = platillos as Platillo[];
  const marcados = disponibles.filter((p) => p.destacado);
  // Si nadie marcó destacados, la portada muestra los primeros del menú
  const destacados = (marcados.length ? marcados : disponibles).slice(0, 3);

  return {
    destacados,
    totalPlatillos: disponibles.length,
    sedes: sedes as Sede[],
    promociones: promociones as Promocion[],
  };
});

export const getMenuData = createServerFn({ method: "GET" }).handler(async () => {
  const sql = db();
  const platillos = (await platilloFields(sql)) as Platillo[];

  const categorias: { nombre: string; total: number }[] = [];
  for (const p of platillos) {
    const found = categorias.find((c) => c.nombre === p.categoria);
    if (found) found.total++;
    else categorias.push({ nombre: p.categoria, total: 1 });
  }
  const actualizado = platillos.reduce<string | null>(
    (max, p) => (max === null || p.precio_actualizado_at > max ? p.precio_actualizado_at : max),
    null,
  );

  return { platillos, categorias, actualizado };
});
