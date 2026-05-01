export type ProjectStatus =
  | "ideia"
  | "planejado"
  | "em_execucao"
  | "bloqueado"
  | "em_validacao"
  | "concluido"
  | "cancelado";

export type ProjectType =
  | "interno"
  | "cliente"
  | "inovacao"
  | "sustentacao"
  | "consultoria"
  | "implantacao"
  | "automacao";

export type Priority = "baixa" | "media" | "alta" | "critica";
export type HealthScore = "verde" | "amarelo" | "vermelho";
export type ResourceKind = "colaborador" | "prestador" | "parceiro";

export interface Nucleo {
  id: string;
  nome: string;
  cor: string;
}

export interface Cliente {
  id: string;
  nome: string;
  tipo: "publico" | "privado" | "interno";
}

export interface Resource {
  id: string;
  nome: string;
  papel: string;
  kind: ResourceKind;
  nucleoId?: string;
  capacidadeSemanal: number; // horas
  skills: string[];
  avatar: string; // initials
}

export interface Squad {
  id: string;
  nome: string;
  liderId: string;
  membrosIds: string[];
  vigencia: { inicio: string; fim?: string };
  tipo: "permanente" | "temporario" | "hibrido";
  projetosIds: string[];
}

export interface Allocation {
  id: string;
  resourceId: string;
  projectId: string;
  percentual: number;
  inicio: string;
  fim: string;
}

export interface Delivery {
  id: string;
  projectId: string;
  nome: string;
  data: string;
  status: "planejada" | "em_andamento" | "concluida" | "atrasada";
  tipo: "marco" | "entrega" | "contratual";
}

export interface Dependency {
  id: string;
  fromId: string;
  toId: string;
  fromLabel: string;
  toLabel: string;
  tipo: "FS" | "SS" | "FF";
  bloqueante: boolean;
}

export interface Project {
  id: string;
  codigo: string;
  nome: string;
  tipo: ProjectType;
  status: ProjectStatus;
  prioridade: Priority;
  saude: HealthScore;
  clienteId: string;
  nucleoId: string;
  gestorId: string;
  sponsorId?: string;
  inicio: string;
  fim: string;
  progresso: number;
  orcamento: number;
  consumido: number;
  risco: "baixo" | "medio" | "alto";
  squadId?: string;
  programaId?: string;
}

export interface Programa {
  id: string;
  nome: string;
  portfolioId: string;
}

export interface Portfolio {
  id: string;
  nome: string;
  responsavelId: string;
}

export interface Portfolios {
  portfolios: Portfolio[];
  programas: Programa[];
}
