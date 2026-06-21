import { useEffect, useState } from 'react';
import { Plus, Trash2, Pencil, Boxes } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { deleteSolucao, listarSolucoes, upsertSolucao } from '../api';
import type { Solucao } from '../types';
import { KPI, PageHeader } from '../ui';

const empty: Partial<Solucao> = { nome: '', categoria: '', fabricante: '', descricao: '', diferenciais: '', margem_estimada: 30, certificacoes: [], tags: [] };

export const SolucoesPage = () => {
  const [rows, setRows] = useState<Solucao[]>([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<Partial<Solucao>>(empty);

  const load = () => listarSolucoes().then(setRows);
  useEffect(() => { load(); }, []);

  const submit = async () => {
    if (!form.nome || !form.categoria) { toast.error('Preencha nome e categoria.'); return; }
    try {
      await upsertSolucao({
        ...form,
        margem_estimada: form.margem_estimada ? Number(form.margem_estimada) : undefined,
        tags: typeof (form.tags as any) === 'string' ? String(form.tags).split(',').map((s) => s.trim()).filter(Boolean) : form.tags,
        certificacoes: typeof (form.certificacoes as any) === 'string' ? String(form.certificacoes).split(',').map((s) => s.trim()).filter(Boolean) : form.certificacoes,
      });
      toast.success(form.id ? 'Solução atualizada' : 'Solução cadastrada');
      setOpen(false); setForm(empty); load();
    } catch (e: any) { toast.error('Erro', { description: e?.message }); }
  };

  const remove = async (id: string) => { if (!confirm('Excluir?')) return; await deleteSolucao(id); toast.success('Excluído'); load(); };

  return (
    <>
      <PageHeader
        eyebrow="Catálogo do parceiro"
        title="Soluções"
        subtitle="Soluções, ferramentas e fábricas que a Hepta trabalha (InvGate ITSM/ITAM, fábricas, sustentação, etc.)."
        actions={<Button onClick={() => { setForm(empty); setOpen(true); }}><Plus className="h-4 w-4 mr-1" />Nova solução</Button>}
      />
      <div className="px-6 lg:px-8 py-6 space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
          <KPI label="Soluções no catálogo" value={rows.length} accent="primary" />
          <KPI label="Fabricantes" value={new Set(rows.map((r) => r.fabricante).filter(Boolean)).size} accent="accent" />
          <KPI label="Margem média" value={`${rows.length ? Math.round(rows.reduce((s, r) => s + Number(r.margem_estimada ?? 0), 0) / rows.length) : 0}%`} accent="success" />
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
          {rows.length === 0 && <div className="text-muted-foreground"><Boxes className="h-5 w-5 inline mr-2" />Nenhuma solução cadastrada.</div>}
          {rows.map((s) => (
            <div key={s.id} className="border-2 border-foreground bg-card shadow-brutal-sm p-4">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">{s.categoria} {s.fabricante ? `• ${s.fabricante}` : ''}</div>
                  <div className="font-display text-lg">{s.nome}</div>
                </div>
                <div className="flex gap-1">
                  <Button size="sm" variant="ghost" onClick={() => { setForm({ ...s, tags: s.tags?.join(', ') as any, certificacoes: s.certificacoes?.join(', ') as any }); setOpen(true); }}><Pencil className="h-3.5 w-3.5" /></Button>
                  <Button size="sm" variant="ghost" onClick={() => remove(s.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                </div>
              </div>
              <p className="text-xs mt-2">{s.descricao}</p>
              {s.diferenciais && <p className="text-[11px] mt-2 text-muted-foreground"><b>Diferenciais:</b> {s.diferenciais}</p>}
              <div className="mt-3 flex items-center justify-between text-[11px]">
                <span className="font-mono">Margem ~{s.margem_estimada}%</span>
                <div className="flex flex-wrap gap-1 justify-end">
                  {s.tags?.slice(0, 4).map((t) => <span key={t} className="px-1.5 py-0.5 bg-muted border border-foreground text-[9px] uppercase">{t}</span>)}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>{form.id ? 'Editar solução' : 'Nova solução'}</DialogTitle></DialogHeader>
          <div className="grid md:grid-cols-2 gap-3">
            <div><Label>Nome</Label><Input value={form.nome ?? ''} onChange={(e) => setForm({ ...form, nome: e.target.value })} /></div>
            <div><Label>Categoria</Label><Input value={form.categoria ?? ''} onChange={(e) => setForm({ ...form, categoria: e.target.value })} placeholder="ITSM, ITAM, Fábrica..." /></div>
            <div><Label>Fabricante</Label><Input value={form.fabricante ?? ''} onChange={(e) => setForm({ ...form, fabricante: e.target.value })} /></div>
            <div><Label>Margem estimada (%)</Label><Input type="number" value={form.margem_estimada ?? ''} onChange={(e) => setForm({ ...form, margem_estimada: Number(e.target.value) })} /></div>
            <div className="md:col-span-2"><Label>Descrição</Label><Textarea rows={2} value={form.descricao ?? ''} onChange={(e) => setForm({ ...form, descricao: e.target.value })} /></div>
            <div className="md:col-span-2"><Label>Diferenciais</Label><Textarea rows={2} value={form.diferenciais ?? ''} onChange={(e) => setForm({ ...form, diferenciais: e.target.value })} /></div>
            <div><Label>Certificações (vírgula)</Label><Input value={form.certificacoes as any ?? ''} onChange={(e) => setForm({ ...form, certificacoes: e.target.value as any })} /></div>
            <div><Label>Tags (vírgula)</Label><Input value={form.tags as any ?? ''} onChange={(e) => setForm({ ...form, tags: e.target.value as any })} /></div>
          </div>
          <DialogFooter><Button onClick={submit}>Salvar</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
