import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { PageHeader, StatusBadge, PriorityChip, HealthDot, KPI, SectionTitle } from "../ui";
import { labels, dependencies } from "../mockData";
import { useData, resources, clientes, nucleos, squads } from "../DataStore";
import { ArrowLeft, Calendar, Users, AlertTriangle, FileText, Activity, Target, Plus, Pencil, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ProjectFormDialog, DeliveryFormDialog, RiskFormDialog, AllocationFormDialog } from "../Forms";
import type { Delivery, Allocation, Project } from "../types";
import type { Risk } from "../DataStore";
import { toast } from "@/hooks/use-toast";

const tabs = [
  { id: "geral", label: "Visão geral", icon: Target },
  { id: "cronograma", label: "Cronograma", icon: Calendar },
  { id: "equipe", label: "Equipe", icon: Users },
  { id: "entregas", label: "Entregas", icon: FileText },
  { id: "riscos", label: "Riscos", icon: AlertTriangle },
  { id: "historico", label: "Histórico", icon: Activity },
] as const;

const helpersLocal = {
  getResource: (id: string) => resources.find((r) => r.id === id),
  getCliente: (id: string) => clientes.find((c) => c.id === id),
  getNucleo: (id: string) => nucleos.find((n) => n.id === id),
  getSquad: (id: string) => squads.find((s) => s.id === id),
};

