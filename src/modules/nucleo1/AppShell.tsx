import { ReactNode, useState } from "react";
import { Link, NavLink, Navigate, useLocation } from "react-router-dom";
import {
  LayoutDashboard, Briefcase, Users, GanttChartSquare, Activity, Network, Settings,
  LogOut, ChevronLeft, Menu, ShieldCheck,
} from "lucide-react";
import { useAuth } from "./AuthContext";
import { HeptaMark } from "@/components/site/SiteHeader";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const nav = [
  { to: "/projetos-squads/app", end: true, label: "Dashboard", icon: LayoutDashboard },
  { to: "/projetos-squads/app/portfolio", label: "Portfólio", icon: Briefcase },
  { to: "/projetos-squads/app/squads", label: "Squads", icon: Users },
  { to: "/projetos-squads/app/capacidade", label: "Capacidade", icon: Activity },
  { to: "/projetos-squads/app/dependencias", label: "Dependências", icon: Network },
  { to: "/projetos-squads/app/cronograma", label: "Cronograma", icon: GanttChartSquare },
  { to: "/projetos-squads/app/admin", label: "Administração", icon: Settings },
];

export const AppShell = ({ children }: { children: ReactNode }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  if (!user) {
    return <Navigate to="/projetos-squads/login" state={{ from: location }} replace />;
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside
        className={cn(
          "sticky top-0 h-screen border-r-2 border-foreground bg-secondary text-secondary-foreground flex flex-col transition-all",
          collapsed ? "w-16" : "w-64",
        )}
      >
        <div className="h-16 border-b-2 border-sidebar-border flex items-center justify-between px-3">
          <Link to="/" className="flex items-center gap-2">
            <HeptaMark />
            {!collapsed && (
              <div className="leading-tight">
                <div className="font-display text-sm">HeptaProject</div>
                <div className="text-[9px] font-mono uppercase tracking-widest opacity-70">Núcleo 01</div>
              </div>
            )}
          </Link>
          <button
            onClick={() => setCollapsed((c) => !c)}
            className="p-1 hover:bg-sidebar-accent rounded-sm"
            aria-label="Colapsar menu"
          >
            {collapsed ? <Menu className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-1">
          {nav.map((n) => (
            <NavLink
              key={n.to}
              to={n.to}
              end={n.end}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 px-3 py-2.5 text-xs font-bold uppercase tracking-wide border-2 border-transparent transition-smooth",
                  isActive
                    ? "bg-accent text-accent-foreground border-foreground shadow-brutal-sm"
                    : "hover:bg-sidebar-accent",
                )
              }
              title={n.label}
            >
              <n.icon className="h-4 w-4 shrink-0" />
              {!collapsed && <span>{n.label}</span>}
            </NavLink>
          ))}
        </nav>

        <div className="border-t-2 border-sidebar-border p-3">
          {!collapsed && (
            <div className="mb-3">
              <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-widest opacity-70 mb-1">
                <ShieldCheck className="h-3 w-3" /> Sessão
              </div>
              <div className="text-xs font-bold truncate">{user.nome}</div>
              <div className="text-[10px] opacity-70 truncate">{user.email}</div>
              <div className="mt-1 inline-block bg-primary text-primary-foreground text-[9px] font-mono uppercase tracking-widest px-1.5 py-0.5">
                {user.perfil}
              </div>
            </div>
          )}
          <button
            onClick={logout}
            className={cn(
              "w-full flex items-center gap-2 px-2 py-2 text-xs font-bold uppercase tracking-wide border-2 border-sidebar-border hover:bg-primary hover:text-primary-foreground hover:border-foreground transition-smooth",
              collapsed && "justify-center",
            )}
          >
            <LogOut className="h-3.5 w-3.5" />
            {!collapsed && <span>Sair</span>}
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 min-w-0 flex flex-col">
        <header className="sticky top-0 z-40 h-14 border-b-2 border-foreground bg-background/95 backdrop-blur flex items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              Plataforma operacional Hepta
            </div>
            <span className="text-muted-foreground">/</span>
            <div className="font-display text-sm">Núcleo 01 — Projetos & Squads</div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link to="/projetos-squads">Apresentação</Link>
            </Button>
          </div>
        </header>
        <main className="flex-1 overflow-x-hidden">{children}</main>
      </div>
    </div>
  );
};
