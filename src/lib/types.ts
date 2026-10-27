export type Rol = "admin" | "editor";

export type SessionUser = { id: number; nombre: string; email: string; rol: Rol };

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
  ultimo_acceso: string | null;
  created_at: string;
};
