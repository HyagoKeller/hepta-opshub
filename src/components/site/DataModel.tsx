const items = [
  { k: "Projeto", desc: "Entregas com prazo, escopo e responsáveis." },
  { k: "Iniciativa", desc: "Programas e movimentos estratégicos." },
  { k: "Licitação", desc: "Oportunidade comercial em ciclo de proposta." },
  { k: "POC", desc: "Prova de conceito técnica ou comercial." },
  { k: "Automação", desc: "Ativo replicável de produtividade." },
  { k: "Estudo de viabilidade", desc: "Análise técnica e econômica." },
  { k: "Entrega", desc: "Marcos e produtos formais." },
  { k: "Squad", desc: "Time temporário, permanente ou híbrido." },
  { k: "Oportunidade", desc: "Demanda potencial em fase inicial." },
  { k: "Ativo replicável", desc: "Solução pronta para reúso." },
];

const shared = [
  "responsáveis", "dependências", "documentos", "esforço", "custo",
  "valor", "status", "comentários", "riscos", "aprovações",
];

export const DataModel = () => {
  return (
    <section id="modelo" className="py-24 lg:py-28 bg-foreground text-background border-b-2 border-foreground">
      <div className="container">
        <div className="max-w-3xl mb-14">
          <div className="inline-block border-2 border-background bg-accent text-accent-foreground px-3 py-1 mb-5 text-[11px] font-bold uppercase tracking-widest">
            Modelo de dados
          </div>
          <h2 className="font-display text-4xl md:text-5xl lg:text-6xl tracking-tight">
            Um único objeto: <span className="text-accent">item estratégico</span>.
          </h2>
          <p className="mt-6 text-lg font-medium opacity-80">
            A espinha dorsal é um objeto unificado com <strong className="text-accent">tipos diferentes</strong>.
            Isso compartilha responsáveis, custos, riscos e aprovações entre tudo o que a Hepta executa.
          </p>
        </div>

        <div className="grid lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7">
            <div className="border-2 border-background bg-background/5 p-2">
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-px bg-background/20">
                {items.map((it) => (
                  <div key={it.k} className="bg-foreground p-4">
                    <div className="font-display text-base text-accent leading-tight">{it.k}</div>
                    <div className="text-xs opacity-70 mt-1.5 leading-snug">{it.desc}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-5">
            <div className="border-2 border-background bg-background text-foreground p-6 shadow-brutal-lg">
              <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-4">
                Atributos compartilhados
              </div>
              <div className="flex flex-wrap gap-2">
                {shared.map((s) => (
                  <span key={s} className="border-2 border-foreground bg-card px-2.5 py-1 text-[11px] font-mono font-bold uppercase tracking-wide">
                    {s}
                  </span>
                ))}
              </div>
              <p className="mt-6 text-sm font-medium text-muted-foreground leading-relaxed">
                Qualquer tipo do item estratégico herda esses atributos — o que permite
                <strong className="text-foreground"> dashboards transversais</strong> e
                <strong className="text-foreground"> governança consistente</strong>.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
