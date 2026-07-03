import { KPI, PageHeader, SectionTitle, HealthDot, StatusBadge, PriorityChip } from "../ui";
import { projects, deliveries, allocations, resources, squads, helpers } from "../mockData";
import { AlertTriangle, TrendingUp, Users, CalendarClock, Activity, Briefcase } from "lucide-react";
import { Link } from "react-router-dom";

export const DashboardPage = () => {
  const ativos = projects.filter((p) => p.status === "em_execucao").length;
  const emRisco = projects.filter((p) => p.saude === "vermelho" || p.saude === "amarelo").length;
  const bloqueados = projects.filter((p) => p.status === "bloqueado").length;

  const sobrecarga = resources
    .map((r) => ({ r, total: helpers.totalAlloc(r.id) }))
    .filter((x) => x.total > 100)
    .sort((a, b) => b.total - a.total);

  const disponivel = resources
    .map((r) => ({ r, total: helpers.totalAlloc(r.id) }))
    .filter((x) => x.total < 80).length;

  const entregasSemana = deliveries
    .filter((d) => d.status !== "concluida")
    .sort((a, b) => a.data.localeCompare(b.data))
    .slice(0, 6);

  const distribCliente = projects.reduce<Record<string, number>>((acc, p) => {
    const c = helpers.getCliente(p.clienteId)?.nome ?? "—";
    acc[c] = (acc[c] ?? 0) + 1; return acc;
  }, {});

  const distribNucleo = projects.reduce<Record<string, number>>((acc, p) => {
    const n = helpers.getNucleo(p.nucleoId)?.nome ?? "—";
    acc[n] = (acc[n] ?? 0) + 1; return acc;
  }, {});

  return (
    <>
      <PageHeader
        eyebrow="Núcleo 01 · Visão executiva"
        title="Dashboard operacional"
        subtitle="Saúde do portfólio, capacidade da equipe e entregas críticas em tempo real."
      />
      <div className="p-6 lg:p-8 space-y-8">
        {/* KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          <KPI label="Projetos ativos" value={ativos} accent="success" />
          <KPI label="Em risco" value={emRisco} sub="amarelo + vermelho" accent="accent" />
          <KPI label="Bloqueados" value={bloqueados} accent="destructive" />
          <KPI label="Squads ativos" value={squads.length} accent="info" />
          <KPI label="Sobrecarregados" value={sobrecarga.length} sub=">100% alocação" accent="primary" />
          <KPI label="Disponíveis" value={disponivel} sub="<80% alocação" accent="success" />
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Projetos em risco */}
          <div className="lg:col-span-2 border-2 border-foreground bg-card p-5 shadow-brutal-sm">
            <SectionTitle hint="Top 5 por criticidade"><AlertTriangle className="inline h-4 w-4 mr-1 text-primary" /> Projetos em risco</SectionTitle>
            <div className="divide-y-2 divide-foreground">
              {projects.filter((p) => p.saude !== "verde").slice(0, 5).map((p) => (
                <Link
                  key={p.id} to={`/app/projetos/projeto/${p.id}`}
                  className="grid grid-cols-12 gap-3 items-center py-3 hover:bg-muted/40 transition-smooth"
                >
                  <div className="col-span-1"><HealthDot saude={p.saude} /></div>
                  <div className="col-span-5">
                    <div className="font-bold text-sm">{p.nome}</div>
                    <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
                      {p.codigo} · {helpers.getCliente(p.clienteId)?.nome}
                    </div>
                  </div>
                  <div className="col-span-2"><StatusBadge status={p.status} /></div>
                  <div className="col-span-2"><PriorityChip p={p.prioridade} /></div>
                  <div className="col-span-2">
                    <div className="h-2 border border-foreground bg-muted">
                      <div className="h-full bg-primary" style={{ width: `${p.progresso}%` }} />
                    </div>
                    <div className="text-[10px] font-mono mt-1 text-muted-foreground">{p.progresso}%</div>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Sobrecarga */}
          <div className="border-2 border-foreground bg-card p-5 shadow-brutal-sm">
            <SectionTitle hint="alocação > 100%"><Users className="inline h-4 w-4 mr-1 text-primary" /> Sobrecarga</SectionTitle>
            <div className="space-y-3">
              {sobrecarga.length === 0 && <p className="text-xs text-muted-foreground">Sem sobrecarga no momento.</p>}
              {sobrecarga.map(({ r, total }) => (
                <div key={r.id}>
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold">{r.nome}</span>
                    <span className="font-mono text-destructive">{total}%</span>
                  </div>
                  <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-1">{r.papel}</div>
                  <div className="h-2 border border-foreground bg-muted relative overflow-hidden">
                    <div className="h-full bg-success" style={{ width: "100%" }} />
                    <div className="absolute top-0 right-0 h-full bg-destructive" style={{ width: `${Math.min(total - 100, 50)}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Entregas críticas */}
          <div className="lg:col-span-2 border-2 border-foreground bg-card p-5 shadow-brutal-sm">
            <SectionTitle hint="próximas 6"><CalendarClock className="inline h-4 w-4 mr-1 text-primary" /> Entregas críticas</SectionTitle>
            <table className="w-full text-sm">
              <thead className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
                <tr className="border-b-2 border-foreground">
                  <th className="text-left py-2">Entrega</th>
                  <th className="text-left">Projeto</th>
                  <th className="text-left">Tipo</th>
                  <th className="text-right">Data</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-foreground/10">
                {entregasSemana.map((d) => {
                  const p = helpers.getProject(d.projectId);
                  return (
                    <tr key={d.id} className="hover:bg-muted/40">
                      <td className="py-2 font-bold">{d.nome}</td>
                      <td className="text-xs">{p?.codigo} — {p?.nome}</td>
                      <td><span className="font-mono text-[10px] uppercase tracking-widest">{d.tipo}</span></td>
                      <td className="text-right font-mono text-xs">
                        {new Date(d.data).toLocaleDateString("pt-BR")}
                        {d.status === "atrasada" && <span className="ml-2 text-destructive">●</span>}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Distribuição */}
          <div className="border-2 border-foreground bg-card p-5 shadow-brutal-sm">
            <SectionTitle hint="por contexto"><Briefcase className="inline h-4 w-4 mr-1 text-primary" /> Distribuição</SectionTitle>
            <div>
              <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-2">Por cliente</div>
              <div className="space-y-1.5">
                {Object.entries(distribCliente).map(([k, v]) => (
                  <div key={k} className="flex items-center gap-2 text-xs">
                    <span className="w-32 truncate">{k}</span>
                    <div className="flex-1 h-3 border border-foreground bg-muted">
                      <div className="h-full bg-primary" style={{ width: `${(v / projects.length) * 100}%` }} />
                    </div>
                    <span className="font-mono w-6 text-right">{v}</span>
                  </div>
                ))}
              </div>
              <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mt-4 mb-2">Por núcleo</div>
              <div className="space-y-1.5">
                {Object.entries(distribNucleo).map(([k, v]) => (
                  <div key={k} className="flex items-center gap-2 text-xs">
                    <span className="w-32 truncate">{k}</span>
                    <div className="flex-1 h-3 border border-foreground bg-muted">
                      <div className="h-full bg-accent" style={{ width: `${(v / projects.length) * 100}%` }} />
                    </div>
                    <span className="font-mono w-6 text-right">{v}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Alertas de dependência */}
        <div className="border-2 border-foreground bg-accent/30 p-5 shadow-brutal-sm">
          <SectionTitle><Activity className="inline h-4 w-4 mr-1 text-primary" /> Alertas de dependência</SectionTitle>
          <ul className="space-y-1 text-sm">
            <li>• <strong>Migração SAP S/4HANA</strong> bloqueia <strong>Cutover</strong> (FF, crítico)</li>
            <li>• <strong>Liquidação RT</strong> precisa concluir antes de <strong>Homologação BACEN</strong></li>
            <li>• <strong>Ingestão</strong> bloqueia <strong>Camada analítica</strong> do Data Lake</li>
          </ul>
        </div>
      </div>
    </>
  );
};
