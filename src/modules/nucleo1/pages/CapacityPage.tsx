import { PageHeader, SectionTitle } from "../ui";
import { resources, projects, allocations, helpers } from "../mockData";
import { cn } from "@/lib/utils";
import { AlertTriangle, TrendingDown, TrendingUp } from "lucide-react";

const weeks = ["S18", "S19", "S20", "S21", "S22", "S23", "S24", "S25"];

export const CapacityPage = () => {
  // gera "carga" sintética por semana usando alocações (estável por seed)
  const heatRows = resources.map((r) => {
    const total = helpers.totalAlloc(r.id);
    const series = weeks.map((_, i) => {
      const noise = ((i * 7 + r.id.length * 13) % 25) - 10;
      return Math.max(0, Math.min(140, total + noise));
    });
    return { r, total, series };
  });

  return (
    <>
      <PageHeader
        eyebrow="Capacidade & Alocação"
        title="Heatmap de capacidade"
        subtitle="Visualize sobrecarga, subutilização e simule cenários antes de confirmar alocações."
      />
      <div className="p-6 lg:p-8 space-y-6">
        {/* Legenda */}
        <div className="flex flex-wrap gap-4 items-center text-[11px] font-mono uppercase tracking-widest text-muted-foreground">
          <Legend color="bg-muted" label="0–60% subutilizado" />
          <Legend color="bg-success" label="60–90% saudável" />
          <Legend color="bg-accent" label="90–100% pleno" />
          <Legend color="bg-destructive" label=">100% sobrecarga" />
        </div>

        <div className="border-2 border-foreground bg-card shadow-brutal-sm overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-foreground text-background">
              <tr>
                <th className="text-left p-3 sticky left-0 bg-foreground">Recurso</th>
                <th className="text-left">Vínculo</th>
                <th className="text-right p-3">Total atual</th>
                {weeks.map((w) => <th key={w} className="text-center w-14 font-mono">{w}</th>)}
              </tr>
            </thead>
            <tbody className="divide-y-2 divide-foreground">
              {heatRows.map(({ r, total, series }) => (
                <tr key={r.id} className="hover:bg-muted/30">
                  <td className="p-3 sticky left-0 bg-card">
                    <div className="font-bold">{r.nome}</div>
                    <div className="text-[10px] font-mono uppercase text-muted-foreground tracking-widest">{r.papel}</div>
                  </td>
                  <td className="font-mono text-[10px] uppercase tracking-widest">{r.kind}</td>
                  <td className={cn("text-right p-3 font-mono", total > 100 && "text-destructive font-bold")}>
                    {total}%
                    {total > 100 && <AlertTriangle className="inline h-3 w-3 ml-1" />}
                    {total < 60 && <TrendingDown className="inline h-3 w-3 ml-1 text-info" />}
                  </td>
                  {series.map((v, i) => (
                    <td key={i} className="p-0.5">
                      <div
                        title={`${v}%`}
                        className={cn(
                          "h-9 border border-foreground flex items-center justify-center text-[9px] font-mono font-bold",
                          v > 100 ? "bg-destructive text-destructive-foreground"
                            : v >= 90 ? "bg-accent text-accent-foreground"
                            : v >= 60 ? "bg-success text-success-foreground"
                            : "bg-muted text-muted-foreground",
                        )}
                      >{v}</div>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Detalhe por recurso */}
        <div className="grid lg:grid-cols-2 gap-6">
          <div className="border-2 border-foreground bg-card p-5 shadow-brutal-sm">
            <SectionTitle hint="alocação por projeto">Detalhe — sobrecarregados</SectionTitle>
            <div className="space-y-4">
              {heatRows.filter((x) => x.total > 100).map(({ r, total }) => {
                const allocs = helpers.allocationByResource(r.id);
                return (
                  <div key={r.id}>
                    <div className="flex justify-between mb-1">
                      <span className="font-bold text-sm">{r.nome}</span>
                      <span className="font-mono text-xs text-destructive">{total}%</span>
                    </div>
                    <div className="flex h-5 border-2 border-foreground overflow-hidden">
                      {allocs.map((a, i) => {
                        const proj = helpers.getProject(a.projectId);
                        const colors = ["bg-primary", "bg-accent", "bg-info", "bg-success", "bg-steel"];
                        return (
                          <div
                            key={a.id}
                            title={`${proj?.nome}: ${a.percentual}%`}
                            className={cn(colors[i % colors.length], "border-r border-foreground last:border-r-0 text-[9px] font-mono text-center text-primary-foreground")}
                            style={{ width: `${(a.percentual / total) * 100}%` }}
                          >{a.percentual}%</div>
                        );
                      })}
                    </div>
                    <div className="text-[10px] font-mono text-muted-foreground mt-1">
                      {allocs.map((a) => helpers.getProject(a.projectId)?.codigo).join(" · ")}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="border-2 border-foreground bg-accent/30 p-5 shadow-brutal-sm">
            <SectionTitle><TrendingUp className="inline h-4 w-4 mr-1" /> Simulação de cenário</SectionTitle>
            <p className="text-sm mb-4">Redistribuir 20% de <strong>Hyago Keller</strong> do projeto <em>Plataforma PIX</em> para <em>Heitor Alves</em>.</p>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="border-2 border-foreground bg-card p-3">
                <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Antes</div>
                <div className="font-display text-2xl">90% / 16%</div>
                <div className="text-[10px] text-muted-foreground">HK / HA</div>
              </div>
              <div className="border-2 border-foreground bg-success text-success-foreground p-3">
                <div className="font-mono text-[10px] uppercase tracking-widest opacity-70">Depois</div>
                <div className="font-display text-2xl">70% / 36%</div>
                <div className="text-[10px] opacity-70">balanceado</div>
              </div>
            </div>
            <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mt-4">
              ✓ Sem conflito de agenda · ✓ Skills compatíveis · ✓ Vigência ok
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

const Legend = ({ color, label }: { color: string; label: string }) => (
  <span className="inline-flex items-center gap-1.5">
    <span className={cn("h-3 w-3 border border-foreground", color)} />
    {label}
  </span>
);
