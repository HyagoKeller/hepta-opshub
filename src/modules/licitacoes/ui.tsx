import { cn } from '@/lib/utils';

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
}: { label: string; value: React.ReactNode; sub?: string; accent?: 'primary' | 'accent' | 'info' | 'success' | 'destructive' }) => {
  const accentMap = {
    primary: 'border-l-primary',
    accent: 'border-l-accent',
    info: 'border-l-info',
    success: 'border-l-success',
    destructive: 'border-l-destructive',
  };
  return (
    <div className={cn(
      'border-2 border-foreground bg-card p-4 shadow-brutal-sm border-l-[6px]',
      accent && accentMap[accent],
    )}>
      <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">{label}</div>
      <div className="font-display text-3xl mt-1 leading-none">{value}</div>
      {sub && <div className="text-[11px] mt-1 text-muted-foreground">{sub}</div>}
    </div>
  );
};

export const NivelBadge = ({ n }: { n?: string }) => {
  const k = (n ?? '').toLowerCase();
  const map: Record<string, string> = {
    'bid': 'bg-success text-success-foreground',
    'alta': 'bg-success text-success-foreground',
    'parcial': 'bg-warning text-warning-foreground',
    'media': 'bg-warning text-warning-foreground',
    'no-bid': 'bg-destructive text-destructive-foreground',
    'incompativel': 'bg-destructive text-destructive-foreground',
    'baixa': 'bg-muted text-muted-foreground',
  };
  const dot: Record<string, string> = {
    'bid': '🟢', 'alta': '🟢',
    'parcial': '🟡', 'media': '🟡',
    'no-bid': '🔴', 'incompativel': '🔴',
  };
  return (
    <span className={cn('inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest border-2 border-foreground', map[k] ?? 'bg-muted')}>
      <span>{dot[k] ?? ''}</span>{n ?? '—'}
    </span>
  );
};

export const formatBRL = (v?: number | null) =>
  v == null ? '—' : v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 });

export const formatDate = (s?: string) => {
  if (!s) return '—';
  const d = new Date(s);
  if (Number.isNaN(+d)) return s;
  return d.toLocaleDateString('pt-BR');
};
