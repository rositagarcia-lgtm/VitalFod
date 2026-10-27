import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Clock3, ExternalLink, MapPin, Pencil, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
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
import { useAction } from "@/components/admin/hooks";
import { toInt } from "@/lib/utils";
import { deleteSede, listSedes, saveSede, type SedeInput } from "@/functions/admin/sedes";
import type { Sede } from "@/lib/types";

export const Route = createFileRoute("/admin/_panel/sedes")({
  staticData: { title: "Sedes" },
  loader: () => listSedes(),
  component: SedesPage,
});

function SedesPage() {
  const sedes = Route.useLoaderData();
  const [editing, setEditing] = useState<SedeInput | null>(null);
  const { pending, run } = useAction();

  const open = (s?: Sede) =>
    setEditing(
      s
        ? {
            id: s.id,
            nombre: s.nombre,
            direccion: s.direccion,
            horario: s.horario,
            referencia: s.referencia ?? "",
            mapa_url: s.mapa_url ?? "",
            orden: s.orden,
            activo: s.activo,
          }
        : {
            nombre: "",
            direccion: "",
            horario: "",
            referencia: "",
            mapa_url: "",
            orden: sedes.length + 1,
            activo: true,
          },
    );

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!editing) return;
    const ok = await run(
      () => saveSede({ data: editing }),
      editing.id ? "Sede actualizada." : "Sede creada.",
    );
    if (ok) setEditing(null);
  };

  const set = <K extends keyof SedeInput>(key: K, value: SedeInput[K]) =>
    setEditing((prev) => (prev ? { ...prev, [key]: value } : prev));

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Negocio"
        title="Sedes"
        description="Locales que aparecen en la sección “Encuéntranos”."
        action={
          <Button variant="burgundy" onClick={() => open()}>
            <Plus /> Nueva sede
          </Button>
        }
      />

      {sedes.length === 0 ? (
        <EmptyState>Aún no hay sedes registradas.</EmptyState>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {sedes.map((s) => (
            <article key={s.id} className="flex flex-col rounded-xl border bg-card p-5">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-xs text-muted-foreground">#{s.orden}</p>
                  <h3 className="text-lg font-bold">{s.nombre}</h3>
                </div>
                <StatusBadge active={s.activo} on="Visible" off="Oculta" />
              </div>
              <div className="mt-3 space-y-1.5 text-sm text-muted-foreground">
                <p className="flex gap-2">
                  <MapPin className="mt-0.5 size-4 shrink-0" />
                  {s.direccion}
                </p>
                <p className="flex gap-2">
                  <Clock3 className="mt-0.5 size-4 shrink-0" />
                  {s.horario}
                </p>
              </div>
              <div className="mt-auto flex items-center justify-end gap-1 pt-4">
                {s.mapa_url && (
                  <Button variant="ghost" size="icon" asChild>
                    <a
                      href={s.mapa_url}
                      target="_blank"
                      rel="noreferrer"
                      aria-label={`Ver ${s.nombre} en el mapa`}
                    >
                      <ExternalLink />
                    </a>
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => open(s)}
                  aria-label={`Editar ${s.nombre}`}
                >
                  <Pencil />
                </Button>
                <ConfirmDelete
                  title={`Eliminar sede ${s.nombre}`}
                  description="Dejará de mostrarse en la web. Esta acción no se puede deshacer."
                  onConfirm={() =>
                    void run(() => deleteSede({ data: { id: s.id } }), "Sede eliminada.")
                  }
                />
              </div>
            </article>
          ))}
        </div>
      )}

      <Dialog open={editing !== null} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          {editing && (
            <form onSubmit={submit} className="grid gap-4">
              <DialogHeader>
                <DialogTitle>{editing.id ? "Editar sede" : "Nueva sede"}</DialogTitle>
                <DialogDescription>Datos de contacto que verán tus clientes.</DialogDescription>
              </DialogHeader>
              <Field label="Nombre" htmlFor="nombre">
                <Input
                  id="nombre"
                  value={editing.nombre}
                  onChange={(e) => set("nombre", e.target.value)}
                  required
                />
              </Field>
              <Field label="Dirección" htmlFor="direccion">
                <Input
                  id="direccion"
                  value={editing.direccion}
                  onChange={(e) => set("direccion", e.target.value)}
                  required
                />
              </Field>
              <Field
                label="Horario"
                htmlFor="horario"
                hint="Ej.: Lun – Sáb · 8:00 a.m. – 9:00 p.m."
              >
                <Input
                  id="horario"
                  value={editing.horario}
                  onChange={(e) => set("horario", e.target.value)}
                  required
                />
              </Field>
              <Field label="Referencia" htmlFor="referencia">
                <Input
                  id="referencia"
                  value={editing.referencia ?? ""}
                  onChange={(e) => set("referencia", e.target.value)}
                />
              </Field>
              <Field label="Enlace de Google Maps" htmlFor="mapa">
                <Input
                  id="mapa"
                  type="url"
                  placeholder="https://maps.google.com/?q=…"
                  value={editing.mapa_url}
                  onChange={(e) => set("mapa_url", e.target.value)}
                />
              </Field>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Orden" htmlFor="orden">
                  <Input
                    id="orden"
                    type="number"
                    min={0}
                    value={editing.orden}
                    onChange={(e) => set("orden", toInt(e.target.value))}
                  />
                </Field>
                <label className="flex items-center gap-3 self-end pb-2 text-sm font-medium">
                  <Switch checked={editing.activo} onCheckedChange={(v) => set("activo", v)} />
                  Visible en la web
                </label>
              </div>
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
