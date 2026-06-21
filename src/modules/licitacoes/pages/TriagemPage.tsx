import { useEffect, useState } from 'react';
import { listarTriagens } from '../api';
import { KPI, NivelBadge, PageHeader, formatBRL, formatDate } from '../ui';

export const TriagemPage = () => {
  const [rows, setRows] = useState<any[]>([]);
  useEffect(() => { listarTriagens().then(setRows); }, []);

  const altas = rows.filter((r) => r.nivel === 'alta').length;
  const part = rows.filter((r) => r.recomendacao === 'participar').length;
  const valor = rows.reduce((s, r) => s + Number(r.valor_estimado ?? 0), 0);

  return (
    <>
      <PageHeader
        eyebrow="Histórico de análises IA"
        title="Triagem IA"
        subtitle="Todas as análises de aderência geradas pelo Gemini, com score, recomendação e rentabilidade estimada."
      />
      <div className="px-6 lg:px-8 py-6 space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <KPI label="Análises realizadas" value={rows.length} accent="primary" />
          <KPI label="Aderência alta" value={altas} accent="success" />
          <KPI label="Recomendado participar" value={part} accent="accent" />
          <KPI label="Pipeline analisado" value={formatBRL(valor)} accent="info" />
        </div>

        <div className="border-2 border-foreground bg-card shadow-brutal-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/60 border-b-2 border-foreground">
              <tr className="text-[10px] font-mono uppercase tracking-widest">
                <th className="text-left p-3">Quando</th>
                <th className="text-left p-3">Órgão / Objeto</th>
                <th className="text-left p-3">Score</th>
                <th className="text-left p-3">Nível</th>
                <th className="text-left p-3">Recomendação</th>
                <th className="text-left p-3">Valor est.</th>
                <th className="text-left p-3">Margem</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 && <tr><td colSpan={7} className="p-8 text-center text-muted-foreground">Nenhuma triagem ainda. Vá ao Radar e clique em "Triagem IA".</td></tr>}
              {rows.map((r) => (
                <tr key={r.id} className="border-b border-border hover:bg-muted/30">
                  <td className="p-3 text-xs whitespace-nowrap">{formatDate(r.criado_em)}</td>
                  <td className="p-3 max-w-md">
                    <div className="font-medium line-clamp-2">{r.licitacao_titulo}</div>
                    <div className="text-[11px] text-muted-foreground">{r.orgao}</div>
                  </td>
                  <td className="p-3 font-display text-base">{r.score_aderencia}</td>
                  <td className="p-3"><NivelBadge n={r.nivel} /></td>
                  <td className="p-3 text-xs uppercase font-bold">{r.recomendacao}</td>
                  <td className="p-3 font-mono text-xs">{formatBRL(Number(r.valor_estimado))}</td>
                  <td className="p-3 text-xs">{r.rentabilidade?.margem_estimada_pct ?? '—'}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};
