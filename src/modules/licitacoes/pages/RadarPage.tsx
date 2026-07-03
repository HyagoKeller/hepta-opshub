import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Radar, RefreshCw, Loader2, Star, Sparkles, ExternalLink, Filter, Crown, Ban,
  CheckCircle2, ChevronRight, X, MapPin, Building, Calendar,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import {
  aprovarComoEstrategico, buscarLicitacoes, getCompanyProfile,
  salvarTriagem, toggleFavorito, triagemIA,
} from '../api';
import { registrarEvento } from '@/modules/nucleo3/store';
import type { PncpItem, TriagemResultado } from '../types';
import { KPI, NivelBadge, PageHeader, formatBRL, formatDate } from '../ui';

const MODALIDADES = [
  { id: 6, label: 'Pregão Eletrônico' },
  { id: 4, label: 'Concorrência' },
  { id: 8, label: 'Dispensa' },
  { id: 12, label: 'Credenciamento' },
];

const UFS = ['ALL','AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO'];

export const RadarPage = () => {
  const [items, setItems] = useState<PncpItem[]>([]);
  const [meta, setMeta] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  const [dias, setDias] = useState(7);
  const [palavra, setPalavra] = useState('');
  const [uf, setUf] = useState('ALL');
  const [filtroTI, setFiltroTI] = useState(true);
  const [valorMinimo, setValorMinimo] = useState(50000);
  const [incluirDescartados, setIncluirDescartados] = useState(false);
  const [modalidades, setModalidades] = useState<number[]>([6, 4]);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [blacklistExtra, setBlacklistExtra] = useState<string[]>([]);
  const intervalRef = useRef<number | null>(null);

  const [filtersOpen, setFiltersOpen] = useState(true);

  const [detailOpen, setDetailOpen] = useState(false);
  const [current, setCurrent] = useState<{ item: PncpItem; result?: TriagemResultado; loading: boolean } | null>(null);

  useEffect(() => {
    getCompanyProfile().then((cp) => {
      if (cp) {
        setValorMinimo(Number(cp.valor_minimo) || 50000);
        setBlacklistExtra(cp.blacklist_custom ?? []);
      }
    });
  }, []);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const d = await buscarLicitacoes({
        diasAtras: dias,
        palavraChave: palavra || undefined,
        uf: uf && uf !== 'ALL' ? uf : undefined,
        filtroTI, modalidades, valorMinimo, blacklistExtra, incluirDescartados,
      });
      setItems(d.items);
      setMeta(d.meta);
      setLastUpdate(new Date());
    } catch (e: any) {
      toast.error('Falha ao consultar PNCP', { description: e?.message });
    } finally { setLoading(false); }
  }, [dias, palavra, uf, filtroTI, modalidades, valorMinimo, blacklistExtra, incluirDescartados]);

  useEffect(() => { fetchData(); }, [fetchData]);
  useEffect(() => {
    if (!autoRefresh) { if (intervalRef.current) window.clearInterval(intervalRef.current); return; }
    intervalRef.current = window.setInterval(() => fetchData(), 60_000);
    return () => { if (intervalRef.current) window.clearInterval(intervalRef.current); };
  }, [autoRefresh, fetchData]);

  const toggleMod = (id: number) =>
    setModalidades((c) => c.includes(id) ? c.filter((m) => m !== id) : [...c, id]);

  const openDetail = (item: PncpItem) => {
    setCurrent({ item, loading: false });
    setDetailOpen(true);
  };

  const runTriagem = async (item: PncpItem) => {
    setCurrent({ item, loading: true });
    setDetailOpen(true);
    try {
      const r = await triagemIA(item);
      setCurrent({ item, result: r, loading: false });
      await salvarTriagem(item, r);
    } catch (e: any) {
      toast.error('Falha na triagem IA', { description: e?.message });
      setCurrent({ item, loading: false });
    }
  };

  const handleAprovarEstrategico = async () => {
    if (!current?.item || !current?.result) return;
    try {
      await aprovarComoEstrategico(current.item, current.result);
      registrarEvento({
        evento: 'edital.aprovado',
        origem: 'nucleo2',
        descricao: `Edital "${current.item.objeto.slice(0, 80)}" aprovado como Item Estratégico (score ${current.result.score_aderencia})`,
      });
      toast.success('🟢 Item Estratégico criado', { description: 'Enviado ao Núcleo de Transformação.' });
      setDetailOpen(false);
    } catch (e: any) { toast.error('Erro', { description: e?.message }); }
  };

  const handleFav = async (item: PncpItem) => {
    const added = await toggleFavorito(item);
    toast.success(added ? 'Adicionado aos favoritos' : 'Removido dos favoritos');
  };

  const valorTotal = items.reduce((s, i) => s + (i.valorEstimado ?? 0), 0);
  const candidatos = items.filter((i) => i.status !== 'discarded').length;
  const aderentesTI = useMemo(() => items.filter((i) => i.aderencia?.ti && i.status !== 'discarded').length, [items]);

  return (
    <>
      <PageHeader
        eyebrow="Radar em tempo real • PNCP gov.br"
        title="Radar de Licitações TI"
        subtitle="Purificação determinística → triagem semântica IA → match de execução contra o quadro real."
        actions={
          <>
            <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-widest">
              <span className={`h-2 w-2 rounded-full ${autoRefresh ? 'bg-success animate-pulse' : 'bg-muted'}`} />
              {autoRefresh ? 'LIVE' : 'PAUSADO'}
              <Switch checked={autoRefresh} onCheckedChange={setAutoRefresh} />
            </div>
            <Button variant="outline" size="sm" onClick={() => setFiltersOpen((s) => !s)}>
              <Filter className="h-3.5 w-3.5 mr-1" />Filtros
            </Button>
            <Button variant="outline" size="sm" onClick={fetchData} disabled={loading}>
              {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
              <span className="ml-1.5">Atualizar</span>
            </Button>
          </>
        }
      />

      <div className="px-6 lg:px-8 py-6">
        {/* KPIs topo */}
        <div className="grid grid-cols-2 lg:grid-cols-6 gap-3 mb-6">
          <KPI label="Candidatos" value={candidatos} accent="primary" sub="Pós-purificação" />
          <KPI label="Aderentes TI" value={aderentesTI} accent="accent" />
          <KPI label="Pipeline" value={formatBRL(valorTotal)} accent="info" />
          <KPI label="Descartados" value={meta?.descartados ?? 0} accent="destructive" sub={`BL:${meta?.descartados_blacklist ?? 0} • !TI:${meta?.descartados_fora_ti ?? 0} • $:${meta?.descartados_valor ?? 0}`} />
          <KPI label="Bruto" value={meta?.total_bruto ?? 0} sub={`Janela ${dias}d`} />
          <KPI label="Sync" value={lastUpdate ? lastUpdate.toLocaleTimeString('pt-BR') : '—'} accent="success" sub="Auto 60s" />
        </div>

        <div className="grid gap-6" style={{ gridTemplateColumns: filtersOpen ? 'minmax(0,1fr) 320px' : 'minmax(0,1fr)' }}>
          {/* Lista de cards */}
          <div className="space-y-3">
            {loading && items.length === 0 && (
              <div className="space-y-3">
                {[0,1,2,3].map((i) => <Skeleton key={i} className="h-32 border-2 border-foreground" />)}
              </div>
            )}
            {!loading && items.length === 0 && (
              <div className="border-2 border-dashed border-foreground p-12 text-center bg-card">
                <Radar className="h-8 w-8 inline text-muted-foreground" />
                <div className="mt-3 font-display text-lg">Nenhuma licitação para os filtros atuais</div>
                <div className="text-xs text-muted-foreground mt-1">Ajuste janela, valor mínimo ou desligue "Só TI".</div>
              </div>
            )}

            {items.map((it) => (
              <BidCard
                key={it.id}
                item={it}
                onOpen={() => openDetail(it)}
                onFav={() => handleFav(it)}
                onTriagem={() => runTriagem(it)}
              />
            ))}
          </div>

          {/* Painel de filtros lateral */}
          {filtersOpen && (
            <aside className="border-2 border-foreground bg-card shadow-brutal-sm p-4 h-fit sticky top-20 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2"><Filter className="h-4 w-4" /><span className="font-display text-sm">Filtros & Purificação</span></div>
                <button onClick={() => setFiltersOpen(false)} className="p-1 hover:bg-muted" aria-label="Fechar"><X className="h-3.5 w-3.5" /></button>
              </div>

              <div>
                <Label className="text-[10px] font-mono uppercase">Janela</Label>
                <Select value={String(dias)} onValueChange={(v) => setDias(Number(v))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">24h</SelectItem>
                    <SelectItem value="3">3 dias</SelectItem>
                    <SelectItem value="7">7 dias</SelectItem>
                    <SelectItem value="15">15 dias</SelectItem>
                    <SelectItem value="30">30 dias</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-[10px] font-mono uppercase">UF</Label>
                <Select value={uf} onValueChange={setUf}>
                  <SelectTrigger><SelectValue placeholder="Todas" /></SelectTrigger>
                  <SelectContent>{UFS.map((u) => <SelectItem key={u} value={u}>{u === 'ALL' ? 'Todas' : u}</SelectItem>)}</SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-[10px] font-mono uppercase">Valor mínimo (R$)</Label>
                <Input type="number" value={valorMinimo} onChange={(e) => setValorMinimo(Number(e.target.value))} />
              </div>

              <div>
                <Label className="text-[10px] font-mono uppercase">Palavra-chave no objeto</Label>
                <Input value={palavra} onChange={(e) => setPalavra(e.target.value)} placeholder="service desk, fábrica..." />
              </div>

              <div>
                <Label className="text-[10px] font-mono uppercase block mb-1.5">Modalidades</Label>
                <div className="flex flex-wrap gap-1.5">
                  {MODALIDADES.map((m) => (
                    <button key={m.id} onClick={() => toggleMod(m.id)}
                      className={cn(
                        'px-2 py-1 text-[10px] font-bold uppercase tracking-widest border-2 border-foreground',
                        modalidades.includes(m.id) ? 'bg-foreground text-background' : 'bg-background',
                      )}>
                      {m.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2 pt-2 border-t-2 border-border">
                <div className="flex items-center justify-between">
                  <Label htmlFor="ti" className="text-xs">Só TI</Label>
                  <Switch checked={filtroTI} onCheckedChange={setFiltroTI} id="ti" />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="desc" className="text-xs">Mostrar descartados</Label>
                  <Switch checked={incluirDescartados} onCheckedChange={setIncluirDescartados} id="desc" />
                </div>
              </div>
            </aside>
          )}
        </div>
      </div>

      {/* Detalhe / Triagem em Sheet lateral */}
      <Sheet open={detailOpen} onOpenChange={setDetailOpen}>
        <SheetContent side="right" className="w-full sm:max-w-2xl overflow-y-auto p-0">
          {current?.item && (
            <>
              <SheetHeader className="border-b-2 border-foreground p-5 bg-card sticky top-0 z-10">
                <SheetTitle className="font-display flex items-start gap-2 text-left">
                  <Sparkles className="h-5 w-5 mt-0.5 shrink-0" />
                  <span className="line-clamp-2">{current.item.objeto}</span>
                </SheetTitle>
                <div className="text-[11px] text-muted-foreground font-mono uppercase tracking-widest flex flex-wrap gap-3 mt-1">
                  <span><Building className="h-3 w-3 inline mr-1" />{current.item.orgao}</span>
                  {current.item.uf && <span><MapPin className="h-3 w-3 inline mr-1" />{current.item.uf}</span>}
                  <span>{formatBRL(current.item.valorEstimado)}</span>
                </div>
              </SheetHeader>
              <div className="p-5 space-y-4">
                {!current.result && !current.loading && (
                  <div className="border-2 border-dashed border-foreground p-6 text-center bg-card">
                    <div className="text-sm mb-3">Executar triagem IA para este edital?</div>
                    <Button onClick={() => runTriagem(current.item)}>
                      <Sparkles className="h-4 w-4 mr-1" />Rodar Triagem IA
                    </Button>
                  </div>
                )}
                {current.loading && (
                  <div className="py-12 text-center">
                    <Loader2 className="h-6 w-6 animate-spin inline mr-2" />
                    <div className="mt-2 text-xs text-muted-foreground">
                      Etapa 1: Validação semântica →<br/>
                      Etapa 2: Requisitos + atestados + execução + rentabilidade
                    </div>
                  </div>
                )}
                {current.result && (
                  <>
                    <TriagemResultView r={current.result} />
                    {(current.result.nivel === 'BID' || current.result.score_aderencia >= 80) && (
                      <div className="border-2 border-foreground bg-success/10 p-4 flex items-center justify-between gap-3">
                        <div>
                          <div className="font-display text-sm flex items-center gap-2"><Crown className="h-4 w-4" />Pronto para virar Item Estratégico</div>
                          <div className="text-xs text-muted-foreground">Aciona o Núcleo de Transformação.</div>
                        </div>
                        <Button onClick={handleAprovarEstrategico}><CheckCircle2 className="h-4 w-4 mr-1" />Aprovar</Button>
                      </div>
                    )}
                  </>
                )}
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </>
  );
};

const BidCard = ({ item, onOpen, onFav, onTriagem }: {
  item: PncpItem; onOpen: () => void; onFav: () => void; onTriagem: () => void;
}) => {
  const discarded = item.status === 'discarded';
  return (
    <div
      className={cn(
        'border-2 border-foreground bg-card shadow-brutal-sm p-4 hover:bg-muted/30 transition-smooth',
        discarded && 'opacity-60',
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-1">
            <span className="border-2 border-foreground px-1.5 py-0.5 bg-background">{item.modalidade}</span>
            {item.uf && <span><MapPin className="h-3 w-3 inline mr-0.5" />{item.uf}</span>}
            <span><Calendar className="h-3 w-3 inline mr-0.5" />{formatDate(item.dataPublicacao)}</span>
          </div>
          <button onClick={onOpen} className="text-left w-full">
            <div className="font-medium line-clamp-2 flex items-start gap-1.5 hover:underline">
              {discarded && <Ban className="h-4 w-4 text-destructive shrink-0 mt-0.5" />}
              {item.objeto}
            </div>
          </button>
          <div className="text-[11px] text-muted-foreground mt-1 truncate">
            <Building className="h-3 w-3 inline mr-1" />{item.orgao}{item.unidade ? ` • ${item.unidade}` : ''}
          </div>
          {discarded && item.motivos_descarte && (
            <div className="text-[10px] text-destructive mt-1 font-mono uppercase">
              Descartado: {item.motivos_descarte.join(' • ')}
            </div>
          )}
        </div>
        <div className="text-right shrink-0">
          <div className="font-display text-xl leading-none">{formatBRL(item.valorEstimado)}</div>
          <div className="text-[10px] font-mono uppercase text-muted-foreground mt-1">Estimado</div>
        </div>
      </div>

      <div className="flex items-center justify-between mt-3 pt-3 border-t border-border gap-2 flex-wrap">
        <div className="flex flex-wrap gap-1">
          {item.aderencia?.portaria750 && <span className="text-[9px] font-bold px-1.5 py-0.5 bg-info text-info-foreground border border-foreground">P-750</span>}
          {item.aderencia?.portaria1070 && <span className="text-[9px] font-bold px-1.5 py-0.5 bg-success text-success-foreground border border-foreground">P-1070</span>}
          {item.aderencia?.lei14133 && <span className="text-[9px] font-bold px-1.5 py-0.5 bg-warning text-warning-foreground border border-foreground">14.133</span>}
          {item.aderencia?.ti && <span className="text-[9px] font-bold px-1.5 py-0.5 bg-accent text-accent-foreground border border-foreground">TI</span>}
        </div>
        <div className="flex items-center gap-1">
          <Button size="sm" variant="ghost" onClick={onFav} title="Favoritar"><Star className="h-3.5 w-3.5" /></Button>
          {item.linkSistemaOrigem && (
            <a href={item.linkSistemaOrigem} target="_blank" rel="noreferrer">
              <Button size="sm" variant="ghost"><ExternalLink className="h-3.5 w-3.5" /></Button>
            </a>
          )}
          <Button size="sm" variant="default" onClick={onTriagem} disabled={discarded}>
            <Sparkles className="h-3.5 w-3.5 mr-1" />Triagem IA
          </Button>
          <Button size="sm" variant="outline" onClick={onOpen}>
            <ChevronRight className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export const TriagemResultView = ({ r }: { r: TriagemResultado }) => (
  <div className="space-y-4">
    <div className="grid grid-cols-3 gap-3">
      <KPI label="Score Aderência" value={`${r.score_aderencia}/100`} accent={r.score_aderencia >= 80 ? 'success' : r.score_aderencia >= 50 ? 'info' : 'destructive'} />
      <div className="border-2 border-foreground bg-card p-4 shadow-brutal-sm">
        <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">Nível</div>
        <div className="mt-2"><NivelBadge n={r.nivel} /></div>
        {r.categoria_explicacao && <div className="text-[11px] mt-1 text-muted-foreground">{r.categoria_explicacao}</div>}
      </div>
      <div className="border-2 border-foreground bg-card p-4 shadow-brutal-sm">
        <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">Recomendação</div>
        <div className="mt-2 font-display text-lg">{r.recomendacao}</div>
      </div>
    </div>

    {r.resumo_executivo && r.resumo_executivo.length > 0 && (
      <div className="border-2 border-foreground bg-accent/10 p-4">
        <div className="font-display text-sm mb-2">Resumo Executivo</div>
        <ul className="text-sm space-y-1">
          {r.resumo_executivo.map((t, i) => <li key={i} className="flex gap-2"><span className="text-accent">▸</span>{t}</li>)}
        </ul>
      </div>
    )}

    <div className="border-2 border-foreground bg-card p-4">
      <div className="font-display text-sm mb-2">Resumo da IA</div>
      <p className="text-sm">{r.resumo}</p>
    </div>

    {r.requisitos_extraidos && (
      <div className="border-2 border-foreground bg-card p-4">
        <div className="font-display text-sm mb-2">Requisitos Extraídos</div>
        <div className="grid md:grid-cols-2 gap-2 text-xs">
          <div><b className="font-mono uppercase text-[10px]">Tecnologias:</b> {r.requisitos_extraidos.tecnologias_exigidas?.join(', ') || '—'}</div>
          <div><b className="font-mono uppercase text-[10px]">Certificações:</b> {r.requisitos_extraidos.certificacoes_obrigatorias?.join(', ') || '—'}</div>
          <div><b className="font-mono uppercase text-[10px]">Volume:</b> {r.requisitos_extraidos.volume_estimado || '—'}</div>
          <div><b className="font-mono uppercase text-[10px]">Perfis:</b> {r.requisitos_extraidos.perfis_profissionais?.map((p) => typeof p === 'string' ? p : p.papel).join(', ') || '—'}</div>
          <div className="md:col-span-2"><b className="font-mono uppercase text-[10px]">Prazo:</b> {r.requisitos_extraidos.prazo_execucao || '—'}</div>
        </div>
      </div>
    )}

    <div className="grid md:grid-cols-2 gap-3">
      <div className="border-2 border-foreground bg-card p-4">
        <div className="font-display text-sm mb-2 text-success">Pontos fortes</div>
        <ul className="text-xs space-y-1 list-disc pl-4">{r.pontos_fortes?.map((p, i) => <li key={i}>{p}</li>)}</ul>
      </div>
      <div className="border-2 border-foreground bg-card p-4">
        <div className="font-display text-sm mb-2 text-destructive">Pontos fracos</div>
        <ul className="text-xs space-y-1 list-disc pl-4">{r.pontos_fracos?.map((p, i) => <li key={i}>{p}</li>)}</ul>
      </div>
    </div>

    <div className="border-2 border-foreground bg-card p-4">
      <div className="font-display text-sm mb-2">Rentabilidade estimada</div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
        <div><div className="font-mono uppercase text-muted-foreground text-[10px]">Margem %</div><div className="font-display text-lg">{r.rentabilidade?.margem_estimada_pct}%</div></div>
        <div><div className="font-mono uppercase text-muted-foreground text-[10px]">Valor</div><div className="font-mono">{formatBRL(r.rentabilidade?.valor_estimado_brl)}</div></div>
        <div><div className="font-mono uppercase text-muted-foreground text-[10px]">Custo</div><div className="font-mono">{formatBRL(r.rentabilidade?.custo_estimado_brl)}</div></div>
        <div><div className="font-mono uppercase text-muted-foreground text-[10px]">Lucro</div><div className="font-mono text-success">{formatBRL(r.rentabilidade?.lucro_estimado_brl)}</div></div>
      </div>
      <div className="text-[11px] mt-2 text-muted-foreground">Risco: <b>{r.rentabilidade?.risco}</b> — {r.rentabilidade?.observacoes}</div>
    </div>

    <div className="grid md:grid-cols-2 gap-3">
      <div className="border-2 border-foreground bg-card p-4">
        <div className="font-display text-sm mb-2">Atestados que casam</div>
        {r.atestados_match?.length ? r.atestados_match.map((a) => (
          <div key={a.id} className="border-l-2 border-accent pl-2 mb-2">
            <div className="text-xs font-bold">{a.titulo} <span className="text-muted-foreground">({a.relevancia}%)</span></div>
            <div className="text-[11px] text-muted-foreground">{a.justificativa}</div>
          </div>
        )) : <div className="text-xs text-muted-foreground">Nenhum atestado relevante.</div>}
      </div>
      <div className="border-2 border-foreground bg-card p-4">
        <div className="font-display text-sm mb-2">Soluções aplicáveis</div>
        {r.solucoes_match?.length ? r.solucoes_match.map((s) => (
          <div key={s.id} className="border-l-2 border-primary pl-2 mb-2">
            <div className="text-xs font-bold">{s.nome} <span className="text-muted-foreground">({s.relevancia}%)</span></div>
            <div className="text-[11px] text-muted-foreground">{s.justificativa}</div>
          </div>
        )) : <div className="text-xs text-muted-foreground">Nenhuma solução identificada.</div>}
      </div>
    </div>

    {r.execution_match && (
      <div className="border-2 border-foreground bg-card p-4 space-y-3">
        <div className="flex items-baseline justify-between">
          <div className="font-display text-sm">Match de Execução (Quadro de Perfis)</div>
          <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
            Risco: <b className={r.execution_match.risco_execucao === 'alto' ? 'text-destructive' : r.execution_match.risco_execucao === 'medio' ? 'text-warning' : 'text-success'}>{r.execution_match.risco_execucao}</b>
          </div>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          <div>
            <div className="font-mono uppercase text-muted-foreground text-[10px]">Score execução</div>
            <div className="font-display text-2xl">{r.execution_match.score_execucao}%</div>
          </div>
          <div>
            <div className="font-mono uppercase text-muted-foreground text-[10px]">Skills</div>
            <div className="font-display text-lg">{r.execution_match.cobertura_skills_pct}%</div>
            <div className="h-1.5 bg-muted mt-1"><div className="h-full bg-accent" style={{ width: `${r.execution_match.cobertura_skills_pct}%` }} /></div>
          </div>
          <div>
            <div className="font-mono uppercase text-muted-foreground text-[10px]">Certificações</div>
            <div className="font-display text-lg">{r.execution_match.cobertura_certificacoes_pct}%</div>
            <div className="h-1.5 bg-muted mt-1"><div className="h-full bg-primary" style={{ width: `${r.execution_match.cobertura_certificacoes_pct}%` }} /></div>
          </div>
          <div>
            <div className="font-mono uppercase text-muted-foreground text-[10px]">Headcount</div>
            <div className="font-display text-lg">{r.execution_match.cobertura_headcount_pct}%</div>
            <div className="h-1.5 bg-muted mt-1"><div className="h-full bg-success" style={{ width: `${r.execution_match.cobertura_headcount_pct}%` }} /></div>
          </div>
        </div>

        {(r.execution_match.gap_skills?.length || r.execution_match.gap_certificacoes?.length || r.execution_match.gap_headcount) ? (
          <div className="grid md:grid-cols-3 gap-3 text-[11px]">
            {r.execution_match.gap_skills?.length ? (
              <div className="border-l-2 border-destructive pl-2">
                <div className="font-mono uppercase text-[10px] text-destructive">Gap de skills</div>
                <div>{r.execution_match.gap_skills.join(', ')}</div>
              </div>
            ) : null}
            {r.execution_match.gap_certificacoes?.length ? (
              <div className="border-l-2 border-destructive pl-2">
                <div className="font-mono uppercase text-[10px] text-destructive">Gap de certificações</div>
                <div>{r.execution_match.gap_certificacoes.join(', ')}</div>
              </div>
            ) : null}
            {r.execution_match.gap_headcount ? (
              <div className="border-l-2 border-warning pl-2">
                <div className="font-mono uppercase text-[10px] text-warning">Gap de headcount</div>
                <div>{r.execution_match.gap_headcount}</div>
              </div>
            ) : null}
          </div>
        ) : null}

        {r.execution_match.alocacao_sugerida?.length ? (
          <div>
            <div className="font-mono uppercase text-[10px] text-muted-foreground mb-1">Alocação sugerida</div>
            <div className="space-y-1">
              {r.execution_match.alocacao_sugerida.map((a, i) => (
                <div key={i} className="text-xs border border-border p-2 flex items-start justify-between gap-3">
                  <div>
                    <b>{a.nome}</b> — {a.papel_no_projeto}
                    <div className="text-[11px] text-muted-foreground">{a.justificativa}</div>
                  </div>
                  <div className="text-right font-mono text-[11px] shrink-0">
                    <div>{a.alocacao_pct}%</div>
                    {a.custo_hora ? <div className="text-muted-foreground">{formatBRL(a.custo_hora)}/h</div> : null}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        {r.execution_match.observacoes && <div className="text-[11px] text-muted-foreground">{r.execution_match.observacoes}</div>}
      </div>
    )}
  </div>
);
