import { useState } from 'react';
import { Settings, ShieldCheck, Users, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { PageHeader } from '../ui';

// Parâmetros locais (mock). Em V2 vira tabela `automacoes_config` no banco.
const STORAGE = 'hepta_automacoes_config';

type Config = {
  nucleos_ativos: { nucleo1: boolean; nucleo2: boolean; nucleo3: boolean };
  responsavel_padrao: string;
  criacao_livre: boolean;
};

const defaults: Config = {
  nucleos_ativos: { nucleo1: true, nucleo2: true, nucleo3: true },
  responsavel_padrao: 'Ana Martins',
  criacao_livre: true,
};

const carregar = (): Config => {
  try { const raw = localStorage.getItem(STORAGE); if (raw) return { ...defaults, ...JSON.parse(raw) }; }
  catch {}
  return defaults;
};

export const ConfigPage = () => {
  const [cfg, setCfg] = useState<Config>(carregar);
  const [saving, setSaving] = useState(false);

  const salvar = async () => {
    setSaving(true);
    try {
      localStorage.setItem(STORAGE, JSON.stringify(cfg));
      await new Promise((r) => setTimeout(r, 300));
      toast.success('Configurações salvas');
    } finally { setSaving(false); }
  };

  return (
    <>
      <PageHeader
        eyebrow="Núcleo 03 · Configuração"
        title="Parâmetros do módulo de Automações"
        subtitle="Quais núcleos alimentam a esteira e quem é o responsável padrão para novas automações."
        actions={
          <Button variant="primary" size="sm" onClick={salvar} disabled={saving}>
            <Save className="h-3.5 w-3.5 mr-1" /> Salvar
          </Button>
        }
      />

      <div className="px-6 lg:px-8 py-6 grid lg:grid-cols-2 gap-6">
        <div className="border-2 border-foreground bg-card shadow-brutal-sm p-5 space-y-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4" />
            <h2 className="font-display text-lg">Núcleos que alimentam automações</h2>
          </div>
          {[
            { id: 'nucleo1' as const, label: 'Núcleo 01 — Projetos & Squads' },
            { id: 'nucleo2' as const, label: 'Núcleo 02 — Licitações' },
            { id: 'nucleo3' as const, label: 'Núcleo 03 — Automações (interno)' },
          ].map((n) => (
            <div key={n.id} className="flex items-center justify-between border-2 border-foreground p-3">
              <div>
                <div className="font-bold text-sm">{n.label}</div>
                <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
                  {cfg.nucleos_ativos[n.id] ? 'Ativo · aparece no filtro do catálogo' : 'Desligado'}
                </div>
              </div>
              <Switch
                checked={cfg.nucleos_ativos[n.id]}
                onCheckedChange={(v) =>
                  setCfg((c) => ({ ...c, nucleos_ativos: { ...c.nucleos_ativos, [n.id]: v } }))
                }
              />
            </div>
          ))}
        </div>

        <div className="border-2 border-foreground bg-card shadow-brutal-sm p-5 space-y-4">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            <h2 className="font-display text-lg">Responsáveis padrão</h2>
          </div>

          <div>
            <Label className="text-[10px] font-mono uppercase tracking-widest">Responsável padrão para novas automações</Label>
            <Input
              value={cfg.responsavel_padrao}
              onChange={(e) => setCfg((c) => ({ ...c, responsavel_padrao: e.target.value }))}
              placeholder="Nome do responsável"
              className="mt-1.5"
            />
          </div>

          <div className="flex items-center justify-between border-2 border-foreground p-3">
            <div>
              <div className="font-bold text-sm">Permitir criação livre de automações</div>
              <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
                Qualquer usuário autenticado pode cadastrar uma ideia
              </div>
            </div>
            <Switch checked={cfg.criacao_livre} onCheckedChange={(v) => setCfg((c) => ({ ...c, criacao_livre: v }))} />
          </div>
        </div>

        <div className="lg:col-span-2 border-2 border-dashed border-foreground bg-accent/20 shadow-brutal-sm p-5 flex items-start gap-3">
          <Settings className="h-4 w-4 mt-0.5 shrink-0" />
          <div className="text-xs">
            <b>Nota V1 · mock local.</b> As configurações estão em <code className="font-mono">localStorage</code>.
            Em produção viram tabela <code className="font-mono">automacoes_config</code> com RLS por perfil
            (ver <code className="font-mono">docs/security.md</code>).
          </div>
        </div>
      </div>
    </>
  );
};
