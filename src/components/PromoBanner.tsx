import { useEffect, useState } from "react";
import { ArrowLeft, ArrowRight, ArrowUpRight, Leaf } from "lucide-react";
import { promotions } from "@/data/promotions";
import { Button } from "@/components/ui/button";

export function PromoBanner() {
  const [active, setActive] = useState(0);
  useEffect(() => { const timer = window.setInterval(() => setActive((value) => (value + 1) % promotions.length), 5000); return () => window.clearInterval(timer); }, []);
  const promo = promotions[active];
  if (!promo) return null;
  const move = (direction: number) => setActive((active + direction + promotions.length) % promotions.length);

  return (
    <section id="inicio" aria-label="Campañas de Vital Foods" aria-roledescription="carrusel" className={`campaign-banner campaign-${promo.variant} relative mt-20 overflow-hidden`}>
      <div className="campaign-shade absolute inset-0" />
      <div className="pointer-events-none absolute -left-20 top-16 h-64 w-64 rounded-full bg-primary/20 blur-3xl" />
      <div key={active} className="animate-slide-in relative mx-auto flex min-h-[680px] max-w-7xl items-center px-6 pb-24 pt-10 lg:min-h-[720px] lg:px-12">
        <div className="relative z-10 grid w-full grid-cols-1 items-center gap-5 md:grid-cols-[0.9fr_1.1fr] md:gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:gap-10">
          <div className="campaign-content max-w-xl">
            <div className="mb-4 flex items-center gap-3">
              <span className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-xs font-extrabold uppercase text-primary-foreground"><Leaf className="h-3.5 w-3.5" />{promo.eyebrow}</span>
            </div>
            <h1 className={`campaign-title font-extrabold leading-[0.96] tracking-normal text-brand-wine ${promo.variant === "launch" ? "text-5xl sm:text-6xl lg:text-8xl" : "text-4xl sm:text-5xl lg:text-6xl"}`}>{promo.title}</h1>
            <p className="campaign-copy mt-4 max-w-lg text-base font-semibold leading-6 text-foreground sm:text-lg sm:leading-7">{promo.description}</p>
            {promo.secondaryDescription && <p className="mt-3 max-w-lg text-sm font-medium leading-6 text-muted-foreground sm:text-base">{promo.secondaryDescription}</p>}
            <div className="mt-5 flex flex-wrap gap-2">
              {promo.features.map((feature) => <span key={feature} className="campaign-feature inline-flex items-center rounded-full px-3 py-2 text-[11px] font-extrabold uppercase sm:px-4 sm:text-xs">{feature}</span>)}
            </div>
            <div className="mt-6">
              <Button asChild variant="hero" size="xl"><a href="#platillos">{promo.cta}<ArrowUpRight /></a></Button>
            </div>
          </div>
          <div className="campaign-visual relative h-[260px] w-full sm:h-[330px] md:h-[500px] lg:h-[600px]">
            <img src={promo.image} alt={`Campaña ${promo.eyebrow}: ${promo.title}`} width={1920} height={1080} loading={active === 0 ? "eager" : "lazy"} fetchPriority={active === 0 ? "high" : "auto"} className="h-full w-full rounded-md object-cover object-center shadow-xl transition duration-700" />
            <div className="pointer-events-none absolute -right-6 -top-5 h-36 w-36 rounded-full bg-primary/30 blur-2xl lg:h-64 lg:w-64" />
            <div className="pointer-events-none absolute -bottom-5 left-4 h-24 w-24 rounded-[38%_62%_45%_55%] bg-brand-wine/20 lg:h-40 lg:w-40" />
            {promo.sticker && <span className="absolute right-4 top-4 inline-grid h-16 w-16 -rotate-6 place-items-center rounded-full border-2 border-brand-wine bg-background text-xs font-black text-brand-wine shadow-lg lg:right-6 lg:top-6 lg:h-20 lg:w-20">{promo.sticker}</span>}
          </div>
        </div>
      </div>

      <div className="absolute bottom-8 left-6 right-6 z-20 mx-auto flex max-w-7xl items-center justify-between lg:px-6">
        <div className="flex items-center gap-2" aria-label="Seleccionar promoción">{promotions.map((item, index) => <button key={item.title} onClick={() => setActive(index)} aria-label={`Ver campaña ${index + 1}: ${item.title}`} aria-current={active === index ? "true" : undefined} className={`h-1.5 rounded-full transition-all ${active === index ? "w-12 bg-primary" : "w-6 bg-foreground/25 hover:bg-foreground/45"}`} />)}</div>
        <div className="flex gap-2"><Button variant="outline" size="icon" onClick={() => move(-1)} aria-label="Campaña anterior" className="border border-foreground/20 bg-background/70 text-foreground backdrop-blur-md hover:bg-background hover:text-foreground"><ArrowLeft /></Button><Button variant="outline" size="icon" onClick={() => move(1)} aria-label="Campaña siguiente" className="border border-foreground/20 bg-background/70 text-foreground backdrop-blur-md hover:bg-background hover:text-foreground"><ArrowRight /></Button></div>
      </div>
    </section>
  );
}
