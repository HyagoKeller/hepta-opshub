export const Manifesto = () => {
  return (
    <section id="visao" className="relative py-24 lg:py-28 bg-foreground text-background border-b-2 border-foreground overflow-hidden">
      <div className="absolute inset-0 bg-grid-brutal opacity-[0.05]" />
      <div className="container relative">
        <div className="max-w-4xl">
          <div className="inline-block border-2 border-background bg-accent text-accent-foreground px-3 py-1 mb-6 text-[11px] font-bold uppercase tracking-widest">
            Conceito do produto
          </div>
          <h2 className="font-display text-4xl md:text-5xl lg:text-6xl tracking-tight leading-[1.05]">
            Uma <span className="text-accent">plataforma operacional</span> da Hepta — não mais um Project, planilha ou e-mail solto.
          </h2>
          <p className="mt-8 text-lg font-medium opacity-80 leading-relaxed max-w-3xl">
            Posicionamento interno: uma plataforma única para <strong className="text-accent">planejar, priorizar, executar e transformar</strong>.
            Modelo multi-entidade compatível com práticas modernas de PPM e <em>resource pool</em>: recursos
            compartilhados entre projetos internos, clientes, parceiros e iniciativas de inovação.
          </p>

          <div className="mt-12 grid sm:grid-cols-3 gap-4 max-w-3xl">
            {[
              { k: "Visão", v: "Centralizar o trabalho da empresa em uma plataforma só" },
              { k: "Postura", v: "Operacional + comercial + transformação digital" },
              { k: "Diferencial", v: "Multi-entidade, recursos compartilhados, ativos replicáveis" },
            ].map((item) => (
              <div key={item.k} className="border-2 border-background bg-background/5 p-5">
                <div className="font-mono text-[10px] uppercase tracking-widest text-accent mb-2">
                  {item.k}
                </div>
                <div className="font-display text-base leading-tight">{item.v}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
