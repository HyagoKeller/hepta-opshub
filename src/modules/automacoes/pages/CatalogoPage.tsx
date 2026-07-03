import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Filter as FilterIcon, RefreshCw, Loader2, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { listAutomacoes } from '../api';
import type { Automacao, AutomacaoEstagio, AutomacaoTipo, Complexidade, Risco } from '../types';
import { ESTAGIOS, calcConfianca, calcROI } from '../types';
import {
  PageHeader, TipoBadge, EstagioBadge, ComplexidadeBadge, RiscoBadge, ConfiancaBadge,
  AvatarInline, formatBRL,
} from '../ui';

const NUCLEOS = [
  { id: 'nucleo1', label: 'Projetos & Squads' },
  { id: 'nucleo2', label: 'Licitações' },
  { id: 'nucleo3', label: 'Governança' },
];

export const CatalogoPage = () => {
  const [items, setItems] = useState<Automacao[]>([]);
  const [loading, setLoading] = useState(true);

  const [q, setQ] = useState('');
  const [tipo, setTipo] = useState<'ALL' | AutomacaoTipo>('ALL');
  const [estagio, setEstagio] = useState<'ALL' | AutomacaoEstagio>('ALL');
  const [nucleo, setNucleo] = useState<'ALL' | string>('ALL');
  const [complexidade, setComplexidade] = useState<'ALL' | Complexidade>('ALL');
  const [risco, setRisco] = useState<'ALL' | Risco>('ALL');

  const load = async () => {
    setLoading(true);
    try { setItems(await listAutomacoes()); }
    catch (e: any) { toast.error('Falha ao carregar', { description: e?.message }); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const filtrados = useMemo(() => items.filter((a) => {
    if (q && !`${a.nome} ${a.descricao ?? ''} ${a.tags.join(' ')}`.toLowerCase().includes(q.toLowerCase())) return false;
    if (tipo !== 'ALL' && a.tipo !== tipo) return false;
    if (estagio !== 'ALL' && a.estagio !== estagio) return false;
    if (nucleo !== 'ALL' && a.nucleo_origem_id !== nucleo) return false;
    if (complexidade !== 'ALL' && a.complexidade !== complexidade) return false;
    if (risco !== 'ALL' && a.risco !== risco) return false;
    return true;
  }), [items, q, tipo, estagio, nucleo, complexidade, risco]);

  const clearFilters = () => {
    setQ(''); setTipo('ALL'); setEstagio('ALL'); setNucleo('ALL'); setComplexidade('ALL'); setRisco('ALL');
  };

  return (
    <>
      <PageHeader
        eyebrow="Núcleo 03 · Catálogo"
        title="Catálogo de Automações"
        subtitle="Lista completa dos ativos com filtros por tipo, estágio, núcleo, complexidade e risco."
        actions={
          <Button variant="outline" size="sm" onClick={load} disabled={loading}>
            {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
            <span className="ml-1.5">Atualizar</span>
          </Button>
        }
      />

      <div className="px-6 lg:px-8 py-6 space-y-4">
        {/* Filtros */}
        <div className="border-2 border-foreground bg-card shadow-brutal-sm p-4">
          <div className="flex items-center gap-2 mb-3">
            <FilterIcon className="h-4 w-4" />
            <span className="font-display text-sm">Filtros</span>
            <span className="ml-auto text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
              {filtrados.length} de {items.length} exibidos
            </span>
            <Button variant="ghost" size="sm" onClick={clearFilters}>Limpar</Button>
          </div>
          <div className="grid md:grid-cols-3 lg:grid-cols-6 gap-3">
            <div className="lg:col-span-2 relative">
              <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar por nome, tag ou descrição" className="pl-9" />
            </div>
            <Select value={tipo} onValueChange={(v) => setTipo(v as any)}>
              <SelectTrigger><SelectValue placeholder="Tipo" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Todos os tipos</SelectItem>
                <SelectItem value="no_code">no-code</SelectItem>
                <SelectItem value="low_code">low-code</SelectItem>
                <SelectItem value="code">code</SelectItem>
              </SelectContent>
            </Select>
            <Select value={estagio} onValueChange={(v) => setEstagio(v as any)}>
              <SelectTrigger><SelectValue placeholder="Estágio" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Todos os estágios</SelectItem>
                {ESTAGIOS.map((e) => <SelectItem key={e.id} value={e.id}>{e.label}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={nucleo} onValueChange={(v) => setNucleo(v)}>
              <SelectTrigger><SelectValue placeholder="Núcleo" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Todos os núcleos</SelectItem>
                {NUCLEOS.map((n) => <SelectItem key={n.id} value={n.id}>{n.label}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={complexidade} onValueChange={(v) => setComplexidade(v as any)}>
              <SelectTrigger><SelectValue placeholder="Complexidade" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Toda complexidade</SelectItem>
                <SelectItem value="baixa">Baixa</SelectItem>
                <SelectItem value="media">Média</SelectItem>
                <SelectItem value="alta">Alta</SelectItem>
              </SelectContent>
            </Select>
            <Select value={risco} onValueChange={(v) => setRisco(v as any)}>
              <SelectTrigger><SelectValue placeholder="Risco" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Todo risco</SelectItem>
                <SelectItem value="baixo">Baixo</SelectItem>
                <SelectItem value="medio">Médio</SelectItem>
                <SelectItem value="alto">Alto</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Tabela */}
        <div className="border-2 border-foreground bg-card shadow-brutal-sm overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-foreground text-background">
              <tr>
                <th className="text-left p-3">Automação</th>
                <th className="text-left p-3 font-mono text-[10px] uppercase tracking-widest">Tipo</th>
                <th className="text-left p-3 font-mono text-[10px] uppercase tracking-widest">Estágio</th>
                <th className="text-left p-3 font-mono text-[10px] uppercase tracking-widest">Confiança</th>
                <th className="text-right p-3 font-mono text-[10px] uppercase tracking-widest">Economia</th>
                <th className="text-right p-3 font-mono text-[10px] uppercase tracking-widest">ROI</th>
                <th className="p-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y-2 divide-foreground">
              {loading && Array.from({ length: 6 }).map((_, i) => (
                <tr key={i}><td colSpan={7} className="p-3"><Skeleton className="h-8" /></td></tr>
              ))}
              {!loading && filtrados.length === 0 && (
                <tr><td colSpan={7} className="p-8 text-center text-sm text-muted-foreground">
                  Nenhuma automação encontrada para os filtros atuais.
                </td></tr>
              )}
              {!loading && filtrados.map((a) => {
                const roi = calcROI(a);
                return (
                  <tr key={a.id} className="hover:bg-muted/30">
                    <td className="p-3">
                      <div className="flex items-center gap-3">
                        <AvatarInline nome={a.responsavel_nome} />
                        <div className="min-w-0">
                          <Link to={`/app/automacoes/${a.id}`} className="font-bold hover:underline line-clamp-1">{a.nome}</Link>
                          <div className="text-[11px] text-muted-foreground line-clamp-1">{a.descricao}</div>
                          <div className="flex flex-wrap gap-1 mt-1">
                            <ComplexidadeBadge c={a.complexidade} />
                            <RiscoBadge r={a.risco} />
                            {a.reusavel && (
                              <span className="text-[10px] font-bold px-1.5 py-0.5 bg-info text-info-foreground border-2 border-foreground uppercase tracking-widest">
                                Reusável
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="p-3"><TipoBadge t={a.tipo} /></td>
                    <td className="p-3"><EstagioBadge e={a.estagio} /></td>
                    <td className="p-3"><ConfiancaBadge c={calcConfianca(a)} /></td>
                    <td className="p-3 text-right font-mono">
                      <div className="text-sm">{formatBRL(a.economia_realizada ?? a.economia_estimada)}</div>
                      <div className="text-[10px] text-muted-foreground">{a.economia_realizada ? 'realizada' : 'estimada'}</div>
                    </td>
                    <td className="p-3 text-right font-mono">
                      {roi == null ? '—' : roi === Infinity ? '∞' : `${roi}%`}
                    </td>
                    <td className="p-3 text-right">
                      <Button asChild size="sm" variant="outline"><Link to={`/app/automacoes/${a.id}`}><ChevronRight className="h-3.5 w-3.5" /></Link></Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};
