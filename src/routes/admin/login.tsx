import { useState } from "react";
import { Link, createFileRoute, redirect, useNavigate, useRouter } from "@tanstack/react-router";
import { ArrowLeft, Leaf, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field } from "@/components/admin/ui";
import { useAdminTheme } from "@/components/admin/hooks";
import { getCurrentUser, login } from "@/functions/auth";

export const Route = createFileRoute("/admin/login")({
  beforeLoad: async () => {
    if (await getCurrentUser()) throw redirect({ to: "/admin" });
  },
  head: () => ({
    meta: [{ title: "Iniciar sesión | Vital Foods" }, { name: "robots", content: "noindex" }],
  }),
  component: LoginPage,
});

function LoginPage() {
  useAdminTheme();
  const router = useRouter();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setPending(true);
    try {
      await login({ data: { email, password } });
      await router.invalidate();
      await navigate({ to: "/admin" });
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo iniciar sesión.");
      setPending(false);
    }
  };

  return (
    <div className="grid min-h-screen place-items-center bg-muted/40 px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center text-center">
          <span className="grid size-12 place-items-center rounded-full bg-primary text-primary-foreground">
            <Leaf className="size-6" strokeWidth={2.5} />
          </span>
          <h1 className="mt-4 text-2xl font-extrabold">Panel de administración</h1>
          <p className="mt-1 text-sm text-muted-foreground">Ingresa con tu cuenta de Vital Foods</p>
        </div>
        <form
          onSubmit={onSubmit}
          className="grid gap-4 rounded-xl border bg-card p-6 shadow-sm"
          noValidate
        >
          <Field label="Correo" htmlFor="email">
            <Input
              id="email"
              type="email"
              autoComplete="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoFocus
            />
          </Field>
          <Field label="Contraseña" htmlFor="password">
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </Field>
          {error && (
            <p
              role="alert"
              className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive"
            >
              {error}
            </p>
          )}
          <Button type="submit" variant="burgundy" disabled={pending} className="mt-1">
            {pending && <Loader2 className="animate-spin" />}
            Iniciar sesión
          </Button>
        </form>
        <Link
          to="/"
          className="mt-6 flex items-center justify-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" /> Volver al sitio
        </Link>
      </div>
    </div>
  );
}
