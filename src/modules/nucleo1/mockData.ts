import type {
  Nucleo, Cliente, Resource, Squad, Project, Allocation, Delivery, Dependency, Portfolio, Programa,
} from "./types";

export const nucleos: Nucleo[] = [
  { id: "n1", nome: "Dados & IA", cor: "hsl(var(--primary))" },
  { id: "n2", nome: "Cloud & Infra", cor: "hsl(var(--info))" },
  { id: "n3", nome: "Software", cor: "hsl(var(--accent))" },
  { id: "n4", nome: "Cyber", cor: "hsl(var(--steel))" },
  { id: "n5", nome: "Inovação", cor: "hsl(var(--success))" },
];

export const clientes: Cliente[] = [
  { id: "c1", nome: "Hepta (Interno)", tipo: "interno" },
  { id: "c2", nome: "Ministério da Fazenda", tipo: "publico" },
  { id: "c3", nome: "TRF-1", tipo: "publico" },
  { id: "c4", nome: "Banco Central", tipo: "publico" },
  { id: "c5", nome: "Petrobras", tipo: "privado" },
  { id: "c6", nome: "Vale", tipo: "privado" },
];

export const resources: Resource[] = [
  { id: "r1", nome: "Hyago Keller", papel: "Tech Lead", kind: "colaborador", nucleoId: "n3", capacidadeSemanal: 40, skills: ["React", "Node", "Arquitetura"], avatar: "HK" },
  { id: "r2", nome: "Ana Martins", papel: "PM Sênior", kind: "colaborador", nucleoId: "n3", capacidadeSemanal: 40, skills: ["PMO", "Scrum"], avatar: "AM" },
  { id: "r3", nome: "Bruno Lima", papel: "Eng. Dados", kind: "colaborador", nucleoId: "n1", capacidadeSemanal: 40, skills: ["Spark", "Airflow"], avatar: "BL" },
  { id: "r4", nome: "Carla Souza", papel: "Cientista de Dados", kind: "colaborador", nucleoId: "n1", capacidadeSemanal: 40, skills: ["ML", "Python"], avatar: "CS" },
  { id: "r5", nome: "Diego Rocha", papel: "DevOps", kind: "colaborador", nucleoId: "n2", capacidadeSemanal: 40, skills: ["AWS", "K8s"], avatar: "DR" },
  { id: "r6", nome: "Elisa Pinto", papel: "Analista Cyber", kind: "colaborador", nucleoId: "n4", capacidadeSemanal: 40, skills: ["SOC", "Pentest"], avatar: "EP" },
  { id: "r7", nome: "Fábio Nunes", papel: "Front-end", kind: "prestador", capacidadeSemanal: 30, skills: ["React", "UX"], avatar: "FN" },
  { id: "r8", nome: "Gabriela Reis", papel: "Designer", kind: "prestador", capacidadeSemanal: 20, skills: ["Figma", "DS"], avatar: "GR" },
  { id: "r9", nome: "Heitor Alves", papel: "Arquiteto Cloud", kind: "parceiro", capacidadeSemanal: 16, skills: ["AWS", "Azure"], avatar: "HA" },
  { id: "r10", nome: "Ivana Costa", papel: "QA Lead", kind: "colaborador", nucleoId: "n3", capacidadeSemanal: 40, skills: ["Cypress", "Auto"], avatar: "IC" },
  { id: "r11", nome: "João Pires", papel: "Eng. ML", kind: "colaborador", nucleoId: "n1", capacidadeSemanal: 40, skills: ["LLM", "Vector DB"], avatar: "JP" },
  { id: "r12", nome: "Karla Mendes", papel: "Analista Negócio", kind: "colaborador", nucleoId: "n5", capacidadeSemanal: 40, skills: ["BPMN", "RPA"], avatar: "KM" },
];

