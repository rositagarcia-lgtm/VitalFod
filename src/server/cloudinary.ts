// Cliente mínimo de Cloudinary con fetch y Web Crypto (sin SDK) para que funcione en cualquier runtime.

function config() {
  const cloudName = process.env["CLOUDINARY_CLOUD_NAME"];
  const apiKey = process.env["CLOUDINARY_API_KEY"];
  const apiSecret = process.env["CLOUDINARY_API_SECRET"];
  const folder = process.env["CLOUDINARY_FOLDER"] || "vital-foods";
  if (!cloudName || !apiKey || !apiSecret) return null;
  return { cloudName, apiKey, apiSecret, folder };
}

export function isCloudinaryConfigured() {
  return config() !== null;
}

/** Firma de Cloudinary: parámetros ordenados "k=v&k=v" + secreto, en SHA-1 hexadecimal. */
export async function signParams(
  params: Record<string, string | number>,
  apiSecret: string,
): Promise<string> {
  const payload = Object.keys(params)
    .sort()
    .map((key) => `${key}=${params[key]}`)
    .join("&");
  const digest = await crypto.subtle.digest("SHA-1", new TextEncoder().encode(payload + apiSecret));
  return Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, "0")).join("");
}

export async function createUploadSignature(subfolder: string) {
  const cfg = config();
  if (!cfg) throw new Error("Cloudinary no está configurado en el servidor.");
  const timestamp = Math.round(Date.now() / 1000);
  const folder = `${cfg.folder}/${subfolder}`;
  const signature = await signParams({ folder, timestamp }, cfg.apiSecret);
  return { cloudName: cfg.cloudName, apiKey: cfg.apiKey, folder, timestamp, signature };
}

/** Elimina una imagen de Cloudinary. Los fallos solo se registran: no deben bloquear la operación. */
export async function destroyImage(publicId: string | null | undefined) {
  const cfg = config();
  if (!cfg || !publicId) return;
  const timestamp = Math.round(Date.now() / 1000);
  const signature = await signParams({ public_id: publicId, timestamp }, cfg.apiSecret);
  const body = new URLSearchParams({
    public_id: publicId,
    timestamp: String(timestamp),
    api_key: cfg.apiKey,
    signature,
  });
  try {
    const res = await fetch(`https://api.cloudinary.com/v1_1/${cfg.cloudName}/image/destroy`, {
      method: "POST",
      body,
    });
    if (!res.ok) console.error(`Cloudinary destroy ${publicId}: HTTP ${res.status}`);
  } catch (error) {
    console.error("Cloudinary destroy", error);
  }
}
