import { useState } from "react";
import { PageHeader } from "../ui";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { ShieldCheck, Pencil, UserCog } from "lucide-react";
import {
  useAuth, usePermissoes, ALL_MODULOS, MODULO_LABEL,
  type Modulo, type Usuario,
} from "../AuthContext";
import { Navigate } from "react-router-dom";

/**
 * Tela de gestão de acessos por módulo (mock).
 * Em produção, isso vira RLS via tabela user_roles + user_module_access,
 * nunca hardcoded em profiles — ver docs/security.md
 */
export const AcessosPage = () => {
  const { usuarios, atualizarModulos } = useAuth();
  const { isAdmin } = usePermissoes();
  const [editing, setEditing] = useState<Usuario | null>(null);

  if (!isAdmin) return <Navigate to="/app" replace />;

  return (
    <>
      <PageHeader
        eyebrow="Administração · Acessos"
        title="Módulos permitidos por usuário"
        subtitle="Conceda ou revogue o acesso de cada usuário aos núcleos da plataforma. Administradores enxergam todos os módulos por padrão."
      />
      <div className="p-6 lg:p-8 space-y-6">
        <div className="border-2 border-foreground bg-accent/20 p-4 shadow-brutal-sm flex items-start gap-3">
          <ShieldCheck className="h-4 w-4 mt-0.5" />
          <div className="text-xs">
            <div className="font-bold">Modelo de permissões (V1 · mock local)</div>
            <div className="text-muted-foreground">
              Em produção, essa matriz será servida por{" "}
              <code className="font-mono">user_roles</code> +{" "}
              <code className="font-mono">user_module_access</code> com RLS — jamais em{" "}
              <code className="font-mono">profiles</code>.
            </div>
          </div>
        </div>

        <div className="border-2 border-foreground bg-card shadow-brutal-sm overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-foreground text-background">
              <tr>
                <th className="text-left p-3">Usuário</th>
                <th className="text-left p-3 font-mono text-[10px] uppercase tracking-widest">Perfil</th>
                <th className="text-left p-3 font-mono text-[10px] uppercase tracking-widest">Módulos permitidos</th>
                <th className="text-right p-3 font-mono text-[10px] uppercase tracking-widest">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y-2 divide-foreground">
              {usuarios.map((u) => (
                <tr key={u.id} className="hover:bg-muted/30">
                  <td className="p-3">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 border-2 border-foreground bg-primary text-primary-foreground grid place-items-center font-display text-sm shadow-brutal-sm">
                        {u.nome.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase()}
                      </div>
                      <div>
                        <div className="font-bold">{u.nome}</div>
                        <div className="text-[11px] font-mono text-muted-foreground">{u.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="p-3">
                    <Badge
                      variant="outline"
                      className={
                        u.perfil === "admin"
                          ? "border-2 border-foreground bg-primary/20 uppercase font-mono text-[10px]"
                          : "border-2 border-foreground bg-muted uppercase font-mono text-[10px]"
                      }
                    >
                      {u.perfil}
                    </Badge>
                  </td>
                  <td className="p-3">
                    {u.perfil === "admin" ? (
                      <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                        Todos os módulos (admin)
                      </span>
                    ) : (
                      <div className="flex flex-wrap gap-1.5">
                        {u.modulosPermitidos.length === 0 && (
                          <span className="font-mono text-[10px] uppercase tracking-widest text-destructive">
                            Nenhum
                          </span>
                        )}
                        {u.modulosPermitidos.map((m) => (
                          <span key={m}
                            className="border-2 border-foreground bg-accent/40 px-2 py-0.5 font-mono text-[10px] uppercase tracking-widest">
                            {MODULO_LABEL[m]}
                          </span>
                        ))}
                      </div>
                    )}
                  </td>
                  <td className="p-3 text-right">
                    <Button size="sm" variant="outline" onClick={() => setEditing(u)}>
                      <Pencil className="h-3.5 w-3.5" /> Editar
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <EditAccessDialog
        user={editing}
        onClose={() => setEditing(null)}
        onSave={(mods) => {
          if (editing) atualizarModulos(editing.id, mods);
          setEditing(null);
        }}
      />
    </>
  );
};

const EditAccessDialog = ({
  user, onClose, onSave,
}: {
  user: Usuario | null;
  onClose: () => void;
  onSave: (m: Modulo[]) => void;
}) => {
  const [selected, setSelected] = useState<Modulo[]>([]);

  // Reset quando abre
  const open = !!user;
  if (open && user && (selected.length === 0 || (user && !selectedMatches(selected, user)))) {
    // hidrata apenas na abertura
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent
        className="border-2 border-foreground rounded-none shadow-brutal max-w-md"
        onOpenAutoFocus={() => user && setSelected(user.modulosPermitidos)}
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-display text-xl">
            <UserCog className="h-5 w-5" /> Módulos de {user?.nome}
          </DialogTitle>
        </DialogHeader>

        {user?.perfil === "admin" ? (
          <div className="border-2 border-foreground bg-primary/10 p-4 text-sm">
            Este usuário é <strong>admin</strong> — enxerga todos os módulos automaticamente.
          </div>
        ) : (
          <div className="space-y-3 py-2">
            {ALL_MODULOS.map((m) => {
              const checked = selected.includes(m);
              return (
                <label
                  key={m}
                  className="flex items-center gap-3 border-2 border-foreground p-3 cursor-pointer hover:bg-muted/30"
                >
                  <Checkbox
                    checked={checked}
                    onCheckedChange={(v) =>
                      setSelected((prev) =>
                        v ? [...prev, m] : prev.filter((x) => x !== m),
                      )
                    }
                    className="border-2 border-foreground"
                  />
                  <div className="flex-1">
                    <div className="font-bold text-sm">{MODULO_LABEL[m]}</div>
                    <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                      {m}
                    </div>
                  </div>
                </label>
              );
            })}
          </div>
        )}

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button variant="primary" onClick={() => onSave(selected)} disabled={user?.perfil === "admin"}>
            Salvar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const selectedMatches = (sel: Modulo[], u: Usuario) =>
  sel.length === u.modulosPermitidos.length && sel.every((m) => u.modulosPermitidos.includes(m));
