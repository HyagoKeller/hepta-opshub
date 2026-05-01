import { Button } from "@/components/ui/button";
import { ArrowLeft, Layers3 } from "lucide-react";
import { Link } from "react-router-dom";

export const ProjectsHero = () => {
  return (
    <section className="relative overflow-hidden bg-background border-b-2 border-foreground">
      <div className="absolute inset-0 bg-grid-brutal opacity-60" />
      <div className="container relative pt-12 pb-16 lg:pt-16 lg:pb-20">
        <div className="flex flex-wrap items-center gap-3 mb-8">
          <Button variant="outline" size="sm" asChild>
            <Link to="/"><ArrowLeft className="mr-1" /> Voltar à apresentação</Link>
          </Button>
          <Button variant="primary" size="sm" asChild>
            <Link to="/projetos-squads/login">Entrar no app do Núcleo 01</Link>
          </Button>
          <div className="inline-flex items-center gap-2 border-2 border-foreground bg-card px-3 py-1.5 shadow-brutal-sm">
            <span className="h-2 w-2 bg-primary rounded-full" />
            <span className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
              Núcleo 01 · Projetos & Squads
            </span>
          </div>
        </div>

        <div className="grid lg:grid-cols-12 gap-10 items-end">
          <div className="lg:col-span-8">
            <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl leading-[0.9] tracking-tight">
              O coração <span className="text-primary">operacional</span> da plataforma.
            </h1>
            <p className="mt-6 max-w-2xl text-lg font-medium leading-relaxed text-muted-foreground">
              Mais que cronograma: <strong className="text-foreground">portfólio, capacidade, alocação e performance</strong> em
              tempo real. Priorize investimentos, aloque recursos por restrição e acompanhe KPIs vivos.
            </p>
          </div>
          <div className="lg:col-span-4">
            <div className="border-2 border-foreground bg-accent text-accent-foreground p-5 shadow-brutal">
              <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest mb-3">
                <Layers3 className="h-3.5 w-3.5" /> Stack do módulo
              </div>
              <div className="grid grid-cols-3 gap-3 text-center">
                <div>
                  <div className="font-display text-3xl">10</div>
                  <div className="text-[10px] font-mono uppercase">capacidades</div>
                </div>
                <div className="border-x-2 border-foreground/20">
                  <div className="font-display text-3xl">7</div>
                  <div className="text-[10px] font-mono uppercase">visões</div>
                </div>
                <div>
                  <div className="font-display text-3xl">∞</div>
                  <div className="text-[10px] font-mono uppercase">cenários</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
