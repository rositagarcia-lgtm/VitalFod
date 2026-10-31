-- Esquema de Vital Foods (PostgreSQL / Neon).
-- Es idempotente: solo crea o agrega lo que falta, nunca borra datos.

CREATE OR REPLACE FUNCTION set_updated_at() RETURNS trigger AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- categorias ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS categorias (
  id          SERIAL PRIMARY KEY,
  nombre      VARCHAR(50) NOT NULL UNIQUE,
  activo      BOOLEAN DEFAULT TRUE,
  created_at  TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE categorias ADD COLUMN IF NOT EXISTS descripcion VARCHAR(150);
ALTER TABLE categorias ADD COLUMN IF NOT EXISTS orden INTEGER NOT NULL DEFAULT 0;
ALTER TABLE categorias ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP;
UPDATE categorias SET activo = TRUE WHERE activo IS NULL;
ALTER TABLE categorias ALTER COLUMN activo SET NOT NULL;
ALTER TABLE categorias ALTER COLUMN created_at SET NOT NULL;

-- platillos -------------------------------------------------------------

CREATE TABLE IF NOT EXISTS platillos (
  id            SERIAL PRIMARY KEY,
  categoria_id  INTEGER NOT NULL,
  nombre        VARCHAR(100) NOT NULL,
  descripcion   TEXT,
  precio        NUMERIC(10, 2) NOT NULL,
  imagen_url    VARCHAR(500),
  disponible    BOOLEAN DEFAULT TRUE,
  created_at    TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_categoria FOREIGN KEY (categoria_id) REFERENCES categorias (id) ON DELETE RESTRICT
);

ALTER TABLE platillos ADD COLUMN IF NOT EXISTS imagen_public_id VARCHAR(255);
ALTER TABLE platillos ADD COLUMN IF NOT EXISTS orden INTEGER NOT NULL DEFAULT 0;
ALTER TABLE platillos ALTER COLUMN precio TYPE NUMERIC(10, 2);
ALTER TABLE platillos ALTER COLUMN imagen_url TYPE VARCHAR(500);
UPDATE platillos SET disponible = TRUE WHERE disponible IS NULL;
ALTER TABLE platillos ALTER COLUMN disponible SET NOT NULL;
ALTER TABLE platillos ALTER COLUMN created_at SET NOT NULL;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'platillos_precio_positivo') THEN
    ALTER TABLE platillos ADD CONSTRAINT platillos_precio_positivo CHECK (precio >= 0);
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_platillos_categoria ON platillos (categoria_id);
CREATE INDEX IF NOT EXISTS idx_platillos_disponible ON platillos (disponible);

-- usuarios --------------------------------------------------------------

CREATE TABLE IF NOT EXISTS usuarios (
  id             SERIAL PRIMARY KEY,
  nombre         VARCHAR(100) NOT NULL,
  email          VARCHAR(150) NOT NULL UNIQUE,
  password_hash  VARCHAR(255) NOT NULL,
  rol            VARCHAR(20) DEFAULT 'admin',
  ultimo_acceso  TIMESTAMPTZ,
  created_at     TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS activo BOOLEAN NOT NULL DEFAULT TRUE;
UPDATE usuarios SET rol = 'admin' WHERE rol IS NULL;
ALTER TABLE usuarios ALTER COLUMN rol SET NOT NULL;
ALTER TABLE usuarios ALTER COLUMN created_at SET NOT NULL;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'usuarios_rol_valido') THEN
    ALTER TABLE usuarios ADD CONSTRAINT usuarios_rol_valido CHECK (rol IN ('admin', 'editor'));
  END IF;
END $$;

-- sedes -----------------------------------------------------------------

