import { ReactNode, useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { Radar, FileSearch, Award, Boxes, Star, ChevronLeft, Menu, Building2, Crown, Users } from 'lucide-react';
import { HeptaMark } from '@/components/site/SiteHeader';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

const nav = [
  { to: '/licitacoes', end: true, label: 'Radar PNCP', icon: Radar },
  { to: '/licitacoes/triagem', label: 'Triagem IA', icon: FileSearch },
  { to: '/licitacoes/estrategicas', label: 'Itens Estratégicos', icon: Crown },
  { to: '/licitacoes/atestados', label: 'Atestados (CAT)', icon: Award },
  { to: '/licitacoes/solucoes', label: 'Soluções', icon: Boxes },
  { to: '/licitacoes/perfis', label: 'Quadro de Perfis', icon: Users },
  { to: '/licitacoes/perfil', label: 'Core Business', icon: Building2 },
  { to: '/licitacoes/favoritos', label: 'Favoritos', icon: Star },
];

export const LicitacoesShell = ({ children }: { children: ReactNode }) => {
  const [collapsed, setCollapsed] = useState(false);
  return (
    <div className="min-h-screen bg-background flex">
      <aside className={cn(
        'sticky top-0 h-screen border-r-2 border-foreground bg-secondary text-secondary-foreground flex flex-col transition-all',
        collapsed ? 'w-16' : 'w-64'
      )}>
        <div className="h-16 border-b-2 border-sidebar-border flex items-center justify-between px-3">
          <Link to="/" className="flex items-center gap-2">
            <HeptaMark />
            {!collapsed && (
              <div className="leading-tight">
                <div className="font-display text-sm">HeptaProject</div>
                <div className="text-[9px] font-mono uppercase tracking-widest opacity-70">Licitações</div>
              </div>
            )}
          </Link>
          <button onClick={() => setCollapsed((c) => !c)} className="p-1 hover:bg-sidebar-accent rounded-sm">
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
                  'flex items-center gap-3 px-3 py-2.5 text-xs font-bold uppercase tracking-wide border-2 border-transparent transition-smooth',
                  isActive
                    ? 'bg-accent text-accent-foreground border-foreground shadow-brutal-sm'
                    : 'hover:bg-sidebar-accent'
                )
              }
              title={n.label}
            >
              <n.icon className="h-4 w-4 shrink-0" />
              {!collapsed && <span>{n.label}</span>}
            </NavLink>
          ))}
        </nav>
        <div className="border-t-2 border-sidebar-border p-3 text-[10px] font-mono uppercase tracking-widest opacity-70">
          {!collapsed && <div>Fonte: PNCP gov.br</div>}
        </div>
      </aside>
      <div className="flex-1 min-w-0 flex flex-col">
        <header className="sticky top-0 z-40 h-14 border-b-2 border-foreground bg-background/95 backdrop-blur flex items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              Plataforma Hepta
            </div>
            <span className="text-muted-foreground">/</span>
            <div className="font-display text-sm">Núcleo 02 — Radar de Licitações TI</div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link to="/projetos-squads/app">Ir para Núcleo 1</Link>
            </Button>
          </div>
        </header>
        <main className="flex-1 overflow-x-hidden">{children}</main>
      </div>
    </div>
  );
};
