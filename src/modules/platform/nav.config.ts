import {
  LayoutDashboard, Briefcase, Users, GanttChartSquare, Activity, Network, Settings,
  Radar, FileSearch, Award, Boxes, Star, Building2, Crown, ShieldCheck, Workflow, ScrollText,
} from "lucide-react";
import type { ModuloId } from "../nucleo1/AuthContext";

export type NavItem = { to: string; label: string; icon: any; end?: boolean };

export type NucleoDef = {
  id: ModuloId;
  code: string;             // "01" | "02" | "03"
  label: string;            // display curto
  fullLabel: string;        // usado no header
  home: string;             // rota inicial ao trocar de núcleo
  requireAuth: boolean;     // mantém comportamento atual
  color: "primary" | "accent" | "steel";
  items: NavItem[];
};

export const NUCLEOS: NucleoDef[] = [
  {
    id: "nucleo1",
    code: "01",
    label: "Projetos & Squads",
    fullLabel: "Núcleo 01 — Projetos & Squads",
    home: "/projetos-squads/app",
    requireAuth: true,
    color: "primary",
    items: [
      { to: "/projetos-squads/app", end: true, label: "Dashboard", icon: LayoutDashboard },
      { to: "/projetos-squads/app/portfolio", label: "Portfólio", icon: Briefcase },
      { to: "/projetos-squads/app/squads", label: "Squads", icon: Users },
      { to: "/projetos-squads/app/capacidade", label: "Capacidade", icon: Activity },
      { to: "/projetos-squads/app/dependencias", label: "Dependências", icon: Network },
      { to: "/projetos-squads/app/cronograma", label: "Cronograma", icon: GanttChartSquare },
      { to: "/projetos-squads/app/admin", label: "Administração", icon: Settings },
    ],
  },
  {
    id: "nucleo2",
    code: "02",
    label: "Radar de Licitações",
    fullLabel: "Núcleo 02 — Radar de Licitações TI",
    home: "/licitacoes",
    requireAuth: false,
    color: "accent",
    items: [
      { to: "/licitacoes", end: true, label: "Radar PNCP", icon: Radar },
      { to: "/licitacoes/triagem", label: "Triagem IA", icon: FileSearch },
      { to: "/licitacoes/estrategicas", label: "Itens Estratégicos", icon: Crown },
      { to: "/licitacoes/atestados", label: "Atestados (CAT)", icon: Award },
      { to: "/licitacoes/solucoes", label: "Soluções", icon: Boxes },
      { to: "/licitacoes/perfis", label: "Quadro de Perfis", icon: Users },
      { to: "/licitacoes/perfil", label: "Core Business", icon: Building2 },
      { to: "/licitacoes/favoritos", label: "Favoritos", icon: Star },
    ],
  },
  {
    id: "nucleo3",
    code: "03",
    label: "Governança & Automações",
    fullLabel: "Núcleo 03 — Governança & Automações",
    home: "/governanca",
    requireAuth: false,
    color: "steel",
    items: [
      { to: "/governanca", end: true, label: "Dashboard", icon: ShieldCheck },
      { to: "/governanca/automacoes", label: "Automações", icon: Workflow },
      { to: "/governanca/auditoria", label: "Auditoria", icon: ScrollText },
    ],
  },
];

export const findNucleoByPath = (pathname: string): NucleoDef => {
  // match mais específico primeiro
  const sorted = [...NUCLEOS].sort((a, b) => b.home.length - a.home.length);
  const hit = sorted.find((n) =>
    pathname === n.home ||
    pathname.startsWith(n.home + "/") ||
    n.items.some((i) => pathname === i.to || pathname.startsWith(i.to + "/"))
  );
  return hit ?? NUCLEOS[0];
};
