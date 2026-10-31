import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Field, PageHeader, SubmitButton } from "@/components/admin/ui";
import { ROLE_LABEL, UserAvatar } from "@/components/admin/AdminSidebar";
import { changePassword } from "@/functions/auth";

export const Route = createFileRoute("/admin/_panel/cuenta")({
  staticData: { title: "Seguridad de cuenta", section: "Mi cuenta" },
  component: CuentaPage,
});

const empty = { actual: "", nueva: "", confirmacion: "" };

function CuentaPage() {
  const { user } = Route.useRouteContext();
  const [form, setForm] = useState(empty);
  const [pending, setPending] = useState(false);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setPending(true);
    try {
      await changePassword({ data: form });
      toast.success("Contraseña actualizada.");
      setForm(empty);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se pudo cambiar la contraseña.");
    } finally {
      setPending(false);
    }
  };

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Cuenta"
        title="Seguridad de cuenta"
        description="Datos de tu acceso al panel."
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_1.4fr]">
        <section className="rounded-xl border bg-card p-6">
          <div className="flex items-center gap-4">
            <UserAvatar name={user.nombre} className="size-12 text-base" />
            <div>
              <p className="font-bold">{user.nombre}</p>
              <p className="text-sm text-muted-foreground">{user.email}</p>
              <p className="mt-1 text-xs font-semibold text-brand-wine">{ROLE_LABEL[user.rol]}</p>
              <p className="mt-3 inline-flex items-center gap-1.5 rounded-md border border-success/30 bg-success/10 px-2 py-1 text-xs font-semibold text-success">
                Verificación en dos pasos activa
              </p>
            </div>
          </div>
        </section>

        <form onSubmit={submit} className="grid gap-4 rounded-xl border bg-card p-6">
          <h2 className="font-bold">Cambiar contraseña</h2>
          <Field label="Contraseña actual" htmlFor="actual">
            <Input
              id="actual"
              type="password"
              autoComplete="current-password"
              value={form.actual}
              onChange={(e) => setForm({ ...form, actual: e.target.value })}
              required
            />
          </Field>
          <Field
            label="Nueva contraseña"
            htmlFor="nueva"
            hint="Mínimo 10 caracteres. Se guarda cifrada."
          >
            <Input
              id="nueva"
              type="password"
              autoComplete="new-password"
              value={form.nueva}
              onChange={(e) => setForm({ ...form, nueva: e.target.value })}
              required
            />
          </Field>
          <Field label="Repite la nueva contraseña" htmlFor="confirmacion">
            <Input
              id="confirmacion"
              type="password"
              autoComplete="new-password"
              value={form.confirmacion}
              onChange={(e) => setForm({ ...form, confirmacion: e.target.value })}
              required
            />
          </Field>
          <div>
            <SubmitButton pending={pending}>Actualizar contraseña</SubmitButton>
          </div>
        </form>
      </div>
    </div>
  );
}
