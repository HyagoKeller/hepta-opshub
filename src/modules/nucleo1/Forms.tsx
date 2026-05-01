import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useData, newId, resources, clientes, nucleos, squads } from "./DataStore";
import { labels } from "./mockData";
import type { Project, Delivery, Allocation } from "./types";
import type { Risk } from "./DataStore";
import { toast } from "@/hooks/use-toast";

const inputCls = "border-2 border-foreground rounded-none h-10";
const selectCls = "h-10 w-full border-2 border-foreground bg-background px-3 text-sm rounded-none";

const emptyProject = (): Project => ({
  id: newId("p"), codigo: "", nome: "", tipo: "cliente", status: "planejado",
  prioridade: "media", saude: "verde", clienteId: clientes[0].id, nucleoId: nucleos[0].id,
  gestorId: resources[0].id, inicio: new Date().toISOString().slice(0, 10),
  fim: new Date(Date.now() + 1000 * 60 * 60 * 24 * 90).toISOString().slice(0, 10),
  progresso: 0, orcamento: 0, consumido: 0, risco: "baixo",
});

export const ProjectFormDialog = ({
  open, onOpenChange, initial,
}: { open: boolean; onOpenChange: (v: boolean) => void; initial?: Project }) => {
  const { upsertProject } = useData();
  const [form, setForm] = useState<Project>(initial ?? emptyProject());

  useEffect(() => { if (open) setForm(initial ?? emptyProject()); }, [open, initial]);

  const set = <K extends keyof Project>(k: K, v: Project[K]) => setForm((f) => ({ ...f, [k]: v }));

  const save = () => {
    if (!form.nome.trim() || !form.codigo.trim()) {
      toast({ title: "Campos obrigatórios", description: "Código e nome são obrigatórios", variant: "destructive" });
      return;
    }
    upsertProject(form);
    toast({ title: initial ? "Projeto atualizado" : "Projeto cadastrado", description: form.nome });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl border-2 border-foreground rounded-none shadow-brutal-sm max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl">
            {initial ? "Editar projeto" : "Novo projeto"}
          </DialogTitle>
        </DialogHeader>

        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Código *">
            <Input className={inputCls} value={form.codigo} onChange={(e) => set("codigo", e.target.value)} placeholder="PJ-009" />
          </Field>
          <Field label="Nome *">
            <Input className={inputCls} value={form.nome} onChange={(e) => set("nome", e.target.value)} />
          </Field>

          <Field label="Tipo">
            <select className={selectCls} value={form.tipo} onChange={(e) => set("tipo", e.target.value as Project["tipo"])}>
              {Object.entries(labels.tipo).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
          </Field>
          <Field label="Status">
            <select className={selectCls} value={form.status} onChange={(e) => set("status", e.target.value as Project["status"])}>
              {Object.entries(labels.status).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
          </Field>

          <Field label="Prioridade">
            <select className={selectCls} value={form.prioridade} onChange={(e) => set("prioridade", e.target.value as Project["prioridade"])}>
              {Object.entries(labels.prioridade).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
          </Field>
          <Field label="Saúde">
            <select className={selectCls} value={form.saude} onChange={(e) => set("saude", e.target.value as Project["saude"])}>
              <option value="verde">Verde</option><option value="amarelo">Amarelo</option><option value="vermelho">Vermelho</option>
            </select>
          </Field>

          <Field label="Cliente">
            <select className={selectCls} value={form.clienteId} onChange={(e) => set("clienteId", e.target.value)}>
              {clientes.map((c) => <option key={c.id} value={c.id}>{c.nome}</option>)}
            </select>
          </Field>
          <Field label="Núcleo">
            <select className={selectCls} value={form.nucleoId} onChange={(e) => set("nucleoId", e.target.value)}>
              {nucleos.map((n) => <option key={n.id} value={n.id}>{n.nome}</option>)}
            </select>
          </Field>

          <Field label="Gestor">
            <select className={selectCls} value={form.gestorId} onChange={(e) => set("gestorId", e.target.value)}>
              {resources.map((r) => <option key={r.id} value={r.id}>{r.nome}</option>)}
            </select>
          </Field>
          <Field label="Sponsor">
            <select className={selectCls} value={form.sponsorId ?? ""} onChange={(e) => set("sponsorId", e.target.value || undefined)}>
              <option value="">—</option>
              {resources.map((r) => <option key={r.id} value={r.id}>{r.nome}</option>)}
            </select>
          </Field>

          <Field label="Squad">
            <select className={selectCls} value={form.squadId ?? ""} onChange={(e) => set("squadId", e.target.value || undefined)}>
              <option value="">—</option>
              {squads.map((s) => <option key={s.id} value={s.id}>{s.nome}</option>)}
            </select>
          </Field>
          <Field label="Risco">
            <select className={selectCls} value={form.risco} onChange={(e) => set("risco", e.target.value as Project["risco"])}>
              <option value="baixo">Baixo</option><option value="medio">Médio</option><option value="alto">Alto</option>
            </select>
          </Field>

          <Field label="Início"><Input type="date" className={inputCls} value={form.inicio} onChange={(e) => set("inicio", e.target.value)} /></Field>
          <Field label="Fim"><Input type="date" className={inputCls} value={form.fim} onChange={(e) => set("fim", e.target.value)} /></Field>

          <Field label="Orçamento (R$)">
            <Input type="number" className={inputCls} value={form.orcamento} onChange={(e) => set("orcamento", Number(e.target.value))} />
          </Field>
          <Field label="Consumido (R$)">
            <Input type="number" className={inputCls} value={form.consumido} onChange={(e) => set("consumido", Number(e.target.value))} />
          </Field>

          <Field label="Progresso (%)">
            <Input type="number" min={0} max={100} className={inputCls} value={form.progresso} onChange={(e) => set("progresso", Number(e.target.value))} />
          </Field>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button variant="primary" onClick={save}>{initial ? "Salvar alterações" : "Cadastrar projeto"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export const DeliveryFormDialog = ({
  open, onOpenChange, projectId, initial,
}: { open: boolean; onOpenChange: (v: boolean) => void; projectId: string; initial?: Delivery }) => {
  const { upsertDelivery } = useData();
  const [form, setForm] = useState<Delivery>(initial ?? {
    id: newId("d"), projectId, nome: "", data: new Date().toISOString().slice(0, 10),
    status: "planejada", tipo: "entrega",
  });
  useEffect(() => {
    if (open) setForm(initial ?? { id: newId("d"), projectId, nome: "", data: new Date().toISOString().slice(0, 10), status: "planejada", tipo: "entrega" });
  }, [open, initial, projectId]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border-2 border-foreground rounded-none shadow-brutal-sm">
        <DialogHeader><DialogTitle className="font-display text-xl">{initial ? "Editar entrega" : "Nova entrega"}</DialogTitle></DialogHeader>
        <div className="grid gap-4">
          <Field label="Nome *">
            <Input className={inputCls} value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Data"><Input type="date" className={inputCls} value={form.data} onChange={(e) => setForm({ ...form, data: e.target.value })} /></Field>
            <Field label="Tipo">
              <select className={selectCls} value={form.tipo} onChange={(e) => setForm({ ...form, tipo: e.target.value as Delivery["tipo"] })}>
                <option value="marco">Marco</option><option value="entrega">Entrega</option><option value="contratual">Contratual</option>
              </select>
            </Field>
          </div>
          <Field label="Status">
            <select className={selectCls} value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as Delivery["status"] })}>
              <option value="planejada">Planejada</option><option value="em_andamento">Em andamento</option>
              <option value="concluida">Concluída</option><option value="atrasada">Atrasada</option>
            </select>
          </Field>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button variant="primary" onClick={() => {
            if (!form.nome.trim()) return toast({ title: "Nome é obrigatório", variant: "destructive" });
            upsertDelivery(form);
            toast({ title: initial ? "Entrega atualizada" : "Entrega criada" });
            onOpenChange(false);
          }}>Salvar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export const RiskFormDialog = ({
  open, onOpenChange, projectId, initial,
}: { open: boolean; onOpenChange: (v: boolean) => void; projectId: string; initial?: Risk }) => {
  const { upsertRisk } = useData();
  const [form, setForm] = useState<Risk>(initial ?? {
    id: newId("rk"), projectId, titulo: "", severidade: "medio",
    status: "aberto", mitigacao: "", criadoEm: new Date().toISOString().slice(0, 10),
  });
  useEffect(() => {
    if (open) setForm(initial ?? { id: newId("rk"), projectId, titulo: "", severidade: "medio", status: "aberto", mitigacao: "", criadoEm: new Date().toISOString().slice(0, 10) });
  }, [open, initial, projectId]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border-2 border-foreground rounded-none shadow-brutal-sm">
        <DialogHeader><DialogTitle className="font-display text-xl">{initial ? "Editar risco" : "Novo risco"}</DialogTitle></DialogHeader>
        <div className="grid gap-4">
          <Field label="Título *">
            <Input className={inputCls} value={form.titulo} onChange={(e) => setForm({ ...form, titulo: e.target.value })} />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Severidade">
              <select className={selectCls} value={form.severidade} onChange={(e) => setForm({ ...form, severidade: e.target.value as Risk["severidade"] })}>
                <option value="baixo">Baixo</option><option value="medio">Médio</option><option value="alto">Alto</option>
              </select>
            </Field>
            <Field label="Status">
              <select className={selectCls} value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as Risk["status"] })}>
                <option value="aberto">Aberto</option><option value="monitorado">Monitorado</option>
                <option value="mitigado">Mitigado</option><option value="fechado">Fechado</option>
              </select>
            </Field>
          </div>
          <Field label="Plano de mitigação">
            <Textarea className="border-2 border-foreground rounded-none" value={form.mitigacao} onChange={(e) => setForm({ ...form, mitigacao: e.target.value })} rows={3} />
          </Field>
          <Field label="Responsável">
            <select className={selectCls} value={form.responsavelId ?? ""} onChange={(e) => setForm({ ...form, responsavelId: e.target.value || undefined })}>
              <option value="">—</option>
              {resources.map((r) => <option key={r.id} value={r.id}>{r.nome}</option>)}
            </select>
          </Field>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button variant="primary" onClick={() => {
            if (!form.titulo.trim()) return toast({ title: "Título é obrigatório", variant: "destructive" });
            upsertRisk(form);
            toast({ title: initial ? "Risco atualizado" : "Risco registrado" });
            onOpenChange(false);
          }}>Salvar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export const AllocationFormDialog = ({
  open, onOpenChange, projectId, initial,
}: { open: boolean; onOpenChange: (v: boolean) => void; projectId: string; initial?: Allocation }) => {
  const { upsertAllocation, projects } = useData();
  const proj = projects.find((p) => p.id === projectId);
  const [form, setForm] = useState<Allocation>(initial ?? {
    id: newId("a"), resourceId: resources[0].id, projectId,
    percentual: 50, inicio: proj?.inicio ?? new Date().toISOString().slice(0, 10),
    fim: proj?.fim ?? new Date().toISOString().slice(0, 10),
  });
  useEffect(() => {
    if (open) setForm(initial ?? {
      id: newId("a"), resourceId: resources[0].id, projectId,
      percentual: 50, inicio: proj?.inicio ?? new Date().toISOString().slice(0, 10),
      fim: proj?.fim ?? new Date().toISOString().slice(0, 10),
    });
  }, [open, initial, projectId, proj?.inicio, proj?.fim]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border-2 border-foreground rounded-none shadow-brutal-sm">
        <DialogHeader><DialogTitle className="font-display text-xl">{initial ? "Editar alocação" : "Alocar colaborador"}</DialogTitle></DialogHeader>
        <div className="grid gap-4">
          <Field label="Colaborador">
            <select className={selectCls} value={form.resourceId} onChange={(e) => setForm({ ...form, resourceId: e.target.value })}>
              {resources.map((r) => <option key={r.id} value={r.id}>{r.nome} — {r.papel}</option>)}
            </select>
          </Field>
          <Field label="Percentual de alocação (%)">
            <Input type="number" min={1} max={100} className={inputCls} value={form.percentual} onChange={(e) => setForm({ ...form, percentual: Number(e.target.value) })} />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Início"><Input type="date" className={inputCls} value={form.inicio} onChange={(e) => setForm({ ...form, inicio: e.target.value })} /></Field>
            <Field label="Fim"><Input type="date" className={inputCls} value={form.fim} onChange={(e) => setForm({ ...form, fim: e.target.value })} /></Field>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button variant="primary" onClick={() => {
            upsertAllocation(form);
            toast({ title: initial ? "Alocação atualizada" : "Colaborador alocado" });
            onOpenChange(false);
          }}>Salvar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div className="space-y-1.5">
    <Label className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">{label}</Label>
    {children}
  </div>
);
