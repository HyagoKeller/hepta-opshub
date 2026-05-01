import { PageHeader, SectionTitle } from "../ui";
import { dependencies, projects, deliveries } from "../mockData";
import { cn } from "@/lib/utils";
import { ArrowRight, AlertTriangle } from "lucide-react";

export const DependenciesPage = () => {
  const bloqueios = dependencies.filter((d) => d.bloqueante);

  // grafo simples: agrupa nodes
  const nodes = Array.from(new Set(dependencies.flatMap((d) => [d.fromLabel, d.toLabel])));

  return (
    <>
      <PageHeader
        eyebrow="Dependências"
        title="Grafo e caminho crítico"
        subtitle="Bloqueios entre projetos, entregas e recursos. Visualize o que precisa destravar primeiro."
      />
      <div className="p-6 lg:p-8 grid lg:grid-cols-3 gap-6">
        {/* Grafo */}
        <div className="lg:col-span-2 border-2 border-foreground bg-card p-5 shadow-brutal-sm">
          <SectionTitle hint={`${nodes.length} nós · ${dependencies.length} relações`}>Grafo visual</SectionTitle>
          <svg viewBox="0 0 700 420" className="w-full h-[420px] border-2 border-dashed border-foreground/30">
            {/* posições estáticas tipo card */}
            {nodes.map((n, i) => {
              const cols = 4;
              const x = 60 + (i % cols) * 170;
              const y = 50 + Math.floor(i / cols) * 110;
              return (
                <g key={n}>
                  <rect x={x} y={y} width="150" height="60" fill="hsl(var(--card))"
                    stroke="hsl(var(--foreground))" strokeWidth="2" />
                  <foreignObject x={x} y={y} width="150" height="60">
                    <div className="h-full w-full p-2 text-[10px] font-bold leading-tight flex items-center justify-center text-center">
                      {n}
                    </div>
                  </foreignObject>
                </g>
              );
            })}
            {dependencies.map((d, i) => {
              const fi = nodes.indexOf(d.fromLabel);
              const ti = nodes.indexOf(d.toLabel);
              const cols = 4;
              const fx = 60 + (fi % cols) * 170 + 75;
              const fy = 50 + Math.floor(fi / cols) * 110 + 60;
              const tx = 60 + (ti % cols) * 170 + 75;
              const ty = 50 + Math.floor(ti / cols) * 110;
              return (
                <line key={d.id} x1={fx} y1={fy} x2={tx} y2={ty}
                  stroke={d.bloqueante ? "hsl(var(--destructive))" : "hsl(var(--foreground))"}
                  strokeWidth={d.bloqueante ? 2.5 : 1.5}
                  strokeDasharray={d.bloqueante ? "0" : "4 3"}
                  markerEnd="url(#arrow)" />
              );
            })}
            <defs>
              <marker id="arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
                <path d="M0,0 L10,5 L0,10 z" fill="hsl(var(--foreground))" />
              </marker>
            </defs>
          </svg>
          <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mt-2">
            <span className="inline-block w-3 h-0.5 bg-destructive align-middle mr-1" /> bloqueante ·
            <span className="inline-block w-3 h-0 border-t-2 border-dashed border-foreground align-middle mx-1" /> opcional
          </div>
        </div>

        {/* Lista de bloqueios + caminho crítico */}
        <div className="space-y-5">
          <div className="border-2 border-foreground bg-card p-5 shadow-brutal-sm">
            <SectionTitle><AlertTriangle className="inline h-4 w-4 mr-1 text-destructive" /> Bloqueios ativos</SectionTitle>
            <ul className="space-y-2">
              {bloqueios.map((d) => (
                <li key={d.id} className="border-2 border-destructive bg-destructive/10 p-2.5 text-xs">
                  <div className="flex items-center gap-2 font-bold">
                    <span>{d.fromLabel}</span>
                    <ArrowRight className="h-3 w-3" />
                    <span>{d.toLabel}</span>
                  </div>
                  <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mt-1">
                    Tipo {d.tipo}
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="border-2 border-foreground bg-secondary text-secondary-foreground p-5 shadow-brutal-sm">
            <SectionTitle hint="estimativa">Caminho crítico</SectionTitle>
            <ol className="space-y-2 text-sm">
              {["Migração SAP S/4HANA", "Cutover S/4HANA", "Liquidação RT", "Homologação BACEN"].map((s, i) => (
                <li key={s} className="flex items-center gap-3">
                  <span className="h-6 w-6 border-2 border-accent bg-accent text-accent-foreground font-display flex items-center justify-center text-xs">{i + 1}</span>
                  <span className="font-bold">{s}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </>
  );
};
