import { useState } from "react";
import { createFileRoute, redirect } from "@tanstack/react-router";
import { Pencil, UserPlus } from "lucide-react";
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
  saveUsuario,
  type UsuarioInput,
} from "@/functions/admin/usuarios";
import type { Rol, Usuario } from "@/lib/types";

export const Route = createFileRoute("/admin/_panel/usuarios")({
  staticData: { title: "Usuarios" },
  beforeLoad: ({ context }) => {
    if (context.user.rol !== "admin") throw redirect({ to: "/admin" });
  },
  loader: () => listUsuarios(),
  component: UsuariosPage,
});

const dateFormat = new Intl.DateTimeFormat("es-PE", { dateStyle: "medium", timeStyle: "short" });

function formatDate(value: string | null) {
  if (!value) return "Nunca";
  // Postgres devuelve "2026-01-10 09:00:00.123+00"; se normaliza a ISO 8601
  const date = new Date(value.replace(" ", "T").replace(/([+-]\d{2})$/, "$1:00"));
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
        ? { id: u.id, nombre: u.nombre, email: u.email, rol: u.rol, activo: u.activo, password: "" }
        : { nombre: "", email: "", rol: "editor", activo: true, password: "" },
    );

  const set = <K extends keyof UsuarioInput>(key: K, value: UsuarioInput[K]) =>
    setEditing((prev) => (prev ? { ...prev, [key]: value } : prev));

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!editing) return;
    const ok = await run(
      () => saveUsuario({ data: editing }),
      editing.id ? "Usuario actualizado." : "Usuario creado.",
    );
    if (ok) setEditing(null);
  };

  const isSelf = editing?.id === me.id;

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Accesos"
        title="Usuarios"
        description="Personas con acceso al panel. Los editores no pueden gestionar usuarios."
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
              <TableHead>Rol</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="hidden md:table-cell">Último acceso</TableHead>
              <TableHead className="w-24 text-right">Acciones</TableHead>
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
                    </div>
                  </div>
                </TableCell>
                <TableCell>{ROLE_LABEL[u.rol]}</TableCell>
                <TableCell>
                  <StatusBadge active={u.activo} on="Activo" off="Inactivo" />
                </TableCell>
                <TableCell className="hidden text-muted-foreground md:table-cell">
                  {formatDate(u.ultimo_acceso)}
                </TableCell>
                <TableCell className="text-right">
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
        <DialogContent>
          {editing && (
            <form onSubmit={submit} className="grid gap-4">
              <DialogHeader>
                <DialogTitle>{editing.id ? "Editar usuario" : "Nuevo usuario"}</DialogTitle>
                <DialogDescription>
                  {editing.id
                    ? "Deja la contraseña vacía para mantener la actual."
                    : "Comparte la contraseña con la persona por un canal seguro."}
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
              <Field label="Correo" htmlFor="email">
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
                hint="Mínimo 8 caracteres."
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
                <Field label="Rol" htmlFor="rol">
                  <Select
                    value={editing.rol}
                    onValueChange={(v) => set("rol", v as Rol)}
                    disabled={isSelf}
                  >
                    <SelectTrigger id="rol">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Administrador</SelectItem>
                      <SelectItem value="editor">Editor</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
                <label className="flex items-center gap-3 self-end pb-2 text-sm font-medium">
                  <Switch
                    checked={editing.activo}
                    onCheckedChange={(v) => set("activo", v)}
                    disabled={isSelf}
                  />
                  Activo
                </label>
              </div>
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
