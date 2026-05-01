import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

export const ProjectsCTA = () => (
  <section className="py-20 lg:py-24 bg-background">
    <div className="container">
      <div className="border-2 border-foreground bg-foreground text-background p-10 lg:p-14 shadow-brutal-lg">
        <div className="grid lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-8">
            <div className="inline-block border-2 border-background bg-accent text-accent-foreground px-3 py-1 mb-4 text-[11px] font-bold uppercase tracking-widest">
              Próximo passo
            </div>
            <h2 className="font-display text-4xl lg:text-5xl tracking-tight leading-[0.95]">
              Capacidades, visões e dados <span className="text-accent">ligados em uma só base</span>.
            </h2>
            <p className="mt-5 text-base font-medium opacity-80 max-w-2xl">
              Esta V1 mapeia o módulo. A próxima iteração detalha telas, fluxos e o modelo de dados do "item estratégico"
              aplicado a Projetos & Squads.
            </p>
          </div>
          <div className="lg:col-span-4 flex flex-col gap-3">
            <Button variant="hero" size="xl" asChild>
              <Link to="/">Voltar à apresentação <ArrowRight className="ml-1" /></Link>
            </Button>
            <Button variant="outlineLight" size="xl" asChild>
              <a href="#capacidades">Revisitar capacidades</a>
            </Button>
          </div>
        </div>
      </div>
    </div>
  </section>
);
