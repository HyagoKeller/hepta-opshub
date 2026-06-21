import { useEffect, useState } from 'react';
import { Star, ExternalLink } from 'lucide-react';
import { listarFavoritos } from '../api';
import { PageHeader, formatBRL, formatDate } from '../ui';
import { Button } from '@/components/ui/button';

export const FavoritosPage = () => {
  const [rows, setRows] = useState<any[]>([]);
  useEffect(() => { listarFavoritos().then(setRows); }, []);
  return (
    <>
      <PageHeader eyebrow="Pipeline" title="Favoritos" subtitle="Licitações marcadas para acompanhamento." />
      <div className="px-6 lg:px-8 py-6 space-y-3">
        {rows.length === 0 && <div className="text-muted-foreground"><Star className="h-5 w-5 inline mr-2" />Nenhuma licitação favoritada.</div>}
        {rows.map((f) => {
          const it = f.licitacao_payload || {};
          return (
            <div key={f.id} className="border-2 border-foreground bg-card shadow-brutal-sm p-4 flex items-start justify-between gap-4">
              <div className="min-w-0">
                <div className="font-medium line-clamp-2">{it.objeto}</div>
                <div className="text-[11px] text-muted-foreground mt-1">{it.orgao} • {it.uf} • {formatDate(it.dataPublicacao)}</div>
                <div className="text-xs font-mono mt-1">{formatBRL(it.valorEstimado)}</div>
              </div>
              {it.linkSistemaOrigem && (
                <a href={it.linkSistemaOrigem} target="_blank" rel="noreferrer">
                  <Button size="sm" variant="outline"><ExternalLink className="h-3.5 w-3.5 mr-1" />Abrir edital</Button>
                </a>
              )}
            </div>
          );
        })}
      </div>
    </>
  );
};
