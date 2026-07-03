import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { PackageCheck, RefreshCw, Loader2, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { listAutomacoes, listOfertas } from '../api';
import type { Automacao, AutomacaoOferta } from '../types';
import { PageHeader, KPI, formatBRL, TipoBadge, ConfiancaBadge } from '../ui';
import { calcConfianca, calcROI } from '../types';

export const OfertasPage = () => {
  const [automacoes, setAutomacoes] = useState<Automacao[]>([]);
  const [ofertas, setOfertas] = useState<AutomacaoOferta[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const [a, o] = await Promise.all([listAutomacoes(), listOfertas()]);
      setAutomacoes(a); setOfertas(o);
    } catch (e: any) { toast.error('Falha ao carregar', { description: e?.message }); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  // Só aparecem automações em estágio 'oferta_cliente'
  const elegiveis = useMemo(() => automacoes.filter((a) => a.estagio === 'oferta_cliente'), [automacoes]);
  const ofertasPorAutomacao = useMemo(() => {
    const m: Record<string, AutomacaoOferta[]> = {};
    for (const o of ofertas) (m[o.automacao_id] ??= []).push(o);
    return m;
  }, [ofertas]);

  const ativas = ofertas.filter((o) => o.status === 'ativa').length;
  const margemMedia = ofertas.length === 0 ? 0
    : ofertas.reduce((s, o) => s + Number(o.margem_estimada ?? 0), 0) / ofertas.length;
  const economiaTotal = elegiveis.reduce((s, a) => s + Number(a.economia_realizada ?? a.economia_estimada ?? 0), 0);

  return (
    <>
      <PageHeader
        eyebrow="Núcleo 03 · Ofertas & Cases"
        title="Automações empacotadas como oferta"
        subtitle="Somente automações em estágio Oferta / Case aparecem aqui — ativos prontos para replicar em clientes."
        actions={
          <Button variant="outline" size="sm" onClick={load} disabled={loading}>
            {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
            <span className="ml-1.5">Atualizar</span>
          </Button>
        }
      />

      <div className="px-6 lg:px-8 py-6 space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {loading ? Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-[92px] border-2 border-foreground" />) : (
            <>
              <KPI label="Ofertas ativas" value={ativas} accent="success" />
              <KPI label="Ofertas totais" value={ofertas.length} accent="primary" sub={`${ofertas.length - ativas} descontinuada(s)`} />
              <KPI label="Margem média" value={`${margemMedia.toFixed(1)}%`} accent="info" />
              <KPI label="Economia gerada" value={formatBRL(economiaTotal)} accent="accent" sub="Somando as automações-oferta" />
            </>
          )}
        </div>

        <div className="space-y-4">
          {loading && Array.from({ length: 2 }).map((_, i) => <Skeleton key={i} className="h-40" />)}
          {!loading && elegiveis.length === 0 && (
            <div className="border-2 border-dashed border-foreground p-10 text-center bg-card">
              <PackageCheck className="h-8 w-8 inline text-muted-foreground" />
              <div className="mt-2 font-display text-lg">Nenhuma automação em estágio Oferta ainda</div>
              <div className="text-xs text-muted-foreground mt-1">Avance uma automação até <b>Oferta / Case</b> para vê-la aqui.</div>
            </div>
          )}
          {!loading && elegiveis.map((a) => {
            const oList = ofertasPorAutomacao[a.id] ?? [];
            const roi = calcROI(a);
            return (
              <div key={a.id} className="border-2 border-foreground bg-card shadow-brutal-sm">
                <div className="p-5 border-b-2 border-foreground flex items-start justify-between gap-4 flex-wrap">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Link to={`/app/automacoes/${a.id}`} className="font-display text-lg hover:underline">{a.nome}</Link>
                      <TipoBadge t={a.tipo} />
                      <ConfiancaBadge c={calcConfianca(a)} />
                    </div>
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{a.descricao}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">Economia · ROI</div>
                    <div className="font-display text-xl leading-tight">
                      {formatBRL(a.economia_realizada ?? a.economia_estimada)}
                      <span className="text-success ml-2">{roi == null ? '' : roi === Infinity ? '∞' : `${roi}%`}</span>
                    </div>
                  </div>
                </div>
                <div className="p-5 space-y-3">
                  {oList.length === 0 ? (
                    <div className="text-xs text-muted-foreground">Automação marcada como oferta, mas ainda sem card comercial cadastrado.</div>
                  ) : oList.map((o) => (
                    <div key={o.id} className="border-l-4 border-success pl-3">
                      <div className="flex items-center gap-2 flex-wrap">
                        <div className="font-bold text-sm">{o.nome_oferta}</div>
                        <span className={`text-[10px] font-mono uppercase tracking-widest px-1.5 border-2 border-foreground ${o.status === 'ativa' ? 'bg-success text-success-foreground' : 'bg-muted'}`}>
                          {o.status}
                        </span>
                        {o.margem_estimada != null && (
                          <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
                            margem ~ {o.margem_estimada}%
                          </span>
                        )}
                      </div>
                      <div className="text-xs mt-1">{o.descricao_comercial}</div>
                      {o.clientes_aplicaveis.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1.5">
                          {o.clientes_aplicaveis.map((c) => (
                            <span key={c} className="text-[10px] font-bold px-1.5 py-0.5 bg-background border-2 border-foreground uppercase tracking-widest">
                              {c}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                  <div className="pt-2">
                    <Button asChild variant="ghost" size="sm">
                      <Link to={`/app/automacoes/${a.id}`}>Abrir detalhe <ArrowRight className="h-3.5 w-3.5 ml-1" /></Link>
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
};
