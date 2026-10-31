import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ChevronDown, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { cn } from "@/lib/utils";

type Cat = { nombre: string; total: number };

const STORAGE_KEY = "vf-menu-lateral";

function CategoryLinks({
  categorias,
  activa,
  total,
  onSelect,
}: {
  categorias: Cat[];
  activa: string | undefined;
  total: number;
  onSelect?: () => void;
}) {
  const items = [
    { nombre: "Todos", total, value: undefined },
    ...categorias.map((c) => ({ ...c, value: c.nombre })),
  ];
  return (
    <ul className="grid gap-1">
      {items.map((c) => {
        const current = activa === c.value;
        return (
          <li key={c.nombre}>
            <Link
              to="/menu"
              search={c.value ? { categoria: c.value } : {}}
              onClick={onSelect}
              aria-current={current ? "page" : undefined}
              className={cn(
                "flex min-h-11 items-center justify-between gap-3 rounded-lg px-3 text-sm font-semibold transition-colors",
                current ? "bg-brand-wine text-brand-wine-foreground" : "hover:bg-muted",
              )}
            >
              <span className="truncate">{c.nombre}</span>
              <span
                className={cn(
                  "rounded-full px-2 text-xs tabular-nums",
                  current ? "bg-brand-wine-foreground/20" : "bg-muted text-muted-foreground",
                )}
              >
                {c.total}
              </span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

/**
 * Menú de categorías. En computadoras es una barra lateral que se puede contraer para dejar
 * más espacio a los platillos; en celulares es un desplegable que solo se abre cuando se necesita.
 */
export function CategoryNav({
  categorias,
  activa,
  total,
}: {
  categorias: Cat[];
  activa: string | undefined;
  total: number;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    try {
      setCollapsed(localStorage.getItem(STORAGE_KEY) === "contraido");
    } catch {
      // sin almacenamiento: queda expandido
    }
  }, []);

  const toggle = () => {
    const next = !collapsed;
    setCollapsed(next);
    try {
      localStorage.setItem(STORAGE_KEY, next ? "contraido" : "expandido");
    } catch {
      // sin persistencia
    }
  };

  return (
    <>
      {/* Celulares y tablets */}
      <div className="lg:hidden">
        <button
          type="button"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-expanded={mobileOpen}
          aria-controls="categorias-movil"
          className="flex min-h-12 w-full items-center justify-between rounded-xl border bg-card px-4 text-left font-bold"
        >
          <span>
            Categoría: <span className="text-brand-wine">{activa ?? "Todos"}</span>
          </span>
          <ChevronDown
            className={cn("size-5 transition-transform", mobileOpen && "rotate-180")}
            aria-hidden="true"
          />
        </button>
        {mobileOpen && (
          <div id="categorias-movil" className="mt-2 rounded-xl border bg-card p-2">
            <CategoryLinks
              categorias={categorias}
              activa={activa}
              total={total}
              onSelect={() => setMobileOpen(false)}
            />
          </div>
        )}
      </div>

      {/* Computadoras */}
      <aside
        aria-label="Categorías del menú"
        className={cn(
          "sticky top-28 hidden self-start rounded-xl border bg-card p-3 transition-[width] duration-200 lg:block",
          collapsed ? "w-14" : "w-64",
        )}
      >
        <div
          className={cn(
            "mb-2 flex items-center",
            collapsed ? "justify-center" : "justify-between pl-3",
          )}
        >
          {!collapsed && (
            <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-muted-foreground">
              Categorías
            </p>
          )}
          <button
            type="button"
            onClick={toggle}
            aria-expanded={!collapsed}
            aria-label={collapsed ? "Mostrar categorías" : "Ocultar categorías"}
            title={collapsed ? "Mostrar categorías" : "Ocultar categorías"}
            className="grid size-9 place-items-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            {collapsed ? (
              <PanelLeftOpen className="size-5" />
            ) : (
              <PanelLeftClose className="size-5" />
            )}
          </button>
        </div>
        {!collapsed && <CategoryLinks categorias={categorias} activa={activa} total={total} />}
      </aside>
    </>
  );
}
