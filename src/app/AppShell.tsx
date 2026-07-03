import { ReactNode, useState } from "react";
import { Link, NavLink, Navigate, useLocation, useNavigate } from "react-router-dom";
import { ChevronLeft, Menu, LogOut, ChevronDown, ShieldCheck } from "lucide-react";
import { HeptaMark } from "@/components/site/SiteHeader";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { useAuth } from "@/modules/nucleo1/AuthContext";
import { NUCLEOS, findNucleoByPath, type NucleoDef } from "@/modules/platform/nav.config";

const accentBtn: Record<NucleoDef["color"], string> = {
  primary: "bg-primary text-primary-foreground",
  accent: "bg-accent text-accent-foreground",
  steel: "bg-steel text-steel-foreground",
};

export const AppShell = ({ children }: { children: ReactNode }) => {
  const { user, logout, hasModule } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  if (!user) {
    return <Navigate to="/app/login" state={{ from: location }} replace />;
  }

  const active = findNucleoByPath(location.pathname);
  const visibleNucleos = NUCLEOS.filter((n) => hasModule(n.id));

  if (!hasModule(active.id)) {
    const first = visibleNucleos[0];
    return <Navigate to={first?.home ?? "/"} replace />;
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Topbar única da plataforma */}
      <header className="sticky top-0 z-50 h-14 border-b-2 border-foreground bg-background flex items-center justify-between px-4 gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <Link to="/app" className="flex items-center gap-2 shrink-0">
            <HeptaMark />
            <div className="leading-tight hidden sm:block">
              <div className="font-display text-sm">
                Hepta<span className="text-primary">Project</span>
              </div>
              <div className="text-[9px] font-mono uppercase tracking-widest text-muted-foreground">
                Plataforma
              </div>
            </div>
          </Link>

          {/* Seletor de núcleo */}
          <div className="hidden md:flex items-center gap-1 border-l-2 border-foreground pl-3 ml-1">
            {visibleNucleos.map((n) => {
              const isActive = active.id === n.id;
              return (
                <button
                  key={n.id}
                  onClick={() => navigate(n.home)}
                  className={cn(
                    "flex items-center gap-2 px-3 py-1.5 text-xs font-bold uppercase tracking-wide border-2 border-transparent transition-smooth",
                    isActive
                      ? `${accentBtn[n.color]} border-foreground shadow-brutal-sm`
                      : "hover:bg-muted",
                  )}
                >
                  <span
                    className={cn(
                      "font-mono text-[10px] h-5 w-5 grid place-items-center border-2 border-foreground",
                      isActive ? "bg-background text-foreground" : accentBtn[n.color],
                    )}
                  >
                    {n.code}
                  </span>
                  <span className="hidden lg:inline">{n.label}</span>
                </button>
              );
            })}
          </div>

          {/* Mobile: dropdown */}
          <div className="md:hidden">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <span className={cn("font-mono text-[10px] h-4 w-4 grid place-items-center border-2 border-foreground mr-1.5", accentBtn[active.color])}>
                    {active.code}
                  </span>
                  {active.label}
                  <ChevronDown className="h-3 w-3 ml-1" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                <DropdownMenuLabel className="font-mono text-[10px] uppercase tracking-widest">Núcleos</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {visibleNucleos.map((n) => (
                  <DropdownMenuItem key={n.id} onClick={() => navigate(n.home)}>
                    <span className={cn("font-mono text-[10px] h-4 w-4 grid place-items-center border-2 border-foreground mr-2", accentBtn[n.color])}>
                      {n.code}
                    </span>
                    {n.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Avatar / logout */}
        <div className="flex items-center gap-2">
          <div className="hidden sm:block text-right leading-tight">
            <div className="text-xs font-bold">{user.nome}</div>
            <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">{user.perfil}</div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className="h-9 w-9 border-2 border-foreground bg-primary text-primary-foreground font-display text-sm grid place-items-center shadow-brutal-sm hover:bg-primary/90"
                aria-label="Menu do usuário"
              >
                {user.nome.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase()}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="text-xs font-bold">{user.nome}</div>
                <div className="text-[10px] font-mono opacity-70">{user.email}</div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link to="/"><ShieldCheck className="h-3.5 w-3.5 mr-2" />Página inicial</Link>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={logout}>
                <LogOut className="h-3.5 w-3.5 mr-2" />Sair
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      <div className="flex-1 flex min-h-0">
        {/* Sidebar contextual do núcleo ativo */}
        <aside
          className={cn(
            "sticky top-14 h-[calc(100vh-3.5rem)] border-r-2 border-foreground bg-secondary text-secondary-foreground flex flex-col transition-all",
            collapsed ? "w-14" : "w-60",
          )}
        >
          <div className="h-12 border-b-2 border-sidebar-border flex items-center justify-between px-3">
            {!collapsed && (
              <div className="text-[9px] font-mono uppercase tracking-widest opacity-80 truncate">
                {active.label}
              </div>
            )}
            <button
              onClick={() => setCollapsed((c) => !c)}
              className="p-1 hover:bg-sidebar-accent rounded-sm"
              aria-label="Colapsar menu"
            >
              {collapsed ? <Menu className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
            </button>
          </div>
          <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-1">
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
        </aside>

        <main className="flex-1 min-w-0 overflow-x-hidden">{children}</main>
      </div>
    </div>
  );
};