CREATE TABLE IF NOT EXISTS sedes (
  id          SERIAL PRIMARY KEY,
  nombre      VARCHAR(80) NOT NULL UNIQUE,
  direccion   VARCHAR(200) NOT NULL,
  horario     VARCHAR(120) NOT NULL,
  referencia  VARCHAR(200),
  mapa_url    VARCHAR(500),
  orden       INTEGER NOT NULL DEFAULT 0,
  activo      BOOLEAN NOT NULL DEFAULT TRUE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- promociones (carrusel principal) --------------------------------------

CREATE TABLE IF NOT EXISTS promociones (
  id                      SERIAL PRIMARY KEY,
  etiqueta                VARCHAR(60) NOT NULL,
  titulo                  VARCHAR(120) NOT NULL,
  descripcion             VARCHAR(300) NOT NULL,
  descripcion_secundaria  VARCHAR(300),
  sticker                 VARCHAR(20),
  texto_boton             VARCHAR(60) NOT NULL,
  enlace_boton            VARCHAR(300) NOT NULL DEFAULT '#platillos',
  imagen_url              VARCHAR(500),
  imagen_public_id        VARCHAR(255),
  variante                VARCHAR(20) NOT NULL DEFAULT 'launch',
  caracteristicas         TEXT[] NOT NULL DEFAULT '{}',
  orden                   INTEGER NOT NULL DEFAULT 0,
  activo                  BOOLEAN NOT NULL DEFAULT TRUE,
  created_at              TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at              TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT promociones_variante_valida CHECK (variante IN ('launch', 'practicality', 'organization'))
);

-- ofertas y destacados ----------------------------------------------------

ALTER TABLE platillos ADD COLUMN IF NOT EXISTS precio_oferta NUMERIC(10, 2);
ALTER TABLE platillos ADD COLUMN IF NOT EXISTS destacado BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE platillos ADD COLUMN IF NOT EXISTS precio_actualizado_at TIMESTAMPTZ;
-- Los platillos existentes no deben aparecer como "precio actualizado"
UPDATE platillos SET precio_actualizado_at = created_at WHERE precio_actualizado_at IS NULL;
ALTER TABLE platillos ALTER COLUMN precio_actualizado_at SET DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE platillos ALTER COLUMN precio_actualizado_at SET NOT NULL;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'platillos_oferta_valida') THEN
    ALTER TABLE platillos ADD CONSTRAINT platillos_oferta_valida
      CHECK (precio_oferta IS NULL OR (precio_oferta >= 0 AND precio_oferta < precio));
  END IF;
END $$;

CREATE OR REPLACE FUNCTION set_precio_actualizado_at() RETURNS trigger AS $$
BEGIN
  IF NEW.precio IS DISTINCT FROM OLD.precio OR NEW.precio_oferta IS DISTINCT FROM OLD.precio_oferta THEN
    NEW.precio_actualizado_at = CURRENT_TIMESTAMP;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_platillos_precio ON platillos;
CREATE TRIGGER trg_platillos_precio BEFORE UPDATE ON platillos
  FOR EACH ROW EXECUTE FUNCTION set_precio_actualizado_at();

-- seguridad de usuarios: permisos por módulo, 2FA y bloqueo por intentos ----

ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS permisos TEXT[] NOT NULL
  DEFAULT ARRAY['platillos', 'categorias', 'sedes', 'promociones'];
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS totp_secreto TEXT;
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS totp_activo BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS totp_ultimo_paso BIGINT;
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS intentos_fallidos INTEGER NOT NULL DEFAULT 0;
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS bloqueado_hasta TIMESTAMPTZ;

-- historial de cambios del panel --------------------------------------------

CREATE TABLE IF NOT EXISTS actividad (
  id          BIGSERIAL PRIMARY KEY,
  usuario_id  INTEGER REFERENCES usuarios (id) ON DELETE SET NULL,
  usuario     VARCHAR(100) NOT NULL,
  accion      VARCHAR(30) NOT NULL,
  modulo      VARCHAR(30) NOT NULL,
  detalle     VARCHAR(300) NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_actividad_fecha ON actividad (created_at DESC);

-- triggers de updated_at ------------------------------------------------

DO $$
DECLARE t TEXT;
BEGIN
  FOREACH t IN ARRAY ARRAY['categorias', 'platillos', 'sedes', 'promociones'] LOOP
    EXECUTE format('DROP TRIGGER IF EXISTS trg_%s_updated_at ON %I', t, t);
    EXECUTE format(
      'CREATE TRIGGER trg_%s_updated_at BEFORE UPDATE ON %I FOR EACH ROW EXECUTE FUNCTION set_updated_at()',
      t, t
    );
  END LOOP;
END $$;

-- el menú ahora es una página propia (/menu) --------------------------------

ALTER TABLE promociones ALTER COLUMN enlace_boton SET DEFAULT '/menu';
UPDATE promociones SET enlace_boton = '/menu' WHERE enlace_boton = '#platillos';
