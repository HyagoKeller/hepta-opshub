import { useState } from "react";
import { CalendarRange, GanttChartSquare, Kanban, LayoutDashboard, TableProperties, Map, Flame, Crown } from "lucide-react";
import { cn } from "@/lib/utils";

type ViewKey = "timeline" | "gantt" | "board" | "dashboard" | "table" | "capacity" | "heatmap" | "executive";

const views: { key: ViewKey; label: string; icon: any; desc: string }[] = [
  { key: "timeline", label: "Timeline", icon: CalendarRange, desc: "Linha do tempo macro de portfólio." },
  { key: "gantt", label: "Gantt leve", icon: GanttChartSquare, desc: "Cronograma sem peso do MS Project." },
  { key: "board", label: "Board", icon: Kanban, desc: "Kanban por fase, squad ou prioridade." },
  { key: "dashboard", label: "Dashboard no-code", icon: LayoutDashboard, desc: "Métricas, colunas, pizza e indicadores configuráveis." },
  { key: "table", label: "Tabela analítica", icon: TableProperties, desc: "Filtros, agrupamentos e exportação." },
  { key: "capacity", label: "Mapa de capacidade", icon: Map, desc: "Quem tem folga, quem está no limite." },
  { key: "heatmap", label: "Heatmap de sobrecarga", icon: Flame, desc: "Picos de alocação por semana e por time." },
  { key: "executive", label: "Painel executivo", icon: Crown, desc: "Saúde do portfólio em uma tela." },
];

