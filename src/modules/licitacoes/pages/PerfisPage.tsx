import { useEffect, useMemo, useState } from 'react';
import { Plus, Trash2, Pencil, Users, BadgeCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { deletePerfil, listarPerfis, upsertPerfil } from '../api';
import type { Perfil } from '../types';
import { KPI, PageHeader, formatBRL } from '../ui';

const empty: Partial<Perfil> = {
  nome: '', cargo: '', senioridade: 'pleno',
  skills: [], certificacoes: [], frameworks: [],
  custo_hora: undefined, disponibilidade_pct: 100, ativo: true,
};

const toArr = (v: any): string[] =>
  Array.isArray(v) ? v : String(v ?? '').split(',').map((s) => s.trim()).filter(Boolean);

export const PerfisPage = () => {
  const [rows, setRows] = useState<Perfil[]>([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<Partial<Perfil>>(empty);

  const load = () => listarPerfis().then(setRows).catch((e) => toast.error('Erro ao carregar', { description: e?.message }));
  useEffect(() => { load(); }, []);

  const submit = async () => {
    if (!form.nome || !form.cargo) { toast.error('Preencha nome e cargo.'); return; }
    try {
      await upsertPerfil({
        ...form,
        skills: toArr(form.skills),
        certificacoes: toArr(form.certificacoes),
        frameworks: toArr(form.frameworks),
        custo_hora: form.custo_hora === undefined || form.custo_hora === null || (form.custo_hora as any) === '' ? null : Number(form.custo_hora),
        disponibilidade_pct: Number(form.disponibilidade_pct ?? 100),
      });
      toast.success(form.id ? 'Perfil atualizado' : 'Perfil cadastrado');
      setOpen(false); setForm(empty); load();
    } catch (e: any) { toast.error('Erro', { description: e?.message }); }
  };

  const remove = async (id: string) => {
    if (!confirm('Excluir este perfil?')) return;
    await deletePerfil(id); toast.success('Excluído'); load();
  };

  const stats = useMemo(() => {
    const ativos = rows.filter((r) => r.ativo);
    const custoMedio = ativos.filter((r) => r.custo_hora).reduce((s, r) => s + Number(r.custo_hora), 0) / (ativos.filter((r) => r.custo_hora).length || 1);
    const porSen: Record<string, number> = {};
    ativos.forEach((r) => { porSen[r.senioridade] = (porSen[r.senioridade] ?? 0) + 1; });
    const certs = new Set<string>();
    ativos.forEach((r) => r.certificacoes?.forEach((c) => certs.add(c)));
    return { ativos: ativos.length, total: rows.length, custoMedio, porSen, certs: certs.size };
  }, [rows]);

  return (
    <>
      <PageHeader
        eyebrow="Capacidade de execução"
        title="Quadro de Perfis"
        subtitle="Cadastre as pessoas reais da Hepta com skills, senioridade, certificações, custo/hora e disponibilidade. A IA usa esse quadro para calcular o % de match de execução de cada licitação."
        actions={<Button onClick={() => { setForm(empty); setOpen(true); }}><Plus className="h-4 w-4 mr-1" />Novo perfil</Button>}
      />
      <div className="px-6 lg:px-8 py-6 space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
          <KPI label="Perfis ativos" value={stats.ativos} accent="primary" />
          <KPI label="Total cadastrado" value={stats.total} />
          <KPI label="Sêniores + Esp." value={(stats.porSen['senior'] ?? 0) + (stats.porSen['especialista'] ?? 0)} accent="accent" />
          <KPI label="Certificações únicas" value={stats.certs} accent="success" />
          <KPI label="Custo/hora médio" value={formatBRL(stats.custoMedio || 0)} />
        </div>

        <div className="border-2 border-foreground bg-card shadow-brutal-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/60 border-b-2 border-foreground">
              <tr className="text-[10px] font-mono uppercase tracking-widest">
                <th className="text-left p-3">Pessoa</th>
                <th className="text-left p-3">Senioridade</th>
                <th className="text-left p-3">Skills / Frameworks</th>
                <th className="text-left p-3">Certificações</th>
                <th className="text-left p-3">Custo/h</th>
                <th className="text-left p-3">Disp.</th>
                <th className="text-right p-3">Ações</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 && (
                <tr><td colSpan={7} className="p-8 text-center text-muted-foreground">
                  <Users className="h-5 w-5 inline mr-2" />Nenhum perfil cadastrado. A IA não conseguirá calcular match de execução.
                </td></tr>
              )}
              {rows.map((p) => (
                <tr key={p.id} className={`border-b border-border hover:bg-muted/30 ${!p.ativo ? 'opacity-50' : ''}`}>
                  <td className="p-3">
                    <div className="font-medium">{p.nome}</div>
                    <div className="text-[11px] text-muted-foreground">{p.cargo}</div>
                  </td>
                  <td className="p-3 text-xs">
                    <span className="inline-block px-2 py-0.5 bg-secondary text-secondary-foreground text-[10px] font-mono uppercase">{p.senioridade}</span>
                  </td>
                  <td className="p-3">
                    <div className="flex flex-wrap gap-1">
                      {p.skills?.slice(0, 6).map((s) => (
                        <span key={s} className="text-[10px] font-mono px-1.5 py-0.5 border border-foreground">{s}</span>
                      ))}
                      {(p.skills?.length ?? 0) > 6 && <span className="text-[10px] text-muted-foreground">+{p.skills.length - 6}</span>}
                    </div>
                    {p.frameworks?.length ? (
                      <div className="text-[10px] text-muted-foreground mt-1">Frameworks: {p.frameworks.join(', ')}</div>
                    ) : null}
                  </td>
                  <td className="p-3">
                    <div className="flex flex-wrap gap-1">
                      {p.certificacoes?.map((c) => (
                        <span key={c} className="text-[10px] font-mono px-1.5 py-0.5 bg-accent/30 border border-accent inline-flex items-center gap-1">
                          <BadgeCheck className="h-3 w-3" />{c}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="p-3 font-mono text-xs">{p.custo_hora ? formatBRL(p.custo_hora) : '—'}</td>
                  <td className="p-3 text-xs">{p.disponibilidade_pct}%</td>
                  <td className="p-3 text-right">
                    <Button size="sm" variant="ghost" onClick={() => { setForm({
                      ...p,
                      skills: (p.skills ?? []).join(', ') as any,
                      certificacoes: (p.certificacoes ?? []).join(', ') as any,
                      frameworks: (p.frameworks ?? []).join(', ') as any,
                    }); setOpen(true); }}><Pencil className="h-3.5 w-3.5" /></Button>
                    <Button size="sm" variant="ghost" onClick={() => remove(p.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>{form.id ? 'Editar perfil' : 'Novo perfil'}</DialogTitle></DialogHeader>
          <div className="grid md:grid-cols-2 gap-3">
            <div><Label>Nome</Label><Input value={form.nome ?? ''} onChange={(e) => setForm({ ...form, nome: e.target.value })} /></div>
            <div><Label>Cargo</Label><Input value={form.cargo ?? ''} onChange={(e) => setForm({ ...form, cargo: e.target.value })} placeholder="Dev Backend, Arquiteto Cloud..." /></div>
            <div>
              <Label>Senioridade</Label>
              <Select value={form.senioridade ?? 'pleno'} onValueChange={(v) => setForm({ ...form, senioridade: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="junior">Júnior</SelectItem>
                  <SelectItem value="pleno">Pleno</SelectItem>
                  <SelectItem value="senior">Sênior</SelectItem>
                  <SelectItem value="especialista">Especialista</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div><Label>Custo/hora (R$)</Label><Input type="number" value={(form.custo_hora as any) ?? ''} onChange={(e) => setForm({ ...form, custo_hora: e.target.value as any })} /></div>
            <div><Label>Disponibilidade (%)</Label><Input type="number" min={0} max={100} value={form.disponibilidade_pct ?? 100} onChange={(e) => setForm({ ...form, disponibilidade_pct: Number(e.target.value) })} /></div>
            <div className="flex items-center gap-2 pt-6">
              <Switch checked={!!form.ativo} onCheckedChange={(v) => setForm({ ...form, ativo: v })} />
              <Label>Ativo no quadro</Label>
            </div>
            <div className="md:col-span-2">
              <Label>Skills (vírgula)</Label>
              <Input value={form.skills as any ?? ''} onChange={(e) => setForm({ ...form, skills: e.target.value as any })} placeholder="Java, Spring, Kubernetes, SQL, ServiceNow, InvGate..." />
            </div>
            <div className="md:col-span-2">
              <Label>Certificações (vírgula)</Label>
              <Input value={form.certificacoes as any ?? ''} onChange={(e) => setForm({ ...form, certificacoes: e.target.value as any })} placeholder="ITIL v4, PMP, AWS SA, Scrum, CKA..." />
            </div>
            <div className="md:col-span-2">
              <Label>Frameworks/Metodologias (vírgula)</Label>
              <Input value={form.frameworks as any ?? ''} onChange={(e) => setForm({ ...form, frameworks: e.target.value as any })} placeholder="Scrum, SAFe, ITIL, DevOps..." />
            </div>
            <div className="md:col-span-2"><Label>Observações</Label><Textarea rows={2} value={form.observacoes ?? ''} onChange={(e) => setForm({ ...form, observacoes: e.target.value })} /></div>
          </div>
          <DialogFooter><Button onClick={submit}>Salvar</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
