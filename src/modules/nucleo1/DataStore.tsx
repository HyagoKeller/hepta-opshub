import { createContext, useCallback, useContext, useMemo, useState, ReactNode } from "react";
import {
  projects as seedProjects,
  deliveries as seedDeliveries,
  allocations as seedAllocations,
  resources, clientes, nucleos, squads, dependencies,
} from "./mockData";
import type { Project, Delivery, Allocation } from "./types";

export interface Risk {
  id: string;
  projectId: string;
  titulo: string;
  severidade: "baixo" | "medio" | "alto";
  status: "aberto" | "monitorado" | "mitigado" | "fechado";
  mitigacao: string;
  responsavelId?: string;
  criadoEm: string;
}

const seedRisks: Risk[] = [
  { id: "rk1", projectId: "p1", titulo: "Atraso na integração externa", severidade: "alto", status: "aberto", mitigacao: "Renegociar SLA com fornecedor", responsavelId: "r1", criadoEm: "2026-03-12" },
  { id: "rk2", projectId: "p1", titulo: "Rotatividade no squad", severidade: "medio", status: "mitigado", mitigacao: "Plano de retenção e backup", responsavelId: "r2", criadoEm: "2026-02-20" },
  { id: "rk3", projectId: "p1", titulo: "Mudança de escopo pelo cliente", severidade: "baixo", status: "monitorado", mitigacao: "Comitê quinzenal", responsavelId: "r2", criadoEm: "2026-02-01" },
  { id: "rk4", projectId: "p5", titulo: "Bloqueio de licenciamento SAP", severidade: "alto", status: "aberto", mitigacao: "Escalada para sponsor", responsavelId: "r5", criadoEm: "2026-04-02" },
  { id: "rk5", projectId: "p2", titulo: "Qualidade dos dados de origem", severidade: "medio", status: "monitorado", mitigacao: "Camada de validação automática", responsavelId: "r3", criadoEm: "2026-03-01" },
];

interface DataState {
  projects: Project[];
  deliveries: Delivery[];
  allocations: Allocation[];
  risks: Risk[];
  // Projetos
  upsertProject: (p: Project) => void;
  deleteProject: (id: string) => void;
  // Entregas
  upsertDelivery: (d: Delivery) => void;
  deleteDelivery: (id: string) => void;
  // Riscos
  upsertRisk: (r: Risk) => void;
  deleteRisk: (id: string) => void;
  // Alocações
  upsertAllocation: (a: Allocation) => void;
  deleteAllocation: (id: string) => void;
  // helpers
  byProject: (pid: string) => { entregas: Delivery[]; riscos: Risk[]; alocacoes: Allocation[] };
}

const Ctx = createContext<DataState | null>(null);

const newId = (prefix: string) => `${prefix}_${Math.random().toString(36).slice(2, 9)}`;

export const DataProvider = ({ children }: { children: ReactNode }) => {
  const [projects, setProjects] = useState<Project[]>(seedProjects);
  const [deliveries, setDeliveries] = useState<Delivery[]>(seedDeliveries);
  const [allocations, setAllocations] = useState<Allocation[]>(seedAllocations);
  const [risks, setRisks] = useState<Risk[]>(seedRisks);

  const upsert = <T extends { id: string }>(setter: (fn: (s: T[]) => T[]) => void) =>
    (item: T) => setter((s) => (s.some((x) => x.id === item.id) ? s.map((x) => (x.id === item.id ? item : x)) : [...s, item]));

  const remove = <T extends { id: string }>(setter: (fn: (s: T[]) => T[]) => void) =>
    (id: string) => setter((s) => s.filter((x) => x.id !== id));

  const byProject = useCallback((pid: string) => ({
    entregas: deliveries.filter((d) => d.projectId === pid),
    riscos: risks.filter((r) => r.projectId === pid),
    alocacoes: allocations.filter((a) => a.projectId === pid),
  }), [deliveries, risks, allocations]);

  const value: DataState = useMemo(() => ({
    projects, deliveries, allocations, risks,
    upsertProject: upsert(setProjects),
    deleteProject: (id) => {
      setProjects((s) => s.filter((p) => p.id !== id));
      setDeliveries((s) => s.filter((d) => d.projectId !== id));
      setAllocations((s) => s.filter((a) => a.projectId !== id));
      setRisks((s) => s.filter((r) => r.projectId !== id));
    },
    upsertDelivery: upsert(setDeliveries),
    deleteDelivery: remove(setDeliveries),
    upsertRisk: upsert(setRisks),
    deleteRisk: remove(setRisks),
    upsertAllocation: upsert(setAllocations),
    deleteAllocation: remove(setAllocations),
    byProject,
  }), [projects, deliveries, allocations, risks, byProject]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
};

export const useData = () => {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useData fora do DataProvider");
  return ctx;
};

export { newId };
// Re-export catálogos estáticos
export { resources, clientes, nucleos, squads, dependencies };
