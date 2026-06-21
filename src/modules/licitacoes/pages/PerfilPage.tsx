import { useEffect, useState } from 'react';
import { Save, Building2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { getCompanyProfile, upsertCompanyProfile } from '../api';
import type { CompanyProfile } from '../types';
import { PageHeader } from '../ui';

const csv = (arr?: string[]) => (arr ?? []).join(', ');
const fromCsv = (s: string) => s.split(',').map((x) => x.trim()).filter(Boolean);

export const PerfilPage = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [p, setP] = useState<Partial<CompanyProfile>>({});

  useEffect(() => {
    getCompanyProfile().then((c) => { setP(c ?? { nome: 'Hepta', especialidades: [], frameworks: [], tecnologias: [], certificacoes: [], blacklist_custom: [], valor_minimo: 50000 }); setLoading(false); });
  }, []);

  const submit = async () => {
    setSaving(true);
    try {
      await upsertCompanyProfile(p as any);
      toast.success('Perfil de Core Business atualizado. A IA passará a usar esses parâmetros nas próximas triagens.');
    } catch (e: any) { toast.error('Erro ao salvar', { description: e?.message }); }
    finally { setSaving(false); }
  };

  if (loading) return <div className="p-8"><Loader2 className="h-5 w-5 animate-spin inline mr-2" />Carregando perfil...</div>;

  const esp = p.especialidades ?? [];

  return (
    <>
      <PageHeader
        eyebrow="REQ-04 + REQ-05 • Memória da empresa"
        title="Perfil de Core Business"
        subtitle="Define o que a empresa faz, frameworks, certificações e valor mínimo de licitação. Esses parâmetros são injetados no prompt da IA em toda triagem."
        actions={<Button onClick={submit} disabled={saving}>{saving ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Save className="h-4 w-4 mr-1" />}Salvar</Button>}
      />
      <div className="px-6 lg:px-8 py-6 space-y-6 max-w-5xl">

        <section className="border-2 border-foreground bg-card shadow-brutal-sm p-5">
          <div className="flex items-center gap-2 mb-3"><Building2 className="h-4 w-4" /><h2 className="font-display text-lg">Identidade</h2></div>
          <div className="grid md:grid-cols-2 gap-3">
            <div><Label>Nome da empresa</Label><Input value={p.nome ?? ''} onChange={(e) => setP({ ...p, nome: e.target.value })} /></div>
            <div><Label>Valor mínimo de licitação (R$)</Label><Input type="number" value={p.valor_minimo ?? 50000} onChange={(e) => setP({ ...p, valor_minimo: Number(e.target.value) })} /></div>
            <div className="md:col-span-2"><Label>Missão / posicionamento</Label>
              <Textarea rows={2} value={p.missao ?? ''} onChange={(e) => setP({ ...p, missao: e.target.value })} />
            </div>
          </div>
        </section>

        <section className="border-2 border-foreground bg-card shadow-brutal-sm p-5">
          <h2 className="font-display text-lg mb-3">Especialidades (Core Business)</h2>
          <p className="text-xs text-muted-foreground mb-3">Ex.: ITSM/ESM, Governança de TI, Automação & Copilot, Squads de desenvolvimento.</p>
          <div className="space-y-2">
            {esp.map((e, i) => (
              <div key={i} className="grid md:grid-cols-[1fr_140px_2fr_auto] gap-2">
                <Input value={e.area} placeholder="Área" onChange={(ev) => { const next = [...esp]; next[i] = { ...e, area: ev.target.value }; setP({ ...p, especialidades: next }); }} />
                <Input value={e.nivel} placeholder="Nível" onChange={(ev) => { const next = [...esp]; next[i] = { ...e, nivel: ev.target.value }; setP({ ...p, especialidades: next }); }} />
                <Input value={e.descricao} placeholder="Descrição" onChange={(ev) => { const next = [...esp]; next[i] = { ...e, descricao: ev.target.value }; setP({ ...p, especialidades: next }); }} />
                <Button variant="outline" size="sm" onClick={() => setP({ ...p, especialidades: esp.filter((_, j) => j !== i) })}>×</Button>
              </div>
            ))}
            <Button variant="outline" size="sm" onClick={() => setP({ ...p, especialidades: [...esp, { area: '', nivel: 'especialista', descricao: '' }] })}>+ Adicionar especialidade</Button>
          </div>
        </section>

        <section className="border-2 border-foreground bg-card shadow-brutal-sm p-5">
          <h2 className="font-display text-lg mb-3">Stack & credenciais</h2>
          <div className="grid md:grid-cols-2 gap-3">
            <div><Label>Frameworks (CSV)</Label>
              <Textarea rows={2} value={csv(p.frameworks)} onChange={(e) => setP({ ...p, frameworks: fromCsv(e.target.value) })} placeholder="ITIL v4, COBIT, SAFe..." />
            </div>
            <div><Label>Tecnologias (CSV)</Label>
              <Textarea rows={2} value={csv(p.tecnologias)} onChange={(e) => setP({ ...p, tecnologias: fromCsv(e.target.value) })} placeholder="InvGate, ServiceNow, Copilot..." />
            </div>
            <div><Label>Certificações (CSV)</Label>
              <Textarea rows={2} value={csv(p.certificacoes)} onChange={(e) => setP({ ...p, certificacoes: fromCsv(e.target.value) })} placeholder="ISO 27001, MPS-Br, CMMI..." />
            </div>
            <div><Label>Diferenciais</Label>
              <Textarea rows={2} value={p.diferenciais ?? ''} onChange={(e) => setP({ ...p, diferenciais: e.target.value })} />
            </div>
          </div>
        </section>

        <section className="border-2 border-foreground bg-card shadow-brutal-sm p-5">
          <h2 className="font-display text-lg mb-2">Blacklist customizada (REQ-02)</h2>
          <p className="text-xs text-muted-foreground mb-2">Palavras-chave que adicionam às palavras negativas padrão. Editais cujo objeto bata com qualquer uma serão automaticamente descartados.</p>
          <Textarea rows={3} value={csv(p.blacklist_custom)} onChange={(e) => setP({ ...p, blacklist_custom: fromCsv(e.target.value) })} placeholder="reforma predial, jardinagem..." />
        </section>
      </div>
    </>
  );
};
