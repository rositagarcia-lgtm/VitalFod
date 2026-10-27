import { Clock3, MapPin, Navigation } from "lucide-react";
import type { Sede } from "@/lib/types";
import { Button } from "@/components/ui/button";

export function LocationCard({
  location,
  featured = false,
}: {
  location: Sede;
  featured?: boolean;
}) {
  return (
    <article
      className={`flex min-h-64 flex-col rounded-lg border p-6 ${featured ? "border-brand-wine bg-brand-wine text-brand-wine-foreground" : "border-border bg-card"}`}
    >
      <div
        className={`mb-5 grid size-10 place-items-center rounded-full ${featured ? "bg-primary text-primary-foreground" : "bg-lime-soft text-accent-foreground"}`}
      >
        <MapPin className="size-5" />
      </div>
      <h3 className="text-xl font-extrabold">{location.nombre}</h3>
      <p
        className={`mt-1 text-sm ${featured ? "text-brand-wine-foreground/80" : "text-muted-foreground"}`}
      >
        {location.direccion}
      </p>
      <div
        className={`mt-5 space-y-2 text-xs leading-5 ${featured ? "text-brand-wine-foreground/75" : "text-muted-foreground"}`}
      >
        <p className="flex gap-2">
          <Clock3 className="mt-0.5 size-4 shrink-0" />
          {location.horario}
        </p>
        {location.referencia && (
          <p className="flex gap-2">
            <MapPin className="mt-0.5 size-4 shrink-0" />
            {location.referencia}
          </p>
        )}
      </div>
      {location.mapa_url && (
        <Button asChild variant={featured ? "hero" : "outline"} className="mt-auto self-start">
          <a href={location.mapa_url} target="_blank" rel="noreferrer">
            Cómo llegar <Navigation />
          </a>
        </Button>
      )}
    </article>
  );
}
