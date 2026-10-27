// Uso: npm run db:migrate | db:seed | db:admin
import { readFile } from "node:fs/promises";
import { Client, neonConfig } from "@neondatabase/serverless";
import bcrypt from "bcryptjs";

neonConfig.webSocketConstructor = globalThis.WebSocket;

const command = process.argv[2];
const { DATABASE_URL, ADMIN_USERNAME, ADMIN_EMAIL, ADMIN_PASSWORD } = process.env;

if (!DATABASE_URL) {
  console.error("Falta DATABASE_URL en .env");
  process.exit(1);
}

const client = new Client(DATABASE_URL);
await client.connect();

try {
  if (command === "migrate" || command === "seed") {
    const file = new URL(`../db/${command === "migrate" ? "schema" : "seed"}.sql`, import.meta.url);
    await client.query(await readFile(file, "utf8"));
    console.log(command === "migrate" ? "Esquema actualizado." : "Datos iniciales cargados.");
  } else if (command === "admin") {
    if (!ADMIN_EMAIL || !ADMIN_PASSWORD || ADMIN_PASSWORD.length < 8) {
      throw new Error("Define ADMIN_EMAIL y ADMIN_PASSWORD (mínimo 8 caracteres) en .env");
    }
    const hash = await bcrypt.hash(ADMIN_PASSWORD, 12);
    const { rows } = await client.query(
      `INSERT INTO usuarios (nombre, email, password_hash, rol, activo)
       VALUES ($1, $2, $3, 'admin', TRUE)
       ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash, activo = TRUE
       RETURNING id`,
      [ADMIN_USERNAME || "Administrador", ADMIN_EMAIL.toLowerCase(), hash],
    );
    console.log(`Administrador listo (id ${rows[0].id}, ${ADMIN_EMAIL}).`);
  } else {
    throw new Error("Comando no válido. Usa: migrate, seed o admin");
  }
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
} finally {
  await client.end();
}