export const ProjectDetailPage = () => {
  const { id } = useParams();
  const { projects, byProject, allocations, deleteDelivery, deleteRisk, deleteAllocation } = useData();
  const [tab, setTab] = useState<typeof tabs[number]["id"]>("geral");
  const [editProjOpen, setEditProjOpen] = useState(false);
  const [delivOpen, setDelivOpen] = useState(false);
  const [delivEdit, setDelivEdit] = useState<Delivery | undefined>();
  const [riskOpen, setRiskOpen] = useState(false);
  const [riskEdit, setRiskEdit] = useState<Risk | undefined>();
  const [allocOpen, setAllocOpen] = useState(false);
  const [allocEdit, setAllocEdit] = useState<Allocation | undefined>();

  const project = projects.find((p) => p.id === id);

  if (!project) {
    return (
      <div className="p-8">
        <p>Projeto não encontrado.</p>
        <Button asChild variant="outline" className="mt-4">
          <Link to="/projetos-squads/app/portfolio"><ArrowLeft /> Voltar</Link>
        </Button>
      </div>
    );
  }

  const { entregas, riscos, alocacoes } = byProject(project.id);
  const cliente = helpersLocal.getCliente(project.clienteId);
  const nucleo = helpersLocal.getNucleo(project.nucleoId);
  const gestor = helpersLocal.getResource(project.gestorId);
  const squad = project.squadId ? helpersLocal.getSquad(project.squadId) : undefined;
  const projDeps = dependencies.filter((d) => d.fromId === project.id || d.toId === project.id);

  const totalAlloc = (rid: string) => allocations.filter((a) => a.resourceId === rid).reduce((s, a) => s + a.percentual, 0);

  return (
    <>
      <PageHeader
        eyebrow={`${project.codigo} · ${labels.tipo[project.tipo]}`}
        title={project.nome}
        subtitle={`${cliente?.nome} · ${nucleo?.nome} · Gestor: ${gestor?.nome ?? "—"}`}
        actions={
          <>
            <Button variant="outline" size="sm" asChild>
              <Link to="/projetos-squads/app/portfolio"><ArrowLeft /> Portfólio</Link>
            </Button>
            <Button variant="primary" size="sm" onClick={() => setEditProjOpen(true)}>
              <Pencil /> Editar projeto
            </Button>
            <div className="flex items-center gap-2">
              <HealthDot saude={project.saude} withLabel />
              <StatusBadge status={project.status} />
              <PriorityChip p={project.prioridade} />
            </div>
          </>
        }
      />

      <div className="border-b-2 border-foreground bg-background">
        <div className="px-6 lg:px-8 flex overflow-x-auto">
          {tabs.map((t) => (
            <button
              key={t.id} onClick={() => setTab(t.id)}
              className={cn(
                "flex items-center gap-2 px-4 py-3 text-xs font-bold uppercase tracking-widest border-b-2 transition-smooth",
                tab === t.id ? "border-primary text-primary" : "border-transparent hover:text-foreground text-muted-foreground",
              )}
            >
              <t.icon className="h-3.5 w-3.5" /> {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="p-6 lg:p-8">
        {tab === "geral" && (
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <KPI label="Progresso" value={`${project.progresso}%`} accent="primary" />
                <KPI label="Orçamento" value={`R$ ${(project.orcamento / 1000).toFixed(0)}k`} sub={`Consumido R$ ${(project.consumido / 1000).toFixed(0)}k`} accent="info" />
                <KPI label="Risco" value={project.risco.toUpperCase()} accent={project.risco === "alto" ? "destructive" : "accent"} />
                <KPI label="Equipe" value={alocacoes.length} sub={`${entregas.length} entregas`} accent="success" />
              </div>

              <div className="border-2 border-foreground bg-card p-5 shadow-brutal-sm">
                <SectionTitle>Resumo executivo</SectionTitle>
                <p className="text-sm leading-relaxed">
                  Projeto <strong>{labels.tipo[project.tipo].toLowerCase()}</strong> em fase de
                  <strong> {labels.status[project.status].toLowerCase()}</strong>, atendendo
                  {" "}<strong>{cliente?.nome}</strong> via núcleo <strong>{nucleo?.nome}</strong>.
                  Vigência {new Date(project.inicio).toLocaleDateString("pt-BR")} →
                  {" "}{new Date(project.fim).toLocaleDateString("pt-BR")}.
                </p>
                <div className="mt-4 grid sm:grid-cols-3 gap-3 text-xs">
                  <Field k="Sponsor" v={helpersLocal.getResource(project.sponsorId ?? "")?.nome ?? "—"} />
                  <Field k="Gestor" v={gestor?.nome ?? "—"} />
                  <Field k="Squad" v={squad?.nome ?? "—"} />
                </div>
              </div>

              <div className="border-2 border-foreground bg-card p-5 shadow-brutal-sm">
                <div className="flex items-center justify-between mb-3">
                  <SectionTitle hint="próximas">Entregas</SectionTitle>
                  <Button variant="primary" size="sm" onClick={() => { setDelivEdit(undefined); setDelivOpen(true); }}>
                    <Plus /> Nova entrega
                  </Button>
                </div>
                <div className="divide-y-2 divide-foreground">
                  {entregas.map((d) => (
                    <div key={d.id} className="grid grid-cols-12 gap-3 items-center py-2.5">
                      <div className="col-span-5 font-bold text-sm">{d.nome}</div>
                      <div className="col-span-2"><span className="font-mono text-[10px] uppercase tracking-widest">{d.tipo}</span></div>
                      <div className="col-span-2"><span className={cn(
                        "font-mono text-[10px] uppercase tracking-widest px-1.5 py-0.5 border-2 border-foreground",
                        d.status === "concluida" && "bg-success text-success-foreground",
                        d.status === "atrasada" && "bg-destructive text-destructive-foreground",
                        d.status === "em_andamento" && "bg-accent text-accent-foreground",
                        d.status === "planejada" && "bg-muted",
                      )}>{d.status.replace("_", " ")}</span></div>
                      <div className="col-span-2 text-right font-mono text-xs">{new Date(d.data).toLocaleDateString("pt-BR")}</div>
                      <div className="col-span-1 flex gap-1 justify-end">
                        <button onClick={() => { setDelivEdit(d); setDelivOpen(true); }} className="p-1 border border-foreground hover:bg-accent"><Pencil className="h-3 w-3" /></button>
                        <button onClick={() => { deleteDelivery(d.id); toast({ title: "Entrega removida" }); }} className="p-1 border border-foreground hover:bg-destructive hover:text-destructive-foreground"><Trash2 className="h-3 w-3" /></button>
                      </div>
                    </div>
                  ))}
                  {entregas.length === 0 && <p className="text-xs text-muted-foreground py-4">Sem entregas cadastradas.</p>}
                </div>
              </div>
            </div>

            <aside className="space-y-5">
              <div className="border-2 border-foreground bg-secondary text-secondary-foreground p-5 shadow-brutal-sm">
                <div className="font-mono text-[10px] uppercase tracking-widest opacity-70 mb-3">Linha do tempo</div>
                <div className="space-y-2 text-xs">
                  <TimelineItem when="Hoje" what="Atualização de status semanal" />
                  <TimelineItem when="-2d" what={`Aprovação de marco "${entregas[0]?.nome ?? "—"}"`} />
                  <TimelineItem when="-5d" what="Replanejamento de cronograma" />
                </div>
              </div>

              <div className="border-2 border-foreground bg-card p-5 shadow-brutal-sm">
                <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-3">Dependências</div>
                {projDeps.length === 0 && <p className="text-xs text-muted-foreground">Sem dependências mapeadas.</p>}
                <ul className="space-y-2 text-xs">
                  {projDeps.map((d) => (
                    <li key={d.id} className="border border-foreground p-2">
                      <div className="font-bold">{d.fromLabel} → {d.toLabel}</div>
                      <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                        Tipo {d.tipo} {d.bloqueante && <span className="text-destructive">· bloqueante</span>}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </aside>
          </div>
        )}

        {tab === "equipe" && (
          <div className="space-y-4">
            <div className="flex justify-end">
              <Button variant="primary" size="sm" onClick={() => { setAllocEdit(undefined); setAllocOpen(true); }}>
                <Plus /> Alocar colaborador
              </Button>
            </div>
            <div className="border-2 border-foreground bg-card shadow-brutal-sm overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-[10px] font-mono uppercase tracking-widest bg-foreground text-background">
                  <tr>
                    <th className="text-left p-3">Colaborador</th>
                    <th className="text-left">Papel</th>
                    <th className="text-left">Vínculo</th>
                    <th className="text-left">Período</th>
                    <th className="text-right">Alocação</th>
                    <th className="text-right">Total geral</th>
                    <th className="text-right p-3">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y-2 divide-foreground">
                  {alocacoes.map((a) => {
                    const m = helpersLocal.getResource(a.resourceId);
                    if (!m) return null;
                    const total = totalAlloc(m.id);
                    return (
                      <tr key={a.id}>
                        <td className="p-3">
                          <div className="flex items-center gap-3">
                            <span className="h-8 w-8 border-2 border-foreground bg-accent flex items-center justify-center font-bold text-xs">{m.avatar}</span>
                            <span className="font-bold">{m.nome}</span>
                          </div>
                        </td>
                        <td className="text-xs">{m.papel}</td>
                        <td><span className="font-mono text-[10px] uppercase tracking-widest">{m.kind}</span></td>
                        <td className="text-xs font-mono">{new Date(a.inicio).toLocaleDateString("pt-BR")} → {new Date(a.fim).toLocaleDateString("pt-BR")}</td>
                        <td className="text-right font-mono">{a.percentual}%</td>
                        <td className={cn("text-right font-mono", total > 100 && "text-destructive font-bold")}>{total}%</td>
                        <td className="text-right p-3">
                          <div className="inline-flex gap-1">
                            <button onClick={() => { setAllocEdit(a); setAllocOpen(true); }} className="p-1 border border-foreground hover:bg-accent"><Pencil className="h-3 w-3" /></button>
                            <button onClick={() => { deleteAllocation(a.id); toast({ title: "Alocação removida" }); }} className="p-1 border border-foreground hover:bg-destructive hover:text-destructive-foreground"><Trash2 className="h-3 w-3" /></button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {alocacoes.length === 0 && <tr><td colSpan={7} className="p-6 text-center text-sm text-muted-foreground">Nenhum colaborador alocado.</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {tab === "cronograma" && <MiniGantt entregas={entregas} />}
        {tab === "entregas" && <DeliveryBoard entregas={entregas} onNew={() => { setDelivEdit(undefined); setDelivOpen(true); }} onEdit={(d) => { setDelivEdit(d); setDelivOpen(true); }} onDelete={(id) => { deleteDelivery(id); toast({ title: "Entrega removida" }); }} />}
        {tab === "riscos" && <RiskList riscos={riscos} onNew={() => { setRiskEdit(undefined); setRiskOpen(true); }} onEdit={(r) => { setRiskEdit(r); setRiskOpen(true); }} onDelete={(id) => { deleteRisk(id); toast({ title: "Risco removido" }); }} />}
        {tab === "historico" && <AuditLog />}
      </div>

      <ProjectFormDialog open={editProjOpen} onOpenChange={setEditProjOpen} initial={project} />
      <DeliveryFormDialog open={delivOpen} onOpenChange={setDelivOpen} projectId={project.id} initial={delivEdit} />
      <RiskFormDialog open={riskOpen} onOpenChange={setRiskOpen} projectId={project.id} initial={riskEdit} />
      <AllocationFormDialog open={allocOpen} onOpenChange={setAllocOpen} projectId={project.id} initial={allocEdit} />
    </>
  );
};

const Field = ({ k, v }: { k: string; v: string }) => (
  <div className="border-2 border-foreground p-2.5">
    <div className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground">{k}</div>
    <div className="font-bold text-sm mt-0.5">{v}</div>
  </div>
);
const TimelineItem = ({ when, what }: { when: string; what: string }) => (
  <div className="flex gap-3">
    <div className="font-mono text-[9px] uppercase tracking-widest opacity-70 w-10 mt-0.5">{when}</div>
    <div className="flex-1 border-l-2 border-accent pl-3">{what}</div>
  </div>
);

const MiniGantt = ({ entregas }: { entregas: Delivery[] }) => {
  if (entregas.length === 0) return <p className="text-sm text-muted-foreground">Sem entregas cadastradas.</p>;
  const min = Math.min(...entregas.map((d) => +new Date(d.data)));
  const max = Math.max(...entregas.map((d) => +new Date(d.data)));
  const span = max - min || 1;
  return (
    <div className="border-2 border-foreground bg-card p-5 shadow-brutal-sm">
      <SectionTitle>Cronograma (Gantt leve)</SectionTitle>
      <div className="space-y-3">
        {entregas.map((d) => {
          const start = ((+new Date(d.data) - min) / span) * 80;
          return (
            <div key={d.id} className="grid grid-cols-12 gap-3 items-center">
              <div className="col-span-3 text-xs font-bold truncate">{d.nome}</div>
              <div className="col-span-9 relative h-8 border-2 border-foreground bg-muted">
                <div className="absolute h-full bg-primary" style={{ left: `${start}%`, width: "12%" }}>
                  <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[10px] font-mono text-primary-foreground whitespace-nowrap">
                    {new Date(d.data).toLocaleDateString("pt-BR")}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const DeliveryBoard = ({ entregas, onNew, onEdit, onDelete }: {
  entregas: Delivery[]; onNew: () => void; onEdit: (d: Delivery) => void; onDelete: (id: string) => void;
}) => {
  const cols = ["planejada", "em_andamento", "concluida", "atrasada"] as const;
  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button variant="primary" size="sm" onClick={onNew}><Plus /> Nova entrega</Button>
      </div>
      <div className="grid md:grid-cols-4 gap-4">
        {cols.map((c) => (
          <div key={c} className="border-2 border-foreground bg-card p-3 shadow-brutal-sm">
            <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-2">{c.replace("_", " ")}</div>
            <div className="space-y-2">
              {entregas.filter((d) => d.status === c).map((d) => (
                <div key={d.id} className="border-2 border-foreground p-2 group">
                  <div className="text-xs font-bold">{d.nome}</div>
                  <div className="text-[10px] font-mono text-muted-foreground mt-1">{new Date(d.data).toLocaleDateString("pt-BR")} · {d.tipo}</div>
                  <div className="flex gap-1 mt-2 opacity-0 group-hover:opacity-100">
                    <button onClick={() => onEdit(d)} className="p-1 border border-foreground hover:bg-accent text-[10px]"><Pencil className="h-3 w-3" /></button>
                    <button onClick={() => onDelete(d.id)} className="p-1 border border-foreground hover:bg-destructive hover:text-destructive-foreground text-[10px]"><Trash2 className="h-3 w-3" /></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const RiskList = ({ riscos, onNew, onEdit, onDelete }: {
  riscos: Risk[]; onNew: () => void; onEdit: (r: Risk) => void; onDelete: (id: string) => void;
}) => (
  <div className="border-2 border-foreground bg-card p-5 shadow-brutal-sm">
    <div className="flex items-center justify-between mb-3">
      <SectionTitle>Riscos identificados</SectionTitle>
      <Button variant="primary" size="sm" onClick={onNew}><Plus /> Novo risco</Button>
    </div>
    {riscos.length === 0 && <p className="text-sm text-muted-foreground py-4">Nenhum risco cadastrado para este projeto.</p>}
    <ul className="divide-y-2 divide-foreground">
      {riscos.map((r) => (
        <li key={r.id} className="py-3 grid grid-cols-12 gap-3 items-center">
          <span className={cn("col-span-1 inline-block px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-widest border-2 border-foreground text-center",
            r.severidade === "alto" ? "bg-destructive text-destructive-foreground" : r.severidade === "medio" ? "bg-accent" : "bg-muted")}>{r.severidade}</span>
          <span className="col-span-4 text-sm font-bold">{r.titulo}</span>
          <span className="col-span-4 text-xs text-muted-foreground">{r.mitigacao || "—"}</span>
          <span className="col-span-2 font-mono text-[10px] uppercase tracking-widest">{r.status}</span>
          <span className="col-span-1 flex gap-1 justify-end">
            <button onClick={() => onEdit(r)} className="p-1 border border-foreground hover:bg-accent"><Pencil className="h-3 w-3" /></button>
            <button onClick={() => onDelete(r.id)} className="p-1 border border-foreground hover:bg-destructive hover:text-destructive-foreground"><Trash2 className="h-3 w-3" /></button>
          </span>
        </li>
      ))}
    </ul>
  </div>
);

const AuditLog = () => (
  <div className="border-2 border-foreground bg-card p-5 shadow-brutal-sm">
    <SectionTitle>Trilha de auditoria</SectionTitle>
    <ol className="space-y-2 text-xs font-mono">
      {[
        { t: "01/05 14:22", u: "Hyago Keller", a: "alterou status para Em execução" },
        { t: "29/04 09:10", u: "Ana Martins", a: "adicionou Carla Souza ao squad" },
        { t: "27/04 17:48", u: "Hyago Keller", a: "aprovou marco Sandbox PIX" },
      ].map((e, i) => (
        <li key={i} className="grid grid-cols-12 gap-3 border-l-2 border-foreground pl-3">
          <span className="col-span-2 text-muted-foreground">{e.t}</span>
          <span className="col-span-3 font-bold">{e.u}</span>
          <span className="col-span-7">{e.a}</span>
        </li>
      ))}
    </ol>
  </div>
);