export const Visualizations = () => {
  const [active, setActive] = useState<ViewKey>("timeline");

  return (
    <section className="py-20 lg:py-24 bg-muted border-b-2 border-foreground">
      <div className="container">
        <div className="max-w-3xl mb-12">
          <div className="inline-block border-2 border-foreground bg-primary text-primary-foreground px-3 py-1 mb-5 text-[11px] font-bold uppercase tracking-widest shadow-brutal-sm">
            02 · Visualizações
          </div>
          <h2 className="font-display text-4xl md:text-5xl lg:text-6xl tracking-tight">
            A mesma base, <span className="text-primary">sete leituras</span> diferentes.
          </h2>
          <p className="mt-5 text-lg font-medium text-muted-foreground">
            Cada perfil — gerente, líder técnico, executivo, PMO — abre o mesmo dado pela visão que precisa.
          </p>
        </div>

        <div className="grid lg:grid-cols-12 gap-6">
          {/* Tabs */}
          <div className="lg:col-span-4 flex lg:flex-col gap-2 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0">
            {views.map(({ key, label, icon: Icon, desc }) => {
              const isActive = active === key;
              return (
                <button
                  key={key}
                  onClick={() => setActive(key)}
                  className={cn(
                    "flex-shrink-0 lg:flex-shrink text-left border-2 border-foreground p-3 lg:p-4 transition-all flex items-start gap-3",
                    isActive
                      ? "bg-foreground text-background shadow-brutal -translate-x-[2px] -translate-y-[2px]"
                      : "bg-card hover:bg-accent hover:text-accent-foreground shadow-brutal-sm",
                  )}
                >
                  <Icon className="h-5 w-5 flex-shrink-0 mt-0.5" />
                  <div className="hidden lg:block">
                    <div className="font-display text-base leading-tight">{label}</div>
                    <div className={cn("text-[11px] font-medium mt-1", isActive ? "opacity-70" : "text-muted-foreground")}>
                      {desc}
                    </div>
                  </div>
                  <div className="lg:hidden font-display text-sm">{label}</div>
                </button>
              );
            })}
          </div>

          {/* Preview area */}
          <div className="lg:col-span-8">
            <div className="border-2 border-foreground bg-card shadow-brutal-lg">
              <div className="border-b-2 border-foreground bg-foreground text-background px-4 py-2.5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-2.5 w-2.5 rounded-full bg-accent" />
                  <span className="font-mono text-xs font-bold uppercase">
                    {views.find((v) => v.key === active)?.label}
                  </span>
                </div>
                <span className="text-[10px] font-mono opacity-70">preview · mock</span>
              </div>
              <div className="p-6 min-h-[420px]">
                <ViewPreview view={active} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

const ViewPreview = ({ view }: { view: ViewKey }) => {
  switch (view) {
    case "timeline":
      return <TimelinePreview />;
    case "gantt":
      return <GanttPreview />;
    case "board":
      return <BoardPreview />;
    case "dashboard":
      return <DashboardPreview />;
    case "table":
      return <TablePreview />;
    case "capacity":
      return <CapacityPreview />;
    case "heatmap":
      return <HeatmapPreview />;
    case "executive":
      return <ExecutivePreview />;
  }
};

/* ---------- mocks ---------- */

const months = ["JAN", "FEV", "MAR", "ABR", "MAI", "JUN", "JUL", "AGO"];
const projects = [
  { name: "Portal SERPRO", color: "bg-primary", start: 0, end: 4 },
  { name: "Modernização Receita", color: "bg-accent", start: 2, end: 6 },
  { name: "POC IA Banco BR", color: "bg-foreground", start: 1, end: 3 },
  { name: "Squad SUSEP", color: "bg-info", start: 3, end: 7 },
  { name: "Automação RH Hepta", color: "bg-success", start: 0, end: 2 },
];

const TimelinePreview = () => (
  <div>
    <div className="grid grid-cols-8 gap-1 mb-3 text-[10px] font-mono text-muted-foreground">
      {months.map((m) => <div key={m} className="text-center border-b border-foreground/20 pb-1">{m}</div>)}
    </div>
    <div className="space-y-3">
      {projects.map((p) => (
        <div key={p.name}>
          <div className="text-xs font-bold mb-1">{p.name}</div>
          <div className="grid grid-cols-8 gap-1 h-7">
            {months.map((_, i) => (
              <div key={i} className={cn("border-2 border-foreground", i >= p.start && i <= p.end ? p.color : "bg-transparent border-dashed border-foreground/10")} />
            ))}
          </div>
        </div>
      ))}
    </div>
  </div>
);

const GanttPreview = () => (
  <div className="space-y-2">
    {[
      { task: "Discovery", start: 0, span: 2, dep: false },
      { task: "Arquitetura", start: 1, span: 2, dep: true },
      { task: "Sprint 1 — APIs", start: 2, span: 2, dep: true },
      { task: "Sprint 2 — Frontend", start: 3, span: 3, dep: true },
      { task: "Homologação", start: 5, span: 2, dep: true },
      { task: "Go-live", start: 7, span: 1, dep: true },
    ].map((t, i) => (
      <div key={i} className="flex items-center gap-3">
        <div className="w-40 text-xs font-bold truncate">{t.task}</div>
        <div className="flex-1 grid grid-cols-8 gap-0.5 h-6">
          {Array.from({ length: 8 }).map((_, c) => (
            <div key={c} className={cn("border border-foreground/20", c >= t.start && c < t.start + t.span && "bg-primary border-foreground")} />
          ))}
        </div>
      </div>
    ))}
    <div className="pt-2 mt-2 border-t-2 border-dashed border-foreground/20 text-[10px] font-mono text-muted-foreground">
      → Dependências FS · Marco de Go-live destacado
    </div>
  </div>
);

const BoardPreview = () => {
  const cols = [
    { name: "Backlog", items: ["API gov.br", "Refatorar auth"] },
    { name: "Em curso", items: ["Painel SUSEP", "Integração SEI"] },
    { name: "Revisão", items: ["Modelo dados RH"] },
    { name: "Entregue", items: ["Login OAuth", "Pipeline CI"] },
  ];
  return (
    <div className="grid grid-cols-4 gap-3 h-full">
      {cols.map((c) => (
        <div key={c.name} className="border-2 border-foreground bg-background p-2">
          <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground mb-2 flex justify-between">
            <span>{c.name}</span><span>{c.items.length}</span>
          </div>
          <div className="space-y-2">
            {c.items.map((i) => (
              <div key={i} className="border-2 border-foreground bg-card p-2 text-xs font-medium shadow-brutal-sm">
                {i}
                <div className="mt-1.5 flex gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                  <span className="h-1.5 w-1.5 rounded-full bg-accent" />
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

const DashboardPreview = () => (
  <div className="grid grid-cols-6 gap-3">
    {[
      { v: "23", l: "Projetos ativos" },
      { v: "87%", l: "Capacidade" },
      { v: "12", l: "POCs em curso" },
      { v: "4", l: "Saúde crítica" },
    ].map((k) => (
      <div key={k.l} className="col-span-3 lg:col-span-3 xl:col-span-3 border-2 border-foreground bg-background p-3">
        <div className="font-display text-3xl text-primary">{k.v}</div>
        <div className="text-[10px] font-mono uppercase text-muted-foreground">{k.l}</div>
      </div>
    ))}
    <div className="col-span-6 lg:col-span-4 border-2 border-foreground bg-background p-3">
      <div className="text-[10px] font-mono uppercase mb-2 text-muted-foreground">Throughput por mês</div>
      <div className="flex items-end gap-1 h-32">
        {[40, 60, 35, 80, 70, 95, 65, 90].map((h, i) => (
          <div key={i} className="flex-1 border-2 border-foreground bg-primary" style={{ height: `${h}%` }} />
        ))}
      </div>
    </div>
    <div className="col-span-6 lg:col-span-2 border-2 border-foreground bg-background p-3">
      <div className="text-[10px] font-mono uppercase mb-2 text-muted-foreground">Mix de portfólio</div>
      <div className="relative h-32 w-32 mx-auto rounded-full border-2 border-foreground"
        style={{ background: "conic-gradient(hsl(var(--primary)) 0 45%, hsl(var(--accent)) 45% 75%, hsl(var(--foreground)) 75% 100%)" }} />
      <div className="mt-2 grid grid-cols-3 gap-1 text-[9px] font-mono">
        <div><span className="inline-block h-2 w-2 bg-primary mr-1" />Gov</div>
        <div><span className="inline-block h-2 w-2 bg-accent mr-1" />POC</div>
        <div><span className="inline-block h-2 w-2 bg-foreground mr-1" />Interno</div>
      </div>
    </div>
  </div>
);

const TablePreview = () => (
  <div className="overflow-hidden border-2 border-foreground">
    <table className="w-full text-xs">
      <thead className="bg-foreground text-background font-mono uppercase">
        <tr>{["Projeto", "Cliente", "Squad", "Saúde", "% Aloc."].map((h) => <th key={h} className="text-left p-2">{h}</th>)}</tr>
      </thead>
      <tbody>
        {[
          ["Portal SERPRO", "SERPRO", "Squad Alpha", "🟢", "82%"],
          ["Receita Federal", "RFB", "Squad Beta", "🟡", "94%"],
          ["POC IA Banco BR", "BB", "Inova", "🟢", "45%"],
          ["Squad SUSEP", "SUSEP", "Squad Delta", "🔴", "118%"],
          ["RH Hepta", "Interno", "Auto", "🟢", "30%"],
        ].map((row, i) => (
          <tr key={i} className="border-t border-foreground/20 even:bg-muted/40">
            {row.map((c, j) => <td key={j} className="p-2 font-medium">{c}</td>)}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

const CapacityPreview = () => {
  const people = [
    { n: "Ana C.", role: "Tech Lead", load: 75 },
    { n: "Bruno M.", role: "Dev Sr.", load: 95 },
    { n: "Carla R.", role: "PO", load: 60 },
    { n: "Diego F.", role: "Dev Pl.", load: 110 },
    { n: "Erika S.", role: "QA", load: 40 },
    { n: "Felipe T.", role: "Arquiteto", load: 85 },
  ];
  return (
    <div className="space-y-2">
      {people.map((p) => (
        <div key={p.n} className="flex items-center gap-3">
          <div className="w-32">
            <div className="text-xs font-bold">{p.n}</div>
            <div className="text-[10px] font-mono text-muted-foreground">{p.role}</div>
          </div>
          <div className="flex-1 h-5 border-2 border-foreground bg-background relative">
            <div className={cn("h-full", p.load > 100 ? "bg-primary" : p.load > 80 ? "bg-accent" : "bg-success")} style={{ width: `${Math.min(p.load, 100)}%` }} />
            {p.load > 100 && <div className="absolute right-0 top-0 h-full w-1 bg-foreground" />}
          </div>
          <div className="w-12 text-right text-xs font-mono font-bold">{p.load}%</div>
        </div>
      ))}
    </div>
  );
};

const HeatmapPreview = () => {
  const weeks = ["S1", "S2", "S3", "S4", "S5", "S6", "S7", "S8"];
  const teams = ["Squad Alpha", "Squad Beta", "Squad Delta", "Inova", "Auto"];
  const intensity = (r: number, c: number) => ((r * 3 + c * 2 + 1) % 5);
  const colors = ["bg-success/20", "bg-success", "bg-accent", "bg-primary/70", "bg-primary"];
  return (
    <div>
      <div className="grid mb-2" style={{ gridTemplateColumns: "120px repeat(8, 1fr)" }}>
        <div />
        {weeks.map((w) => <div key={w} className="text-center text-[10px] font-mono text-muted-foreground">{w}</div>)}
      </div>
      <div className="space-y-1">
        {teams.map((t, r) => (
          <div key={t} className="grid items-center gap-1" style={{ gridTemplateColumns: "120px repeat(8, 1fr)" }}>
            <div className="text-xs font-bold">{t}</div>
            {weeks.map((_, c) => (
              <div key={c} className={cn("h-7 border border-foreground/40", colors[intensity(r, c)])} />
            ))}
          </div>
        ))}
      </div>
      <div className="mt-3 flex items-center gap-2 text-[10px] font-mono">
        <span>Folga</span>
        {colors.map((c, i) => <div key={i} className={cn("h-3 w-6 border border-foreground/40", c)} />)}
        <span>Sobrecarga</span>
      </div>
    </div>
  );
};

const ExecutivePreview = () => (
  <div className="grid grid-cols-2 gap-3">
    {[
      { t: "Saúde do portfólio", v: "72%", sub: "+4pp vs mês passado", color: "bg-success" },
      { t: "On-time delivery", v: "88%", sub: "Meta 90%", color: "bg-accent" },
      { t: "Receita comprometida", v: "R$ 12,4M", sub: "Squads alocadas", color: "bg-primary" },
      { t: "POCs → contrato", v: "3 / 12", sub: "Conversão 25%", color: "bg-foreground" },
    ].map((k) => (
      <div key={k.t} className="border-2 border-foreground bg-background p-4 relative overflow-hidden">
        <div className={cn("absolute left-0 top-0 h-full w-1.5", k.color)} />
        <div className="pl-3">
          <div className="text-[10px] font-mono uppercase text-muted-foreground">{k.t}</div>
          <div className="font-display text-3xl mt-1">{k.v}</div>
          <div className="text-[11px] font-medium text-muted-foreground mt-1">{k.sub}</div>
        </div>
      </div>
    ))}
  </div>
);
