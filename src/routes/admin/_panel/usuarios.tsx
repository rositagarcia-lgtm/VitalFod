import { useState } from "react";
import { createFileRoute, redirect } from "@tanstack/react-router";
import { KeyRound, LockOpen, Pencil, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ConfirmDelete, Field, PageHeader, StatusBadge, SubmitButton } from "@/components/admin/ui";
import { ROLE_LABEL, UserAvatar } from "@/components/admin/AdminSidebar";
import { useAction } from "@/components/admin/hooks";
import {
  deleteUsuario,
  listUsuarios,
  resetUsuarioMfa,
  saveUsuario,
  unlockUsuario,
  type UsuarioInput,
} from "@/functions/admin/usuarios";
import { MODULOS } from "@/lib/permissions";
import { parseDbDate } from "@/lib/images";
import type { Modulo, Rol, Usuario } from "@/lib/types";

export const Route = createFileRoute("/admin/_panel/usuarios")({
  staticData: { title: "Usuarios y permisos", section: "Accesos" },
  beforeLoad: ({ context }) => {
    if (context.user.rol !== "admin") throw redirect({ to: "/admin" });
  },
  loader: () => listUsuarios(),
  component: UsuariosPage,
});

const dateFormat = new Intl.DateTimeFormat("es-PE", { dateStyle: "medium", timeStyle: "short" });

function formatDate(value: string | null) {
  if (!value) return "Nunca";
  const date = parseDbDate(value);
  return Number.isNaN(date.getTime()) ? value : dateFormat.format(date);
}

