import { useState } from "react";
import { createFileRoute, redirect } from "@tanstack/react-router";
import { Pencil, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import { canAccess } from "@/lib/permissions";
import {
  deleteCategoria,
  listCategorias,
  saveCategoria,
  type CategoriaInput,
} from "@/functions/admin/categorias";
import type { Categoria } from "@/lib/types";

export const Route = createFileRoute("/admin/_panel/categorias")({
  staticData: { title: "Categorías", section: "Menú" },
  beforeLoad: ({ context }) => {
    if (!canAccess(context.user, "categorias")) throw redirect({ to: "/admin" });
  },
  loader: () => listCategorias(),
  component: CategoriasPage,
});

const empty: CategoriaInput = { nombre: "", descripcion: "", orden: 0, activo: true };

function CategoriasPage() {
  const categorias = Route.useLoaderData();
  const [editing, setEditing] = useState<CategoriaInput | null>(null);
  const { pending, run } = useAction();

  const open = (c?: Categoria) =>
    setEditing(
      c
        ? {
            id: c.id,
            nombre: c.nombre,
            descripcion: c.descripcion ?? "",
            orden: c.orden,
            activo: c.activo,
          }
        : { ...empty, orden: categorias.length + 1 },
    );

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!editing) return;
    const ok = await run(
      () => saveCategoria({ data: editing }),
      editing.id ? "Categoría actualizada." : "Categoría creada.",
    );
    if (ok) setEditing(null);
  };

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Menú"
        title="Categorías"
        description="Secciones con las que se filtra el menú en la web."
        action={
          <Button variant="burgundy" onClick={() => open()}>
            <Plus /> Nueva categoría
          </Button>
        }
      />

      {categorias.length === 0 ? (
        <EmptyState>Aún no hay categorías.</EmptyState>
      ) : (
        <div className="rounded-xl border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-20">Posición</TableHead>
                <TableHead>Nombre</TableHead>
                <TableHead className="hidden md:table-cell">Descripción</TableHead>
                <TableHead className="text-center">Platillos</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="w-24 text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {categorias.map((c) => (
                <TableRow key={c.id}>
                  <TableCell className="tabular-nums text-muted-foreground">{c.orden}</TableCell>
                  <TableCell className="font-semibold">{c.nombre}</TableCell>
                  <TableCell className="hidden max-w-xs truncate text-muted-foreground md:table-cell">
                    {c.descripcion}
                  </TableCell>
                  <TableCell className="text-center tabular-nums">{c.total_platillos}</TableCell>
                  <TableCell>
                    <StatusBadge active={c.activo} on="Activa" off="Oculta" />
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => open(c)}
                      aria-label={`Editar ${c.nombre}`}
                    >
                      <Pencil />
                    </Button>
                    <ConfirmDelete
                      title={`Eliminar ${c.nombre}`}
                      description={
                        c.total_platillos > 0
                          ? `Esta categoría tiene ${c.total_platillos} platillo(s). Debes moverlos o eliminarlos antes.`
                          : "Esta acción no se puede deshacer."
                      }
                      onConfirm={() =>
                        void run(
                          () => deleteCategoria({ data: { id: c.id } }),
                          "Categoría eliminada.",
                        )
                      }
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <Dialog open={editing !== null} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent>
          {editing && (
            <form onSubmit={submit} className="grid gap-4">
              <DialogHeader>
                <DialogTitle>{editing.id ? "Editar categoría" : "Nueva categoría"}</DialogTitle>
                <DialogDescription>
                  Se muestra como filtro en la sección de platillos.
                </DialogDescription>
              </DialogHeader>
              <Field label="Nombre" htmlFor="nombre">
                <Input
                  id="nombre"
                  value={editing.nombre}
                  onChange={(e) => setEditing({ ...editing, nombre: e.target.value })}
                  maxLength={50}
                  required
                />
              </Field>
              <Field label="Descripción" htmlFor="descripcion">
                <Textarea
                  id="descripcion"
                  value={editing.descripcion ?? ""}
                  onChange={(e) => setEditing({ ...editing, descripcion: e.target.value })}
                  maxLength={150}
                  rows={2}
                />
              </Field>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Posición en la lista" htmlFor="orden" hint="1 aparece primero.">
                  <Input
                    id="orden"
                    type="number"
                    min={0}
                    value={editing.orden}
                    onChange={(e) => setEditing({ ...editing, orden: toInt(e.target.value) })}
                  />
                </Field>
                <label className="flex items-center gap-3 self-end pb-2 text-sm font-medium">
                  <Switch
                    checked={editing.activo}
                    onCheckedChange={(activo) => setEditing({ ...editing, activo })}
                  />
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
