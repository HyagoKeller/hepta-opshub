// Núcleo 03 · Automações — modelo de domínio
// Em produção, migrar RLS para user_roles + user_module_access (ver docs/security.md)

export type AutomacaoTipo = 'no_code' | 'low_code' | 'code';

export type AutomacaoEstagio =
  | 'ideia'
  | 'oportunidade'
  | 'viabilidade'
  | 'poc'
  | 'piloto'
  | 'produto_interno'
  | 'oferta_cliente';

export type Complexidade = 'baixa' | 'media' | 'alta';
export type Risco = 'baixo' | 'medio' | 'alto';
export type Maturidade = 'experimental' | 'estavel' | 'consolidada';

export interface Automacao {
  id: string;
  nome: string;
  descricao?: string | null;
  tipo: AutomacaoTipo;
  estagio: AutomacaoEstagio;
  nucleo_origem_id?: string | null;
  responsavel_id?: string | null;
  responsavel_nome?: string | null;
  custo_estimado?: number | null;
  economia_estimada?: number | null;
  economia_realizada?: number | null;
  complexidade: Complexidade;
  risco: Risco;
  maturidade: Maturidade;
  reusavel: boolean;
  stack_integracoes: string[];
  tags: string[];
  criado_em: string;
  atualizado_em: string;
}

export interface AutomacaoHistorico {
  id: string;
  automacao_id: string;
  estagio_anterior?: AutomacaoEstagio | null;
  estagio_novo: AutomacaoEstagio;
  nota?: string | null;
  autor_nome?: string | null;
  criado_em: string;
}

export interface AutomacaoOferta {
  id: string;
  automacao_id: string;
  nome_oferta: string;
  descricao_comercial?: string | null;
  clientes_aplicaveis: string[];
  margem_estimada?: number | null;
  status: 'ativa' | 'descontinuada';
  criado_em: string;
  atualizado_em: string;
}

// ────────────────────────────────────────────────────────────────────────────
// Metadata visual dos estágios (esteira)
// ────────────────────────────────────────────────────────────────────────────
export const ESTAGIOS: {
  id: AutomacaoEstagio;
  label: string;
  short: string;
  descricao: string;
}[] = [
  { id: 'ideia',           label: 'Ideia',              short: '01 · Ideia',           descricao: 'Hipótese registrada, sem validação.' },
  { id: 'oportunidade',    label: 'Oportunidade',       short: '02 · Oportunidade',    descricao: 'Problema priorizado, dor mapeada.' },
  { id: 'viabilidade',     label: 'Viabilidade',        short: '03 · Viabilidade',     descricao: 'Estudo técnico e de negócio.' },
  { id: 'poc',             label: 'POC',                short: '04 · POC',             descricao: 'Prova de conceito construída.' },
  { id: 'piloto',          label: 'Piloto',             short: '05 · Piloto',          descricao: 'Uso controlado em produção interna.' },
  { id: 'produto_interno', label: 'Produto interno',    short: '06 · Produto interno', descricao: 'Adoção interna consolidada.' },
  { id: 'oferta_cliente',  label: 'Oferta / Case',      short: '07 · Oferta',          descricao: 'Empacotada como oferta para clientes.' },
];

export const estagioIndex = (e: AutomacaoEstagio) => ESTAGIOS.findIndex((x) => x.id === e);
export const estagioLabel = (e: AutomacaoEstagio) => ESTAGIOS.find((x) => x.id === e)?.label ?? e;

// Confiança de escala (visual · sem IA nesta fase).
// V2: plugar mesmo padrão de scoring por IA usado em ai-triagem do Núcleo 02.
export type Confianca = 'alta' | 'media' | 'baixa';

export const calcConfianca = (a: Pick<Automacao, 'complexidade' | 'risco' | 'maturidade'>): Confianca => {
  const cx = { baixa: 3, media: 2, alta: 1 }[a.complexidade];
  const rx = { baixo: 3, medio: 2, alto: 1 }[a.risco];
  const mx = { consolidada: 3, estavel: 2, experimental: 1 }[a.maturidade];
  const score = cx + rx + mx; // 3..9
  if (score >= 8) return 'alta';
  if (score >= 5) return 'media';
  return 'baixa';
};

export const calcROI = (a: Pick<Automacao, 'economia_realizada' | 'economia_estimada' | 'custo_estimado'>): number | null => {
  const ganho = a.economia_realizada ?? a.economia_estimada ?? 0;
  const custo = a.custo_estimado ?? 0;
  if (!ganho && !custo) return null;
  if (!custo) return ganho > 0 ? Infinity : 0;
  return Math.round(((ganho - custo) / custo) * 100);
};
