import { cn } from "@/lib/utils";
import type { HealthScore, ProjectStatus, Priority } from "./types";
import { labels } from "./mockData";

export const StatusBadge = ({ status }: { status: ProjectStatus }) => {
  const map: Record<ProjectStatus, string> = {
    ideia: "bg-muted text-foreground",
    planejado: "bg-info text-info-foreground",
    em_execucao: "bg-success text-success-foreground",
    bloqueado: "bg-destructive text-destructive-foreground",
    em_validacao: "bg-accent text-accent-foreground",
    concluido: "bg-foreground text-background",
    cancelado: "bg-muted text-muted-foreground line-through",
  };
  return (
    <span className={cn("inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest border-2 border-foreground", map[status])}>
      {labels.status[status]}
    </span>
  );
};

export const HealthDot = ({ saude, withLabel = false }: { saude: HealthScore; withLabel?: boolean }) => {
  const map = { verde: "bg-success", amarelo: "bg-warning", vermelho: "bg-destructive" };
  const lbl = { verde: "Saudável", amarelo: "Atenção", vermelho: "Crítico" };
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className={cn("h-2.5 w-2.5 rounded-full border border-foreground", map[saude])} />
      {withLabel && <span className="text-[10px] font-mono uppercase tracking-widest">{lbl[saude]}</span>}
    </span>
  );
};

export const PriorityChip = ({ p }: { p: Priority }) => {
  const map: Record<Priority, string> = {
    baixa: "bg-muted text-muted-foreground",
    media: "bg-info/20 text-info",
    alta: "bg-accent text-accent-foreground",
    critica: "bg-primary text-primary-foreground",
  };
  return (
    <span className={cn("inline-flex px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-widest", map[p])}>
      {labels.prioridade[p]}
    </span>
  );
};

export const PageHeader = ({
  title, subtitle, actions, eyebrow,
}: { title: string; subtitle?: string; actions?: React.ReactNode; eyebrow?: string }) => (
  <div className="border-b-2 border-foreground bg-card">
    <div className="px-6 lg:px-8 py-6 flex items-end justify-between gap-6 flex-wrap">
      <div>
        {eyebrow && (
          <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-1.5">
            {eyebrow}
          </div>
        )}
        <h1 className="font-display text-3xl lg:text-4xl tracking-tight">{title}</h1>
        {subtitle && <p className="mt-2 text-sm text-muted-foreground max-w-2xl">{subtitle}</p>}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  </div>
);

export const KPI = ({
  label, value, sub, accent,
}: { label: string; value: React.ReactNode; sub?: string; accent?: "primary" | "accent" | "info" | "success" | "destructive" }) => {
  const accentMap = {
    primary: "border-l-primary",
    accent: "border-l-accent",
    info: "border-l-info",
    success: "border-l-success",
    destructive: "border-l-destructive",
  };
  return (
    <div className={cn(
      "border-2 border-foreground bg-card p-4 shadow-brutal-sm border-l-[6px]",
      accent && accentMap[accent],
    )}>
      <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">{label}</div>
      <div className="font-display text-3xl mt-1 leading-none">{value}</div>
      {sub && <div className="text-[11px] mt-1 text-muted-foreground">{sub}</div>}
    </div>
  );
};

export const SectionTitle = ({ children, hint }: { children: React.ReactNode; hint?: string }) => (
  <div className="flex items-end justify-between mb-3">
    <h2 className="font-display text-lg tracking-tight">{children}</h2>
    {hint && <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">{hint}</span>}
  </div>
);
