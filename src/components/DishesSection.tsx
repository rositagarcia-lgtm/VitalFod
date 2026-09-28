import { useState } from "react";
import { dishCategories, dishes } from "@/data/dishes";
import { DishCard } from "./DishCard";

export function DishesSection() {
  const [filter, setFilter] = useState<(typeof dishCategories)[number]>("Todos");
  const visible = filter === "Todos" ? dishes : dishes.filter((dish) => dish.category === filter);
  return (
    <section id="platillos" className="bg-background py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <div className="max-w-2xl"><p className="mb-3 text-xs font-extrabold uppercase tracking-[0.2em] text-brand-wine">Comer rico, sentirte bien</p><h2 className="text-3xl font-extrabold sm:text-5xl">Nuestros platillos</h2><p className="mt-4 text-muted-foreground">Opciones deliciosas preparadas para disfrutar y sentirte bien.</p></div>
        <div className="-mx-5 mt-9 flex gap-2 overflow-x-auto px-5 pb-3 sm:mx-0 sm:flex-wrap sm:px-0" role="group" aria-label="Filtrar platillos">
          {dishCategories.map((category) => <button key={category} onClick={() => setFilter(category)} aria-pressed={filter === category} className={`shrink-0 rounded-full border px-4 py-2 text-sm font-bold transition-colors ${filter === category ? "border-brand-wine bg-brand-wine text-brand-wine-foreground" : "border-border bg-card text-foreground hover:border-primary"}`}>{category}</button>)}
        </div>
        <div className="mt-7 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{visible.map((dish) => <DishCard key={dish.name} dish={dish} />)}</div>
      </div>
    </section>
  );
}