export const squads: Squad[] = [
  { id: "s1", nome: "Squad Pagamentos", liderId: "r1", membrosIds: ["r1", "r7", "r10", "r8"], vigencia: { inicio: "2026-01-15" }, tipo: "permanente", projetosIds: ["p1"] },
  { id: "s2", nome: "Squad Dados Fiscais", liderId: "r3", membrosIds: ["r3", "r4", "r11"], vigencia: { inicio: "2026-02-01", fim: "2026-12-31" }, tipo: "temporario", projetosIds: ["p2", "p5"] },
  { id: "s3", nome: "Squad Plataforma", liderId: "r5", membrosIds: ["r5", "r9", "r1"], vigencia: { inicio: "2026-01-01" }, tipo: "hibrido", projetosIds: ["p3"] },
  { id: "s4", nome: "Squad SOC 24/7", liderId: "r6", membrosIds: ["r6", "r9"], vigencia: { inicio: "2025-09-01" }, tipo: "permanente", projetosIds: ["p4"] },
  { id: "s5", nome: "Squad Automação", liderId: "r12", membrosIds: ["r12", "r4", "r2"], vigencia: { inicio: "2026-03-01" }, tipo: "temporario", projetosIds: ["p6"] },
];

export const portfolios: Portfolio[] = [
  { id: "pf1", nome: "Portfólio Setor Público", responsavelId: "r2" },
  { id: "pf2", nome: "Portfólio Setor Privado", responsavelId: "r2" },
  { id: "pf3", nome: "Portfólio Interno Hepta", responsavelId: "r1" },
];

export const programas: Programa[] = [
  { id: "pr1", nome: "Modernização Fiscal", portfolioId: "pf1" },
  { id: "pr2", nome: "Plataforma Hepta", portfolioId: "pf3" },
  { id: "pr3", nome: "Energia & Mineração", portfolioId: "pf2" },
];

export const projects: Project[] = [
  { id: "p1", codigo: "PJ-001", nome: "Plataforma de Pagamentos PIX", tipo: "cliente", status: "em_execucao", prioridade: "critica", saude: "amarelo", clienteId: "c4", nucleoId: "n3", gestorId: "r2", sponsorId: "r1", inicio: "2026-01-15", fim: "2026-09-30", progresso: 42, orcamento: 1800000, consumido: 820000, risco: "medio", squadId: "s1", programaId: "pr1" },
  { id: "p2", codigo: "PJ-002", nome: "Data Lake Receita Federal", tipo: "cliente", status: "em_execucao", prioridade: "alta", saude: "verde", clienteId: "c2", nucleoId: "n1", gestorId: "r3", sponsorId: "r2", inicio: "2026-02-01", fim: "2026-11-30", progresso: 28, orcamento: 2400000, consumido: 690000, risco: "baixo", squadId: "s2", programaId: "pr1" },
  { id: "p3", codigo: "PJ-003", nome: "HeptaProject — Plataforma Interna", tipo: "interno", status: "em_execucao", prioridade: "alta", saude: "verde", clienteId: "c1", nucleoId: "n3", gestorId: "r1", sponsorId: "r1", inicio: "2026-01-01", fim: "2026-12-31", progresso: 18, orcamento: 600000, consumido: 90000, risco: "baixo", squadId: "s3", programaId: "pr2" },
  { id: "p4", codigo: "PJ-004", nome: "SOC Gerenciado TRF-1", tipo: "sustentacao", status: "em_execucao", prioridade: "alta", saude: "verde", clienteId: "c3", nucleoId: "n4", gestorId: "r6", inicio: "2025-09-01", fim: "2027-08-31", progresso: 55, orcamento: 3200000, consumido: 1700000, risco: "baixo", squadId: "s4" },
  { id: "p5", codigo: "PJ-005", nome: "Migração SAP S/4HANA", tipo: "implantacao", status: "bloqueado", prioridade: "critica", saude: "vermelho", clienteId: "c5", nucleoId: "n2", gestorId: "r5", inicio: "2026-03-01", fim: "2027-02-28", progresso: 12, orcamento: 5600000, consumido: 980000, risco: "alto", squadId: "s2", programaId: "pr3" },
  { id: "p6", codigo: "PJ-006", nome: "RPA Conciliação Contábil", tipo: "automacao", status: "planejado", prioridade: "media", saude: "amarelo", clienteId: "c6", nucleoId: "n5", gestorId: "r12", inicio: "2026-04-01", fim: "2026-09-30", progresso: 5, orcamento: 480000, consumido: 12000, risco: "medio", squadId: "s5", programaId: "pr3" },
  { id: "p7", codigo: "PJ-007", nome: "POC LLM Atendimento", tipo: "inovacao", status: "em_validacao", prioridade: "media", saude: "verde", clienteId: "c1", nucleoId: "n1", gestorId: "r11", inicio: "2026-02-15", fim: "2026-05-30", progresso: 70, orcamento: 120000, consumido: 78000, risco: "baixo" },
  { id: "p8", codigo: "PJ-008", nome: "Consultoria Cloud Vale", tipo: "consultoria", status: "concluido", prioridade: "baixa", saude: "verde", clienteId: "c6", nucleoId: "n2", gestorId: "r9", inicio: "2025-10-01", fim: "2026-02-28", progresso: 100, orcamento: 320000, consumido: 305000, risco: "baixo" },
];

