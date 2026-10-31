export type Rol = "admin" | "editor";

export type Modulo = "platillos" | "categorias" | "sedes" | "promociones";

export type SessionUser = {
  id: number;
  nombre: string;
  email: string;
  rol: Rol;
  permisos: Modulo[];
};

export type Categoria = {
  id: number;
  nombre: string;
  descripcion: string | null;
  orden: number;
  activo: boolean;
  total_platillos: number;
};

export type Platillo = {
  id: number;
  categoria_id: number;
  categoria: string;
  nombre: string;
  descripcion: string | null;
  precio: number;
  imagen_url: string | null;
  imagen_public_id: string | null;
  disponible: boolean;
  orden: number;
  precio_oferta: number | null;
  destacado: boolean;
  precio_actualizado_at: string;
  /** El precio cambió en los últimos 7 días (calculado en la base de datos). */
  precio_reciente: boolean;
};

export type Sede = {
  id: number;
  nombre: string;
  direccion: string;
  horario: string;
  referencia: string | null;
  mapa_url: string | null;
  orden: number;
  activo: boolean;
};

export type Variante = "launch" | "practicality" | "organization";

export type Promocion = {
  id: number;
  etiqueta: string;
  titulo: string;
  descripcion: string;
  descripcion_secundaria: string | null;
  sticker: string | null;
  texto_boton: string;
  enlace_boton: string;
  imagen_url: string | null;
  imagen_public_id: string | null;
  variante: Variante;
  caracteristicas: string[];
  orden: number;
  activo: boolean;
};

export type Usuario = {
  id: number;
  nombre: string;
  email: string;
  rol: Rol;
  activo: boolean;
  permisos: Modulo[];
  totp_activo: boolean;
  bloqueado: boolean;
  ultimo_acceso: string | null;
  created_at: string;
};

export type Actividad = {
  id: number;
  usuario: string;
  accion: "crear" | "editar" | "eliminar" | "seguridad";
  modulo: string;
  detalle: string;
  created_at: string;
};
