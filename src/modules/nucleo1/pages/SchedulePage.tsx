import { PageHeader, SectionTitle, StatusBadge } from "../ui";
import { projects, helpers } from "../mockData";
import { cn } from "@/lib/utils";

export const SchedulePage = () => {
  // calcular janela total
  const min = Math.min(...projects.map((p) => +new Date(p.inicio)));
  const max = Math.max(...projects.map((p) => +new Date(p.fim)));
  const span = max - min;

  // mês para escala
  const months: { label: string; ts: number }[] = [];
  const start = new Date(min); start.setDate(1);
  const end = new Date(max);
  const cur = new Date(start);
  while (cur <= end) {
    months.push({ label: cur.toLocaleDateString("pt-BR", { month: "short", year: "2-digit" }), ts: +cur });
    cur.setMonth(cur.getMonth() + 1);
  }

  return (
    <>
      <PageHeader
        eyebrow="Cronograma global"
        title="Timeline do portfólio"
        subtitle="Vista Gantt leve com todos os projetos ativos. Identifique sobreposições e janelas livres."
      />
      <div className="p-6 lg:p-8">
        <div className="border-2 border-foreground bg-card shadow-brutal-sm overflow-x-auto">
          <div className="min-w-[1000px]">
            {/* Header meses */}
            <div className="grid grid-cols-[260px_1fr] border-b-2 border-foreground bg-foreground text-background">
              <div className="p-3 text-[10px] font-mono uppercase tracking-widest border-r-2 border-background">Projeto</div>
              <div className="grid" style={{ gridTemplateColumns: `repeat(${months.length}, 1fr)` }}>
                {months.map((m) => (
                  <div key={m.ts} className="text-center text-[10px] font-mono uppercase tracking-widest p-1.5 border-r border-background/30 last:border-r-0">
                    {m.label}
                  </div>
                ))}
              </div>
            </div>

            {/* Linhas */}
            {projects.map((p) => {
              const startPct = ((+new Date(p.inicio) - min) / span) * 100;
              const widthPct = ((+new Date(p.fim) - +new Date(p.inicio)) / span) * 100;
              const colorMap = {
                verde: "bg-success", amarelo: "bg-accent", vermelho: "bg-destructive",
              } as const;
              return (
                <div key={p.id} className="grid grid-cols-[260px_1fr] border-b-2 border-foreground hover:bg-muted/30">
                  <div className="p-3 border-r-2 border-foreground">
                    <div className="font-bold text-sm truncate">{p.nome}</div>
                    <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mt-0.5">
                      {p.codigo} · {helpers.getCliente(p.clienteId)?.nome}
                    </div>
                  </div>
                  <div className="relative h-14 bg-grid-brutal">
                    <div
                      className={cn("absolute top-3 h-8 border-2 border-foreground shadow-brutal-sm flex items-center px-2", colorMap[p.saude])}
                      style={{ left: `${startPct}%`, width: `${widthPct}%` }}
                      title={`${p.nome}: ${p.inicio} → ${p.fim}`}
                    >
                      <div className="text-[10px] font-mono font-bold text-foreground truncate">
                        {p.progresso}%
                      </div>
                      {/* progresso interno */}
                      <div className="absolute inset-0 border-r-2 border-foreground/40" style={{ right: `${100 - p.progresso}%` }} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-4 text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
          <span className="inline-flex items-center gap-1.5"><span className="h-3 w-3 bg-success border border-foreground" /> Saudável</span>
          <span className="inline-flex items-center gap-1.5"><span className="h-3 w-3 bg-accent border border-foreground" /> Atenção</span>
          <span className="inline-flex items-center gap-1.5"><span className="h-3 w-3 bg-destructive border border-foreground" /> Crítico</span>
        </div>
      </div>
    </>
  );
};
