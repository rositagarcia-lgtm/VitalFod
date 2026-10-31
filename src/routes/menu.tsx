import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Search, X } from "lucide-react";
import { SiteLayout } from "@/components/SiteLayout";
import { Breadcrumbs, type Crumb } from "@/components/Breadcrumbs";
import { CategoryNav } from "@/components/CategoryNav";
import { DishCard } from "@/components/DishCard";
import { getMenuData } from "@/functions/public";
import { parseDbDate } from "@/lib/images";
import type { Platillo } from "@/lib/types";

type MenuSearch = { categoria?: string | undefined };

export const Route = createFileRoute("/menu")({
  validateSearch: (search: Record<string, unknown>): MenuSearch => ({
    categoria:
      typeof search["categoria"] === "string" && search["categoria"]
        ? search["categoria"]
        : undefined,
  }),
  loader: () => getMenuData(),
  head: () => ({
    meta: [
      { title: "Menú | Vital Foods" },
      {
        name: "description",
        content:
          "Menú completo de Vital Foods con precios en soles: bowls, desayunos, ensaladas, snacks y bebidas.",
      },
    ],
  }),
  component: MenuPage,
});

const fechaLarga = new Intl.DateTimeFormat("es-PE", {
  day: "numeric",
  month: "long",
  year: "numeric",
});

function normalize(text: string) {
  return text.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
}

function MenuPage() {
  const { platillos, categorias, actualizado } = Route.useLoaderData();
  const { categoria } = Route.useSearch();
  const [query, setQuery] = useState("");

  const activa = categorias.some((c) => c.nombre === categoria) ? categoria : undefined;

  const grupos = useMemo(() => {
    const q = normalize(query.trim());
    const visibles = platillos.filter(
      (p) =>
        (!activa || p.categoria === activa) &&
        (!q || normalize(`${p.nombre} ${p.descripcion ?? ""} ${p.categoria}`).includes(q)),
    );
    const map = new Map<string, Platillo[]>();
    for (const p of visibles) map.set(p.categoria, [...(map.get(p.categoria) ?? []), p]);
    return [...map.entries()];
  }, [platillos, activa, query]);

  const crumbs: Crumb[] = [
    { label: "Inicio", to: "/" },
    { label: "Menú", to: "/menu" },
  ];
  if (activa) crumbs.push({ label: activa });

  const fecha = actualizado ? parseDbDate(actualizado) : null;
  const resultados = grupos.reduce((n, [, items]) => n + items.length, 0);

  return (
    <SiteLayout>
      <div className="mx-auto max-w-7xl px-5 pb-16 pt-24 md:pt-28 lg:px-8">
        <Breadcrumbs items={crumbs} />

        <div className="mt-4 max-w-3xl">
          <h1 className="text-3xl font-extrabold text-brand-wine sm:text-5xl">
            {activa ?? "Nuestro menú"}
          </h1>
          <p className="mt-3 text-muted-foreground">
            Todos los precios están en <strong className="text-foreground">soles (S/)</strong>.
            {fecha && !Number.isNaN(fecha.getTime()) && (
              <> Precios actualizados al {fechaLarga.format(fecha)}.</>
            )}
          </p>
        </div>

        <div className="mt-8 gap-8 lg:grid lg:grid-cols-[auto_minmax(0,1fr)]">
          <CategoryNav categorias={categorias} activa={activa} total={platillos.length} />

          <div className="mt-4 lg:mt-0">
            <div className="relative">
              <Search
                className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-muted-foreground"
                aria-hidden="true"
              />
              <label htmlFor="buscar" className="sr-only">
                Buscar en el menú
              </label>
              <input
                id="buscar"
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscar platillo o ingrediente…"
                autoComplete="off"
                className="h-12 w-full rounded-xl border bg-card pl-12 pr-12 text-base outline-none transition focus:border-primary focus:ring-2 focus:ring-ring/40"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  aria-label="Borrar búsqueda"
                  className="absolute right-2 top-1/2 grid size-9 -translate-y-1/2 place-items-center rounded-lg text-muted-foreground hover:bg-muted"
                >
                  <X className="size-4" />
                </button>
              )}
            </div>
            <p className="mt-3 text-sm text-muted-foreground" aria-live="polite">
              {resultados === 1 ? "1 platillo" : `${resultados} platillos`}
              {query ? ` para “${query.trim()}”` : ""}
            </p>

            {grupos.length === 0 ? (
              <div className="mt-8 rounded-xl border border-dashed px-6 py-12 text-center text-muted-foreground">
                No encontramos platillos con esa búsqueda.
              </div>
            ) : (
              grupos.map(([nombre, items]) => (
                <section key={nombre} aria-label={nombre} className="mt-8 first:mt-6">
                  {!activa && <h2 className="mb-4 text-xl font-extrabold sm:text-2xl">{nombre}</h2>}
                  <ul className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                    {items.map((dish, i) => (
                      <li key={dish.id}>
                        <DishCard dish={dish} priority={i < 3 && nombre === grupos[0]?.[0]} />
                      </li>
                    ))}
                  </ul>
                </section>
              ))
            )}
          </div>
        </div>
      </div>
    </SiteLayout>
  );
}
