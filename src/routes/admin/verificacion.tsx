import { useEffect, useState } from "react";
import { Link, createFileRoute, redirect, useNavigate, useRouter } from "@tanstack/react-router";
import { ArrowLeft, Loader2, ShieldCheck, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field } from "@/components/admin/ui";
import { useAdminTheme } from "@/components/admin/hooks";
import { getCurrentUser, getMfaState, startMfaSetup, verifyMfa } from "@/functions/auth";

export const Route = createFileRoute("/admin/verificacion")({
  beforeLoad: async () => {
    if (await getCurrentUser()) throw redirect({ to: "/admin" });
    const estado = await getMfaState();
    if (!estado) throw redirect({ to: "/admin/login" });
    return { estado };
  },
  head: () => ({
    meta: [
      { title: "Verificación en dos pasos | Vital Foods" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: VerificacionPage,
});

function VerificacionPage() {
  useAdminTheme();
  const { estado } = Route.useRouteContext();
  const router = useRouter();
  const navigate = useNavigate();
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [setup, setSetup] = useState<{ secret: string; qr: string } | null>(null);
  const configurar = estado.modo === "configurar";

  useEffect(() => {
    if (!configurar) return;
    startMfaSetup()
      .then(setSetup)
      .catch((e: unknown) =>
        setError(e instanceof Error ? e.message : "No se pudo preparar el código QR."),
      );
  }, [configurar]);

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setPending(true);
    try {
      await verifyMfa({ data: { code } });
      await router.invalidate();
      await navigate({ to: "/admin" });
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo verificar el código.");
      setCode("");
      setPending(false);
    }
  };

  return (
    <div className="grid min-h-screen place-items-center bg-muted/40 px-4 py-10">
      <div className="w-full max-w-md">
        <div className="mb-6 flex flex-col items-center text-center">
          <span className="grid size-12 place-items-center rounded-full bg-primary text-primary-foreground">
            <ShieldCheck className="size-6" />
          </span>
          <h1 className="mt-4 text-2xl font-extrabold">Verificación en dos pasos</h1>
          <p className="mt-1 text-sm text-muted-foreground">Paso 2 de 2 · {estado.email}</p>
        </div>

        <form
          onSubmit={onSubmit}
          className="grid gap-5 rounded-xl border bg-card p-6 shadow-sm"
          noValidate
        >
          {configurar ? (
            <div className="grid gap-4 text-sm">
              <p className="font-semibold">
                Por seguridad, el panel pide un código de tu celular además de la contraseña. Solo
                se configura una vez:
              </p>
              <ol className="grid list-decimal gap-2 pl-5 text-muted-foreground">
                <li>
                  Instala una app de autenticación en tu celular:{" "}
                  <strong className="text-foreground">Google Authenticator</strong> o{" "}
                  <strong className="text-foreground">Microsoft Authenticator</strong>.
                </li>
                <li>En la app, elige “Agregar cuenta” y escanea este código.</li>
                <li>Escribe abajo el código de 6 dígitos que aparece en la app.</li>
              </ol>
              <div className="grid place-items-center rounded-lg border bg-white p-3">
                {setup ? (
                  <div
                    role="img"
                    aria-label="Código QR para vincular la app de autenticación"
                    className="size-48 [&>svg]:h-full [&>svg]:w-full"
                    dangerouslySetInnerHTML={{ __html: setup.qr }}
                  />
                ) : (
                  <Loader2 className="my-20 size-6 animate-spin text-muted-foreground" />
                )}
              </div>
              {setup && (
                <details className="rounded-lg bg-muted/60 px-3 py-2 text-xs">
                  <summary className="cursor-pointer font-semibold">
                    ¿No puedes escanear? Escribe esta clave
                  </summary>
                  <code className="mt-2 block break-all font-mono text-sm tracking-wider">
                    {setup.secret.match(/.{1,4}/g)?.join(" ")}
                  </code>
                </details>
              )}
            </div>
          ) : (
            <p className="flex items-start gap-3 text-sm text-muted-foreground">
              <Smartphone className="mt-0.5 size-5 shrink-0 text-brand-wine" />
              Abre tu app de autenticación y escribe el código de 6 dígitos de Vital Foods.
            </p>
          )}

          <Field label="Código de 6 dígitos" htmlFor="code">
            <Input
              id="code"
              inputMode="numeric"
              autoComplete="one-time-code"
              pattern="[0-9]*"
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
              className="h-12 text-center font-mono text-2xl tracking-[0.5em]"
              autoFocus
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
          <Button type="submit" variant="burgundy" disabled={pending || code.length !== 6}>
            {pending && <Loader2 className="animate-spin" />}
            {configurar ? "Activar y entrar" : "Verificar y entrar"}
          </Button>
        </form>
        <Link
          to="/admin/login"
          className="mt-6 flex items-center justify-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" /> Volver al inicio de sesión
        </Link>
      </div>
    </div>
  );
}
