import { Leaf } from "lucide-react";
import type { Platillo } from "@/lib/types";
import { formatPrice, optimizedImage } from "@/lib/images";

export function DishCard({ dish }: { dish: Platillo }) {
  const image = optimizedImage(dish.imagen_url, 800);

  return (
    <article className="group overflow-hidden rounded-lg border border-border bg-card shadow-[0_6px_24px_color-mix(in_oklab,var(--color-foreground)_5%,transparent)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_12px_30px_color-mix(in_oklab,var(--color-foreground)_9%,transparent)]">
      <div className="aspect-[4/3] overflow-hidden bg-lime-soft">
        {image ? (
          <img
            src={image}
            alt={dish.nombre}
            width={800}
            height={600}
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.035]"
          />
        ) : (
          <div className="grid h-full place-items-center text-primary">
            <Leaf className="size-12" />
          </div>
        )}
      </div>
      <div className="p-5">
        <div className="mb-3 flex items-start justify-between gap-4">
          <div>
            <p className="mb-1 text-xs font-bold uppercase text-brand-wine">{dish.categoria}</p>
            <h3 className="text-lg font-extrabold">{dish.nombre}</h3>
          </div>
          <p className="shrink-0 font-extrabold text-brand-wine">{formatPrice(dish.precio)}</p>
        </div>
        {dish.descripcion && (
          <p className="text-sm leading-6 text-muted-foreground">{dish.descripcion}</p>
        )}
      </div>
    </article>
  );
}
