import { useState } from "react";
import { Menu, X } from "lucide-react";
import { BrandLogo } from "./BrandLogo";
import { Button } from "@/components/ui/button";

const links = [
  { label: "Inicio", href: "#inicio" },
  { label: "Platillos", href: "#platillos" },
  { label: "Nosotros", href: "#nosotros" },
  { label: "Sedes", href: "#sedes" },
];

export function Header() {
  const [open, setOpen] = useState(false);
  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-border/70 bg-background/95 shadow-[0_1px_12px_color-mix(in_oklab,var(--color-foreground)_5%,transparent)] backdrop-blur-md">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5 lg:px-8">
        <BrandLogo />
        <nav aria-label="Navegación principal" className="hidden items-center gap-9 md:flex">
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm font-semibold text-foreground/75 transition-colors hover:text-brand-wine"
            >
              {link.label}
            </a>
          ))}
        </nav>
        <Button
          variant="ghost"
          size="icon"
          aria-label={open ? "Cerrar menú" : "Abrir menú"}
          aria-expanded={open}
          onClick={() => setOpen(!open)}
          className="md:hidden"
        >
          {open ? <X /> : <Menu />}
        </Button>
      </div>
      {open && (
        <nav
          aria-label="Navegación móvil"
          className="animate-slide-in border-t border-border bg-background px-5 py-4 md:hidden"
        >
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="block border-b border-border/70 py-3 text-base font-semibold last:border-0"
            >
              {link.label}
            </a>
          ))}
        </nav>
      )}
    </header>
  );
}
