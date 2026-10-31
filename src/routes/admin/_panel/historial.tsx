import { useMemo, useState } from "react";
import { createFileRoute, redirect } from "@tanstack/react-router";
import { Pencil, Plus, Search, ShieldCheck, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { EmptyState, PageHeader } from "@/components/admin/ui";
import { ACCION, timeAgo } from "@/components/admin/NotificationsBell";
import { listActividad } from "@/functions/admin/usuarios";
import { parseDbDate } from "@/lib/images";
import type { Actividad } from "@/lib/types";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin/_panel/historial")({
  staticData: { title: "Historial de cambios", section: "Accesos" },
  beforeLoad: ({ context }) => {
    if (context.user.rol !== "admin") throw redirect({ to: "/admin" });
  },
  loader: () => listActividad(),
  component: HistorialPage,
});

const ICONO = { crear: Plus, editar: Pencil, eliminar: Trash2, seguridad: ShieldCheck } as const;
const COLOR: Record<Actividad["accion"], string> = {
  crear: "bg-success/10 text-success",
  editar: "bg-sky-500/10 text-sky-600 dark:text-sky-400",
  eliminar: "bg-destructive/10 text-destructive",
  seguridad: "bg-warning/15 text-warning",
};
const fecha = new Intl.DateTimeFormat("es-PE", { dateStyle: "medium", timeStyle: "short" });

function HistorialPage() {
  const actividad = Route.useLoaderData();
  const [query, setQuery] = useState("");

  const visibles = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return actividad;
    return actividad.filter((a) =>
      `${a.usuario} ${a.modulo} ${a.detalle}`.toLowerCase().includes(q),
    );
  }, [actividad, query]);

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Accesos"
        title="Historial de cambios"
        description="Quién cambió qué y cuándo. Sirve para revisar precios, publicaciones y accesos (últimos 200 registros)."
      />
      <div className="relative">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Buscar por persona, sección o platillo…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="bg-card pl-9"
          aria-label="Buscar en el historial"
        />
      </div>
      {visibles.length === 0 ? (
        <EmptyState>
          {actividad.length === 0 ? "Todavía no hay cambios registrados." : "Sin resultados."}
        </EmptyState>
      ) : (
        <ol className="divide-y overflow-hidden rounded-xl border bg-card">
          {visibles.map((a) => {
            const Icon = ICONO[a.accion];
            const d = parseDbDate(a.created_at);
            return (
              <li key={a.id} className="flex items-start gap-4 px-5 py-4">
                <span
                  className={cn(
                    "grid size-9 shrink-0 place-items-center rounded-full",
                    COLOR[a.accion],
                  )}
                >
                  <Icon className="size-4" aria-hidden="true" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm">
                    <span className="font-semibold">{a.usuario}</span>{" "}
                    <span className="text-muted-foreground">{ACCION[a.accion]}</span> {a.detalle}
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {a.modulo} ·{" "}
                    <time
                      dateTime={Number.isNaN(d.getTime()) ? a.created_at : d.toISOString()}
                      title={Number.isNaN(d.getTime()) ? a.created_at : fecha.format(d)}
                    >
                      {timeAgo(a.created_at)}
                    </time>
                  </p>
                </div>
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
}
