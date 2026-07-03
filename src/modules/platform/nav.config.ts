import {
  LayoutDashboard, Briefcase, Users, GanttChartSquare, Activity, Network, Settings,
  Radar, FileSearch, Award, Boxes, Star, Building2, Crown, ShieldCheck, Workflow, ScrollText,
} from "lucide-react";
import type { ModuloId } from "../nucleo1/AuthContext";

export type NavItem = { to: string; label: string; icon: any; end?: boolean };

export type NucleoDef = {
  id: ModuloId;
  code: string;
  label: string;
  fullLabel: string;
  home: string;
  color: "primary" | "accent" | "steel";
  items: NavItem[];
};

export const NUCLEOS: NucleoDef[] = [
  {
    id: "nucleo1",
    code: "01",
    label: "Projetos & Squads",
    fullLabel: "Núcleo 01 — Projetos & Squads",
    home: "/app/projetos",
    color: "primary",
    items: [
      { to: "/app/projetos", end: true, label: "Dashboard", icon: LayoutDashboard },
      { to: "/app/projetos/portfolio", label: "Portfólio", icon: Briefcase },
      { to: "/app/projetos/squads", label: "Squads", icon: Users },
      { to: "/app/projetos/capacidade", label: "Capacidade", icon: Activity },
      { to: "/app/projetos/dependencias", label: "Dependências", icon: Network },
      { to: "/app/projetos/cronograma", label: "Cronograma", icon: GanttChartSquare },
      { to: "/app/projetos/admin", label: "Administração", icon: Settings },
    ],
  },
  {
    id: "nucleo2",
    code: "02",
    label: "Licitações",
    fullLabel: "Núcleo 02 — Radar de Licitações TI",
    home: "/app/licitacoes",
    color: "accent",
    items: [
      { to: "/app/licitacoes", end: true, label: "Radar PNCP", icon: Radar },
      { to: "/app/licitacoes/triagem", label: "Triagem IA", icon: FileSearch },
      { to: "/app/licitacoes/estrategicas", label: "Itens Estratégicos", icon: Crown },
      { to: "/app/licitacoes/atestados", label: "Atestados (CAT)", icon: Award },
      { to: "/app/licitacoes/solucoes", label: "Soluções", icon: Boxes },
      { to: "/app/licitacoes/perfis", label: "Quadro de Perfis", icon: Users },
      { to: "/app/licitacoes/perfil", label: "Core Business", icon: Building2 },
      { to: "/app/licitacoes/favoritos", label: "Favoritos", icon: Star },
    ],
  },
  {
    id: "nucleo3",
    code: "03",
    label: "Automações",
    fullLabel: "Núcleo 03 — Automações & Governança",
    home: "/app/automacoes",
    color: "steel",
    items: [
      { to: "/app/automacoes", end: true, label: "Governança", icon: ShieldCheck },
      { to: "/app/automacoes/catalogo", label: "Catálogo", icon: Workflow },
      { to: "/app/automacoes/auditoria", label: "Auditoria", icon: ScrollText },
    ],
  },
];

export const findNucleoByPath = (pathname: string): NucleoDef => {
  const sorted = [...NUCLEOS].sort((a, b) => b.home.length - a.home.length);
  const hit = sorted.find((n) =>
    pathname === n.home ||
    pathname.startsWith(n.home + "/") ||
    n.items.some((i) => pathname === i.to || pathname.startsWith(i.to + "/"))
  );
  return hit ?? NUCLEOS[0];
};
