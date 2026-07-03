import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Index from "./pages/Index.tsx";
import ProjectsSquads from "./pages/ProjectsSquads.tsx";
import NotFound from "./pages/NotFound.tsx";

import { AuthProvider } from "./modules/nucleo1/AuthContext";
import { DataProvider } from "./modules/nucleo1/DataStore";
import { AppShell } from "./modules/nucleo1/AppShell";
import { LoginPage } from "./modules/nucleo1/LoginPage";
import { DashboardPage } from "./modules/nucleo1/pages/DashboardPage";
import { PortfolioPage } from "./modules/nucleo1/pages/PortfolioPage";
import { ProjectDetailPage } from "./modules/nucleo1/pages/ProjectDetailPage";
import { SquadsPage } from "./modules/nucleo1/pages/SquadsPage";
import { CapacityPage } from "./modules/nucleo1/pages/CapacityPage";
import { DependenciesPage } from "./modules/nucleo1/pages/DependenciesPage";
import { SchedulePage } from "./modules/nucleo1/pages/SchedulePage";
import { AdminPage } from "./modules/nucleo1/pages/AdminPage";

import { LicitacoesShell } from "./modules/licitacoes/AppShell";
import { RadarPage } from "./modules/licitacoes/pages/RadarPage";
import { TriagemPage } from "./modules/licitacoes/pages/TriagemPage";
import { AtestadosPage } from "./modules/licitacoes/pages/AtestadosPage";
import { SolucoesPage } from "./modules/licitacoes/pages/SolucoesPage";
import { FavoritosPage } from "./modules/licitacoes/pages/FavoritosPage";
import { PerfilPage } from "./modules/licitacoes/pages/PerfilPage";
import { PerfisPage } from "./modules/licitacoes/pages/PerfisPage";
import { EstrategicasPage } from "./modules/licitacoes/pages/EstrategicasPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <DataProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/projetos-squads" element={<ProjectsSquads />} />
            <Route path="/projetos-squads/login" element={<LoginPage />} />
            <Route path="/projetos-squads/app" element={<AppShell><DashboardPage /></AppShell>} />
            <Route path="/projetos-squads/app/portfolio" element={<AppShell><PortfolioPage /></AppShell>} />
            <Route path="/projetos-squads/app/projeto/:id" element={<AppShell><ProjectDetailPage /></AppShell>} />
            <Route path="/projetos-squads/app/squads" element={<AppShell><SquadsPage /></AppShell>} />
            <Route path="/projetos-squads/app/capacidade" element={<AppShell><CapacityPage /></AppShell>} />
            <Route path="/projetos-squads/app/dependencias" element={<AppShell><DependenciesPage /></AppShell>} />
            <Route path="/projetos-squads/app/cronograma" element={<AppShell><SchedulePage /></AppShell>} />
            <Route path="/projetos-squads/app/admin" element={<AppShell><AdminPage /></AppShell>} />

            <Route path="/licitacoes" element={<LicitacoesShell><RadarPage /></LicitacoesShell>} />
            <Route path="/licitacoes/triagem" element={<LicitacoesShell><TriagemPage /></LicitacoesShell>} />
            <Route path="/licitacoes/atestados" element={<LicitacoesShell><AtestadosPage /></LicitacoesShell>} />
            <Route path="/licitacoes/solucoes" element={<LicitacoesShell><SolucoesPage /></LicitacoesShell>} />
            <Route path="/licitacoes/favoritos" element={<LicitacoesShell><FavoritosPage /></LicitacoesShell>} />
            <Route path="/licitacoes/estrategicas" element={<LicitacoesShell><EstrategicasPage /></LicitacoesShell>} />
            <Route path="/licitacoes/perfil" element={<LicitacoesShell><PerfilPage /></LicitacoesShell>} />
            <Route path="/licitacoes/perfis" element={<LicitacoesShell><PerfisPage /></LicitacoesShell>} />

            <Route path="*" element={<NotFound />} />
          </Routes>
          </DataProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
