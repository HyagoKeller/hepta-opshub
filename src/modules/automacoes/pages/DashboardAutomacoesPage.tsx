import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles, TrendingUp, PackageCheck, Rocket, ArrowRight, LayoutGrid, Zap,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { listAutomacoes, listOfertas } from '../api';
import type { Automacao, AutomacaoOferta } from '../types';
import { calcROI, ESTAGIOS, estagioLabel } from '../types';
import {
  PageHeader, KPI, formatBRL, TipoBadge, EstagioBadge, ConfiancaBadge, AvatarInline,
} from '../ui';
import { calcConfianca } from '../types';

export const DashboardAutomacoesPage = () => {
  const [items, setItems] = useState<Automacao[]>([]);
  const [ofertas, setOfertas] = useState<AutomacaoOferta[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [a, o] = await Promise.all([listAutomacoes(), listOfertas()]);
        setItems(a); setOfertas(o);
      } catch (e: any) {
        toast.error('Falha ao carregar automações', { description: e?.message });
      } finally { setLoading(false); }
    })();
  }, []);

  const ativos = items.filter((i) => i.estagio !== 'ideia').length;
  const emPoc = items.filter((i) => i.estagio === 'poc' || i.estagio === 'piloto').length;
  const emOferta = items.filter((i) => i.estagio === 'oferta_cliente').length;
  const economiaAcum = items.reduce((s, i) => s + (Number(i.economia_realizada) || 0), 0);

  const distribuicaoPorEstagio = ESTAGIOS.map((e) => ({
    ...e,
    count: items.filter((i) => i.estagio === e.id).length,
  }));
  const maxCount = Math.max(1, ...distribuicaoPorEstagio.map((d) => d.count));

  const topROI = useMemo(
    () => [...items]
      .map((i) => ({ i, roi: calcROI(i) }))
      .filter((x) => x.roi != null && Number.isFinite(x.roi))
      .sort((a, b) => (b.roi! - a.roi!))
      .slice(0, 5),
    [items],
  );

  return (
    <>
      <PageHeader
        eyebrow="Núcleo 03 · Automações & Transformação Digital"
        title="Painel de Ativos e Esteira"
        subtitle="Cada automação é um ativo com estágio, custo, economia e potencial de virar oferta comercial."
        actions={
          <>
            <Button asChild variant="outline" size="sm"><Link to="/app/automacoes/esteira"><LayoutGrid className="h-3.5 w-3.5 mr-1" />Esteira</Link></Button>
            <Button asChild variant="primary" size="sm"><Link to="/app/automacoes/catalogo"><Sparkles className="h-3.5 w-3.5 mr-1" />Catálogo</Link></Button>
          </>
        }
      />

      <div className="px-6 lg:px-8 py-6 space-y-6">
        {/* KPIs */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-[92px] border-2 border-foreground" />)
          ) : (
            <>
              <KPI label="Automações ativas" value={ativos} accent="success" sub={`${items.length} no catálogo total`} />
              <KPI label="Economia acumulada" value={formatBRL(economiaAcum)} accent="primary" sub="Apenas realizada" />
              <KPI label="Em POC / Piloto" value={emPoc} accent="info" sub="Em validação real" />
              <KPI label="Já viraram oferta" value={emOferta} accent="accent" sub={`${ofertas.length} ofertas ativas/desc.`} />
            </>
          )}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Distribuição por estágio */}
          <div className="lg:col-span-2 border-2 border-foreground bg-card shadow-brutal-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-lg">Distribuição na esteira</h2>
              <Button asChild variant="ghost" size="sm"><Link to="/app/automacoes/esteira">Abrir Kanban <ArrowRight className="h-3.5 w-3.5 ml-1" /></Link></Button>
            </div>
            {loading ? <Skeleton className="h-40" /> : (
              <div className="space-y-2">
                {distribuicaoPorEstagio.map((d) => (
                  <div key={d.id} className="grid grid-cols-[140px_1fr_40px] items-center gap-3 text-xs">
                    <div className="font-mono uppercase tracking-widest text-[10px] text-muted-foreground">{d.short}</div>
                    <div className="h-5 border-2 border-foreground bg-background">
                      <div className="h-full bg-success" style={{ width: `${(d.count / maxCount) * 100}%` }} />
                    </div>
                    <div className="font-display text-lg text-right leading-none">{d.count}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Top ROI */}
          <div className="border-2 border-foreground bg-card shadow-brutal-sm p-5">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="h-4 w-4 text-success" />
              <h2 className="font-display text-lg">Top ROI</h2>
            </div>
            {loading ? <Skeleton className="h-40" /> : topROI.length === 0 ? (
              <div className="text-xs text-muted-foreground">Sem ROI calculado ainda.</div>
            ) : (
              <ul className="space-y-3">
                {topROI.map(({ i, roi }) => (
                  <li key={i.id} className="border-l-4 border-success pl-3">
                    <Link to={`/app/automacoes/${i.id}`} className="font-bold text-sm hover:underline line-clamp-1">{i.nome}</Link>
                    <div className="flex items-center gap-2 text-[11px] font-mono uppercase tracking-widest text-muted-foreground mt-0.5">
                      <span>ROI <b className="text-success">{roi === Infinity ? '∞' : `${roi}%`}</b></span>
                      <span>·</span>
                      <span>{estagioLabel(i.estagio)}</span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Últimos ativos + confiança */}
        <div className="border-2 border-foreground bg-card shadow-brutal-sm">
          <div className="p-5 border-b-2 border-foreground flex items-center justify-between">
            <div>
              <h2 className="font-display text-lg flex items-center gap-2"><Rocket className="h-4 w-4" /> Últimos ativos atualizados</h2>
              <div className="text-[11px] text-muted-foreground">Cada card mostra tipo, estágio e a confiança de escala calculada.</div>
            </div>
            <Button asChild variant="outline" size="sm"><Link to="/app/automacoes/catalogo"><PackageCheck className="h-3.5 w-3.5 mr-1" />Ver catálogo</Link></Button>
          </div>
          <div className="p-5 grid md:grid-cols-2 xl:grid-cols-3 gap-3">
            {loading ? (
              Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-32" />)
            ) : items.slice(0, 6).map((a) => (
              <Link
                key={a.id}
                to={`/app/automacoes/${a.id}`}
                className="border-2 border-foreground bg-background p-4 shadow-brutal-sm hover:bg-muted/30 transition-smooth block"
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="font-display text-sm line-clamp-2 flex-1">{a.nome}</div>
                  <AvatarInline nome={a.responsavel_nome} />
                </div>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  <TipoBadge t={a.tipo} />
                  <EstagioBadge e={a.estagio} />
                </div>
                <ConfiancaBadge c={calcConfianca(a)} />
              </Link>
            ))}
            {!loading && items.length === 0 && (
              <div className="col-span-full text-center py-10 border-2 border-dashed border-foreground">
                <Zap className="h-6 w-6 inline text-muted-foreground" />
                <div className="mt-2 text-sm">Nenhuma automação cadastrada ainda.</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};
