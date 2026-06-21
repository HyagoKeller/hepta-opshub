export interface PncpItem {
  id: string;
  numeroControlePNCP?: string;
  objeto: string;
  modalidade: string;
  modalidadeId: number;
  orgao: string;
  cnpjOrgao?: string;
  unidade?: string;
  uf?: string;
  municipio?: string;
  valorEstimado: number | null;
  dataPublicacao?: string;
  dataAbertura?: string;
  dataEncerramento?: string;
  situacao?: string;
  linkSistemaOrigem?: string;
  amparoLegal?: string;
  aderencia: { ti: boolean; portaria750: boolean; portaria1070: boolean };
  raw?: any;
}

export interface Atestado {
  id: string;
  titulo: string;
  cliente: string;
  tipo_servico: string;
  descricao?: string;
  valor_contrato?: number;
  data_inicio?: string;
  data_fim?: string;
  vigente: boolean;
  tags?: string[];
  arquivo_url?: string;
  criado_em?: string;
}

export interface Solucao {
  id: string;
  nome: string;
  categoria: string;
  fabricante?: string;
  descricao?: string;
  diferenciais?: string;
  margem_estimada?: number;
  certificacoes?: string[];
  tags?: string[];
  criado_em?: string;
}

export interface TriagemResultado {
  score_aderencia: number;
  nivel: 'alta' | 'media' | 'baixa' | 'incompativel';
  resumo: string;
  pontos_fortes: string[];
  pontos_fracos: string[];
  atestados_match: { id: string; titulo: string; relevancia: number; justificativa: string }[];
  solucoes_match: { id: string; nome: string; relevancia: number; justificativa: string }[];
  rentabilidade: {
    margem_estimada_pct: number;
    valor_estimado_brl: number | null;
    custo_estimado_brl: number | null;
    lucro_estimado_brl: number | null;
    risco: 'baixo' | 'medio' | 'alto';
    observacoes: string;
  };
  recomendacao: 'participar' | 'monitorar' | 'descartar';
}
