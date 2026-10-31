import { useRef, useState } from "react";
import { ImageOff, Loader2, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getUploadSignature } from "@/functions/admin/uploads";
import { optimizedImage } from "@/lib/images";

export type ImageValue = { url: string | null; publicId: string | null };

const MAX_BYTES = 5 * 1024 * 1024;
const ACCEPTED = ["image/jpeg", "image/png", "image/webp", "image/avif"];

export function ImageField({
  value,
  onChange,
  carpeta,
  cloudinary,
}: {
  value: ImageValue;
  onChange: (value: ImageValue) => void;
  carpeta: "platillos" | "promociones";
  cloudinary: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const upload = async (file: File) => {
    setError(null);
    if (!ACCEPTED.includes(file.type)) return setError("Usa una imagen JPG, PNG, WebP o AVIF.");
    if (file.size > MAX_BYTES) return setError("La imagen no debe pesar más de 5 MB.");

    setUploading(true);
    try {
      const sig = await getUploadSignature({ data: { carpeta } });
      const form = new FormData();
      form.append("file", file);
      form.append("api_key", sig.apiKey);
      form.append("timestamp", String(sig.timestamp));
      form.append("signature", sig.signature);
      form.append("folder", sig.folder);
      const res = await fetch(`https://api.cloudinary.com/v1_1/${sig.cloudName}/image/upload`, {
        method: "POST",
        body: form,
      });
      const json = (await res.json()) as {
        secure_url?: string;
        public_id?: string;
        error?: { message?: string };
      };
      if (!res.ok || !json.secure_url || !json.public_id) {
        throw new Error(json.error?.message ?? "No se pudo subir la imagen.");
      }
      onChange({ url: json.secure_url, publicId: json.public_id });
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo subir la imagen.");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const preview = optimizedImage(value.url, 400);

  return (
    <div className="grid gap-1.5">
      <Label>Foto</Label>
      <div className="flex items-center gap-4">
        <div className="grid size-24 shrink-0 place-items-center overflow-hidden rounded-md border bg-muted">
          {preview ? (
            <img src={preview} alt="" className="h-full w-full object-cover" />
          ) : (
            <ImageOff className="size-6 text-muted-foreground" />
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          {cloudinary && (
            <>
              <input
                ref={inputRef}
                type="file"
                accept={ACCEPTED.join(",")}
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) void upload(file);
                }}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={uploading}
                onClick={() => inputRef.current?.click()}
              >
                {uploading ? <Loader2 className="animate-spin" /> : <Upload />}
                {uploading ? "Subiendo…" : value.url ? "Cambiar foto" : "Subir foto"}
              </Button>
            </>
          )}
          {value.url && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onChange({ url: null, publicId: null })}
            >
              <X /> Quitar
            </Button>
          )}
        </div>
      </div>
      {!cloudinary && (
        <>
          <Input
            placeholder="https://… o /images/…"
            value={value.url ?? ""}
            onChange={(e) => onChange({ url: e.target.value || null, publicId: null })}
          />
          <p className="text-xs text-muted-foreground">
            La subida de fotos aún no está configurada: por ahora puedes pegar la dirección (URL) de
            la imagen.
          </p>
        </>
      )}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