export const allocations: Allocation[] = [
  { id: "a1", resourceId: "r1", projectId: "p1", percentual: 50, inicio: "2026-01-15", fim: "2026-09-30" },
  { id: "a2", resourceId: "r1", projectId: "p3", percentual: 40, inicio: "2026-01-01", fim: "2026-12-31" },
  { id: "a3", resourceId: "r2", projectId: "p1", percentual: 60, inicio: "2026-01-15", fim: "2026-09-30" },
  { id: "a4", resourceId: "r2", projectId: "p6", percentual: 30, inicio: "2026-04-01", fim: "2026-09-30" },
  { id: "a5", resourceId: "r3", projectId: "p2", percentual: 80, inicio: "2026-02-01", fim: "2026-11-30" },
  { id: "a6", resourceId: "r4", projectId: "p2", percentual: 60, inicio: "2026-02-01", fim: "2026-11-30" },
  { id: "a7", resourceId: "r4", projectId: "p6", percentual: 50, inicio: "2026-04-01", fim: "2026-09-30" },
  { id: "a8", resourceId: "r5", projectId: "p5", percentual: 90, inicio: "2026-03-01", fim: "2027-02-28" },
  { id: "a9", resourceId: "r5", projectId: "p3", percentual: 20, inicio: "2026-01-01", fim: "2026-12-31" },
  { id: "a10", resourceId: "r6", projectId: "p4", percentual: 100, inicio: "2025-09-01", fim: "2027-08-31" },
  { id: "a11", resourceId: "r7", projectId: "p1", percentual: 70, inicio: "2026-01-15", fim: "2026-09-30" },
  { id: "a12", resourceId: "r9", projectId: "p3", percentual: 30, inicio: "2026-01-01", fim: "2026-12-31" },
  { id: "a13", resourceId: "r9", projectId: "p4", percentual: 40, inicio: "2025-09-01", fim: "2027-08-31" },
  { id: "a14", resourceId: "r10", projectId: "p1", percentual: 50, inicio: "2026-01-15", fim: "2026-09-30" },
  { id: "a15", resourceId: "r11", projectId: "p2", percentual: 50, inicio: "2026-02-01", fim: "2026-11-30" },
  { id: "a16", resourceId: "r11", projectId: "p7", percentual: 60, inicio: "2026-02-15", fim: "2026-05-30" },
  { id: "a17", resourceId: "r12", projectId: "p6", percentual: 80, inicio: "2026-04-01", fim: "2026-09-30" },
  { id: "a18", resourceId: "r8", projectId: "p1", percentual: 40, inicio: "2026-01-15", fim: "2026-06-30" },
];

