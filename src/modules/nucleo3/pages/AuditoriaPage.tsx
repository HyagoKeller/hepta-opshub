import { useEffect, useState } from "react";
import { ScrollText, RefreshCw } from "lucide-react";
import { PageHeader } from "@/modules/licitacoes/ui";
import { Button } from "@/components/ui/button";
import { listarAuditoria, type AuditoriaEvento } from "../store";

const origemColor: Record<AuditoriaEvento["origem"], string> = {
  nucleo1: "bg-primary text-primary-foreground",
  nucleo2: "bg-accent text-accent-foreground",
  nucleo3: "bg-steel text-steel-foreground",
  plataforma: "bg-muted text-foreground",
};

export const AuditoriaPage = () => {
  const [items, setItems] = useState<AuditoriaEvento[]>([]);
  const reload = () => setItems(listarAuditoria());
  useEffect(reload, []);

  return (
    <>
      <PageHeader
        eyebrow="Núcleo 03 • Trilha imutável"
        title="Auditoria"
        subtitle="Eventos operacionais registrados pela plataforma. Somente leitura."
        actions={<Button size="sm" variant="outline" onClick={reload}><RefreshCw className="h-3.5 w-3.5 mr-1" />Atualizar</Button>}
      />
      <div className="px-6 lg:px-8 py-6">
        <div className="border-2 border-foreground bg-card shadow-brutal-sm">
          {items.length === 0 ? (
            <div className="p-10 text-center text-muted-foreground">
              <ScrollText className="h-5 w-5 inline mr-2" />Nenhum evento registrado ainda.
            </div>
          ) : (
            <ul className="divide-y-2 divide-border">
              {items.map((e) => (
                <li key={e.id} className="p-4 flex items-start gap-3">
                  <span className={`shrink-0 text-[9px] font-mono uppercase tracking-widest px-1.5 py-0.5 border-2 border-foreground ${origemColor[e.origem]}`}>
                    {e.origem}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium">{e.descricao}</div>
                    <div className="text-[11px] text-muted-foreground font-mono uppercase tracking-widest mt-0.5">
                      {e.evento} · {new Date(e.criado_em).toLocaleString("pt-BR")}
                      {e.ator ? ` · ${e.ator}` : ""}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </>
  );
};
