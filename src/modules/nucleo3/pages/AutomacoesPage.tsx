import { useEffect, useState } from "react";
import { Plus, Trash2, Workflow, Save } from "lucide-react";
import { toast } from "sonner";
import { PageHeader, KPI } from "@/modules/licitacoes/ui";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { listarAutomacoes, upsertAutomacao, deletarAutomacao, type Automacao } from "../store";

const TRIGGERS: { value: Automacao["trigger"]; label: string }[] = [
  { value: "edital_aprovado", label: "Edital aprovado (REQ-10)" },
  { value: "projeto_criado", label: "Projeto criado no Núcleo 01" },
  { value: "capacidade_critica", label: "Capacidade crítica detectada" },
  { value: "manual", label: "Disparo manual" },
];

export const AutomacoesPage = () => {
  const [items, setItems] = useState<Automacao[]>([]);
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<Partial<Automacao>>({ trigger: "manual", ativo: true });

  const reload = () => setItems(listarAutomacoes());
  useEffect(reload, []);

  const save = () => {
    if (!draft.nome?.trim()) { toast.error("Informe um nome"); return; }
    if (!draft.acao?.trim()) { toast.error("Descreva a ação"); return; }
    upsertAutomacao(draft);
    setOpen(false);
    setDraft({ trigger: "manual", ativo: true });
    reload();
    toast.success("Automação salva");
  };

  const remove = (id: string) => {
    deletarAutomacao(id);
    reload();
    toast.success("Automação removida");
  };

  const toggle = (a: Automacao) => {
    upsertAutomacao({ ...a, ativo: !a.ativo });
    reload();
  };

  const ativos = items.filter((i) => i.ativo).length;

  return (
    <>
      <PageHeader
        eyebrow="Núcleo 03 • Catálogo"
        title="Automações"
        subtitle="Gatilhos operacionais que conectam os núcleos. Persistidos localmente nesta etapa."
        actions={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button size="sm"><Plus className="h-3.5 w-3.5 mr-1" />Nova automação</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle className="font-display">Nova automação</DialogTitle></DialogHeader>
              <div className="space-y-3">
                <div>
                  <Label className="text-[10px] font-mono uppercase">Nome</Label>
                  <Input value={draft.nome ?? ""} onChange={(e) => setDraft({ ...draft, nome: e.target.value })} />
                </div>
                <div>
                  <Label className="text-[10px] font-mono uppercase">Gatilho</Label>
                  <Select value={draft.trigger} onValueChange={(v) => setDraft({ ...draft, trigger: v as Automacao["trigger"] })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {TRIGGERS.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-[10px] font-mono uppercase">Ação</Label>
                  <Textarea rows={3} value={draft.acao ?? ""} onChange={(e) => setDraft({ ...draft, acao: e.target.value })} placeholder="ex: notificar comercial e criar projeto rascunho" />
                </div>
                <div className="flex items-center gap-2">
                  <Switch checked={draft.ativo ?? true} onCheckedChange={(v) => setDraft({ ...draft, ativo: v })} id="at" />
                  <Label htmlFor="at" className="text-xs">Ativa ao criar</Label>
                </div>
                <div className="flex justify-end">
                  <Button onClick={save}><Save className="h-3.5 w-3.5 mr-1" />Salvar</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        }
      />

      <div className="px-6 lg:px-8 py-6 space-y-6">
        <div className="grid grid-cols-3 gap-3">
          <KPI label="Total" value={items.length} />
          <KPI label="Ativas" value={ativos} accent="success" />
          <KPI label="Pausadas" value={items.length - ativos} accent="destructive" />
        </div>

        <div className="border-2 border-foreground bg-card shadow-brutal-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/60 border-b-2 border-foreground">
                <tr className="text-[10px] font-mono uppercase tracking-widest">
                  <th className="text-left p-3">Nome</th>
                  <th className="text-left p-3">Gatilho</th>
                  <th className="text-left p-3">Ação</th>
                  <th className="text-left p-3">Status</th>
                  <th className="text-right p-3">—</th>
                </tr>
              </thead>
              <tbody>
                {items.length === 0 && (
                  <tr><td colSpan={5} className="p-10 text-center text-muted-foreground">
                    <Workflow className="h-5 w-5 inline mr-2" />Nenhuma automação cadastrada.
                  </td></tr>
                )}
                {items.map((a) => (
                  <tr key={a.id} className="border-b border-border">
                    <td className="p-3 font-medium">{a.nome}</td>
                    <td className="p-3 text-xs"><span className="border-2 border-foreground px-1.5 py-0.5 font-mono text-[10px] uppercase">{a.trigger}</span></td>
                    <td className="p-3 text-xs text-muted-foreground max-w-md">{a.acao}</td>
                    <td className="p-3"><Switch checked={a.ativo} onCheckedChange={() => toggle(a)} /></td>
                    <td className="p-3 text-right">
                      <Button size="sm" variant="ghost" onClick={() => remove(a.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
};