export const deliveries: Delivery[] = [
  { id: "d1", projectId: "p1", nome: "Sandbox PIX integrada", data: "2026-04-15", status: "concluida", tipo: "marco" },
  { id: "d2", projectId: "p1", nome: "Liquidação tempo real", data: "2026-06-30", status: "em_andamento", tipo: "entrega" },
  { id: "d3", projectId: "p1", nome: "Homologação BACEN", data: "2026-09-15", status: "planejada", tipo: "contratual" },
  { id: "d4", projectId: "p2", nome: "Ingestão fontes legadas", data: "2026-05-30", status: "em_andamento", tipo: "entrega" },
  { id: "d5", projectId: "p2", nome: "Camada analítica v1", data: "2026-08-30", status: "planejada", tipo: "entrega" },
  { id: "d6", projectId: "p3", nome: "MVP plataforma", data: "2026-06-30", status: "em_andamento", tipo: "marco" },
  { id: "d7", projectId: "p5", nome: "Cutover S/4HANA", data: "2027-01-30", status: "atrasada", tipo: "contratual" },
  { id: "d8", projectId: "p6", nome: "Robô conciliação produção", data: "2026-08-30", status: "planejada", tipo: "entrega" },
  { id: "d9", projectId: "p7", nome: "Demo executiva LLM", data: "2026-05-15", status: "em_andamento", tipo: "marco" },
];

export const dependencies: Dependency[] = [
  { id: "dp1", fromId: "d1", toId: "d2", fromLabel: "Sandbox PIX", toLabel: "Liquidação RT", tipo: "FS", bloqueante: false },
  { id: "dp2", fromId: "d2", toId: "d3", fromLabel: "Liquidação RT", toLabel: "Homologação BACEN", tipo: "FS", bloqueante: true },
  { id: "dp3", fromId: "d4", toId: "d5", fromLabel: "Ingestão", toLabel: "Camada analítica", tipo: "FS", bloqueante: true },
  { id: "dp4", fromId: "p3", toId: "p1", fromLabel: "HeptaProject", toLabel: "Plataforma PIX", tipo: "SS", bloqueante: false },
  { id: "dp5", fromId: "d6", toId: "d8", fromLabel: "MVP plataforma", toLabel: "Robô conciliação", tipo: "FS", bloqueante: true },
  { id: "dp6", fromId: "p5", toId: "d7", fromLabel: "Migração SAP", toLabel: "Cutover", tipo: "FF", bloqueante: true },
];

export const helpers = {
  getResource: (id: string) => resources.find((r) => r.id === id),
  getProject: (id: string) => projects.find((p) => p.id === id),
  getCliente: (id: string) => clientes.find((c) => c.id === id),
  getNucleo: (id: string) => nucleos.find((n) => n.id === id),
  getSquad: (id: string) => squads.find((s) => s.id === id),
  allocationByResource: (rid: string) => allocations.filter((a) => a.resourceId === rid),
  totalAlloc: (rid: string) => allocations.filter((a) => a.resourceId === rid).reduce((s, a) => s + a.percentual, 0),
  deliveriesByProject: (pid: string) => deliveries.filter((d) => d.projectId === pid),
  resourcesByProject: (pid: string) =>
    allocations.filter((a) => a.projectId === pid).map((a) => ({ ...resources.find((r) => r.id === a.resourceId)!, percentual: a.percentual })),
};

export const labels = {
  status: {
    ideia: "Ideia", planejado: "Planejado", em_execucao: "Em execução",
    bloqueado: "Bloqueado", em_validacao: "Em validação", concluido: "Concluído", cancelado: "Cancelado",
  } as const,
  tipo: {
    interno: "Interno", cliente: "Cliente", inovacao: "Inovação",
    sustentacao: "Sustentação", consultoria: "Consultoria", implantacao: "Implantação", automacao: "Automação",
  } as const,
  prioridade: { baixa: "Baixa", media: "Média", alta: "Alta", critica: "Crítica" } as const,
};
