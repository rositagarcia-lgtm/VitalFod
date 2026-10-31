import { useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Bell, Info, TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Alerta } from "@/functions/admin/dashboard";
import type { Actividad } from "@/lib/types";
import { parseDbDate } from "@/lib/images";
import { cn } from "@/lib/utils";

const hace = new Intl.RelativeTimeFormat("es", { numeric: "auto" });

export function timeAgo(value: string) {
  const diff = (parseDbDate(value).getTime() - Date.now()) / 1000;
  if (Number.isNaN(diff)) return value;
  const abs = Math.abs(diff);
  if (abs < 60) return "hace un momento";
  if (abs < 3600) return hace.format(Math.round(diff / 60), "minute");
  if (abs < 86400) return hace.format(Math.round(diff / 3600), "hour");
  return hace.format(Math.round(diff / 86400), "day");
}

/** Campana con pendientes del panel y los últimos cambios del equipo. */
export function NotificationsBell({
  alertas,
  recientes,
}: {
  alertas: Alerta[];
  recientes: Actividad[];
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        aria-haspopup="dialog"
        aria-label={`Notificaciones${alertas.length ? `: ${alertas.length} pendientes` : ""}`}
        className="relative"
      >
        <Bell />
        {alertas.length > 0 && (
          <span className="absolute right-1 top-1 grid min-w-4 place-items-center rounded-full bg-brand-wine px-1 text-[10px] font-bold leading-4 text-brand-wine-foreground">
            {alertas.length}
          </span>
        )}
      </Button>
      {open && (
        <div
          role="dialog"
          aria-label="Notificaciones"
          className="absolute right-0 top-11 z-50 w-[min(22rem,calc(100vw-2rem))] overflow-hidden rounded-xl border bg-popover text-popover-foreground shadow-xl"
        >
          <p className="border-b px-4 py-3 text-sm font-bold">Pendientes</p>
          {alertas.length === 0 ? (
            <p className="px-4 py-3 text-sm text-muted-foreground">No hay pendientes.</p>
          ) : (
            <ul className="max-h-56 divide-y overflow-y-auto">
              {alertas.map((a) => (
                <li key={`${a.detalle}-${a.titulo}`}>
                  <Link
                    to={a.to}
                    onClick={() => setOpen(false)}
                    className="flex items-start gap-3 px-4 py-2.5 text-sm hover:bg-muted"
                  >
                    {a.nivel === "media" ? (
                      <TriangleAlert className="mt-0.5 size-4 shrink-0 text-warning" />
                    ) : (
                      <Info className="mt-0.5 size-4 shrink-0 text-sky-600 dark:text-sky-400" />
                    )}
                    <span>
                      <span className="font-semibold">{a.titulo}</span>
                      <span className="text-muted-foreground"> · {a.detalle}</span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
          <p className="border-y px-4 py-3 text-sm font-bold">Cambios recientes</p>
          {recientes.length === 0 ? (
            <p className="px-4 py-3 text-sm text-muted-foreground">
              Todavía no hay cambios registrados.
            </p>
          ) : (
            <ul className="max-h-56 divide-y overflow-y-auto">
              {recientes.map((r) => (
                <li key={r.id} className="px-4 py-2.5 text-sm">
                  <p>
                    <span className="font-semibold">{r.usuario}</span>{" "}
                    <span className={cn("text-muted-foreground")}>{ACCION[r.accion]}</span>{" "}
                    {r.detalle}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {r.modulo} · {timeAgo(r.created_at)}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

export const ACCION: Record<Actividad["accion"], string> = {
  crear: "agregó",
  editar: "modificó",
  eliminar: "eliminó",
  seguridad: "·",
};
