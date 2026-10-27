import { createServerFn } from "@tanstack/react-start";
import { db } from "@/server/db";
import { isCloudinaryConfigured } from "@/server/cloudinary";
import { requireUser } from "@/server/session";

export type Alerta = { nivel: "media" | "baja"; titulo: string; detalle: string; to: string };

export const getDashboard = createServerFn({ method: "GET" }).handler(async () => {
  await requireUser();
  const sql = db();

  const [totales, sinImagen, categoriasVacias, noDisponibles] = await Promise.all([
    sql`
      SELECT
        (SELECT count(*)::int FROM platillos) AS platillos,
        (SELECT count(*)::int FROM platillos WHERE disponible) AS disponibles,
        (SELECT count(*)::int FROM categorias WHERE activo) AS categorias,
        (SELECT count(*)::int FROM sedes WHERE activo) AS sedes,
        (SELECT count(*)::int FROM promociones WHERE activo) AS promociones
    `,
    sql`SELECT nombre FROM platillos WHERE imagen_url IS NULL ORDER BY nombre`,
    sql`
      SELECT c.nombre FROM categorias c
      WHERE c.activo AND NOT EXISTS (SELECT 1 FROM platillos p WHERE p.categoria_id = c.id)
      ORDER BY c.nombre
    `,
    sql`SELECT nombre FROM platillos WHERE NOT disponible ORDER BY nombre`,
  ]);

  const alertas: Alerta[] = [];
  for (const row of sinImagen) {
    alertas.push({
      nivel: "media",
      titulo: String(row["nombre"]),
      detalle: "Platillo sin imagen",
      to: "/admin/platillos",
    });
  }
  for (const row of categoriasVacias) {
    alertas.push({
      nivel: "baja",
      titulo: String(row["nombre"]),
      detalle: "Categoría activa sin platillos",
      to: "/admin/categorias",
    });
  }
  for (const row of noDisponibles) {
    alertas.push({
      nivel: "baja",
      titulo: String(row["nombre"]),
      detalle: "Platillo marcado como no disponible",
      to: "/admin/platillos",
    });
  }
  if (!isCloudinaryConfigured()) {
    alertas.unshift({
      nivel: "media",
      titulo: "Cloudinary",
      detalle: "Faltan las credenciales para subir imágenes",
      to: "/admin",
    });
  }

  const t = totales[0] ?? {};
  return {
    totales: {
      platillos: Number(t["platillos"] ?? 0),
      disponibles: Number(t["disponibles"] ?? 0),
      categorias: Number(t["categorias"] ?? 0),
      sedes: Number(t["sedes"] ?? 0),
      promociones: Number(t["promociones"] ?? 0),
    },
    alertas,
  };
});
