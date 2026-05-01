import { Button } from "@/components/ui/button";
import { ArrowRight, Calendar, Mail, Linkedin } from "lucide-react";
import { HeptaMark } from "./SiteHeader";

export const CTA = () => {
  return (
    <section id="contato" className="relative py-24 lg:py-28 bg-background overflow-hidden">
      <div className="container">
        <div className="relative border-2 border-foreground bg-primary text-primary-foreground p-10 lg:p-16 shadow-brutal-lg overflow-hidden">
          <div className="absolute inset-0 bg-grid-brutal opacity-10" />

          <div className="relative grid lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-7">
              <div className="inline-block border-2 border-background bg-accent text-accent-foreground px-3 py-1 mb-5 text-[11px] font-bold uppercase tracking-widest">
                V1 · Próximo passo
              </div>
              <h2 className="font-display text-4xl md:text-5xl lg:text-6xl tracking-tight leading-[0.95]">
                Vamos transformar a operação da Hepta?
              </h2>
              <p className="mt-6 text-base lg:text-lg font-medium opacity-90 max-w-xl leading-relaxed">
                A V1 cobre a visão de alto nível: três núcleos, modelo multi-entidade e item estratégico unificado.
                A próxima conversa é definir piloto, áreas envolvidas e roadmap.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <Button variant="hero" size="xl" asChild>
                  <a href="mailto:hyago.keller@hepta.com.br">
                    <Calendar className="mr-1" /> Agendar conversa <ArrowRight className="ml-1" />
                  </a>
                </Button>
                <Button variant="outlineLight" size="xl" asChild>
                  <a href="#visao">
                    Revisitar a visão
                  </a>
                </Button>
              </div>
            </div>

            <div className="lg:col-span-5">
              <div className="border-2 border-background bg-background/5 p-6">
                <div className="font-mono text-[10px] uppercase tracking-widest text-accent mb-3">
                  O que esta V1 entrega
                </div>
                <ul className="space-y-3 text-sm font-medium">
                  {[
                    "Conceito do produto e posicionamento interno",
                    "Modelo multi-entidade e regras de recursos",
                    "Detalhamento dos 3 núcleos",
                    "Modelo de dados unificado (item estratégico)",
                    "Módulos transversais e diferencial vs MS Project",
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-2">
                      <span className="mt-1.5 flex-shrink-0 h-1.5 w-1.5 bg-accent" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-5 pt-5 border-t border-background/20 space-y-2 text-xs font-mono">
                  <div className="flex items-center gap-2">
                    <Mail className="h-3.5 w-3.5" />
                    <span>hyago.keller@hepta.com.br</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Linkedin className="h-3.5 w-3.5" />
                    <span>/in/hyagokeller</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export const SiteFooter = () => {
  return (
    <footer className="border-t-2 border-foreground bg-foreground text-background">
      <div className="container py-14">
        <div className="grid md:grid-cols-4 gap-10">
          <div className="md:col-span-2">
            <div className="flex items-center gap-3">
              <div className="bg-background p-1.5 border-2 border-background">
                <HeptaMark />
              </div>
              <div className="leading-tight">
                <div className="font-display text-xl">
                  Hepta<span className="text-accent">Project</span>
                </div>
                <div className="text-[10px] font-mono uppercase tracking-widest opacity-70">
                  Plataforma operacional · Hepta Tecnologia
                </div>
              </div>
            </div>
            <p className="mt-5 text-sm font-medium opacity-70 max-w-md leading-relaxed">
              Plataforma única para planejar, priorizar, executar e transformar — projetos & squads,
              gestão de licitações e automações replicáveis em uma só base operacional.
            </p>
          </div>
          <div>
            <div className="font-display text-sm uppercase tracking-wider mb-4 text-accent">Núcleos</div>
            <ul className="space-y-2.5 text-sm font-medium opacity-80">
              <li><a href="#nucleo-projetos" className="hover:text-accent">Projetos & Squads</a></li>
              <li><a href="#nucleo-licitacoes" className="hover:text-accent">Licitações</a></li>
              <li><a href="#nucleo-automacoes" className="hover:text-accent">Automações</a></li>
            </ul>
          </div>
          <div>
            <div className="font-display text-sm uppercase tracking-wider mb-4 text-accent">Plataforma</div>
            <ul className="space-y-2.5 text-sm font-medium opacity-80">
              <li><a href="#estrutura" className="hover:text-accent">Estrutura organizacional</a></li>
              <li><a href="#modelo" className="hover:text-accent">Modelo de dados</a></li>
              <li><a href="#plataforma" className="hover:text-accent">Módulos transversais</a></li>
              <li><a href="#contato" className="hover:text-accent">Contato</a></li>
            </ul>
          </div>
        </div>
        <div className="mt-12 pt-6 border-t border-background/20 flex flex-col sm:flex-row justify-between gap-3 text-xs font-mono opacity-70">
          <div>© {new Date().getFullYear()} HeptaProject · Conceito interno · Hepta Tecnologia</div>
          <div className="text-accent font-bold">DESENVOLVIDO POR HYAGO KELLER</div>
        </div>
      </div>
    </footer>
  );
};
