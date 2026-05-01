import { Briefcase, GitBranch, Users, PieChart, Network, Link2, Trophy, Layers, HeartPulse, Activity } from "lucide-react";

const items = [
  { icon: Briefcase, title: "Portfólio", desc: "Projetos internos e externos numa única visão consolidada." },
  { icon: Layers, title: "Programas, iniciativas e squads", desc: "Hierarquia flexível de portfólio até execução." },
  { icon: Users, title: "Capacidade", desc: "Por colaborador, time e núcleo — com base real." },
  { icon: PieChart, title: "Alocação", desc: "Percentual ou por horas, com limites e restrições." },
  { icon: Network, title: "Recursos compartilhados", desc: "Pessoas atuando em mais de uma frente sem dupla contagem." },
  { icon: Link2, title: "Dependências entre projetos", desc: "Bloqueios e relações cruzadas explícitas." },
  { icon: Trophy, title: "Priorização", desc: "Por valor, risco, esforço e cliente — score configurável." },
  { icon: GitBranch, title: "Cenários de alocação", desc: "Simule trade-offs antes de mover pessoas." },
  { icon: HeartPulse, title: "Saúde do projeto", desc: "Semáforo vivo de prazo, escopo, custo e equipe." },
  { icon: Activity, title: "Indicadores de performance", desc: "KPIs de entrega, throughput e satisfação do cliente." },
];

export const Capabilities = () => {
  return (
    <section className="py-20 lg:py-24 bg-background border-b-2 border-foreground">
      <div className="container">
        <div className="max-w-3xl mb-12">
          <div className="inline-block border-2 border-foreground bg-foreground text-background px-3 py-1 mb-5 text-[11px] font-bold uppercase tracking-widest">
            01 · Capacidades principais
          </div>
          <h2 className="font-display text-4xl md:text-5xl lg:text-6xl tracking-tight">
            Mais que cronograma — <span className="text-primary">PPM de verdade</span>.
          </h2>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {items.map(({ icon: Icon, title, desc }, i) => (
            <article
              key={title}
              className="border-2 border-foreground bg-card p-5 shadow-brutal-sm hover-brutal flex flex-col gap-3"
            >
              <div className="flex items-center justify-between">
                <div className="inline-flex h-10 w-10 items-center justify-center border-2 border-foreground bg-accent text-accent-foreground">
                  <Icon className="h-5 w-5" />
                </div>
                <span className="font-mono text-[10px] text-muted-foreground">
                  {String(i + 1).padStart(2, "0")}
                </span>
              </div>
              <div>
                <div className="font-display text-lg leading-tight">{title}</div>
                <p className="mt-1.5 text-xs font-medium text-muted-foreground leading-relaxed">{desc}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};
