import { createServerFn } from "@tanstack/react-start";
import { db } from "@/server/db";
import type { Platillo, Promocion, Sede } from "@/lib/types";

export const getHomeData = createServerFn({ method: "GET" }).handler(async () => {
  const sql = db();
  const [platillos, categorias, sedes, promociones] = await Promise.all([
    sql`
      SELECT p.id, p.categoria_id, c.nombre AS categoria, p.nombre, p.descripcion,
             p.precio::float8 AS precio, p.imagen_url, p.imagen_public_id, p.disponible, p.orden
      FROM platillos p
      JOIN categorias c ON c.id = p.categoria_id
      WHERE p.disponible AND c.activo
      ORDER BY c.orden, p.orden, p.nombre
    `,
    sql`
      SELECT c.nombre FROM categorias c
      WHERE c.activo AND EXISTS (
        SELECT 1 FROM platillos p WHERE p.categoria_id = c.id AND p.disponible
      )
      ORDER BY c.orden, c.nombre
    `,
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

  return {
    platillos: platillos as Platillo[],
    categorias: categorias.map((row) => row["nombre"] as string),
    sedes: sedes as Sede[],
    promociones: promociones as Promocion[],
  };
});
