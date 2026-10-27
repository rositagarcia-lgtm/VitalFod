# Vital Foods

Sitio web de Vital Foods (Trujillo) con panel de administración para gestionar el menú, las sedes y las promociones.

## Tecnologías

- TanStack Start (React 19, SSR y server functions)
- Tailwind CSS 4 y componentes Radix UI
- PostgreSQL en Neon
- Cloudinary para las imágenes que se suben desde el panel

## Requisitos

- Node.js 22.12 o superior
- Una base de datos PostgreSQL (Neon)
- Una cuenta de Cloudinary (opcional para desarrollo)

## Puesta en marcha

1. Instalar dependencias:

   ```sh
   npm ci
   ```

2. Copiar `.env.example` a `.env` y completar los valores.

3. Crear o actualizar las tablas y cargar los datos iniciales:

   ```sh
   npm run db:migrate
   npm run db:seed
   ```

4. Crear el primer administrador con `ADMIN_EMAIL` y `ADMIN_PASSWORD` del `.env`:

   ```sh
   npm run db:admin
   ```

5. Levantar el entorno de desarrollo:

   ```sh
   npm run dev
   ```

   - Sitio: `http://localhost:5173`
   - Panel: `http://localhost:5173/admin`

## Scripts

| Comando              | Descripción                                            |
| -------------------- | ------------------------------------------------------ |
| `npm run dev`        | Servidor de desarrollo                                 |
| `npm run build`      | Compila para producción en `.output/`                  |
| `npm start`          | Ejecuta la compilación de producción                   |
| `npm run lint`       | ESLint                                                 |
| `npm run typecheck`  | Verificación de tipos                                  |
| `npm run format`     | Formatea el código con Prettier                        |
| `npm run db:migrate` | Aplica `db/schema.sql` (idempotente, no borra datos)   |
| `npm run db:seed`    | Inserta los datos iniciales que falten (`db/seed.sql`) |
| `npm run db:admin`   | Crea el administrador o le restablece la contraseña    |

## Estructura

```
db/                 Esquema y datos iniciales de PostgreSQL
scripts/db.mjs      Migración, seed y alta de administrador
public/images/      Imágenes iniciales optimizadas (WebP)
src/routes/         Rutas: "/" (sitio) y "/admin/*" (panel)
src/functions/      Server functions (públicas y del panel)
src/server/         Código que solo corre en el servidor: BD, sesión, Cloudinary
src/components/     Componentes del sitio, del panel (admin/) y base (ui/)
```

## Roles del panel

- **Administrador**: acceso completo, incluida la gestión de usuarios.
- **Editor**: gestiona platillos, categorías, sedes y promociones.

## Imágenes

Las imágenes que se suben desde el panel van directo del navegador a Cloudinary con una firma generada en el servidor, así que la clave secreta nunca llega al cliente. Al reemplazar o eliminar un registro, su imagen anterior también se borra de Cloudinary. Mientras Cloudinary no esté configurado, el panel permite pegar la URL de la imagen.

## Despliegue

`npm run build` genera un servidor Node en `.output/` que se ejecuta con `npm start`. Hay que definir las mismas variables de `.env` en el entorno de producción.
