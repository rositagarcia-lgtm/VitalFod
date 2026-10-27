import aboutImage from "@/assets/vital-foods-about.webp";
import { Leaf, Heart, Sparkles } from "lucide-react";

export function AboutSection() {
  return (
    <section id="nosotros" className="bg-cream py-20 sm:py-24">
      <div className="mx-auto grid max-w-7xl items-center gap-12 px-5 md:grid-cols-2 lg:gap-20 lg:px-8">
        <div className="relative">
          <img
            src={aboutImage}
            alt="Preparación de un platillo fresco en Vital Foods"
            width={1200}
            height={900}
            loading="lazy"
            className="aspect-[4/3] w-full rounded-lg object-cover shadow-[0_16px_40px_color-mix(in_oklab,var(--color-foreground)_10%,transparent)]"
          />
          <div className="absolute -bottom-5 right-5 rounded-lg bg-primary px-5 py-4 text-primary-foreground shadow-lg">
            <p className="text-sm font-extrabold">Fresco cada día</p>
          </div>
        </div>
        <div>
          <p className="mb-3 text-xs font-extrabold uppercase tracking-[0.2em] text-brand-wine">
            Nuestra esencia
          </p>
          <h2 className="text-3xl font-extrabold sm:text-5xl">Sobre Vital Foods</h2>
          <p className="mt-6 text-base leading-8 text-muted-foreground sm:text-lg">
            En Vital Foods creemos que comer saludable también puede ser delicioso. Preparamos
            opciones frescas y nutritivas para acompañar el día a día de quienes buscan cuidar su
            alimentación sin dejar de disfrutar.
          </p>
          <div className="mt-8 flex flex-wrap gap-6 text-sm font-bold">
            <span className="flex items-center gap-2">
              <Leaf className="text-primary" /> Fresco
            </span>
            <span className="flex items-center gap-2">
              <Heart className="text-brand-wine" /> Nutritivo
            </span>
            <span className="flex items-center gap-2">
              <Sparkles className="text-primary" /> Delicioso
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
