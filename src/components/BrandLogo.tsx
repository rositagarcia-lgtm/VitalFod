import { Leaf } from "lucide-react";

export function BrandLogo({ inverse = false }: { inverse?: boolean }) {
  return (
    <a href="#inicio" aria-label="Vital Foods, ir al inicio" className="inline-flex items-center gap-2.5">
      <span className="grid size-9 place-items-center rounded-full bg-primary text-primary-foreground"><Leaf className="size-5" strokeWidth={2.5} /></span>
      <span className={`text-xl font-extrabold leading-none ${inverse ? "text-brand-wine-foreground" : "text-brand-wine"}`}>vital<span className="text-primary">foods</span></span>
    </a>
  );
}