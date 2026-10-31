import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import type { Platillo } from "@/lib/types";
import { DishCard } from "./DishCard";

/** Vista previa del menú en la portada: pocos platillos y un acceso claro al menú completo. */
export function FeaturedSection({ dishes, total }: { dishes: Platillo[]; total: number }) {
  return (
    <section
      id="destacados"
      aria-labelledby="destacados-titulo"
      className="bg-background py-16 sm:py-24"
    >
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div className="max-w-2xl">
            <p className="mb-3 text-xs font-extrabold uppercase tracking-[0.2em] text-brand-wine">
              Comer rico, sentirte bien
            </p>
            <h2 id="destacados-titulo" className="text-3xl font-extrabold sm:text-5xl">
              Destacados del menú
            </h2>
          </div>
          <Link
            to="/menu"
            className="inline-flex h-11 items-center gap-2 self-start rounded-full border border-brand-wine px-5 text-sm font-bold text-brand-wine transition-colors hover:bg-brand-wine hover:text-brand-wine-foreground sm:self-auto"
          >
            Ver menú completo{total > 0 ? ` (${total})` : ""}{" "}
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </div>
        {dishes.length > 0 ? (
          <ul className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {dishes.map((dish) => (
              <li key={dish.id}>
                <DishCard dish={dish} />
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-10 text-muted-foreground">Pronto tendremos nuevos platillos.</p>
        )}
      </div>
    </section>
  );
}
