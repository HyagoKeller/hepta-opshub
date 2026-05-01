import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const navItems = [
  { label: "Visão", href: "/#visao" },
  { label: "Projetos & Squads", href: "/projetos-squads", route: true },
  { label: "Licitações", href: "/#nucleo-licitacoes" },
  { label: "Automações", href: "/#nucleo-automacoes" },
  { label: "Plataforma", href: "/#plataforma" },
];

const HeptaMark = () => (
  <svg viewBox="0 0 40 40" className="h-9 w-9" aria-hidden>
    <rect x="3" y="3" width="34" height="34" fill="none" stroke="hsl(var(--foreground))" strokeWidth="2.5" transform="rotate(-12 20 20)" />
    <rect x="9" y="6" width="11" height="11" fill="hsl(var(--accent))" stroke="hsl(var(--foreground))" strokeWidth="1.5" />
    <rect x="20" y="22" width="11" height="11" fill="hsl(var(--primary))" stroke="hsl(var(--foreground))" strokeWidth="1.5" />
  </svg>
);

export const SiteHeader = () => {
  return (
    <header className="sticky top-0 z-50 w-full border-b-2 border-foreground bg-background/95 backdrop-blur">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-3 group">
          <HeptaMark />
          <div className="leading-tight">
            <div className="font-display text-lg tracking-tight">
              Hepta<span className="text-primary">Project</span>
            </div>
            <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
              Plataforma operacional · Hepta
            </div>
          </div>
        </Link>

        <nav className="hidden lg:flex items-center gap-1">
          {navItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="px-3 py-2 text-xs font-bold uppercase tracking-wide hover:bg-accent hover:text-accent-foreground transition-smooth"
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Button variant="primary" size="sm" asChild>
            <Link to="/projetos-squads">Acessar Projetos & Squads</Link>
          </Button>
        </div>
      </div>
    </header>
  );
};

export { HeptaMark };