function UsuariosPage() {
  const usuarios = Route.useLoaderData();
  const { user: me } = Route.useRouteContext();
  const [editing, setEditing] = useState<UsuarioInput | null>(null);
  const { pending, run } = useAction();

  const open = (u?: Usuario) =>
    setEditing(
      u
        ? {
            id: u.id,
            nombre: u.nombre,
            email: u.email,
            rol: u.rol,
            activo: u.activo,
            permisos: u.permisos,
            password: "",
          }
        : {
            nombre: "",
            email: "",
            rol: "editor",
            activo: true,
            permisos: ["platillos"],
            password: "",
          },
    );

  const set = <K extends keyof UsuarioInput>(key: K, value: UsuarioInput[K]) =>
    setEditing((prev) => (prev ? { ...prev, [key]: value } : prev));

  const togglePermiso = (m: Modulo, on: boolean) =>
    setEditing((prev) =>
      prev
        ? {
            ...prev,
            permisos: on
              ? [...new Set([...prev.permisos, m])]
              : prev.permisos.filter((p) => p !== m),
          }
        : prev,
    );

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!editing) return;
    const ok = await run(
      () => saveUsuario({ data: editing }),
      editing.id
        ? "Usuario actualizado."
        : "Usuario creado. Al ingresar por primera vez configurará su verificación en dos pasos.",
    );
    if (ok) setEditing(null);
  };

  const isSelf = editing?.id === me.id;
  const permisosTexto = (u: Usuario) =>
    u.rol === "admin"
      ? "Todo el panel"
      : MODULOS.filter((m) => u.permisos.includes(m.id))
          .map((m) => m.nombre)
          .join(", ") || "Ninguna";

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Accesos"
        title="Usuarios y permisos"
        description="Quién puede entrar al panel y qué secciones puede modificar. Todos ingresan con contraseña y un código de su celular."
        action={
          <Button variant="burgundy" onClick={() => open()}>
            <UserPlus /> Nuevo usuario
          </Button>
        }
      />

      <div className="rounded-xl border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Usuario</TableHead>
              <TableHead>Puede modificar</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="hidden lg:table-cell">Último acceso</TableHead>
              <TableHead className="w-36 text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {usuarios.map((u) => (
              <TableRow key={u.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <UserAvatar name={u.nombre} />
                    <div className="min-w-0">
                      <p className="font-semibold">
                        {u.nombre}
                        {u.id === me.id && (
                          <span className="ml-2 text-xs font-normal text-muted-foreground">
                            (tú)
                          </span>
                        )}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">{u.email}</p>
                      <p className="text-xs font-semibold text-brand-wine">{ROLE_LABEL[u.rol]}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="max-w-56 text-sm">{permisosTexto(u)}</TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    <StatusBadge active={u.activo} on="Activo" off="Inactivo" />
                    <StatusBadge
                      active={u.totp_activo}
                      on="2 pasos activo"
                      off="2 pasos pendiente"
                    />
                    {u.bloqueado && (
                      <span className="inline-flex items-center rounded-md border border-destructive/30 bg-destructive/10 px-2 py-0.5 text-xs font-semibold text-destructive">
                        Bloqueado
                      </span>
                    )}
                  </div>
                </TableCell>
                <TableCell className="hidden text-muted-foreground lg:table-cell">
                  {formatDate(u.ultimo_acceso)}
                </TableCell>
                <TableCell className="text-right">
                  {u.bloqueado && (
                    <Button
                      variant="ghost"
                      size="icon"
                      title="Desbloquear cuenta"
                      aria-label={`Desbloquear a ${u.nombre}`}
                      onClick={() =>
                        void run(
                          () => unlockUsuario({ data: { id: u.id } }),
                          "Cuenta desbloqueada.",
                        )
                      }
                    >
                      <LockOpen />
                    </Button>
                  )}
                  {u.totp_activo && u.id !== me.id && (
                    <Button
                      variant="ghost"
                      size="icon"
                      title="Restablecer verificación en dos pasos (p. ej. si cambió de celular)"
                      aria-label={`Restablecer verificación en dos pasos de ${u.nombre}`}
                      onClick={() =>
                        void run(
                          () => resetUsuarioMfa({ data: { id: u.id } }),
                          "Listo. La próxima vez que ingrese, vinculará de nuevo su app de autenticación.",
                        )
                      }
                    >
                      <KeyRound />
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => open(u)}
                    aria-label={`Editar ${u.nombre}`}
                  >
                    <Pencil />
                  </Button>
                  {u.id !== me.id && (
                    <ConfirmDelete
                      title={`Eliminar a ${u.nombre}`}
                      description="Perderá el acceso al panel. Si solo quieres suspenderlo, desactívalo."
                      onConfirm={() =>
                        void run(() => deleteUsuario({ data: { id: u.id } }), "Usuario eliminado.")
                      }
                    />
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={editing !== null} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          {editing && (
            <form onSubmit={submit} className="grid gap-4">
              <DialogHeader>
                <DialogTitle>{editing.id ? "Editar usuario" : "Nuevo usuario"}</DialogTitle>
                <DialogDescription>
                  {editing.id
                    ? "Deja la contraseña vacía para mantener la actual."
                    : "Comparte la contraseña por un canal seguro. Al ingresar, la persona vinculará su app de autenticación."}
                </DialogDescription>
              </DialogHeader>
              <Field label="Nombre" htmlFor="nombre">
                <Input
                  id="nombre"
                  value={editing.nombre}
                  onChange={(e) => set("nombre", e.target.value)}
                  required
                />
              </Field>
              <Field
                label="Correo"
                htmlFor="email"
                hint="Solo correos autorizados (por ejemplo @gmail.com o @vitalfoods.pe)."
              >
                <Input
                  id="email"
                  type="email"
                  value={editing.email}
                  onChange={(e) => set("email", e.target.value)}
                  required
                />
              </Field>
              <Field
                label={editing.id ? "Nueva contraseña" : "Contraseña"}
                htmlFor="password"
                hint="Mínimo 10 caracteres. Se guarda cifrada."
              >
                <Input
                  id="password"
                  type="password"
                  autoComplete="new-password"
                  value={editing.password}
                  onChange={(e) => set("password", e.target.value)}
                  required={!editing.id}
                />
              </Field>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Tipo de acceso" htmlFor="rol">
                  <Select
                    value={editing.rol}
                    onValueChange={(v) => set("rol", v as Rol)}
                    disabled={isSelf}
                  >
                    <SelectTrigger id="rol">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Administrador (todo)</SelectItem>
                      <SelectItem value="editor">Editor (secciones elegidas)</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
                <label className="flex items-center gap-3 self-end pb-2 text-sm font-medium">
                  <Switch
                    checked={editing.activo}
                    onCheckedChange={(v) => set("activo", v)}
                    disabled={isSelf}
                  />
                  Puede ingresar
                </label>
              </div>
              <fieldset className="grid gap-2 rounded-lg border p-3">
                <legend className="px-1 text-sm font-semibold">
                  Secciones que puede modificar
                </legend>
                {MODULOS.map((m) => {
                  const checked = editing.rol === "admin" || editing.permisos.includes(m.id);
                  return (
                    <label key={m.id} className="flex items-start gap-3 rounded-md p-1 text-sm">
                      <input
                        type="checkbox"
                        className="mt-0.5 size-4 accent-[var(--color-brand-wine)]"
                        checked={checked}
                        disabled={editing.rol === "admin"}
                        onChange={(e) => togglePermiso(m.id, e.target.checked)}
                      />
                      <span>
                        <span className="font-medium">{m.nombre}</span>
                        <span className="block text-xs text-muted-foreground">{m.descripcion}</span>
                      </span>
                    </label>
                  );
                })}
                {editing.rol === "admin" && (
                  <p className="text-xs text-muted-foreground">
                    Los administradores pueden modificar todo, incluidos usuarios e historial.
                  </p>
                )}
              </fieldset>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setEditing(null)}>
                  Cancelar
                </Button>
                <SubmitButton pending={pending}>Guardar</SubmitButton>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
