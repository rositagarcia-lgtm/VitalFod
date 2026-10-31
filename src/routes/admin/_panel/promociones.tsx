import { useState } from "react";
import { createFileRoute, redirect } from "@tanstack/react-router";
import { ImageOff, Pencil, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  ConfirmDelete,
  EmptyState,
  Field,
  PageHeader,
  StatusBadge,
  SubmitButton,
} from "@/components/admin/ui";
import { ImageField } from "@/components/admin/ImageField";
import { useAction } from "@/components/admin/hooks";
import { toInt } from "@/lib/utils";
import { canAccess } from "@/lib/permissions";
import {
  deletePromocion,
  listPromociones,
  savePromocion,
  type PromocionInput,
} from "@/functions/admin/promociones";
import { optimizedImage } from "@/lib/images";
import type { Promocion, Variante } from "@/lib/types";

export const Route = createFileRoute("/admin/_panel/promociones")({
  staticData: { title: "Banners de portada", section: "Negocio" },
  beforeLoad: ({ context }) => {
    if (!canAccess(context.user, "promociones")) throw redirect({ to: "/admin" });
  },
  loader: () => listPromociones(),
  component: PromocionesPage,
});

const VARIANTES: Record<Variante, string> = {
  launch: "Lanzamiento (título grande)",
  practicality: "Practicidad (fondo verde)",
  organization: "Organización (fondo vino)",
};

type FormState = Omit<PromocionInput, "caracteristicas"> & { caracteristicas: string };

