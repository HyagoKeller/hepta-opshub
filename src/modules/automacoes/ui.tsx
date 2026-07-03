import { cn } from '@/lib/utils';
import type { AutomacaoTipo, Complexidade, Risco, Maturidade, Confianca, AutomacaoEstagio } from './types';
import { estagioLabel } from './types';

export { PageHeader, KPI, formatBRL, formatDate } from '../licitacoes/ui';

// ── Badges do domínio de Automações ────────────────────────────────────────
const badgeBase =
  'inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest border-2 border-foreground';

export const TipoBadge = ({ t }: { t: AutomacaoTipo }) => {
  const map: Record<AutomacaoTipo, string> = {
    no_code: 'bg-muted text-foreground',
    low_code: 'bg-info text-info-foreground',
    code: 'bg-primary text-primary-foreground',
  };
  const label = { no_code: 'no-code', low_code: 'low-code', code: 'code' }[t];
  return <span className={cn(badgeBase, map[t])}>{label}</span>;
};

export const ComplexidadeBadge = ({ c }: { c: Complexidade }) => {
  const map: Record<Complexidade, string> = {
    baixa: 'bg-success text-success-foreground',
    media: 'bg-warning text-warning-foreground',
    alta: 'bg-destructive text-destructive-foreground',
  };
  return <span className={cn(badgeBase, map[c])}>Cx: {c}</span>;
};

export const RiscoBadge = ({ r }: { r: Risco }) => {
  const map: Record<Risco, string> = {
    baixo: 'bg-success text-success-foreground',
    medio: 'bg-warning text-warning-foreground',
    alto: 'bg-destructive text-destructive-foreground',
  };
  return <span className={cn(badgeBase, map[r])}>Risco: {r}</span>;
};

export const MaturidadeBadge = ({ m }: { m: Maturidade }) => {
  const map: Record<Maturidade, string> = {
    experimental: 'bg-muted text-foreground',
    estavel: 'bg-info text-info-foreground',
    consolidada: 'bg-success text-success-foreground',
  };
  return <span className={cn(badgeBase, map[m])}>{m}</span>;
};

export const ConfiancaBadge = ({ c }: { c: Confianca }) => {
  const map: Record<Confianca, string> = {
    alta: 'bg-success text-success-foreground',
    media: 'bg-warning text-warning-foreground',
    baixa: 'bg-destructive text-destructive-foreground',
  };
  const emoji = { alta: '🟢', media: '🟡', baixa: '🔴' }[c];
  return <span className={cn(badgeBase, map[c])}>{emoji} Confiança de escala: {c}</span>;
};

export const EstagioBadge = ({ e }: { e: AutomacaoEstagio }) => (
  <span className={cn(badgeBase, 'bg-secondary text-secondary-foreground')}>{estagioLabel(e)}</span>
);

// Avatar mínimo do responsável (iniciais)
export const AvatarInline = ({ nome }: { nome?: string | null }) => {
  const iniciais = (nome ?? '?')
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
  return (
    <div className="h-6 w-6 border-2 border-foreground bg-success text-success-foreground grid place-items-center font-display text-[10px] shadow-brutal-sm">
      {iniciais}
    </div>
  );
};
