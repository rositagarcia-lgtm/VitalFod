import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { ImageOff, Pencil, Plus, Search } from "lucide-react";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ConfirmDelete, EmptyState, Field, PageHeader, SubmitButton } from "@/components/admin/ui";
import { ImageField } from "@/components/admin/ImageField";
import { useAction } from "@/components/admin/hooks";
import { toInt } from "@/lib/utils";
import {
  deletePlatillo,
  listPlatillos,
  savePlatillo,
  togglePlatillo,
  type PlatilloInput,
} from "@/functions/admin/platillos";
import { listCategorias } from "@/functions/admin/categorias";
import { formatPrice, optimizedImage } from "@/lib/images";
import type { Platillo } from "@/lib/types";

export const Route = createFileRoute("/admin/_panel/platillos")({
  staticData: { title: "Platillos" },
  loader: async () => {
    const [platillos, categorias] = await Promise.all([listPlatillos(), listCategorias()]);
    return { platillos, categorias };
  },
  component: PlatillosPage,
});

type FormState = Omit<PlatilloInput, "precio"> & { precio: string };

const ALL = "todas";

function PlatillosPage() {
  const { platillos, categorias } = Route.useLoaderData();
  const { cloudinary } = Route.useRouteContext();
  const [query, setQuery] = useState("");
  const [categoria, setCategoria] = useState(ALL);
  const [editing, setEditing] = useState<FormState | null>(null);
  const { pending, run } = useAction();

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return platillos.filter(
      (p) =>
        (categoria === ALL || String(p.categoria_id) === categoria) &&
        (!q ||
          p.nombre.toLowerCase().includes(q) ||
          (p.descripcion ?? "").toLowerCase().includes(q)),
    );
  }, [platillos, query, categoria]);

  const open = (p?: Platillo) =>
    setEditing(
      p
        ? {
            id: p.id,
            categoria_id: p.categoria_id,
            nombre: p.nombre,
            descripcion: p.descripcion ?? "",
            precio: p.precio.toFixed(2),
            disponible: p.disponible,
            orden: p.orden,
            imagen_url: p.imagen_url,
            imagen_public_id: p.imagen_public_id,
          }
        : {
            categoria_id: categorias[0]?.id ?? 0,
            nombre: "",
            descripcion: "",
            precio: "",
            disponible: true,
            orden: platillos.length + 1,
            imagen_url: null,
            imagen_public_id: null,
          },
    );

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!editing) return;
    const precio = Number.parseFloat(editing.precio.replace(",", "."));
    const ok = await run(
      () => savePlatillo({ data: { ...editing, precio } }),
      editing.id ? "Platillo actualizado." : "Platillo creado.",
    );
    if (ok) setEditing(null);
  };

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Menú"
        title="Platillos"
        description="Lo que tus clientes ven en la sección “Nuestros platillos”."
        action={
          <Button variant="burgundy" onClick={() => open()} disabled={categorias.length === 0}>
            <Plus /> Nuevo platillo
          </Button>
        }
      />

      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar platillo…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="bg-card pl-9"
            aria-label="Buscar platillo"
          />
        </div>
        <Select value={categoria} onValueChange={setCategoria}>
          <SelectTrigger className="bg-card sm:w-56" aria-label="Filtrar por categoría">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>Todas las categorías</SelectItem>
            {categorias.map((c) => (
              <SelectItem key={c.id} value={String(c.id)}>
                {c.nombre}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {visible.length === 0 ? (
        <EmptyState>
          {platillos.length === 0
            ? "Aún no hay platillos."
            : "Ningún platillo coincide con la búsqueda."}
        </EmptyState>
      ) : (
        <div className="rounded-xl border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Platillo</TableHead>
                <TableHead className="hidden md:table-cell">Categoría</TableHead>
                <TableHead className="text-right">Precio</TableHead>
                <TableHead className="text-center">Disponible</TableHead>
                <TableHead className="w-24 text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {visible.map((p) => {
                const thumb = optimizedImage(p.imagen_url, 120);
                return (
                  <TableRow key={p.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="grid size-11 shrink-0 place-items-center overflow-hidden rounded-md border bg-muted">
                          {thumb ? (
                            <img
                              src={thumb}
                              alt=""
                              className="h-full w-full object-cover"
                              loading="lazy"
                            />
                          ) : (
                            <ImageOff className="size-4 text-muted-foreground" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold">{p.nombre}</p>
                          <p className="max-w-xs truncate text-xs text-muted-foreground">
                            {p.descripcion}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">{p.categoria}</TableCell>
                    <TableCell className="whitespace-nowrap text-right font-semibold tabular-nums">
                      {formatPrice(p.precio)}
                    </TableCell>
                    <TableCell className="text-center">
                      <Switch
                        checked={p.disponible}
                        aria-label={`Disponibilidad de ${p.nombre}`}
                        onCheckedChange={(disponible) =>
                          void run(() => togglePlatillo({ data: { id: p.id, disponible } }))
                        }
                      />
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => open(p)}
                        aria-label={`Editar ${p.nombre}`}
                      >
                        <Pencil />
                      </Button>
                      <ConfirmDelete
                        title={`Eliminar ${p.nombre}`}
                        description="El platillo y su imagen se eliminarán. Esta acción no se puede deshacer."
                        onConfirm={() =>
                          void run(
                            () => deletePlatillo({ data: { id: p.id } }),
                            "Platillo eliminado.",
                          )
                        }
                      />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}

      <Dialog open={editing !== null} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
          {editing && (
            <form onSubmit={submit} className="grid gap-4">
              <DialogHeader>
                <DialogTitle>{editing.id ? "Editar platillo" : "Nuevo platillo"}</DialogTitle>
                <DialogDescription>
                  Los cambios se reflejan de inmediato en la web.
                </DialogDescription>
              </DialogHeader>
              <ImageField
                carpeta="platillos"
                cloudinary={cloudinary}
                value={{ url: editing.imagen_url, publicId: editing.imagen_public_id }}
                onChange={(img) =>
                  setEditing({ ...editing, imagen_url: img.url, imagen_public_id: img.publicId })
                }
              />
              <Field label="Nombre" htmlFor="nombre">
                <Input
                  id="nombre"
                  value={editing.nombre}
                  onChange={(e) => setEditing({ ...editing, nombre: e.target.value })}
                  maxLength={100}
                  required
                />
              </Field>
              <Field
                label="Descripción"
                htmlFor="descripcion"
                hint="Ingredientes o detalle del platillo."
              >
                <Textarea
                  id="descripcion"
                  value={editing.descripcion ?? ""}
                  onChange={(e) => setEditing({ ...editing, descripcion: e.target.value })}
                  rows={3}
                  maxLength={1000}
                />
              </Field>
              <div className="grid gap-4 sm:grid-cols-3">
                <Field label="Categoría" htmlFor="categoria" className="sm:col-span-1">
                  <Select
                    value={String(editing.categoria_id)}
                    onValueChange={(v) => setEditing({ ...editing, categoria_id: Number(v) })}
                  >
                    <SelectTrigger id="categoria">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categorias.map((c) => (
                        <SelectItem key={c.id} value={String(c.id)}>
                          {c.nombre}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
                <Field label="Precio (S/)" htmlFor="precio">
                  <Input
                    id="precio"
                    inputMode="decimal"
                    placeholder="0.00"
                    value={editing.precio}
                    onChange={(e) => setEditing({ ...editing, precio: e.target.value })}
                    required
                  />
                </Field>
                <Field label="Orden" htmlFor="orden">
                  <Input
                    id="orden"
                    type="number"
                    min={0}
                    value={editing.orden}
                    onChange={(e) => setEditing({ ...editing, orden: toInt(e.target.value) })}
                  />
                </Field>
              </div>
              <label className="flex items-center gap-3 text-sm font-medium">
                <Switch
                  checked={editing.disponible}
                  onCheckedChange={(disponible) => setEditing({ ...editing, disponible })}
                />
                Disponible para la venta
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
