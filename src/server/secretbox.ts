// Cifrado AES-GCM para guardar en la base de datos secretos que no deben quedar en texto plano
// (el secreto de la verificación en dos pasos). La clave se deriva de SESSION_SECRET:
// si se cambia SESSION_SECRET, hay que restablecer la verificación en dos pasos de los usuarios.

const enc = new TextEncoder();
const dec = new TextDecoder();

async function key(): Promise<CryptoKey> {
  const secret = process.env["SESSION_SECRET"];
  if (!secret) throw new Error("SESSION_SECRET no está configurada");
  const base = await crypto.subtle.importKey("raw", enc.encode(secret), "HKDF", false, [
    "deriveKey",
  ]);
  return crypto.subtle.deriveKey(
    {
      name: "HKDF",
      hash: "SHA-256",
      salt: enc.encode("vital-foods"),
      info: enc.encode("totp-secret"),
    },
    base,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"],
  );
}

const toB64 = (bytes: Uint8Array) => btoa(String.fromCharCode(...bytes));
const fromB64 = (text: string) => Uint8Array.from(atob(text), (c) => c.charCodeAt(0));

export async function seal(plain: string): Promise<string> {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const data = new Uint8Array(
    await crypto.subtle.encrypt({ name: "AES-GCM", iv }, await key(), enc.encode(plain)),
  );
  return `v1.${toB64(iv)}.${toB64(data)}`;
}

export async function open(sealed: string): Promise<string> {
  const [version, iv, data] = sealed.split(".");
  if (version !== "v1" || !iv || !data) throw new Error("Formato de secreto no válido");
  const plain = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv: fromB64(iv) },
    await key(),
    fromB64(data),
  );
  return dec.decode(plain);
}
