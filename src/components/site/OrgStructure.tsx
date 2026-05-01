import { Building2, Users, Briefcase, Network, UserCog, Handshake } from "lucide-react";

const entities = [
  { icon: Building2, k: "Empresa", v: "Hepta Tecnologia como entidade-raiz." },
  { icon: Network, k: "Núcleos internos", v: "Áreas e capítulos de especialização." },
  { icon: Briefcase, k: "Clientes / Unidades", v: "Órgãos e clientes externos atendidos." },
  { icon: Users, k: "Times & Squads", v: "Permanentes, temporários ou híbridos." },
  { icon: UserCog, k: "Colaboradores", v: "Atuam em mais de um projeto e cliente." },
  { icon: Handshake, k: "Prestadores & Parceiros", v: "Participam de licitações, POCs e entregas." },
];

export const OrgStructure = () => {
  return (
    <section id="estrutura" className="relative py-24 lg:py-28 bg-background border-b-2 border-foreground">
      <div className="container">
        <div className="max-w-3xl mb-14">
          <div className="inline-block border-2 border-foreground bg-primary text-primary-foreground px-3 py-1 mb-5 text-[11px] font-bold uppercase tracking-widest shadow-brutal-sm">
            Estrutura organizacional
          </div>
          <h2 className="font-display text-4xl md:text-5xl lg:text-6xl tracking-tight">
            Modelo <span className="text-primary">multi-entidade</span> de verdade.
          </h2>
          <p className="mt-6 text-lg font-medium text-muted-foreground">
            Times internos, clientes, colaboradores compartilhados, parceiros e contextos híbridos —
            tudo compatível com gestão moderna de portfólio e <em>resource pool</em>.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {entities.map(({ icon: Icon, k, v }) => (
            <article key={k} className="border-2 border-foreground bg-card p-7 shadow-brutal-sm hover-brutal">
              <div className="inline-flex h-12 w-12 items-center justify-center border-2 border-foreground bg-secondary text-secondary-foreground mb-5">
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="font-display text-xl leading-tight">{k}</h3>
              <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{v}</p>
            </article>
          ))}
        </div>

        <div className="mt-10 border-2 border-foreground bg-accent/30 p-6 shadow-brutal-sm">
          <div className="font-mono text-[10px] uppercase tracking-widest mb-3">Regras-chave</div>
          <ul className="grid md:grid-cols-2 gap-x-8 gap-y-2 text-sm font-medium">
            <li>• Um colaborador atua em N projetos e N clientes.</li>
            <li>• Parceiro entra em licitação/POC sem ser quadro interno.</li>
            <li>• Recursos compartilhados entre interno, cliente e inovação.</li>
            <li>• Times e squads podem ser temporários, permanentes ou híbridos.</li>
          </ul>
        </div>
      </div>
    </section>
  );
};
