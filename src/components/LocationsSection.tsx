import { locations } from "@/data/locations";
import { LocationCard } from "./LocationCard";

export function LocationsSection() {
  return (
    <section id="sedes" className="bg-background py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-5 lg:px-8"><div className="mb-10 flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><p className="mb-3 text-xs font-extrabold uppercase tracking-[0.2em] text-brand-wine">Siempre cerca de ti</p><h2 className="text-3xl font-extrabold sm:text-5xl">Encuéntranos</h2></div><p className="max-w-sm text-sm leading-6 text-muted-foreground">Visita tu sede favorita y disfruta opciones frescas preparadas al momento.</p></div><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{locations.map((location, index) => <LocationCard key={location.name} location={location} featured={index === 0} />)}</div></div>
    </section>
  );
}