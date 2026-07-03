import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { PageHeader, StatusBadge, PriorityChip, HealthDot } from "../ui";
import { labels } from "../mockData";
import { useData, clientes, nucleos } from "../DataStore";
import { Search, LayoutGrid, List, Filter, Plus, Pencil, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ProjectFormDialog } from "../Forms";
import type { Project } from "../types";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "@/hooks/use-toast";

const helpersLocal = {
  getCliente: (id: string) => clientes.find((c) => c.id === id),
  getNucleo: (id: string) => nucleos.find((n) => n.id === id),
};

export const PortfolioPage = () => {
  const { projects, deleteProject } = useData();
  const [view, setView] = useState<"cards" | "table">("cards");
  const [q, setQ] = useState("");
  const [cliente, setCliente] = useState<string>("");
  const [nucleo, setNucleo] = useState<string>("");
  const [status, setStatus] = useState<string>("");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Project | undefined>();
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const filtered = useMemo(
    () => projects.filter((p) => {
      if (q && !`${p.nome} ${p.codigo}`.toLowerCase().includes(q.toLowerCase())) return false;
      if (cliente && p.clienteId !== cliente) return false;
      if (nucleo && p.nucleoId !== nucleo) return false;
      if (status && p.status !== status) return false;
      return true;
    }),
    [projects, q, cliente, nucleo, status],
  );

  const openNew = () => { setEditing(undefined); setOpen(true); };
  const openEdit = (p: Project) => { setEditing(p); setOpen(true); };

  return (
    <>
      <PageHeader
        eyebrow="Portfólio"
        title="Carteira de projetos"
        subtitle="Cadastre, edite e acompanhe projetos com filtros por cliente, núcleo, status e prioridade."
        actions={
          <>
            <Button variant={view === "cards" ? "primary" : "outline"} size="sm" onClick={() => setView("cards")}><LayoutGrid /> Cards</Button>
            <Button variant={view === "table" ? "primary" : "outline"} size="sm" onClick={() => setView("table")}><List /> Tabela</Button>
            <Button variant="primary" size="sm" onClick={openNew}><Plus /> Novo projeto</Button>
          </>
        }
      />

      <div className="p-6 lg:p-8 space-y-6">
        <div className="border-2 border-foreground bg-card p-4 shadow-brutal-sm flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[220px]">
            <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar por nome ou código…" className="pl-9 border-2 border-foreground rounded-none h-10" />
          </div>
          <Selector value={cliente} onChange={setCliente} placeholder="Cliente" options={clientes.map((c) => ({ v: c.id, l: c.nome }))} />
          <Selector value={nucleo} onChange={setNucleo} placeholder="Núcleo" options={nucleos.map((n) => ({ v: n.id, l: n.nome }))} />
          <Selector value={status} onChange={setStatus} placeholder="Status" options={Object.entries(labels.status).map(([v, l]) => ({ v, l }))} />
          <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground flex items-center gap-1">
            <Filter className="h-3 w-3" /> {filtered.length} de {projects.length}
          </div>
        </div>

        {view === "cards" ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((p) => (
              <div key={p.id} className="border-2 border-foreground bg-card p-5 shadow-brutal-sm hover-brutal relative group">
                <Link to={`/app/projetos/projeto/${p.id}`} className="block">
                  <div className="flex items-start justify-between mb-2">
                    <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">{p.codigo}</div>
                    <HealthDot saude={p.saude} />
                  </div>
                  <h3 className="font-display text-lg leading-tight mb-2 pr-16">{p.nome}</h3>
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    <StatusBadge status={p.status} />
                    <PriorityChip p={p.prioridade} />
                    <span className="inline-flex px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-widest border border-foreground">
                      {labels.tipo[p.tipo]}
                    </span>
                  </div>
                  <div className="text-xs text-muted-foreground mb-3">
                    <strong>{helpersLocal.getCliente(p.clienteId)?.nome}</strong> · {helpersLocal.getNucleo(p.nucleoId)?.nome}
                  </div>
                  <div className="h-2 border border-foreground bg-muted">
                    <div className="h-full bg-primary" style={{ width: `${p.progresso}%` }} />
                  </div>
                  <div className="flex justify-between mt-1.5 text-[10px] font-mono text-muted-foreground">
                    <span>{p.progresso}% concluído</span>
                    <span>R$ {(p.consumido / 1000).toFixed(0)}k / {(p.orcamento / 1000).toFixed(0)}k</span>
                  </div>
                </Link>
                <div className="absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={(e) => { e.preventDefault(); openEdit(p); }} className="p-1.5 border-2 border-foreground bg-background hover:bg-accent" title="Editar">
                    <Pencil className="h-3 w-3" />
                  </button>
                  <button onClick={(e) => { e.preventDefault(); setDeleteId(p.id); }} className="p-1.5 border-2 border-foreground bg-background hover:bg-destructive hover:text-destructive-foreground" title="Excluir">
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="border-2 border-foreground bg-card shadow-brutal-sm overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-[10px] font-mono uppercase tracking-widest bg-foreground text-background">
                <tr>
                  <th className="text-left p-3">Código</th>
                  <th className="text-left">Projeto</th>
                  <th className="text-left">Cliente</th>
                  <th className="text-left">Núcleo</th>
                  <th className="text-left">Status</th>
                  <th className="text-left">Prio</th>
                  <th className="text-left">Saúde</th>
                  <th className="text-right">Progresso</th>
                  <th className="text-right p-3">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y-2 divide-foreground">
                {filtered.map((p) => (
                  <tr key={p.id} className="hover:bg-muted/40">
                    <td className="p-3 font-mono text-xs">{p.codigo}</td>
                    <td><Link to={`/app/projetos/projeto/${p.id}`} className="font-bold hover:underline">{p.nome}</Link></td>
                    <td className="text-xs">{helpersLocal.getCliente(p.clienteId)?.nome}</td>
                    <td className="text-xs">{helpersLocal.getNucleo(p.nucleoId)?.nome}</td>
                    <td><StatusBadge status={p.status} /></td>
                    <td><PriorityChip p={p.prioridade} /></td>
                    <td><HealthDot saude={p.saude} withLabel /></td>
                    <td className="text-right font-mono text-xs">{p.progresso}%</td>
                    <td className="text-right p-3">
                      <div className="inline-flex gap-1">
                        <button onClick={() => openEdit(p)} className="p-1.5 border-2 border-foreground hover:bg-accent" title="Editar"><Pencil className="h-3 w-3" /></button>
                        <button onClick={() => setDeleteId(p.id)} className="p-1.5 border-2 border-foreground hover:bg-destructive hover:text-destructive-foreground" title="Excluir"><Trash2 className="h-3 w-3" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <ProjectFormDialog open={open} onOpenChange={setOpen} initial={editing} />

      <AlertDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <AlertDialogContent className="border-2 border-foreground rounded-none">
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir projeto?</AlertDialogTitle>
            <AlertDialogDescription>Essa ação remove o projeto, suas entregas, riscos e alocações. Não pode ser desfeita.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={() => {
              if (deleteId) { deleteProject(deleteId); toast({ title: "Projeto excluído" }); setDeleteId(null); }
            }}>Excluir</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

const Selector = ({ value, onChange, options, placeholder }: { value: string; onChange: (v: string) => void; options: { v: string; l: string }[]; placeholder: string }) => (
  <select value={value} onChange={(e) => onChange(e.target.value)} className={cn("h-10 border-2 border-foreground bg-background px-3 text-xs font-bold uppercase tracking-wide rounded-none")}>
    <option value="">{placeholder}: todos</option>
    {options.map((o) => <option key={o.v} value={o.v}>{o.l}</option>)}
  </select>
);
