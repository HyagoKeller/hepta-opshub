import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { PageHeader, StatusBadge, PriorityChip, HealthDot, KPI, SectionTitle } from "../ui";
import { helpers, labels, deliveries, dependencies, projects } from "../mockData";
import { ArrowLeft, Calendar, Users, AlertTriangle, FileText, Activity, Target } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const tabs = [
  { id: "geral", label: "Visão geral", icon: Target },
  { id: "cronograma", label: "Cronograma", icon: Calendar },
  { id: "equipe", label: "Equipe", icon: Users },
  { id: "entregas", label: "Entregas", icon: FileText },
  { id: "riscos", label: "Riscos", icon: AlertTriangle },
  { id: "historico", label: "Histórico", icon: Activity },
] as const;

export const ProjectDetailPage = () => {
  const { id } = useParams();
  const [tab, setTab] = useState<typeof tabs[number]["id"]>("geral");
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

  const equipe = helpers.resourcesByProject(project.id);
  const entregas = helpers.deliveriesByProject(project.id);
  const cliente = helpers.getCliente(project.clienteId);
  const nucleo = helpers.getNucleo(project.nucleoId);
  const gestor = helpers.getResource(project.gestorId);
  const squad = project.squadId ? helpers.getSquad(project.squadId) : undefined;
  const projDeps = dependencies.filter((d) => d.fromId === project.id || d.toId === project.id);

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
            <div className="flex items-center gap-2">
              <HealthDot saude={project.saude} withLabel />
              <StatusBadge status={project.status} />
              <PriorityChip p={project.prioridade} />
            </div>
          </>
        }
      />

      {/* Tabs */}
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
                <KPI label="Equipe" value={equipe.length} sub={`${entregas.length} entregas`} accent="success" />
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
                  <Field k="Sponsor" v={helpers.getResource(project.sponsorId ?? "")?.nome ?? "—"} />
                  <Field k="Gestor" v={gestor?.nome ?? "—"} />
                  <Field k="Squad" v={squad?.nome ?? "—"} />
                </div>
              </div>

              <div className="border-2 border-foreground bg-card p-5 shadow-brutal-sm">
                <SectionTitle hint="próximas">Entregas</SectionTitle>
                <div className="divide-y-2 divide-foreground">
                  {entregas.map((d) => (
                    <div key={d.id} className="grid grid-cols-12 gap-3 items-center py-2.5">
                      <div className="col-span-6 font-bold text-sm">{d.nome}</div>
                      <div className="col-span-2"><span className="font-mono text-[10px] uppercase tracking-widest">{d.tipo}</span></div>
                      <div className="col-span-2"><span className={cn(
                        "font-mono text-[10px] uppercase tracking-widest px-1.5 py-0.5 border-2 border-foreground",
                        d.status === "concluida" && "bg-success text-success-foreground",
                        d.status === "atrasada" && "bg-destructive text-destructive-foreground",
                        d.status === "em_andamento" && "bg-accent text-accent-foreground",
                        d.status === "planejada" && "bg-muted",
                      )}>{d.status.replace("_", " ")}</span></div>
                      <div className="col-span-2 text-right font-mono text-xs">{new Date(d.data).toLocaleDateString("pt-BR")}</div>
                    </div>
                  ))}
                  {entregas.length === 0 && <p className="text-xs text-muted-foreground py-4">Sem entregas cadastradas.</p>}
                </div>
              </div>
            </div>

            {/* Painel lateral */}
            <aside className="space-y-5">
              <div className="border-2 border-foreground bg-secondary text-secondary-foreground p-5 shadow-brutal-sm">
                <div className="font-mono text-[10px] uppercase tracking-widest opacity-70 mb-3">Linha do tempo</div>
                <div className="space-y-2 text-xs">
                  <TimelineItem when="Hoje" what="Atualização de status semanal" />
                  <TimelineItem when="-2d" what={`Aprovação de marco "${entregas[0]?.nome ?? "—"}"`} />
                  <TimelineItem when="-5d" what="Replanejamento de cronograma" />
                  <TimelineItem when="-1w" what="Novo integrante alocado ao squad" />
                  <TimelineItem when="-2w" what="Risco mitigado: integração externa" />
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
          <div className="border-2 border-foreground bg-card shadow-brutal-sm overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-[10px] font-mono uppercase tracking-widest bg-foreground text-background">
                <tr>
                  <th className="text-left p-3">Colaborador</th>
                  <th className="text-left">Papel</th>
                  <th className="text-left">Vínculo</th>
                  <th className="text-right p-3">Alocação no projeto</th>
                  <th className="text-right p-3">Total geral</th>
                </tr>
              </thead>
              <tbody className="divide-y-2 divide-foreground">
                {equipe.map((m) => {
                  const total = helpers.totalAlloc(m.id);
                  return (
                    <tr key={m.id}>
                      <td className="p-3">
                        <div className="flex items-center gap-3">
                          <span className="h-8 w-8 border-2 border-foreground bg-accent flex items-center justify-center font-bold text-xs">{m.avatar}</span>
                          <span className="font-bold">{m.nome}</span>
                        </div>
                      </td>
                      <td className="text-xs">{m.papel}</td>
                      <td><span className="font-mono text-[10px] uppercase tracking-widest">{m.kind}</span></td>
                      <td className="text-right font-mono p-3">{m.percentual}%</td>
                      <td className={cn("text-right font-mono p-3", total > 100 && "text-destructive font-bold")}>{total}%</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {tab === "cronograma" && <MiniGantt projectId={project.id} />}
        {tab === "entregas" && <DeliveryBoard projectId={project.id} />}
        {tab === "riscos" && <RiskList />}
        {tab === "historico" && <AuditLog />}
      </div>
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

const MiniGantt = ({ projectId }: { projectId: string }) => {
  const ds = helpers.deliveriesByProject(projectId);
  if (ds.length === 0) return <p className="text-sm text-muted-foreground">Sem entregas.</p>;
  const min = Math.min(...ds.map((d) => +new Date(d.data)));
  const max = Math.max(...ds.map((d) => +new Date(d.data)));
  const span = max - min || 1;
  return (
    <div className="border-2 border-foreground bg-card p-5 shadow-brutal-sm">
      <SectionTitle>Cronograma (Gantt leve)</SectionTitle>
      <div className="space-y-3">
        {ds.map((d, i) => {
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

const DeliveryBoard = ({ projectId }: { projectId: string }) => {
  const cols = ["planejada", "em_andamento", "concluida", "atrasada"] as const;
  const ds = helpers.deliveriesByProject(projectId);
  return (
    <div className="grid md:grid-cols-4 gap-4">
      {cols.map((c) => (
        <div key={c} className="border-2 border-foreground bg-card p-3 shadow-brutal-sm">
          <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-2">{c.replace("_", " ")}</div>
          <div className="space-y-2">
            {ds.filter((d) => d.status === c).map((d) => (
              <div key={d.id} className="border-2 border-foreground p-2">
                <div className="text-xs font-bold">{d.nome}</div>
                <div className="text-[10px] font-mono text-muted-foreground mt-1">{new Date(d.data).toLocaleDateString("pt-BR")} · {d.tipo}</div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

const RiskList = () => (
  <div className="border-2 border-foreground bg-card p-5 shadow-brutal-sm">
    <SectionTitle>Riscos identificados</SectionTitle>
    <ul className="divide-y-2 divide-foreground">
      {[
        { sev: "alto", t: "Atraso na integração externa", o: "Renegociar SLA com fornecedor", s: "aberto" },
        { sev: "medio", t: "Rotatividade no squad", o: "Plano de retenção e backup", s: "mitigado" },
        { sev: "baixo", t: "Mudança de escopo pelo cliente", o: "Comitê quinzenal", s: "monitorado" },
      ].map((r, i) => (
        <li key={i} className="py-3 grid grid-cols-12 gap-3 items-center">
          <span className={cn("col-span-1 inline-block px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-widest border-2 border-foreground",
            r.sev === "alto" ? "bg-destructive text-destructive-foreground" : r.sev === "medio" ? "bg-accent" : "bg-muted")}>{r.sev}</span>
          <span className="col-span-5 text-sm font-bold">{r.t}</span>
          <span className="col-span-4 text-xs text-muted-foreground">{r.o}</span>
          <span className="col-span-2 text-right font-mono text-[10px] uppercase tracking-widest">{r.s}</span>
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
        { t: "20/04 11:00", u: "Sistema", a: "registrou replanejamento (+15 dias)" },
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
