import { LayoutDashboard, GitBranch, Trophy, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

type Core = {
  id: string;
  number: string;
  icon: typeof LayoutDashboard;
  title: string;
  subtitle: string;
  desc: string;
  capabilities: string[];
  views?: string[];
  fields?: { k: string; v: string }[];
  badgeColor: "primary" | "accent" | "secondary";
  anchor: string;
  route?: string;
  routeLabel?: string;
};

const cores: Core[] = [
  {
    id: "01",
    number: "01",
    anchor: "nucleo-projetos",
    icon: LayoutDashboard,
    title: "Projetos & Squads",
    subtitle: "O coração da plataforma",
    desc: "Não só cronograma — portfólio, capacidade, alocação e performance em tempo real, no espírito das ferramentas modernas de PPM.",
    capabilities: [
      "Portfólio interno e externo",
      "Programas, iniciativas e squads",
      "Capacidade por colaborador, time e núcleo",
      "Alocação % e por horas",
      "Colaboradores compartilhados",
      "Dependências entre projetos",
      "Priorização por valor, risco, esforço e cliente",
      "Cenários de alocação",
      "Saúde do projeto e KPIs",
    ],
    views: ["Timeline", "Gantt leve", "Board", "Tabela analítica", "Mapa de capacidade", "Heatmap de sobrecarga", "Painel executivo"],
    badgeColor: "primary",
  },
  {
    id: "02",
    number: "02",
    anchor: "nucleo-licitacoes",
    route: "/licitacoes",
    routeLabel: "Abrir Radar de Licitações",
    icon: Trophy,
    title: "Gestão de Licitações",
    subtitle: "Da prospecção à decisão bid/no-bid",
    desc: "Cobre o que normalmente não cabe nem em CRM nem em Project. Controle centralizado, status em tempo real, comparação de propostas e ciclo completo da oportunidade.",
    capabilities: [
      "Radar de editais e oportunidades",
      "Pipeline de licitações",
      "Triagem e aderência",
      "Avaliação técnica + decisão bid/no-bid",
      "Controle de POCs",
      "Composição de equipe de resposta",
      "Repositório documental",
      "Cronograma da proposta",
      "Lições aprendidas por edital",
    ],
    fields: [
      { k: "Órgão / Cliente", v: "Tipo, prazo, valor estimado" },
      { k: "Responsáveis", v: "Comercial e técnico" },
      { k: "Probabilidade", v: "Score técnico-comercial" },
      { k: "Aderência", v: "Checklist + biblioteca de respostas" },
      { k: "Parceiros", v: "Composição e papéis" },
      { k: "Risco & decisão", v: "Histórico vivo da oportunidade" },
    ],
    badgeColor: "accent",
  },
  {
    id: "03",
    number: "03",
    anchor: "nucleo-automacoes",
    icon: GitBranch,
    title: "Automações & Transformação Digital",
    subtitle: "Esteira de ativos replicáveis",
    desc: "Não registra só ideias — organiza ativos para reduzir custo, ganhar operação e gerar valor para clientes. Cada automação evolui em estágios de maturidade.",
    capabilities: [
      "Esteira: ideia → oportunidade → viabilidade",
      "Avaliação técnica e estimativa de economia",
      "POC → piloto → produto interno",
      "Solução replicável para clientes → escala",
      "Tipos: no-code, low-code, code",
      "Reusabilidade e stack/integrações",
      "Custo, economia e valor gerado",
      "Complexidade, risco e maturidade",
      "Transforma automações em ofertas e cases",
    ],
    badgeColor: "secondary",
  },
];

const badgeClass: Record<Core["badgeColor"], string> = {
  primary: "bg-primary text-primary-foreground",
  accent: "bg-accent text-accent-foreground",
  secondary: "bg-secondary text-secondary-foreground",
};

export const Cores = () => {
  return (
    <section className="bg-background">
      {cores.map((core, i) => {
        const Icon = core.icon;
        const isAlt = i % 2 === 1;
        return (
          <section
            key={core.id}
            id={core.anchor}
            className={`border-b-2 border-foreground py-24 lg:py-28 ${isAlt ? "bg-muted" : "bg-background"}`}
          >
            <div className="container">
              <div className="grid lg:grid-cols-12 gap-10 items-start">
                <div className="lg:col-span-5">
                  <div className={`inline-block border-2 border-foreground px-3 py-1 mb-5 text-[11px] font-bold uppercase tracking-widest shadow-brutal-sm ${badgeClass[core.badgeColor]}`}>
                    Núcleo {core.number}
                  </div>
                  <div className="flex items-start gap-4 mb-4">
                    <div className="flex-shrink-0 inline-flex h-14 w-14 items-center justify-center border-2 border-foreground bg-foreground text-background">
                      <Icon className="h-6 w-6" />
                    </div>
                    <div>
                      <h2 className="font-display text-4xl md:text-5xl tracking-tight leading-[0.95]">
                        {core.title}
                      </h2>
                      <div className="font-mono text-xs uppercase tracking-widest text-muted-foreground mt-2">
                        {core.subtitle}
                      </div>
                    </div>
                  </div>
                  <p className="mt-6 text-base lg:text-lg font-medium text-muted-foreground leading-relaxed">
                    {core.desc}
                  </p>

                  {core.route && (
                    <Link
                      to={core.route}
                      className="mt-6 inline-flex items-center gap-2 border-2 border-foreground bg-foreground text-background px-4 py-2.5 text-xs font-bold uppercase tracking-widest shadow-brutal-sm hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all"
                    >
                      {core.routeLabel ?? "Abrir módulo"} <ArrowRight className="h-4 w-4" />
                    </Link>
                  )}

                  {core.views && (
                    <div className="mt-8">
                      <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-3">

                        Visualizações
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {core.views.map((v) => (
                          <span key={v} className="border-2 border-foreground bg-card px-2.5 py-1 text-[10px] font-mono font-bold uppercase tracking-wide">
                            {v}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="lg:col-span-7">
                  <div className="border-2 border-foreground bg-card shadow-brutal-lg">
                    <div className="border-b-2 border-foreground bg-foreground text-background px-4 py-2.5 flex items-center justify-between">
                      <span className="font-mono text-xs font-bold uppercase">Capacidades-chave</span>
                      <span className="text-[10px] font-mono opacity-70">núcleo {core.number}</span>
                    </div>
                    <ul className="grid sm:grid-cols-2">
                      {core.capabilities.map((c, idx) => (
                        <li
                          key={c}
                          className={`flex items-start gap-3 p-4 text-sm font-medium border-foreground/10
                            ${idx % 2 === 0 ? "sm:border-r-2" : ""}
                            ${idx < core.capabilities.length - (core.capabilities.length % 2 === 0 ? 2 : 1) ? "border-b-2" : ""}`}
                        >
                          <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 bg-primary" />
                          <span>{c}</span>
                        </li>
                      ))}
                    </ul>

                    {core.fields && (
                      <div className="border-t-2 border-foreground bg-muted/50 p-5">
                        <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-3">
                          Campos importantes
                        </div>
                        <div className="grid sm:grid-cols-2 gap-x-6 gap-y-2 text-sm">
                          {core.fields.map((f) => (
                            <div key={f.k} className="flex justify-between gap-3 border-b border-dashed border-foreground/20 py-1.5">
                              <span className="font-bold">{f.k}</span>
                              <span className="text-muted-foreground text-right">{f.v}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </section>
        );
      })}
    </section>
  );
};
