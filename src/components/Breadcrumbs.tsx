import { Link } from "@tanstack/react-router";
import { ChevronRight } from "lucide-react";

export type Crumb = { label: string; to?: "/" | "/menu" };

/** Ruta de navegación: muestra dónde está el usuario y cómo volver. */
export function Breadcrumbs({ items }: { items: Crumb[] }) {
  return (
    <nav aria-label="Ruta de navegación" className="text-sm">
      <ol className="flex flex-wrap items-center gap-1 text-muted-foreground">
        {items.map((item, i) => {
          const last = i === items.length - 1;
          return (
            <li key={item.label} className="flex items-center gap-1">
              {item.to && !last ? (
                <Link
                  to={item.to}
                  className="rounded px-1 font-semibold hover:text-brand-wine hover:underline"
                >
                  {item.label}
                </Link>
              ) : (
                <span
                  aria-current={last ? "page" : undefined}
                  className="px-1 font-bold text-foreground"
                >
                  {item.label}
                </span>
              )}
              {!last && <ChevronRight className="size-4" aria-hidden="true" />}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
