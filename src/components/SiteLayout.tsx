import type { ReactNode } from "react";
import { Header, MobileNav } from "./Header";
import { Footer } from "./Footer";

export function SiteLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen overflow-x-hidden bg-background">
      <a
        href="#contenido"
        className="sr-only z-[60] rounded-md bg-brand-wine px-4 py-2 font-bold text-brand-wine-foreground focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
      >
        Saltar al contenido
      </a>
      <Header />
      <main id="contenido" tabIndex={-1} className="outline-none">
        {children}
      </main>
      <Footer />
      <MobileNav />
    </div>
  );
}
