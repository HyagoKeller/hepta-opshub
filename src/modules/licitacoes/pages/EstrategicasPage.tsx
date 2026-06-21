import { useEffect, useState } from 'react';
import { Crown, ExternalLink } from 'lucide-react';
import { atualizarStatusEstrategica, listarEstrategicas } from '../api';
import type { OportunidadeEstrategica } from '../types';
import { KPI, NivelBadge, PageHeader, formatBRL, formatDate } from '../ui';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

const STATUS = ['em_proposta', 'em_analise_juridica', 'proposta_enviada', 'vencida', 'perdida', 'descartada'];

export const EstrategicasPage = () => {
  const [rows, setRows] = useState<OportunidadeEstrategica[]>([]);
  const load = () => listarEstrategicas().then(setRows);
  useEffect(() => { load(); }, []);

  const total = rows.length;
  const valor = rows.reduce((s, r) => s + Number(r.valor_estimado ?? 0), 0);
  const emProposta = rows.filter((r) => r.status === 'em_proposta').length;

  const setStatus = async (id: string, status: string) => {
    await atualizarStatusEstrategica(id, status);
    toast.success('Status atualizado');
    load();
  };

  return (
    <>
      <PageHeader
        eyebrow="REQ-10 • Núcleo de Transformação"
        title="Itens Estratégicos"
        subtitle="Editais 🟢 BID aprovados manualmente viram Itens Estratégicos. O time comercial usa este pipeline para formar a proposta técnica."
      />
      <div className="px-6 lg:px-8 py-6 space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
          <KPI label="Itens estratégicos" value={total} accent="primary" />
          <KPI label="Em formação de proposta" value={emProposta} accent="info" />
          <KPI label="Pipeline" value={formatBRL(valor)} accent="success" />
        </div>

        <div className="border-2 border-foreground bg-card shadow-brutal-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/60 border-b-2 border-foreground">
              <tr className="text-[10px] font-mono uppercase tracking-widest">
                <th className="text-left p-3">Edital</th>
                <th className="text-left p-3">Nível</th>
                <th className="text-left p-3">Score</th>
                <th className="text-left p-3">Valor</th>
                <th className="text-left p-3">Aprovado</th>
                <th className="text-left p-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 && <tr><td colSpan={6} className="p-8 text-center text-muted-foreground"><Crown className="h-5 w-5 inline mr-2" />Nenhum item estratégico ainda. Aprove um edital 🟢 BID na triagem.</td></tr>}
              {rows.map((r) => (
                <tr key={r.id} className="border-b border-border align-top">
                  <td className="p-3 max-w-xl">
                    <div className="font-medium line-clamp-2">{r.licitacao_titulo}</div>
                    <div className="text-[11px] text-muted-foreground">{r.orgao} • {r.uf}</div>
                    {r.resumo_executivo && (
                      <ul className="mt-1 text-[11px] list-disc pl-4 space-y-0.5">
                        {(r.resumo_executivo as any[]).slice(0, 3).map((t, i) => <li key={i}>{t}</li>)}
                      </ul>
                    )}
                    {r.licitacao_payload?.linkSistemaOrigem && (
                      <a href={r.licitacao_payload.linkSistemaOrigem} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-[11px] underline mt-1"><ExternalLink className="h-3 w-3" />Edital</a>
                    )}
                  </td>
                  <td className="p-3"><NivelBadge n={r.nivel} /></td>
                  <td className="p-3 font-mono text-xs">{r.score_aderencia}/100</td>
                  <td className="p-3 font-mono text-xs whitespace-nowrap">{formatBRL(r.valor_estimado)}</td>
                  <td className="p-3 text-xs">{formatDate(r.criado_em)}</td>
                  <td className="p-3">
                    <Select value={r.status} onValueChange={(v) => setStatus(r.id, v)}>
                      <SelectTrigger className="h-8 text-xs w-44"><SelectValue /></SelectTrigger>
                      <SelectContent>{STATUS.map((s) => <SelectItem key={s} value={s}>{s.replace(/_/g, ' ')}</SelectItem>)}</SelectContent>
                    </Select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};
