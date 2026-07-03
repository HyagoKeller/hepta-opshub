import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Loader2, History, Layers, PackageCheck, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import {
  getAutomacao, listHistorico, listOfertasByAutomacao, moverEstagio, updateAutomacao,
} from '../api';
import type { Automacao, AutomacaoHistorico, AutomacaoOferta } from '../types';
import { ESTAGIOS, estagioIndex, estagioLabel, calcConfianca, calcROI } from '../types';
import {
  PageHeader, KPI, formatBRL, formatDate, TipoBadge, EstagioBadge,
  ComplexidadeBadge, RiscoBadge, MaturidadeBadge, ConfiancaBadge, AvatarInline,
} from '../ui';

export const DetalheAutomacaoPage = () => {
  const { id } = useParams<{ id: string }>();
  const [item, setItem] = useState<Automacao | null>(null);
  const [hist, setHist] = useState<AutomacaoHistorico[]>([]);
  const [ofertas, setOfertas] = useState<AutomacaoOferta[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const [a, h, o] = await Promise.all([
        getAutomacao(id), listHistorico(id), listOfertasByAutomacao(id),
      ]);
      setItem(a); setHist(h); setOfertas(o);
    } catch (e: any) { toast.error('Falha ao carregar', { description: e?.message }); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); /* eslint-disable-next-line */ }, [id]);

  if (loading || !item) {
    return (
      <>
        <PageHeader eyebrow="Núcleo 03 · Automação" title="Carregando…" />
        <div className="p-6 lg:p-8 space-y-3">
          <Skeleton className="h-24" /><Skeleton className="h-64" />
        </div>
      </>
    );
  }

  const idx = estagioIndex(item.estagio);
  const next = ESTAGIOS[idx + 1];
  const prev = ESTAGIOS[idx - 1];
  const podeEditarRealizada = idx >= estagioIndex('produto_interno');

  const avancar = async (dir: 'next' | 'prev') => {
    const alvo = dir === 'next' ? next : prev;
    if (!alvo) return;
    setSaving(true);
    try {
      const upd = await moverEstagio(item.id, alvo.id);
      setItem(upd); toast.success(`Estágio: ${alvo.label}`);
      const h = await listHistorico(item.id); setHist(h);
    } catch (e: any) { toast.error('Erro', { description: e?.message }); }
    finally { setSaving(false); }
  };

  const salvarRealizada = async (valor: number | null) => {
    setSaving(true);
    try {
      const upd = await updateAutomacao(item.id, { economia_realizada: valor });
      setItem(upd); toast.success('Economia realizada atualizada');
    } catch (e: any) { toast.error('Erro', { description: e?.message }); }
    finally { setSaving(false); }
  };

  const roi = calcROI(item);

  return (
    <>
      <PageHeader
        eyebrow={`Núcleo 03 · ${estagioLabel(item.estagio)}`}
        title={item.nome}
        subtitle={item.descricao ?? undefined}
        actions={
          <>
            <Button asChild variant="ghost" size="sm">
              <Link to="/app/automacoes/catalogo"><ArrowLeft className="h-3.5 w-3.5 mr-1" />Catálogo</Link>
            </Button>
            {prev && (
              <Button variant="outline" size="sm" onClick={() => avancar('prev')} disabled={saving}>
                <ArrowLeft className="h-3.5 w-3.5 mr-1" />{prev.label}
              </Button>
            )}
            {next && (
              <Button variant="primary" size="sm" onClick={() => avancar('next')} disabled={saving}>
                {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <ArrowRight className="h-3.5 w-3.5" />}
                <span className="ml-1.5">Avançar para {next.label}</span>
              </Button>
            )}
          </>
        }
      />

      <div className="px-6 lg:px-8 py-6 space-y-4">
        <div className="flex flex-wrap gap-2">
          <TipoBadge t={item.tipo} />
          <EstagioBadge e={item.estagio} />
          <ComplexidadeBadge c={item.complexidade} />
          <RiscoBadge r={item.risco} />
          <MaturidadeBadge m={item.maturidade} />
          <ConfiancaBadge c={calcConfianca(item)} />
          {item.reusavel && (
            <span className="text-[10px] font-bold px-2 py-0.5 bg-info text-info-foreground border-2 border-foreground uppercase tracking-widest">
              Reusável
            </span>
          )}
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <KPI label="Custo estimado" value={formatBRL(item.custo_estimado)} />
          <KPI label="Economia estimada" value={formatBRL(item.economia_estimada)} accent="info" />
          <KPI label="Economia realizada" value={formatBRL(item.economia_realizada)} accent="success" sub={podeEditarRealizada ? 'Editável (produção)' : 'Somente após produção interna'} />
          <KPI label="ROI" value={roi == null ? '—' : roi === Infinity ? '∞' : `${roi}%`} accent="primary" />
        </div>

        <Tabs defaultValue="visao">
          <TabsList className="border-2 border-foreground rounded-none bg-card">
            <TabsTrigger value="visao">Visão geral</TabsTrigger>
            <TabsTrigger value="tecnica">Avaliação técnica</TabsTrigger>
            <TabsTrigger value="reuso">Reusabilidade & stack</TabsTrigger>
            <TabsTrigger value="hist">Histórico</TabsTrigger>
          </TabsList>

          <TabsContent value="visao" className="mt-4">
            <div className="grid lg:grid-cols-3 gap-4">
              <div className="lg:col-span-2 border-2 border-foreground bg-card shadow-brutal-sm p-5 space-y-4">
                <div>
                  <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">Descrição</div>
                  <p className="text-sm mt-1">{item.descricao ?? '—'}</p>
                </div>

                <div className="grid sm:grid-cols-2 gap-3">
                  <Info label="Núcleo de origem" value={item.nucleo_origem_id ?? '—'} />
                  <Info label="Responsável">
                    <div className="flex items-center gap-2 mt-1">
                      <AvatarInline nome={item.responsavel_nome} />
                      <span className="font-bold text-sm">{item.responsavel_nome ?? '—'}</span>
                    </div>
                  </Info>
                  <Info label="Criada em" value={formatDate(item.criado_em)} />
                  <Info label="Última atualização" value={formatDate(item.atualizado_em)} />
                </div>

                <div>
                  <Label className="text-[11px] font-bold uppercase tracking-widest">Economia realizada (R$)</Label>
                  <div className="flex gap-2 mt-1.5">
                    <Input
                      type="number"
                      disabled={!podeEditarRealizada || saving}
                      defaultValue={item.economia_realizada ?? ''}
                      onBlur={(e) => {
                        const v = e.target.value === '' ? null : Number(e.target.value);
                        if (v !== item.economia_realizada) salvarRealizada(v);
                      }}
                    />
                    <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground self-center">
                      {podeEditarRealizada ? 'Salva ao sair do campo' : `Habilita a partir de ${estagioLabel('produto_interno')}`}
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-2 border-foreground bg-card shadow-brutal-sm p-5">
                <div className="font-display text-sm flex items-center gap-2 mb-2"><Layers className="h-4 w-4" />Progressão na esteira</div>
                <ol className="space-y-1.5">
                  {ESTAGIOS.map((e, i) => {
                    const done = i < idx, curr = i === idx;
                    return (
                      <li key={e.id} className={`flex items-center gap-2 text-xs border-2 border-foreground p-1.5 ${
                        curr ? 'bg-success text-success-foreground' : done ? 'bg-muted' : 'bg-background'
                      }`}>
                        <span className="font-mono text-[10px] opacity-70">{i + 1}</span>
                        <span className="font-bold flex-1">{e.label}</span>
                        {curr && <span className="text-[9px] font-mono uppercase tracking-widest">atual</span>}
                      </li>
                    );
                  })}
                </ol>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="tecnica" className="mt-4">
            <div className="grid md:grid-cols-3 gap-4">
              <TechCard title="Complexidade" value={item.complexidade}>
                <ComplexidadeBadge c={item.complexidade} />
              </TechCard>
              <TechCard title="Risco" value={item.risco}>
                <RiscoBadge r={item.risco} />
              </TechCard>
              <TechCard title="Maturidade" value={item.maturidade}>
                <MaturidadeBadge m={item.maturidade} />
              </TechCard>
            </div>
            <div className="mt-4 border-2 border-foreground bg-accent/20 shadow-brutal-sm p-4 flex items-start gap-3">
              <Sparkles className="h-4 w-4 mt-0.5 shrink-0" />
              <div className="text-xs">
                <b>Confiança de escala:</b> <ConfiancaBadge c={calcConfianca(item)} />
                <div className="text-muted-foreground mt-1">
                  Cálculo determinístico visual (V1). Em V2, o mesmo padrão de scoring por IA
                  do <code className="font-mono">ai-triagem</code> do Núcleo 02 será plugado aqui.
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="reuso" className="mt-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="border-2 border-foreground bg-card shadow-brutal-sm p-5">
                <div className="font-display text-sm mb-2">Stack & integrações</div>
                <div className="flex flex-wrap gap-1.5">
                  {item.stack_integracoes.length === 0
                    ? <span className="text-xs text-muted-foreground">Não informado.</span>
                    : item.stack_integracoes.map((s) => (
                      <span key={s} className="text-[10px] font-bold px-2 py-0.5 border-2 border-foreground bg-background uppercase tracking-widest">
                        {s}
                      </span>
                    ))}
                </div>
              </div>
              <div className="border-2 border-foreground bg-card shadow-brutal-sm p-5">
                <div className="font-display text-sm mb-2">Tags</div>
                <div className="flex flex-wrap gap-1.5">
                  {item.tags.length === 0
                    ? <span className="text-xs text-muted-foreground">Sem tags.</span>
                    : item.tags.map((t) => (
                      <span key={t} className="text-[10px] font-bold px-2 py-0.5 border-2 border-foreground bg-secondary text-secondary-foreground uppercase tracking-widest">
                        #{t}
                      </span>
                    ))}
                </div>
              </div>
              <div className="md:col-span-2 border-2 border-foreground bg-card shadow-brutal-sm p-5">
                <div className="font-display text-sm mb-2 flex items-center gap-2"><PackageCheck className="h-4 w-4" />Ofertas comerciais</div>
                {ofertas.length === 0 ? (
                  <div className="text-xs text-muted-foreground">Ainda não empacotada como oferta comercial.</div>
                ) : (
                  <ul className="space-y-2">
                    {ofertas.map((o) => (
                      <li key={o.id} className="border-l-4 border-success pl-3">
                        <div className="font-bold text-sm">{o.nome_oferta}
                          <span className={`ml-2 text-[10px] font-mono uppercase tracking-widest ${o.status === 'ativa' ? 'text-success' : 'text-muted-foreground'}`}>{o.status}</span>
                        </div>
                        <div className="text-[11px] text-muted-foreground">{o.descricao_comercial}</div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="hist" className="mt-4">
            <div className="border-2 border-foreground bg-card shadow-brutal-sm p-5">
              <div className="font-display text-sm flex items-center gap-2 mb-3"><History className="h-4 w-4" />Histórico de estágios</div>
              {hist.length === 0 ? (
                <div className="text-xs text-muted-foreground">Sem eventos registrados.</div>
              ) : (
                <ol className="space-y-2">
                  {hist.map((h) => (
                    <li key={h.id} className="border-l-4 border-foreground pl-3">
                      <div className="text-xs">
                        <b>{h.estagio_anterior ? estagioLabel(h.estagio_anterior) : '—'}</b>
                        {' → '}
                        <b>{estagioLabel(h.estagio_novo)}</b>
                      </div>
                      <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
                        {new Date(h.criado_em).toLocaleString('pt-BR')} · {h.autor_nome ?? 'sistema'}
                      </div>
                      {h.nota && <div className="text-[11px] mt-0.5">{h.nota}</div>}
                    </li>
                  ))}
                </ol>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
};

const Info = ({ label, value, children }: { label: string; value?: React.ReactNode; children?: React.ReactNode }) => (
  <div className="border-2 border-foreground bg-background p-2.5">
    <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">{label}</div>
    {children ?? <div className="font-bold text-sm mt-0.5">{value}</div>}
  </div>
);

const TechCard = ({ title, value, children }: { title: string; value: string; children: React.ReactNode }) => (
  <div className="border-2 border-foreground bg-card shadow-brutal-sm p-5">
    <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">{title}</div>
    <div className="font-display text-2xl mt-1 capitalize">{value}</div>
    <div className="mt-2">{children}</div>
  </div>
);
