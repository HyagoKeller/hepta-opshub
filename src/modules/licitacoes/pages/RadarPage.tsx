import { useCallback, useEffect, useRef, useState } from 'react';
import { Radar, RefreshCw, Loader2, Star, Sparkles, ExternalLink, Filter, Crown, Ban, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { aprovarComoEstrategico, buscarLicitacoes, getCompanyProfile, salvarTriagem, toggleFavorito, triagemIA } from '../api';
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

  const [triagemOpen, setTriagemOpen] = useState(false);
  const [triagemAtual, setTriagemAtual] = useState<{ item: PncpItem; result?: TriagemResultado; loading: boolean } | null>(null);

  // Carrega perfil para hidratar valor mínimo padrão + blacklist customizada
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
        filtroTI,
        modalidades,
        valorMinimo,
        blacklistExtra,
        incluirDescartados,
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

  const toggleMod = (id: number) => setModalidades((c) => c.includes(id) ? c.filter((m) => m !== id) : [...c, id]);

  const handleTriagem = async (item: PncpItem) => {
    setTriagemAtual({ item, loading: true });
    setTriagemOpen(true);
    try {
      const r = await triagemIA(item);
      setTriagemAtual({ item, result: r, loading: false });
      await salvarTriagem(item, r);
    } catch (e: any) {
      toast.error('Falha na triagem IA', { description: e?.message });
      setTriagemAtual({ item, loading: false });
    }
  };

  const handleAprovarEstrategico = async () => {
    if (!triagemAtual?.item || !triagemAtual?.result) return;
    try {
      await aprovarComoEstrategico(triagemAtual.item, triagemAtual.result);
      toast.success('🟢 Item Estratégico criado', { description: 'Enviado ao Núcleo de Transformação para formação de proposta técnica.' });
      setTriagemOpen(false);
    } catch (e: any) { toast.error('Erro', { description: e?.message }); }
  };

  const handleFav = async (item: PncpItem) => {
    const added = await toggleFavorito(item);
    toast.success(added ? 'Adicionado aos favoritos' : 'Removido dos favoritos');
  };

  const valorTotal = items.reduce((s, i) => s + (i.valorEstimado ?? 0), 0);
  const candidatos = items.filter((i) => i.status !== 'discarded').length;

  return (
    <>
      <PageHeader
        eyebrow="Radar em tempo real • Fonte: PNCP gov.br"
        title="Radar de Licitações TI"
        subtitle="Pipeline Pilar 1: purificação determinística (Blacklist + CATSER/CATMAT TI + valor mínimo) → triagem semântica via IA contra atestados, soluções e Core Business."
        actions={
          <>
            <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-widest">
              <span className={`h-2 w-2 rounded-full ${autoRefresh ? 'bg-success animate-pulse' : 'bg-muted'}`} />
              {autoRefresh ? 'LIVE' : 'PAUSADO'}
              <Switch checked={autoRefresh} onCheckedChange={setAutoRefresh} />
            </div>
            <Button variant="outline" size="sm" onClick={fetchData} disabled={loading}>
              {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
              <span className="ml-1.5">Atualizar</span>
            </Button>
          </>
        }
      />

      <div className="px-6 lg:px-8 py-6 space-y-6">
        {/* KPIs com transparência do funil de purificação */}
        <div className="grid grid-cols-2 lg:grid-cols-6 gap-3">
          <KPI label="Candidatos" value={candidatos} accent="primary" sub="Pós-purificação" />
          <KPI label="Pipeline" value={formatBRL(valorTotal)} accent="accent" />
          <KPI label="Descartados" value={meta?.descartados ?? 0} accent="destructive" sub={`Blacklist: ${meta?.descartados_blacklist ?? 0} • Fora TI: ${meta?.descartados_fora_ti ?? 0} • Valor: ${meta?.descartados_valor ?? 0}`} />
          <KPI label="Coleta bruta" value={meta?.total_bruto ?? 0} sub={`PNCP: ${meta?.totalRegistros ?? 0}`} />
          <KPI label="Janela" value={meta ? `${meta.intervalo?.de?.slice(-4)}→${meta.intervalo?.ate?.slice(-4)}` : '—'} sub={`${dias}d`} />
          <KPI label="Sync" value={lastUpdate ? lastUpdate.toLocaleTimeString('pt-BR') : '—'} sub="Auto 60s" />
        </div>

        {/* Filtros */}
        <div className="border-2 border-foreground bg-card shadow-brutal-sm p-4">
          <div className="flex items-center gap-2 mb-3"><Filter className="h-4 w-4" /><span className="font-display text-sm">Filtros & Purificação</span></div>
          <div className="grid lg:grid-cols-6 gap-3">
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
            <div className="lg:col-span-2">
              <Label className="text-[10px] font-mono uppercase">Palavra-chave no objeto</Label>
              <Input value={palavra} onChange={(e) => setPalavra(e.target.value)} placeholder="ex: service desk, fábrica, sustentação..." />
            </div>
            <div className="flex flex-col gap-1.5 justify-end">
              <div className="flex items-center gap-2 border-2 border-foreground bg-background px-2 py-1 h-9">
                <Switch checked={filtroTI} onCheckedChange={setFiltroTI} id="ti" />
                <Label htmlFor="ti" className="text-[10px] font-mono uppercase cursor-pointer">Só TI</Label>
              </div>
              <div className="flex items-center gap-2 border-2 border-foreground bg-background px-2 py-1 h-9">
                <Switch checked={incluirDescartados} onCheckedChange={setIncluirDescartados} id="desc" />
                <Label htmlFor="desc" className="text-[10px] font-mono uppercase cursor-pointer">Ver descartados</Label>
              </div>
            </div>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {MODALIDADES.map((m) => (
              <button key={m.id} onClick={() => toggleMod(m.id)}
                className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest border-2 border-foreground ${modalidades.includes(m.id) ? 'bg-foreground text-background' : 'bg-background'}`}>
                {m.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tabela */}
        <div className="border-2 border-foreground bg-card shadow-brutal-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/60 border-b-2 border-foreground">
                <tr className="text-[10px] font-mono uppercase tracking-widest">
                  <th className="text-left p-3">Objeto / Órgão</th>
                  <th className="text-left p-3">Modalidade</th>
                  <th className="text-left p-3">Valor est.</th>
                  <th className="text-left p-3">Publicação</th>
                  <th className="text-left p-3">UF</th>
                  <th className="text-left p-3">Marcadores</th>
                  <th className="text-right p-3">Ações</th>
                </tr>
              </thead>
              <tbody>
                {loading && items.length === 0 && (
                  <tr><td colSpan={7} className="p-8 text-center text-muted-foreground"><Loader2 className="h-5 w-5 animate-spin inline mr-2" />Buscando no PNCP...</td></tr>
                )}
                {!loading && items.length === 0 && (
                  <tr><td colSpan={7} className="p-8 text-center text-muted-foreground"><Radar className="h-5 w-5 inline mr-2" />Nenhuma licitação encontrada para os filtros atuais.</td></tr>
                )}
                {items.map((it) => {
                  const discarded = it.status === 'discarded';
                  return (
                    <tr key={it.id} className={`border-b border-border hover:bg-muted/30 ${discarded ? 'opacity-50' : ''}`}>
                      <td className="p-3 max-w-xl">
                        <div className="font-medium line-clamp-2 flex items-start gap-1.5">
                          {discarded && <Ban className="h-3.5 w-3.5 text-destructive shrink-0 mt-0.5" />}
                          {it.objeto}
                        </div>
                        <div className="text-[11px] text-muted-foreground mt-0.5 truncate">{it.orgao} • {it.unidade ?? ''}</div>
                        {discarded && it.motivos_descarte && (
                          <div className="text-[10px] text-destructive mt-0.5">Descartado: {it.motivos_descarte.join(' • ')}</div>
                        )}
                      </td>
                      <td className="p-3 text-xs">{it.modalidade}</td>
                      <td className="p-3 font-mono text-xs whitespace-nowrap">{formatBRL(it.valorEstimado)}</td>
                      <td className="p-3 text-xs whitespace-nowrap">{formatDate(it.dataPublicacao)}</td>
                      <td className="p-3 text-xs">{it.uf ?? '—'}</td>
                      <td className="p-3">
                        <div className="flex flex-wrap gap-1">
                          {it.aderencia.portaria750 && <span className="text-[9px] font-bold px-1.5 py-0.5 bg-info text-info-foreground border border-foreground">P-750</span>}
                          {it.aderencia.portaria1070 && <span className="text-[9px] font-bold px-1.5 py-0.5 bg-success text-success-foreground border border-foreground">P-1070</span>}
                          {it.aderencia.lei14133 && <span className="text-[9px] font-bold px-1.5 py-0.5 bg-warning text-warning-foreground border border-foreground">14.133</span>}
                          {it.aderencia.ti && <span className="text-[9px] font-bold px-1.5 py-0.5 bg-accent text-accent-foreground border border-foreground">TI</span>}
                        </div>
                      </td>
                      <td className="p-3 text-right whitespace-nowrap">
                        <Button size="sm" variant="outline" onClick={() => handleFav(it)} title="Favoritar"><Star className="h-3.5 w-3.5" /></Button>
                        <Button size="sm" variant="default" className="ml-1" onClick={() => handleTriagem(it)} disabled={discarded}>
                          <Sparkles className="h-3.5 w-3.5 mr-1" /> Triagem IA
                        </Button>
                        {it.linkSistemaOrigem && (
                          <a className="ml-1 inline-flex" href={it.linkSistemaOrigem} target="_blank" rel="noreferrer">
                            <Button size="sm" variant="ghost"><ExternalLink className="h-3.5 w-3.5" /></Button>
                          </a>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal de triagem */}
      <Dialog open={triagemOpen} onOpenChange={setTriagemOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display flex items-center gap-2"><Sparkles className="h-5 w-5" />Triagem Contextual — Gemini</DialogTitle>
          </DialogHeader>
          {triagemAtual?.item && (
            <div className="text-xs text-muted-foreground line-clamp-2 border-l-2 border-foreground pl-2">{triagemAtual.item.objeto}</div>
          )}
          {triagemAtual?.loading && (
            <div className="py-12 text-center">
              <Loader2 className="h-6 w-6 animate-spin inline mr-2" />
              <div className="mt-2 text-xs text-muted-foreground">
                Etapa 1: Validação semântica (SIM/NÃO TI) →<br/>
                Etapa 2: Extração de requisitos + cruzamento com atestados + Core Business + rentabilidade
              </div>
            </div>
          )}
          {triagemAtual?.result && (
            <>
              <TriagemResultView r={triagemAtual.result} />
              {(triagemAtual.result.nivel === 'BID' || triagemAtual.result.score_aderencia >= 80) && (
                <div className="border-2 border-foreground bg-success/10 p-4 flex items-center justify-between">
                  <div>
                    <div className="font-display text-sm flex items-center gap-2"><Crown className="h-4 w-4" />Pronto para virar Item Estratégico</div>
                    <div className="text-xs text-muted-foreground">Aciona o Núcleo de Transformação para formação da proposta técnica.</div>
                  </div>
                  <Button onClick={handleAprovarEstrategico}><CheckCircle2 className="h-4 w-4 mr-1" />Aprovar como BID</Button>
                </div>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export const TriagemResultView = ({ r }: { r: TriagemResultado }) => (
  <div className="space-y-4 mt-2">
    <div className="grid grid-cols-3 gap-3">
      <KPI label="Score Aderência" value={`${r.score_aderencia}/100`} accent={r.score_aderencia >= 80 ? 'success' : r.score_aderencia >= 50 ? 'info' : 'destructive'} />
      <div className="border-2 border-foreground bg-card p-4 shadow-brutal-sm">
        <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">Nível</div>
        <div className="mt-2"><NivelBadge n={r.nivel} /></div>
        {r.categoria_explicacao && <div className="text-[11px] mt-1 text-muted-foreground">{r.categoria_explicacao}</div>}
      </div>
      <div className="border-2 border-foreground bg-card p-4 shadow-brutal-sm">
        <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">Recomendação</div>
        <div className="mt-2 font-display text-xl">{r.recomendacao}</div>
      </div>
    </div>

    {r.resumo_executivo && r.resumo_executivo.length > 0 && (
      <div className="border-2 border-foreground bg-accent/10 p-4">
        <div className="font-display text-sm mb-2">Resumo Executivo (3 tópicos)</div>
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
        <div className="font-display text-sm mb-2">Requisitos Extraídos (REQ-07)</div>
        <div className="grid md:grid-cols-2 gap-2 text-xs">
          <div><b className="font-mono uppercase text-[10px]">Tecnologias:</b> {r.requisitos_extraidos.tecnologias_exigidas?.join(', ') || '—'}</div>
          <div><b className="font-mono uppercase text-[10px]">Certificações:</b> {r.requisitos_extraidos.certificacoes_obrigatorias?.join(', ') || '—'}</div>
          <div><b className="font-mono uppercase text-[10px]">Volume:</b> {r.requisitos_extraidos.volume_estimado || '—'}</div>
          <div><b className="font-mono uppercase text-[10px]">Perfis:</b> {r.requisitos_extraidos.perfis_profissionais?.join(', ') || '—'}</div>
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
        )) : <div className="text-xs text-muted-foreground">Nenhum atestado relevante encontrado.</div>}
      </div>
      <div className="border-2 border-foreground bg-card p-4">
        <div className="font-display text-sm mb-2">Soluções aplicáveis</div>
        {r.solucoes_match?.length ? r.solucoes_match.map((s) => (
          <div key={s.id} className="border-l-2 border-primary pl-2 mb-2">
            <div className="text-xs font-bold">{s.nome} <span className="text-muted-foreground">({s.relevancia}%)</span></div>
            <div className="text-[11px] text-muted-foreground">{s.justificativa}</div>
          </div>
        )) : <div className="text-xs text-muted-foreground">Nenhuma solução aplicável identificada.</div>}
      </div>
    </div>
  </div>
);
