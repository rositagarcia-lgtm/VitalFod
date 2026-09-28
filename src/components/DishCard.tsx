import type { Dish } from "@/data/dishes";

export function DishCard({ dish }: { dish: Dish }) {
  return (
    <article className="group overflow-hidden rounded-lg border border-border bg-card shadow-[0_6px_24px_color-mix(in_oklab,var(--color-foreground)_5%,transparent)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_12px_30px_color-mix(in_oklab,var(--color-foreground)_9%,transparent)]">
      <div className="aspect-[4/3] overflow-hidden"><img src={dish.image} alt={dish.name} width={1400} height={1050} loading="lazy" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.035]" style={{ objectPosition: dish.position }} /></div>
      <div className="p-5">
        <div className="mb-3 flex items-start justify-between gap-4"><div><p className="mb-1 text-xs font-bold uppercase text-brand-wine">{dish.category}</p><h3 className="text-lg font-extrabold">{dish.name}</h3></div><p className="shrink-0 font-extrabold text-brand-wine">{dish.price}</p></div>
        <p className="text-sm leading-6 text-muted-foreground">{dish.description}</p>
      </div>
    </article>
  );
}