import { Leaf } from "lucide-react";
import type { Platillo } from "@/lib/types";
import { imageSrcSet, optimizedImage } from "@/lib/images";
import { PriceTag } from "./PriceTag";

export function DishCard({ dish, priority = false }: { dish: Platillo; priority?: boolean }) {
  const image = optimizedImage(dish.imagen_url, 800);
  const srcSet = imageSrcSet(dish.imagen_url, [400, 600, 800]);
  const enOferta = dish.precio_oferta !== null;
  const precioNuevo = !enOferta && dish.precio_reciente;

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-xl border border-border bg-card shadow-[0_6px_24px_color-mix(in_oklab,var(--color-foreground)_5%,transparent)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_12px_30px_color-mix(in_oklab,var(--color-foreground)_9%,transparent)] motion-reduce:transition-none motion-reduce:hover:translate-y-0">
      <div className="relative aspect-[4/3] overflow-hidden bg-lime-soft">
        {image ? (
          <img
            src={image}
            srcSet={srcSet}
            sizes="(min-width: 1024px) 400px, (min-width: 640px) 50vw, 100vw"
            alt={dish.nombre}
            width={800}
            height={600}
            loading={priority ? "eager" : "lazy"}
            decoding="async"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.035] motion-reduce:transition-none"
          />
        ) : (
          <div className="grid h-full place-items-center text-primary" aria-hidden="true">
            <Leaf className="size-12" />
          </div>
        )}
        {(enOferta || precioNuevo) && (
          <span
            className={`absolute left-3 top-3 rounded-full px-3 py-1 text-xs font-extrabold uppercase shadow-sm ${enOferta ? "bg-brand-wine text-brand-wine-foreground" : "bg-background text-brand-wine"}`}
          >
            {enOferta ? "Oferta" : "Precio actualizado"}
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col p-5">
        <p className="mb-1 text-xs font-bold uppercase tracking-wide text-brand-wine">
          {dish.categoria}
        </p>
        <h3 className="text-lg font-extrabold leading-snug">{dish.nombre}</h3>
        {dish.descripcion && (
          <p className="mt-2 line-clamp-3 text-sm leading-6 text-muted-foreground">
            {dish.descripcion}
          </p>
        )}
        <div className="mt-auto flex items-end justify-between gap-3 border-t border-border/70 pt-4">
          <span className="text-xs font-semibold text-muted-foreground">Precio en soles</span>
          <PriceTag precio={dish.precio} oferta={dish.precio_oferta} className="text-lg" />
        </div>
      </div>
    </article>
  );
}
