import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ShieldCheck, Workflow, ScrollText, Radar, Briefcase, Crown } from "lucide-react";
import { PageHeader, KPI } from "@/modules/licitacoes/ui";
import { supabase } from "@/integrations/supabase/client";
import { listarAutomacoes, listarAuditoria } from "../store";
import { Button } from "@/components/ui/button";

export const GovernancaPage = () => {
  const [projetosAtivos, setProjetosAtivos] = useState<number | null>(null);
  const [editaisMes, setEditaisMes] = useState<number | null>(null);
  const [triagens, setTriagens] = useState<number | null>(null);
  const [automacoes, setAutomacoes] = useState(0);
  const [eventos, setEventos] = useState(0);

  useEffect(() => {
    setAutomacoes(listarAutomacoes().length);
    setEventos(listarAuditoria().length);

    // Contagens best-effort — silencia erros de RLS/tabela vazia
    supabase.from("oportunidades_estrategicas").select("id", { count: "exact", head: true })
      .then(({ count }) => setEditaisMes(count ?? 0));
    supabase.from("triagens").select("id", { count: "exact", head: true })
      .then(({ count }) => setTriagens(count ?? 0));
    // projetos do núcleo 1 são in-memory: mostra placeholder
    setProjetosAtivos(null);
  }, []);

  return (
    <>
      <PageHeader
        eyebrow="Núcleo 03 • Governança cruzada"
        title="Painel de Governança"
        subtitle="KPIs cruzados entre Núcleo 01 (Projetos & Squads) e Núcleo 02 (Radar). Automações e trilha de auditoria centralizadas."
      />
      <div className="px-6 lg:px-8 py-6 space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
          <KPI label="Projetos ativos" value={projetosAtivos ?? "—"} accent="primary" sub="Núcleo 01" />
          <KPI label="Itens Estratégicos" value={editaisMes ?? "—"} accent="accent" sub="Núcleo 02 • REQ-10" />
          <KPI label="Triagens IA" value={triagens ?? "—"} accent="info" sub="Últimos registros" />
          <KPI label="Automações" value={automacoes} sub="Ativas no catálogo" />
          <KPI label="Eventos auditados" value={eventos} accent="success" />
        </div>

        <div className="grid lg:grid-cols-3 gap-4">
          <Card
            to="/governanca/automacoes"
            icon={<Workflow className="h-5 w-5" />}
            title="Catálogo de Automações"
            desc="Gatilhos operacionais entre núcleos (edital aprovado → projeto, capacidade crítica → alerta)."
            cta="Abrir catálogo"
          />
          <Card
            to="/governanca/auditoria"
            icon={<ScrollText className="h-5 w-5" />}
            title="Trilha de Auditoria"
            desc="Eventos imutáveis de aprovação de editais, criação de projetos e mudanças críticas."
            cta="Ver eventos"
          />
          <Card
            to="/projetos-squads/app"
            icon={<Briefcase className="h-5 w-5" />}
            title="Ir para Projetos & Squads"
            desc="Cruzar demanda de editais BID com capacidade real do quadro."
            cta="Abrir Núcleo 01"
          />
        </div>

        <div className="border-2 border-foreground bg-card shadow-brutal-sm p-6">
          <div className="flex items-center gap-2 mb-3">
            <ShieldCheck className="h-4 w-4" />
            <div className="font-display text-sm">Escopo do Núcleo 03</div>
          </div>
          <ul className="text-sm space-y-2 text-muted-foreground">
            <li className="flex gap-2"><Crown className="h-4 w-4 shrink-0 text-accent mt-0.5" /> Consolidar decisões estratégicas (REQ-10) e disparar automações downstream.</li>
            <li className="flex gap-2"><Radar className="h-4 w-4 shrink-0 text-primary mt-0.5" /> Monitorar saúde cruzada dos núcleos operacionais.</li>
            <li className="flex gap-2"><ScrollText className="h-4 w-4 shrink-0 text-steel mt-0.5" /> Manter trilha de auditoria imutável para conformidade.</li>
          </ul>
        </div>
      </div>
    </>
  );
};

const Card = ({ to, icon, title, desc, cta }: { to: string; icon: React.ReactNode; title: string; desc: string; cta: string }) => (
  <div className="border-2 border-foreground bg-card shadow-brutal-sm p-5 flex flex-col">
    <div className="flex items-center gap-2 mb-2">{icon}<div className="font-display text-base">{title}</div></div>
    <p className="text-xs text-muted-foreground flex-1">{desc}</p>
    <div className="mt-4">
      <Button size="sm" variant="outline" asChild><Link to={to}>{cta}</Link></Button>
    </div>
  </div>
);
