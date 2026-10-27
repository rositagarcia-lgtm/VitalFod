import {
  Outlet,
  createFileRoute,
  redirect,
  useMatches,
  useNavigate,
  useRouter,
} from "@tanstack/react-router";
import { LogOut, Moon, Sun } from "lucide-react";
import { Toaster } from "@/components/ui/sonner";
import { Button } from "@/components/ui/button";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AdminSidebar, ROLE_LABEL, UserAvatar } from "@/components/admin/AdminSidebar";
import { useAdminTheme } from "@/components/admin/hooks";
import { getPanelSession, logout } from "@/functions/auth";
import { getDashboard } from "@/functions/admin/dashboard";

declare module "@tanstack/react-router" {
  interface StaticDataRouteOption {
    title?: string;
  }
}

export const Route = createFileRoute("/admin/_panel")({
  beforeLoad: async () => {
    const { user, cloudinary } = await getPanelSession();
    if (!user) throw redirect({ to: "/admin/login" });
    return { user, cloudinary };
  },
  loader: async () => ({ alertCount: (await getDashboard()).alertas.length }),
  head: () => ({
    meta: [{ title: "Panel | Vital Foods" }, { name: "robots", content: "noindex" }],
  }),
  component: PanelLayout,
});

function PanelLayout() {
  const { user } = Route.useRouteContext();
  const { alertCount } = Route.useLoaderData();
  const { dark, toggle } = useAdminTheme();
  const router = useRouter();
  const navigate = useNavigate();
  const matches = useMatches();
  const title = [...matches].reverse().find((m) => m.staticData.title)?.staticData.title;

  const handleLogout = async () => {
    await logout();
    await router.invalidate();
    await navigate({ to: "/admin/login" });
  };

  return (
    <TooltipProvider delayDuration={200}>
      <SidebarProvider>
        <AdminSidebar user={user} alertCount={alertCount} onLogout={handleLogout} />
        <SidebarInset className="min-w-0 bg-muted/40">
          <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b bg-background/95 px-4 backdrop-blur md:px-6">
            <SidebarTrigger className="md:hidden" />
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground">Vital Foods</p>
              <p className="truncate text-base font-bold">{title ?? "Panel de administración"}</p>
            </div>
            <div className="ml-auto flex items-center gap-1 sm:gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={toggle}
                aria-label={dark ? "Activar modo claro" : "Activar modo oscuro"}
              >
                {dark ? <Sun /> : <Moon />}
              </Button>
              <div className="hidden items-center gap-3 sm:flex">
                <UserAvatar name={user.nombre} />
                <div className="leading-tight">
                  <p className="text-sm font-semibold">{user.nombre}</p>
                  <p className="text-xs text-muted-foreground">{ROLE_LABEL[user.rol]}</p>
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={handleLogout} aria-label="Cerrar sesión">
                <LogOut />
              </Button>
            </div>
          </header>
          <div className="mx-auto w-full max-w-6xl px-4 py-8 md:px-8 md:py-10">
            <Outlet />
          </div>
        </SidebarInset>
      </SidebarProvider>
      <Toaster position="top-right" richColors closeButton />
    </TooltipProvider>
  );
}
