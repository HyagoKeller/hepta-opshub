import { useEffect, useMemo, useState, DragEvent } from 'react';
import { Link } from 'react-router-dom';
import { GripVertical, ArrowRight, RefreshCw, Loader2, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { listAutomacoes, moverEstagio } from '../api';
import { ESTAGIOS, estagioIndex, calcConfianca } from '../types';
import type { Automacao, AutomacaoEstagio } from '../types';
import {
  PageHeader, TipoBadge, ComplexidadeBadge, RiscoBadge, ConfiancaBadge, AvatarInline,
} from '../ui';
import { cn } from '@/lib/utils';

export const EsteiraPage = () => {
  const [items, setItems] = useState<Automacao[]>([]);
  const [loading, setLoading] = useState(true);
  const [dragOver, setDragOver] = useState<AutomacaoEstagio | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    try { setItems(await listAutomacoes()); }
    catch (e: any) { toast.error('Falha ao carregar', { description: e?.message }); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const grouped = useMemo(() => {
    const m: Record<AutomacaoEstagio, Automacao[]> = {
      ideia: [], oportunidade: [], viabilidade: [], poc: [], piloto: [], produto_interno: [], oferta_cliente: [],
    };
    for (const a of items) m[a.estagio].push(a);
    return m;
  }, [items]);

  const mover = async (a: Automacao, novo: AutomacaoEstagio) => {
    if (a.estagio === novo) return;
    setSavingId(a.id);
    // otimista
    setItems((prev) => prev.map((x) => x.id === a.id ? { ...x, estagio: novo } : x));
    try {
      await moverEstagio(a.id, novo);
      toast.success(`"${a.nome.slice(0, 40)}…" movida para ${novo.replace('_', ' ')}`);
    } catch (e: any) {
      toast.error('Erro ao mover', { description: e?.message });
      // rollback
      setItems((prev) => prev.map((x) => x.id === a.id ? a : x));
    } finally { setSavingId(null); }
  };

  const onDragStart = (e: DragEvent<HTMLDivElement>, a: Automacao) => {
    e.dataTransfer.setData('text/plain', a.id);
    e.dataTransfer.effectAllowed = 'move';
  };
  const onDrop = (e: DragEvent<HTMLDivElement>, estagio: AutomacaoEstagio) => {
    e.preventDefault();
    setDragOver(null);
    const id = e.dataTransfer.getData('text/plain');
    const a = items.find((x) => x.id === id);
    if (a) mover(a, estagio);
  };

  return (
    <>
      <PageHeader
        eyebrow="Núcleo 03 · Esteira de maturidade"
        title="Kanban da Esteira"
        subtitle="Arraste os cards entre as colunas — cada mudança de estágio é registrada automaticamente no histórico."
        actions={
          <>
            <Button variant="outline" size="sm" onClick={load} disabled={loading}>
              {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
              <span className="ml-1.5">Atualizar</span>
            </Button>
            <Button asChild variant="ghost" size="sm">
              <Link to="/app/automacoes/catalogo"><Filter className="h-3.5 w-3.5 mr-1" />Ver como lista</Link>
            </Button>
          </>
        }
      />

      <div className="px-6 lg:px-8 py-6">
        <div className="overflow-x-auto pb-4">
          <div className="grid gap-3 min-w-[1400px]" style={{ gridTemplateColumns: 'repeat(7, minmax(0, 1fr))' }}>
            {ESTAGIOS.map((estg) => {
              const list = grouped[estg.id] ?? [];
              const isOver = dragOver === estg.id;
              return (
                <div
                  key={estg.id}
                  onDragOver={(e) => { e.preventDefault(); setDragOver(estg.id); }}
                  onDragLeave={() => setDragOver((c) => c === estg.id ? null : c)}
                  onDrop={(e) => onDrop(e, estg.id)}
                  className={cn(
                    'border-2 border-foreground bg-secondary/40 shadow-brutal-sm flex flex-col min-h-[60vh]',
                    isOver && 'bg-success/20 outline-2 outline-dashed outline-foreground',
                  )}
                >
                  <div className="p-3 border-b-2 border-foreground bg-card">
                    <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">{estg.short}</div>
                    <div className="flex items-baseline justify-between mt-0.5">
                      <div className="font-display text-sm">{estg.label}</div>
                      <div className="font-display text-lg leading-none">{list.length}</div>
                    </div>
                  </div>

                  <div className="flex-1 p-2 space-y-2 overflow-y-auto">
                    {loading && Array.from({ length: 2 }).map((_, i) => <Skeleton key={i} className="h-24" />)}
                    {!loading && list.length === 0 && (
                      <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground text-center py-6 border-2 border-dashed border-foreground/40">
                        Vazio
                      </div>
                    )}
                    {list.map((a) => {
                      const idx = estagioIndex(a.estagio);
                      const next = ESTAGIOS[idx + 1];
                      return (
                        <div
                          key={a.id}
                          draggable
                          onDragStart={(e) => onDragStart(e, a)}
                          className={cn(
                            'border-2 border-foreground bg-background p-2.5 shadow-brutal-sm cursor-grab active:cursor-grabbing hover:bg-muted/30',
                            savingId === a.id && 'opacity-60',
                          )}
                        >
                          <div className="flex items-start gap-1.5">
                            <GripVertical className="h-3.5 w-3.5 text-muted-foreground mt-0.5 shrink-0" />
                            <Link to={`/app/automacoes/${a.id}`} className="text-xs font-bold hover:underline line-clamp-2 flex-1">
                              {a.nome}
                            </Link>
                            <AvatarInline nome={a.responsavel_nome} />
                          </div>
                          <div className="flex flex-wrap gap-1 mt-2">
                            <TipoBadge t={a.tipo} />
                          </div>
                          <div className="flex flex-wrap gap-1 mt-1">
                            <ComplexidadeBadge c={a.complexidade} />
                            <RiscoBadge r={a.risco} />
                          </div>
                          <div className="mt-2"><ConfiancaBadge c={calcConfianca(a)} /></div>
                          {next && (
                            <button
                              onClick={() => mover(a, next.id)}
                              disabled={savingId === a.id}
                              className="mt-2 w-full flex items-center justify-center gap-1 text-[10px] font-bold uppercase tracking-widest border-2 border-foreground py-1 bg-background hover:bg-success hover:text-success-foreground transition-smooth"
                            >
                              Avançar para {next.label} <ArrowRight className="h-3 w-3" />
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
};
