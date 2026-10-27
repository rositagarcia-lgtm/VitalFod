import { defineConfig, loadEnv } from "vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import tsConfigPaths from "vite-tsconfig-paths";
import { nitro } from "nitro/vite";

export default defineConfig(({ command, mode }) => {
  // Las server functions leen process.env; en desarrollo se cargan desde .env
  Object.assign(process.env, { ...loadEnv(mode, process.cwd(), ""), ...process.env });

  return {
    resolve: {
      dedupe: ["react", "react-dom", "react/jsx-runtime", "react/jsx-dev-runtime"],
    },
    // Sin index.html Vite descubre dependencias al navegar y re-optimiza a mitad de carga,
    // lo que duplica React en desarrollo; por eso se declaran por adelantado.
    optimizeDeps: {
      include: [
        "@radix-ui/react-alert-dialog",
        "@radix-ui/react-dialog",
        "@radix-ui/react-label",
        "@radix-ui/react-select",
        "@radix-ui/react-separator",
        "@radix-ui/react-slot",
        "@radix-ui/react-switch",
        "@radix-ui/react-tooltip",
        "class-variance-authority",
        "clsx",
        "lucide-react",
        "sonner",
        "tailwind-merge",
        "react",
        "react-dom",
        "react-dom/client",
        "react/jsx-runtime",
        "react/jsx-dev-runtime",
      ],
    },
    plugins: [
      tailwindcss(),
      tsConfigPaths({ projects: ["./tsconfig.json"] }),
      tanstackStart({
        importProtection: {
          behavior: "error",
          client: { files: ["**/server/**"], specifiers: ["server-only"] },
        },
      }),
      ...(command === "build" ? [nitro()] : []),
      viteReact(),
    ],
  };
});
