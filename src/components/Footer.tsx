import { Instagram, Mail, Phone } from "lucide-react";
import { BrandLogo } from "./BrandLogo";

export function Footer() {
  return (
    <footer className="bg-brand-wine text-brand-wine-foreground">
      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-14 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr] lg:px-8">
        <div>
          <BrandLogo inverse />
          <p className="mt-5 max-w-xs text-sm leading-6 text-brand-wine-foreground/70">
            Comida fresca, nutritiva y deliciosa para acompañar cada momento de tu día.
          </p>
        </div>
        <div>
          <p className="mb-4 text-xs font-extrabold uppercase tracking-[0.18em] text-primary">
            Explora
          </p>
          <nav className="grid gap-3 text-sm">
            <a href="#inicio">Inicio</a>
            <a href="#platillos">Platillos</a>
            <a href="#nosotros">Nosotros</a>
            <a href="#sedes">Sedes</a>
          </nav>
        </div>
        <div>
          <p className="mb-4 text-xs font-extrabold uppercase tracking-[0.18em] text-primary">
            Conversemos
          </p>
          <div className="grid gap-3 text-sm text-brand-wine-foreground/80">
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2"
            >
              <Instagram className="size-4" /> Instagram
            </a>
            <a href="mailto:hola@vitalfoods.pe" className="flex items-center gap-2">
              <Mail className="size-4" /> hola@vitalfoods.pe
            </a>
            <a href="tel:+51000000000" className="flex items-center gap-2">
              <Phone className="size-4" /> Contáctanos
            </a>
          </div>
        </div>
      </div>
      <div className="border-t border-brand-wine-foreground/15">
        <div className="mx-auto max-w-7xl px-5 py-5 text-xs text-brand-wine-foreground/60 lg:px-8">
          © 2026 Vital Foods. Todos los derechos reservados.
        </div>
      </div>
    </footer>
  );
}
