import { useEffect, useState } from 'react';
import { Plus, Trash2, Pencil, Award } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { deleteAtestado, listarAtestados, upsertAtestado } from '../api';
import type { Atestado } from '../types';
import { KPI, PageHeader, formatBRL, formatDate } from '../ui';

const empty: Partial<Atestado> = { titulo: '', cliente: '', tipo_servico: '', descricao: '', valor_contrato: 0, vigente: true, tags: [] };

export const AtestadosPage = () => {
  const [rows, setRows] = useState<Atestado[]>([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<Partial<Atestado>>(empty);

  const load = () => listarAtestados().then(setRows);
  useEffect(() => { load(); }, []);

  const submit = async () => {
    if (!form.titulo || !form.cliente || !form.tipo_servico) {
      toast.error('Preencha título, cliente e tipo de serviço.'); return;
    }
    try {
      await upsertAtestado({
        ...form,
        valor_contrato: form.valor_contrato ? Number(form.valor_contrato) : undefined,
        tags: typeof (form.tags as any) === 'string' ? String(form.tags).split(',').map((s) => s.trim()).filter(Boolean) : form.tags,
      });
      toast.success(form.id ? 'Atestado atualizado' : 'Atestado cadastrado');
      setOpen(false); setForm(empty); load();
    } catch (e: any) { toast.error('Erro', { description: e?.message }); }
  };

  const remove = async (id: string) => {
    if (!confirm('Excluir este atestado?')) return;
    await deleteAtestado(id); toast.success('Excluído'); load();
  };

  const vigentes = rows.filter((a) => a.vigente).length;
  const valor = rows.reduce((s, a) => s + Number(a.valor_contrato ?? 0), 0);

  return (
    <>
      <PageHeader
        eyebrow="Capacidade técnica"
        title="Atestados (CAT)"
        subtitle="Cadastre os Atestados de Capacidade Técnica por tipo de serviço/solução. A IA usa essa base ao avaliar aderência das licitações."
        actions={<Button onClick={() => { setForm(empty); setOpen(true); }}><Plus className="h-4 w-4 mr-1" />Novo atestado</Button>}
      />
      <div className="px-6 lg:px-8 py-6 space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
          <KPI label="Atestados" value={rows.length} accent="primary" />
          <KPI label="Vigentes" value={vigentes} accent="success" />
          <KPI label="Volume comprovado" value={formatBRL(valor)} accent="accent" />
        </div>

        <div className="border-2 border-foreground bg-card shadow-brutal-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/60 border-b-2 border-foreground">
              <tr className="text-[10px] font-mono uppercase tracking-widest">
                <th className="text-left p-3">Título</th>
                <th className="text-left p-3">Cliente</th>
                <th className="text-left p-3">Tipo de serviço</th>
                <th className="text-left p-3">Valor</th>
                <th className="text-left p-3">Vigência</th>
                <th className="text-right p-3">Ações</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 && <tr><td colSpan={6} className="p-8 text-center text-muted-foreground"><Award className="h-5 w-5 inline mr-2" />Nenhum atestado cadastrado.</td></tr>}
              {rows.map((a) => (
                <tr key={a.id} className="border-b border-border hover:bg-muted/30">
                  <td className="p-3">
                    <div className="font-medium">{a.titulo}</div>
                    <div className="text-[11px] text-muted-foreground line-clamp-1">{a.descricao}</div>
                  </td>
                  <td className="p-3 text-xs">{a.cliente}</td>
                  <td className="p-3 text-xs">{a.tipo_servico}</td>
                  <td className="p-3 font-mono text-xs">{formatBRL(a.valor_contrato)}</td>
                  <td className="p-3 text-xs">
                    {a.vigente ? <span className="text-success font-bold">VIGENTE</span> : 'Encerrado'}
                    <div className="text-[10px] text-muted-foreground">{formatDate(a.data_inicio)} → {formatDate(a.data_fim)}</div>
                  </td>
                  <td className="p-3 text-right">
                    <Button size="sm" variant="ghost" onClick={() => { setForm({ ...a, tags: a.tags?.join(', ') as any }); setOpen(true); }}><Pencil className="h-3.5 w-3.5" /></Button>
                    <Button size="sm" variant="ghost" onClick={() => remove(a.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>{form.id ? 'Editar atestado' : 'Novo atestado de capacidade técnica'}</DialogTitle></DialogHeader>
          <div className="grid md:grid-cols-2 gap-3">
            <div className="md:col-span-2">
              <Label>Título</Label>
              <Input value={form.titulo ?? ''} onChange={(e) => setForm({ ...form, titulo: e.target.value })} placeholder="ex: Sustentação de sistemas — Ministério X" />
            </div>
            <div><Label>Cliente</Label><Input value={form.cliente ?? ''} onChange={(e) => setForm({ ...form, cliente: e.target.value })} /></div>
            <div><Label>Tipo de serviço/solução</Label><Input value={form.tipo_servico ?? ''} onChange={(e) => setForm({ ...form, tipo_servico: e.target.value })} placeholder="ITSM, Fábrica, Sustentação..." /></div>
            <div><Label>Valor do contrato (R$)</Label><Input type="number" value={form.valor_contrato ?? ''} onChange={(e) => setForm({ ...form, valor_contrato: Number(e.target.value) })} /></div>
            <div><Label>Tags (separe por vírgula)</Label><Input value={form.tags as any ?? ''} onChange={(e) => setForm({ ...form, tags: e.target.value as any })} placeholder="itil, n2, 750..." /></div>
            <div><Label>Início</Label><Input type="date" value={form.data_inicio ?? ''} onChange={(e) => setForm({ ...form, data_inicio: e.target.value })} /></div>
            <div><Label>Fim</Label><Input type="date" value={form.data_fim ?? ''} onChange={(e) => setForm({ ...form, data_fim: e.target.value })} /></div>
            <div className="md:col-span-2"><Label>Descrição</Label><Textarea rows={3} value={form.descricao ?? ''} onChange={(e) => setForm({ ...form, descricao: e.target.value })} /></div>
            <div className="md:col-span-2 flex items-center gap-2">
              <Switch checked={!!form.vigente} onCheckedChange={(v) => setForm({ ...form, vigente: v })} />
              <Label>Contrato vigente</Label>
            </div>
          </div>
          <DialogFooter><Button onClick={submit}>Salvar</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
