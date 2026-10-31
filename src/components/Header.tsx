import { Link, useRouterState } from "@tanstack/react-router";
import { Home, Info, MapPin, UtensilsCrossed, type LucideIcon } from "lucide-react";
import { BrandLogo } from "./BrandLogo";
import { cn } from "@/lib/utils";

type NavItem = { label: string; to: "/" | "/menu"; hash?: string; icon: LucideIcon };

export const NAV_ITEMS: NavItem[] = [
  { label: "Inicio", to: "/", icon: Home },
  { label: "Menú", to: "/menu", icon: UtensilsCrossed },
  { label: "Nosotros", to: "/", hash: "nosotros", icon: Info },
  { label: "Sedes", to: "/", hash: "sedes", icon: MapPin },
];

function useIsActive() {
  const { pathname, hash } = useRouterState({ select: (s) => s.location });
  return (item: NavItem) =>
    item.to === "/menu"
      ? pathname.startsWith("/menu")
      : pathname === "/" && (item.hash ?? "") === (hash ?? "");
}

export function Header() {
  const isActive = useIsActive();
  const enMenu = useRouterState({ select: (st) => st.location.pathname.startsWith("/menu") });

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-border/70 bg-background/95 pt-[env(safe-area-inset-top)] shadow-[0_1px_12px_color-mix(in_oklab,var(--color-foreground)_5%,transparent)] backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 md:h-20 lg:px-8">
        <BrandLogo />
        <nav aria-label="Navegación principal" className="hidden items-center gap-2 md:flex">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.label}
              to={item.to}
              {...(item.hash ? { hash: item.hash } : {})}
              aria-current={isActive(item) ? "page" : undefined}
              className={cn(
                "rounded-full px-4 py-2 text-sm font-semibold transition-colors",
                isActive(item)
                  ? "bg-lime-soft text-brand-wine"
                  : "text-foreground/75 hover:bg-muted hover:text-brand-wine",
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        {!enMenu && (
          <Link
            to="/menu"
            className="inline-flex h-10 items-center rounded-full bg-primary px-4 text-sm font-bold text-primary-foreground md:hidden"
          >
            Ver menú
          </Link>
        )}
      </div>
    </header>
  );
}

/** Barra inferior para celulares, como en una app: siempre visible y con botones grandes. */
export function MobileNav() {
  const isActive = useIsActive();

  return (
    <nav
      aria-label="Navegación móvil"
      className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-background/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md md:hidden"
    >
      <ul className="grid grid-cols-4">
        {NAV_ITEMS.map((item) => (
          <li key={item.label}>
            <Link
              to={item.to}
              {...(item.hash ? { hash: item.hash } : {})}
              aria-current={isActive(item) ? "page" : undefined}
              className={cn(
                "flex min-h-14 flex-col items-center justify-center gap-1 text-[11px] font-bold",
                isActive(item) ? "text-brand-wine" : "text-muted-foreground",
              )}
            >
              <item.icon className="size-5" aria-hidden="true" />
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