function PromocionesPage() {
  const promociones = Route.useLoaderData();
  const { cloudinary } = Route.useRouteContext();
  const [editing, setEditing] = useState<FormState | null>(null);
  const { pending, run } = useAction();

  const open = (p?: Promocion) =>
    setEditing(
      p
        ? {
            id: p.id,
            etiqueta: p.etiqueta,
            titulo: p.titulo,
            descripcion: p.descripcion,
            descripcion_secundaria: p.descripcion_secundaria ?? "",
            sticker: p.sticker ?? "",
            texto_boton: p.texto_boton,
            enlace_boton: p.enlace_boton,
            variante: p.variante,
            caracteristicas: p.caracteristicas.join(", "),
            orden: p.orden,
            activo: p.activo,
            imagen_url: p.imagen_url,
            imagen_public_id: p.imagen_public_id,
          }
        : {
            etiqueta: "",
            titulo: "",
            descripcion: "",
            descripcion_secundaria: "",
            sticker: "",
            texto_boton: "Ver más",
            enlace_boton: "/menu",
            variante: "launch",
            caracteristicas: "",
            orden: promociones.length + 1,
            activo: true,
            imagen_url: null,
            imagen_public_id: null,
          },
    );

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setEditing((prev) => (prev ? { ...prev, [key]: value } : prev));

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!editing) return;
    const caracteristicas = editing.caracteristicas
      .split(",")
      .map((c) => c.trim())
      .filter(Boolean);
    const ok = await run(
      () => savePromocion({ data: { ...editing, caracteristicas } }),
      editing.id ? "Promoción actualizada." : "Promoción creada.",
    );
    if (ok) setEditing(null);
  };

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Negocio"
        title="Banners de portada"
        description="Imágenes y mensajes que rotan al inicio de la web. Se muestran en el orden indicado."
        action={
          <Button variant="burgundy" onClick={() => open()}>
            <Plus /> Nuevo banner
          </Button>
        }
      />

      {promociones.length === 0 ? (
        <EmptyState>No hay promociones. La portada mostrará un encabezado simple.</EmptyState>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {promociones.map((p) => {
            const image = optimizedImage(p.imagen_url, 640);
            return (
              <article key={p.id} className="overflow-hidden rounded-xl border bg-card">
                <div className="aspect-[16/9] bg-muted">
                  {image ? (
                    <img src={image} alt="" className="h-full w-full object-cover" loading="lazy" />
                  ) : (
                    <div className="grid h-full place-items-center text-muted-foreground">
                      <ImageOff />
                    </div>
                  )}
                </div>
                <div className="p-5">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-xs font-bold uppercase text-brand-wine">
                      #{p.orden} · {p.etiqueta}
                    </p>
                    <StatusBadge active={p.activo} on="Activa" off="Pausada" />
                  </div>
                  <h3 className="mt-1 text-lg font-bold">{p.titulo}</h3>
                  <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{p.descripcion}</p>
                  <div className="mt-3 flex items-center justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => open(p)}
                      aria-label={`Editar ${p.titulo}`}
                    >
                      <Pencil />
                    </Button>
                    <ConfirmDelete
                      title="Eliminar promoción"
                      description={`Se eliminará “${p.titulo}” y su imagen. Esta acción no se puede deshacer.`}
                      onConfirm={() =>
                        void run(
                          () => deletePromocion({ data: { id: p.id } }),
                          "Promoción eliminada.",
                        )
                      }
                    />
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      <Dialog open={editing !== null} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          {editing && (
            <form onSubmit={submit} className="grid gap-4">
              <DialogHeader>
                <DialogTitle>{editing.id ? "Editar banner" : "Nuevo banner"}</DialogTitle>
                <DialogDescription>
                  Imagen recomendada: horizontal, 1400 × 780 px.
                </DialogDescription>
              </DialogHeader>
              <ImageField
                carpeta="promociones"
                cloudinary={cloudinary}
                value={{ url: editing.imagen_url, publicId: editing.imagen_public_id }}
                onChange={(img) =>
                  setEditing({ ...editing, imagen_url: img.url, imagen_public_id: img.publicId })
                }
              />
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Etiqueta" htmlFor="etiqueta" hint="Texto pequeño sobre el título.">
                  <Input
                    id="etiqueta"
                    value={editing.etiqueta}
                    onChange={(e) => set("etiqueta", e.target.value)}
                    required
                  />
                </Field>
                <Field label="Sticker" htmlFor="sticker" hint="Opcional. Ej.: NUEVO">
                  <Input
                    id="sticker"
                    value={editing.sticker ?? ""}
                    onChange={(e) => set("sticker", e.target.value)}
                    maxLength={20}
                  />
                </Field>
              </div>
              <Field label="Título" htmlFor="titulo">
                <Input
                  id="titulo"
                  value={editing.titulo}
                  onChange={(e) => set("titulo", e.target.value)}
                  required
                />
              </Field>
              <Field label="Descripción" htmlFor="descripcion">
                <Textarea
                  id="descripcion"
                  rows={2}
                  value={editing.descripcion}
                  onChange={(e) => set("descripcion", e.target.value)}
                  required
                />
              </Field>
              <Field label="Descripción secundaria" htmlFor="secundaria">
                <Textarea
                  id="secundaria"
                  rows={2}
                  value={editing.descripcion_secundaria ?? ""}
                  onChange={(e) => set("descripcion_secundaria", e.target.value)}
                />
              </Field>
              <Field
                label="Características"
                htmlFor="caracteristicas"
                hint="Separadas por comas. Máximo 6."
              >
                <Input
                  id="caracteristicas"
                  value={editing.caracteristicas}
                  onChange={(e) => set("caracteristicas", e.target.value)}
                  placeholder="Preparado, Refrigerado, Listo para calentar"
                />
              </Field>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Texto del botón" htmlFor="boton">
                  <Input
                    id="boton"
                    value={editing.texto_boton}
                    onChange={(e) => set("texto_boton", e.target.value)}
                    required
                  />
                </Field>
                <Field
                  label="Enlace del botón"
                  htmlFor="enlace"
                  hint="/menu, /#sedes o una dirección web"
                >
                  <Input
                    id="enlace"
                    value={editing.enlace_boton}
                    onChange={(e) => set("enlace_boton", e.target.value)}
                  />
                </Field>
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                <Field label="Estilo" htmlFor="variante" className="sm:col-span-2">
                  <Select
                    value={editing.variante}
                    onValueChange={(v) => set("variante", v as Variante)}
                  >
                    <SelectTrigger id="variante">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(VARIANTES).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
                <Field label="Posición en la lista" htmlFor="orden" hint="1 aparece primero.">
                  <Input
                    id="orden"
                    type="number"
                    min={0}
                    value={editing.orden}
                    onChange={(e) => set("orden", toInt(e.target.value))}
                  />
                </Field>
              </div>
              <label className="flex items-center gap-3 text-sm font-medium">
                <Switch checked={editing.activo} onCheckedChange={(v) => set("activo", v)} />
                Mostrar en el carrusel
              </label>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setEditing(null)}>
                  Cancelar
                </Button>
                <SubmitButton pending={pending}>Guardar</SubmitButton>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
