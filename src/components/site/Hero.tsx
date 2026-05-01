import { Button } from "@/components/ui/button";
import { ArrowRight, Play, Layers } from "lucide-react";

export const Hero = () => {
  return (
    <section className="relative overflow-hidden bg-background border-b-2 border-foreground">
      <div className="absolute inset-0 bg-grid-brutal opacity-60" />

      <div className="container relative pt-16 pb-20 lg:pt-24 lg:pb-28">
        <div className="grid lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7">
            <div className="inline-flex items-center gap-2 border-2 border-foreground bg-card px-3 py-1.5 shadow-brutal-sm mb-8">
              <span className="h-2 w-2 bg-primary rounded-full" />
              <span className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
                V1 · Plataforma interna Hepta · Conceito
              </span>
            </div>

            <h1 className="font-display text-5xl sm:text-6xl md:text-7xl lg:text-8xl leading-[0.9] tracking-tight">
              Hepta<span className="text-primary">Project</span>
            </h1>

            <p className="mt-6 font-display text-2xl sm:text-3xl lg:text-4xl leading-[1.1] tracking-tight max-w-3xl">
              Uma plataforma única para <span className="text-primary">planejar, priorizar, executar</span> e <span className="text-primary">transformar</span>.
            </p>

            <p className="mt-8 max-w-2xl text-lg font-medium leading-relaxed text-muted-foreground">
              Centraliza o trabalho da Hepta em três frentes que hoje vivem espalhadas entre Project,
              planilhas, e-mails e documentos: <strong className="text-foreground">projetos & squads</strong>,
              <strong className="text-foreground"> gestão de licitações</strong> e
              <strong className="text-foreground"> automações & transformação digital</strong>.
            </p>

            <div className="mt-10 flex flex-wrap items-center gap-4">
              <Button variant="primary" size="xl" asChild>
                <a href="#contato"><Play className="mr-1" /> Ver demonstração <ArrowRight className="ml-1" /></a>
              </Button>
              <Button variant="outline" size="xl" asChild>
                <a href="#visao"><Layers className="mr-1" /> Conhecer a visão</a>
              </Button>
            </div>
          </div>

          {/* Card-resumo da plataforma */}
          <div className="lg:col-span-5">
            <div className="relative">
              <div className="absolute -inset-2 border-2 border-foreground bg-accent shadow-brutal-lg -rotate-1" />
              <div className="relative border-2 border-foreground bg-card shadow-brutal-lg">
                <div className="border-b-2 border-foreground bg-foreground text-background px-4 py-2.5 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-2.5 w-2.5 rounded-full bg-accent" />
                    <span className="font-mono text-xs font-bold uppercase">HeptaProject · Visão geral</span>
                  </div>
                  <span className="text-[10px] font-mono opacity-70">v1.0</span>
                </div>
                <div className="p-6 space-y-5">
                  <div>
                    <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-2">
                      Missão
                    </div>
                    <p className="font-display text-lg leading-tight">
                      Substituir a colcha de retalhos operacional por uma <span className="text-primary">plataforma única</span> da Hepta.
                    </p>
                  </div>
                  <div className="pt-4 border-t-2 border-dashed border-foreground/20 grid grid-cols-3 gap-3 text-center">
                    <div>
                      <div className="font-display text-2xl text-primary">3</div>
                      <div className="text-[10px] font-mono uppercase tracking-wide text-muted-foreground">núcleos</div>
                    </div>
                    <div className="border-x-2 border-foreground/10">
                      <div className="font-display text-2xl text-primary">9</div>
                      <div className="text-[10px] font-mono uppercase tracking-wide text-muted-foreground">módulos</div>
                    </div>
                    <div>
                      <div className="font-display text-2xl text-primary">∞</div>
                      <div className="text-[10px] font-mono uppercase tracking-wide text-muted-foreground">recursos compart.</div>
                    </div>
                  </div>
                </div>
                <div className="border-t-2 border-foreground bg-muted px-4 py-2 flex justify-between text-[10px] font-mono">
                  <span>Hepta Tecnologia</span>
                  <span className="text-primary font-bold">DESENVOLVIDO POR HYAGO KELLER</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
