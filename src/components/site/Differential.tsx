import { Check, X } from "lucide-react";

const rows = [
  { k: "Cronograma e planejamento", project: true, hepta: true },
  { k: "Portfólio multiárea", project: false, hepta: true },
  { k: "Recursos compartilhados (resource pool)", project: false, hepta: true },
  { k: "Gestão de licitações e POCs", project: false, hepta: true },
  { k: "Automações replicáveis", project: false, hepta: true },
  { k: "Visão comercial + operacional", project: false, hepta: true },
  { k: "Dashboards vivos e executivos", project: false, hepta: true },
  { k: "Colaboração entre internos e parceiros", project: false, hepta: true },
  { k: "Governança simples e adaptada à Hepta", project: false, hepta: true },
];

const Cell = ({ on, label }: { on: boolean; label: string }) => (
  <div className={`flex items-center justify-center h-12 ${on ? "bg-accent/40" : "bg-muted"}`}>
    {on ? (
      <span className="inline-flex items-center gap-1.5 font-mono text-[11px] font-bold uppercase">
        <Check className="h-4 w-4" /> {label}
      </span>
    ) : (
      <span className="inline-flex items-center gap-1.5 font-mono text-[11px] font-bold uppercase opacity-60">
        <X className="h-4 w-4" /> não
      </span>
    )}
  </div>
);

export const Differential = () => {
  return (
    <section className="py-24 lg:py-28 bg-muted border-b-2 border-foreground">
      <div className="container">
        <div className="max-w-3xl mb-14">
          <div className="inline-block border-2 border-foreground bg-foreground text-background px-3 py-1 mb-5 text-[11px] font-bold uppercase tracking-widest">
            Diferencial frente ao Project
          </div>
          <h2 className="font-display text-4xl md:text-5xl lg:text-6xl tracking-tight">
            Forte onde o <span className="text-primary">MS Project não chega</span>.
          </h2>
          <p className="mt-6 text-lg font-medium text-muted-foreground">
            Project é forte em planejamento. O HeptaProject foca na realidade operacional, comercial
            e de inovação da Hepta.
          </p>
        </div>

        <div className="border-2 border-foreground bg-background shadow-brutal-lg overflow-hidden">
          <div className="grid grid-cols-12 bg-foreground text-background">
            <div className="col-span-6 px-5 py-3 font-mono text-xs uppercase tracking-widest">Capacidade</div>
            <div className="col-span-3 px-5 py-3 font-mono text-xs uppercase tracking-widest border-l-2 border-background">MS Project</div>
            <div className="col-span-3 px-5 py-3 font-mono text-xs uppercase tracking-widest border-l-2 border-background bg-primary text-primary-foreground">HeptaProject</div>
          </div>
          {rows.map((r, idx) => (
            <div key={r.k} className={`grid grid-cols-12 ${idx !== rows.length - 1 ? "border-b-2 border-foreground/20" : ""}`}>
              <div className="col-span-6 px-5 py-3 text-sm font-medium flex items-center">{r.k}</div>
              <div className="col-span-3 border-l-2 border-foreground/20"><Cell on={r.project} label="sim" /></div>
              <div className="col-span-3 border-l-2 border-foreground/20"><Cell on={r.hepta} label="sim" /></div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
