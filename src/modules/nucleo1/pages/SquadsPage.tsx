import { Link } from "react-router-dom";
import { PageHeader, SectionTitle } from "../ui";
import { squads, helpers } from "../mockData";
import { Users, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";

export const SquadsPage = () => {
  return (
    <>
      <PageHeader
        eyebrow="Squads"
        title="Times multidisciplinares"
        subtitle="Permanentes, temporários e híbridos. Squad pode ser compartilhado entre projetos."
      />
      <div className="p-6 lg:p-8 grid md:grid-cols-2 xl:grid-cols-3 gap-5">
        {squads.map((s) => {
          const lider = helpers.getResource(s.liderId);
          const membros = s.membrosIds.map((id) => helpers.getResource(id)!).filter(Boolean);
          const projetos = s.projetosIds.map((id) => helpers.getProject(id)!).filter(Boolean);
          const carga = membros.reduce((acc, m) => acc + helpers.totalAlloc(m.id), 0) / Math.max(membros.length, 1);
          return (
            <div key={s.id} className="border-2 border-foreground bg-card p-5 shadow-brutal-sm hover-brutal">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Squad · {s.tipo}</div>
                  <h3 className="font-display text-xl tracking-tight">{s.nome}</h3>
                </div>
                <span className={cn(
                  "px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest border-2 border-foreground",
                  s.tipo === "permanente" && "bg-success text-success-foreground",
                  s.tipo === "temporario" && "bg-accent",
                  s.tipo === "hibrido" && "bg-info text-info-foreground",
                )}>{s.tipo}</span>
              </div>

              <div className="mb-4 text-xs">
                <div className="flex items-center gap-1 text-muted-foreground mb-1">
                  <Calendar className="h-3 w-3" />
                  <span className="font-mono uppercase tracking-widest text-[10px]">
                    Vigência: {new Date(s.vigencia.inicio).toLocaleDateString("pt-BR")}
                    {s.vigencia.fim ? ` → ${new Date(s.vigencia.fim).toLocaleDateString("pt-BR")}` : " · indeterminada"}
                  </span>
                </div>
                <div className="font-mono uppercase tracking-widest text-[10px] text-muted-foreground">
                  Líder: <strong className="text-foreground">{lider?.nome}</strong>
                </div>
              </div>

              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground"><Users className="inline h-3 w-3 mr-1" /> Composição ({membros.length})</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {membros.map((m) => (
                    <span key={m.id} className="inline-flex items-center gap-1.5 border-2 border-foreground bg-muted px-2 py-0.5 text-[10px] font-bold">
                      <span className="h-5 w-5 bg-accent text-accent-foreground border border-foreground flex items-center justify-center text-[9px]">{m.avatar}</span>
                      {m.nome.split(" ")[0]}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mb-4">
                <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-2">Projetos vinculados</div>
                <div className="space-y-1">
                  {projetos.map((p) => (
                    <Link key={p.id} to={`/projetos-squads/app/projeto/${p.id}`} className="block border border-foreground px-2 py-1 text-xs hover:bg-accent/30">
                      <span className="font-mono text-[10px] text-muted-foreground mr-2">{p.codigo}</span>
                      {p.nome}
                    </Link>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex justify-between text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-1">
                  <span>Carga média do squad</span>
                  <span className={cn(carga > 100 && "text-destructive")}>{carga.toFixed(0)}%</span>
                </div>
                <div className="h-2 border border-foreground bg-muted">
                  <div className={cn("h-full", carga > 100 ? "bg-destructive" : carga > 80 ? "bg-accent" : "bg-success")} style={{ width: `${Math.min(carga, 100)}%` }} />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
};
