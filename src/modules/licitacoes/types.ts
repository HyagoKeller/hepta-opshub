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
  aderencia: { ti: boolean; portaria750: boolean; portaria1070: boolean; lei14133?: boolean };
  status?: 'candidate' | 'discarded';
  motivos_descarte?: string[];
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

export interface Perfil {
  id: string;
  nome: string;
  cargo: string;
  senioridade: 'junior' | 'pleno' | 'senior' | 'especialista' | string;
  skills: string[];
  certificacoes: string[];
  frameworks: string[];
  custo_hora?: number | null;
  disponibilidade_pct: number;
  ativo: boolean;
  observacoes?: string;
  criado_em?: string;
}

export interface CompanyProfile {
  id?: string;
  nome: string;
  missao?: string;
  especialidades: { area: string; nivel: string; descricao: string }[];
  frameworks: string[];
  tecnologias: string[];
  certificacoes: string[];
  diferenciais?: string;
  blacklist_custom: string[];
  valor_minimo: number;
}

export interface PerfilExigido {
  papel: string;
  senioridade?: string;
  quantidade?: number;
  skills_chave?: string[];
  certificacoes?: string[];
}

export interface RequisitosExtraidos {
  tecnologias_exigidas?: string[];
  certificacoes_obrigatorias?: string[];
  volume_estimado?: string;
  perfis_profissionais?: (string | PerfilExigido)[];
  prazo_execucao?: string;
}

export interface ExecutionMatch {
  score_execucao: number;
  cobertura_skills_pct: number;
  cobertura_certificacoes_pct: number;
  cobertura_headcount_pct: number;
  gap_skills: string[];
  gap_certificacoes: string[];
  gap_headcount?: string;
  alocacao_sugerida: {
    perfil_id?: string;
    nome: string;
    papel_no_projeto: string;
    alocacao_pct: number;
    custo_hora?: number | null;
    justificativa: string;
  }[];
  risco_execucao: 'baixo' | 'medio' | 'alto';
  observacoes: string;
}

export interface TriagemResultado {
  score_aderencia: number;
  nivel: 'BID' | 'PARCIAL' | 'NO-BID' | 'alta' | 'media' | 'baixa' | 'incompativel';
  categoria_explicacao?: string;
  requisitos_extraidos?: RequisitosExtraidos;
  resumo: string;
  resumo_executivo?: string[];
  pontos_fortes: string[];
  pontos_fracos: string[];
  atestados_match: { id: string; titulo: string; relevancia: number; justificativa: string }[];
  solucoes_match: { id: string; nome: string; relevancia: number; justificativa: string }[];
  execution_match?: ExecutionMatch;
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

export interface OportunidadeEstrategica {
  id: string;
  licitacao_id: string;
  licitacao_titulo?: string;
  orgao?: string;
  uf?: string;
  valor_estimado?: number;
  score_aderencia?: number;
  nivel?: string;
  resumo_executivo?: string[];
  recomendacao?: string;
  responsavel?: string;
  status: string;
  triagem_payload?: TriagemResultado;
  licitacao_payload?: PncpItem;
  criado_em?: string;
}
