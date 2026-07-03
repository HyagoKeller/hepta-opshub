import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Navigate, Route, Routes, useLocation } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Index from "./pages/Index.tsx";
import NotFound from "./pages/NotFound.tsx";

import { AuthProvider } from "./modules/nucleo1/AuthContext";
import { DataProvider } from "./modules/nucleo1/DataStore";
import { AppShell } from "./app/AppShell";
import { LoginPage } from "./modules/nucleo1/LoginPage";
import { DashboardPage } from "./modules/nucleo1/pages/DashboardPage";
import { PortfolioPage } from "./modules/nucleo1/pages/PortfolioPage";
import { ProjectDetailPage } from "./modules/nucleo1/pages/ProjectDetailPage";
import { SquadsPage } from "./modules/nucleo1/pages/SquadsPage";
import { CapacityPage } from "./modules/nucleo1/pages/CapacityPage";
import { DependenciesPage } from "./modules/nucleo1/pages/DependenciesPage";
import { SchedulePage } from "./modules/nucleo1/pages/SchedulePage";
import { AdminPage } from "./modules/nucleo1/pages/AdminPage";

import { RadarPage } from "./modules/licitacoes/pages/RadarPage";
import { TriagemPage } from "./modules/licitacoes/pages/TriagemPage";
import { AtestadosPage } from "./modules/licitacoes/pages/AtestadosPage";
import { SolucoesPage } from "./modules/licitacoes/pages/SolucoesPage";
import { FavoritosPage } from "./modules/licitacoes/pages/FavoritosPage";
import { PerfilPage } from "./modules/licitacoes/pages/PerfilPage";
import { PerfisPage } from "./modules/licitacoes/pages/PerfisPage";
import { EstrategicasPage } from "./modules/licitacoes/pages/EstrategicasPage";

import { GovernancaPage } from "./modules/nucleo3/pages/GovernancaPage";
import { AutomacoesPage } from "./modules/nucleo3/pages/AutomacoesPage";
import { AuditoriaPage } from "./modules/nucleo3/pages/AuditoriaPage";
import { AcessosPage } from "./modules/nucleo1/pages/AcessosPage";
import { RequireModuleAccess } from "./modules/platform/RequireModuleAccess";
import type { Modulo } from "./modules/nucleo1/AuthContext";

const queryClient = new QueryClient();

const wrap = (node: React.ReactNode) => <AppShell>{node}</AppShell>;
const guard = (modulo: Modulo, node: React.ReactNode) =>
  <AppShell><RequireModuleAccess modulo={modulo}>{node}</RequireModuleAccess></AppShell>;

// Redireciona uma rota antiga (prefixo `from`) para `to`, preservando o restante do path.
const LegacyRedirect = ({ from, to }: { from: string; to: string }) => {
  const loc = useLocation();
  const rest = loc.pathname.startsWith(from) ? loc.pathname.slice(from.length) : "";
  return <Navigate to={`${to}${rest}${loc.search}${loc.hash}`} replace />;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <DataProvider>
            <Routes>
              {/* Landing pública */}
              <Route path="/" element={<Index />} />

              {/* Login único */}
              <Route path="/app/login" element={<LoginPage />} />

              {/* /app raiz → primeiro núcleo */}
              <Route path="/app" element={wrap(<DashboardPage />)} />

              {/* Núcleo 01 — Projetos & Squads */}
              <Route path="/app/projetos" element={guard("projetos_squads", <DashboardPage />)} />
              <Route path="/app/projetos/portfolio" element={guard("projetos_squads", <PortfolioPage />)} />
              <Route path="/app/projetos/projeto/:id" element={guard("projetos_squads", <ProjectDetailPage />)} />
              <Route path="/app/projetos/squads" element={guard("projetos_squads", <SquadsPage />)} />
              <Route path="/app/projetos/capacidade" element={guard("projetos_squads", <CapacityPage />)} />
              <Route path="/app/projetos/dependencias" element={guard("projetos_squads", <DependenciesPage />)} />
              <Route path="/app/projetos/cronograma" element={guard("projetos_squads", <SchedulePage />)} />
              <Route path="/app/projetos/admin" element={guard("projetos_squads", <AdminPage />)} />

              {/* Admin transversal (apenas perfil=admin) */}
              <Route path="/app/admin/acessos" element={wrap(<AcessosPage />)} />

              {/* Núcleo 02 — Licitações */}
              <Route path="/app/licitacoes" element={guard("licitacoes", <RadarPage />)} />
              <Route path="/app/licitacoes/triagem" element={guard("licitacoes", <TriagemPage />)} />
              <Route path="/app/licitacoes/atestados" element={guard("licitacoes", <AtestadosPage />)} />
              <Route path="/app/licitacoes/solucoes" element={guard("licitacoes", <SolucoesPage />)} />
              <Route path="/app/licitacoes/favoritos" element={guard("licitacoes", <FavoritosPage />)} />
              <Route path="/app/licitacoes/estrategicas" element={guard("licitacoes", <EstrategicasPage />)} />
              <Route path="/app/licitacoes/perfil" element={guard("licitacoes", <PerfilPage />)} />
              <Route path="/app/licitacoes/perfis" element={guard("licitacoes", <PerfisPage />)} />

              {/* Núcleo 03 — Automações & Governança */}
              <Route path="/app/automacoes" element={guard("automacoes", <GovernancaPage />)} />
              <Route path="/app/automacoes/catalogo" element={guard("automacoes", <AutomacoesPage />)} />
              <Route path="/app/automacoes/auditoria" element={guard("automacoes", <AuditoriaPage />)} />

              {/* Compat: rotas antigas → novas */}
              <Route path="/projetos-squads" element={<Navigate to="/" replace />} />
              <Route path="/projetos-squads/login" element={<Navigate to="/app/login" replace />} />
              <Route path="/projetos-squads/app" element={<Navigate to="/app/projetos" replace />} />
              <Route path="/projetos-squads/app/*" element={<LegacyRedirect from="/projetos-squads/app" to="/app/projetos" />} />

              <Route path="/licitacoes" element={<Navigate to="/app/licitacoes" replace />} />
              <Route path="/licitacoes/*" element={<LegacyRedirect from="/licitacoes" to="/app/licitacoes" />} />

              <Route path="/governanca" element={<Navigate to="/app/automacoes" replace />} />
              <Route path="/governanca/automacoes" element={<Navigate to="/app/automacoes/catalogo" replace />} />
              <Route path="/governanca/auditoria" element={<Navigate to="/app/automacoes/auditoria" replace />} />

              <Route path="*" element={<NotFound />} />
            </Routes>
          </DataProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
