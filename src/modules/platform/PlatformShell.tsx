import { ReactNode, useState } from "react";
import { Link, NavLink, Navigate, useLocation } from "react-router-dom";
import { ChevronLeft, Menu, LogOut, ShieldCheck } from "lucide-react";
import { HeptaMark } from "@/components/site/SiteHeader";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuth } from "../nucleo1/AuthContext";
import { NUCLEOS, findNucleoByPath, type NucleoDef } from "./nav.config";

const nucleoAccent: Record<NucleoDef["color"], string> = {
  primary: "bg-primary text-primary-foreground",
  accent: "bg-accent text-accent-foreground",
  steel: "bg-steel text-steel-foreground",
};

export const PlatformShell = ({ children }: { children: ReactNode }) => {
  const { user, logout, hasModule } = useAuth();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  const active = findNucleoByPath(location.pathname);

  // Guard: núcleo exige auth mas não há sessão
  if (active.requireAuth && !user) {
    return <Navigate to="/projetos-squads/login" state={{ from: location }} replace />;
  }

  // Guard RBAC: sessão existe, mas não tem esse módulo → primeiro permitido
  if (user && !hasModule(active.id)) {
    const first = NUCLEOS.find((n) => hasModule(n.id));
    return <Navigate to={first?.home ?? "/"} replace />;
  }

  const visibleNucleos = NUCLEOS.filter((n) => !user || hasModule(n.id));

  return (
    <div className="min-h-screen bg-background flex">
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
                <div className="text-[9px] font-mono uppercase tracking-widest opacity-70">
                  Plataforma
                </div>
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

        {/* Seletor de Núcleo */}
        <div className="border-b-2 border-sidebar-border p-2 space-y-1">
          {!collapsed && (
            <div className="text-[9px] font-mono uppercase tracking-widest opacity-60 px-1 pb-1">
              Núcleos
            </div>
          )}
          {visibleNucleos.map((n) => {
            const isActive = active.id === n.id;
            return (
              <Link
                key={n.id}
                to={n.home}
                title={n.fullLabel}
                className={cn(
                  "flex items-center gap-2 px-2 py-2 border-2 border-transparent transition-smooth",
                  isActive
                    ? `${nucleoAccent[n.color]} border-foreground shadow-brutal-sm`
                    : "hover:bg-sidebar-accent",
                )}
              >
                <span
                  className={cn(
                    "font-mono text-[10px] font-bold h-6 w-6 grid place-items-center border-2 border-foreground shrink-0",
                    isActive ? "bg-background text-foreground" : nucleoAccent[n.color],
                  )}
                >
                  {n.code}
                </span>
                {!collapsed && (
                  <span className="text-[11px] font-bold uppercase tracking-wide truncate">
                    {n.label}
                  </span>
                )}
              </Link>
            );
          })}
        </div>

        {/* Navegação do núcleo ativo */}
        <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-1">
          {!collapsed && (
            <div className="text-[9px] font-mono uppercase tracking-widest opacity-60 px-1 pb-1">
              {active.label}
            </div>
          )}
          {active.items.map((n) => (
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
          {user ? (
            <>
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
            </>
          ) : (
            !collapsed && (
              <div className="text-[10px] font-mono uppercase tracking-widest opacity-70">
                Acesso aberto
              </div>
            )
          )}
        </div>
      </aside>

      <div className="flex-1 min-w-0 flex flex-col">
        <header className="sticky top-0 z-40 h-14 border-b-2 border-foreground bg-background/95 backdrop-blur flex items-center justify-between px-6">
          <div className="flex items-center gap-3 min-w-0">
            <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              Plataforma Hepta
            </div>
            <span className="text-muted-foreground">/</span>
            <div className="font-display text-sm truncate">{active.fullLabel}</div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link to="/">Apresentação</Link>
            </Button>
          </div>
        </header>
        <main className="flex-1 overflow-x-hidden">{children}</main>
      </div>
    </div>
  );
};
