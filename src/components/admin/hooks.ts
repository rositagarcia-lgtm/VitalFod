import { useEffect, useState } from "react";
import { useRouter } from "@tanstack/react-router";
import { toast } from "sonner";

/** Ejecuta una acción del servidor, muestra el resultado y recarga los datos de la ruta. */
export function useAction() {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  const run = async (action: () => Promise<unknown>, success?: string): Promise<boolean> => {
    setPending(true);
    try {
      await action();
      if (success) toast.success(success);
      await router.invalidate();
      return true;
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Ocurrió un error inesperado.");
      return false;
    } finally {
      setPending(false);
    }
  };

  return { pending, run };
}

const THEME_KEY = "vf-theme";

/** Modo claro/oscuro del panel. Al salir del panel se vuelve al tema claro del sitio. */
export function useAdminTheme() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    let stored: string | null = null;
    try {
      stored = localStorage.getItem(THEME_KEY);
    } catch {
      // almacenamiento no disponible: se queda en claro
    }
    const isDark = stored === "dark";
    document.documentElement.classList.toggle("dark", isDark);
    setDark(isDark);
    return () => document.documentElement.classList.remove("dark");
  }, []);

  const toggle = () => {
    const next = !dark;
    document.documentElement.classList.toggle("dark", next);
    try {
      localStorage.setItem(THEME_KEY, next ? "dark" : "light");
    } catch {
      // sin persistencia
    }
    setDark(next);
  };

  return { dark, toggle };
}
