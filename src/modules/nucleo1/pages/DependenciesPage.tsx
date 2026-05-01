import { useMemo, useState } from "react";
import { PageHeader, SectionTitle, KPI } from "../ui";
import { dependencies, projects, deliveries, helpers } from "../mockData";
import { cn } from "@/lib/utils";
import { AlertTriangle, ArrowRight, Network, GitBranch, Zap, Filter } from "lucide-react";

type NodeKind = "projeto" | "entrega";
interface GraphNode {
  id: string;
  label: string;
  kind: NodeKind;
  projectId?: string;
  projectName?: string;
  status?: string;
}

const buildNode = (id: string, fallbackLabel: string): GraphNode => {
  const proj = projects.find((p) => p.id === id);
  if (proj) return { id, label: proj.nome, kind: "projeto", projectId: proj.id, projectName: proj.nome, status: proj.status };
  const del = deliveries.find((d) => d.id === id);
  if (del) {
    const p = helpers.getProject(del.projectId);
    return { id, label: del.nome, kind: "entrega", projectId: del.projectId, projectName: p?.nome, status: del.status };
  }
  return { id, label: fallbackLabel, kind: "entrega" };
};

// Layout em camadas (Sugiyama simplificado): calcula nível por longest-path topológico
const computeLayers = (nodes: GraphNode[], edges: typeof dependencies) => {
  const inMap = new Map<string, string[]>();
  const outMap = new Map<string, string[]>();
  nodes.forEach((n) => { inMap.set(n.id, []); outMap.set(n.id, []); });
  edges.forEach((e) => {
    if (inMap.has(e.toId) && outMap.has(e.fromId)) {
      inMap.get(e.toId)!.push(e.fromId);
      outMap.get(e.fromId)!.push(e.toId);
    }
  });
  const level = new Map<string, number>();
  const visit = (id: string, seen = new Set<string>()): number => {
    if (level.has(id)) return level.get(id)!;
    if (seen.has(id)) return 0;
    seen.add(id);
    const parents = inMap.get(id) || [];
    const lvl = parents.length === 0 ? 0 : Math.max(...parents.map((p) => visit(p, seen) + 1));
    level.set(id, lvl);
    return lvl;
  };
  nodes.forEach((n) => visit(n.id));
  const layers: GraphNode[][] = [];
  nodes.forEach((n) => {
    const lvl = level.get(n.id) ?? 0;
    if (!layers[lvl]) layers[lvl] = [];
    layers[lvl].push(n);
  });
  return { layers, level };
};

export const DependenciesPage = () => {
  const [filter, setFilter] = useState<"todos" | "bloqueantes">("todos");
  const [hoverId, setHoverId] = useState<string | null>(null);

  const visibleEdges = useMemo(
    () => (filter === "bloqueantes" ? dependencies.filter((d) => d.bloqueante) : dependencies),
    [filter]
  );

  const nodes = useMemo<GraphNode[]>(() => {
    const ids = Array.from(new Set(visibleEdges.flatMap((d) => [d.fromId, d.toId])));
    return ids.map((id) => {
      const edge = visibleEdges.find((e) => e.fromId === id || e.toId === id)!;
      const fallback = edge.fromId === id ? edge.fromLabel : edge.toLabel;
      return buildNode(id, fallback);
    });
  }, [visibleEdges]);

  const { layers } = useMemo(() => computeLayers(nodes, visibleEdges), [nodes, visibleEdges]);

  // Posições
  const COL_W = 240;
  const ROW_H = 90;
  const PAD_X = 40;
  const PAD_Y = 40;
  const NODE_W = 200;
  const NODE_H = 64;
  const positions = useMemo(() => {
    const map = new Map<string, { x: number; y: number }>();
    layers.forEach((col, ci) => {
      col.forEach((n, ri) => {
        map.set(n.id, { x: PAD_X + ci * COL_W, y: PAD_Y + ri * ROW_H });
      });
    });
    return map;
  }, [layers]);

  const width = Math.max(700, PAD_X * 2 + layers.length * COL_W);
  const height = Math.max(380, PAD_Y * 2 + Math.max(...layers.map((l) => l.length), 1) * ROW_H);

  const bloqueantes = dependencies.filter((d) => d.bloqueante);
  const projetosImpactados = new Set(
    bloqueantes.flatMap((d) => {
      const fn = buildNode(d.fromId, d.fromLabel);
      const tn = buildNode(d.toId, d.toLabel);
      return [fn.projectId, tn.projectId].filter(Boolean) as string[];
    })
  );

  // Caminho crítico real: pega cadeia mais longa de bloqueantes
  const criticalPath = useMemo(() => {
    const allBloq = dependencies.filter((d) => d.bloqueante);
    const adj = new Map<string, string[]>();
    allBloq.forEach((e) => {
      if (!adj.has(e.fromId)) adj.set(e.fromId, []);
      adj.get(e.fromId)!.push(e.toId);
    });
    let best: string[] = [];
    const dfs = (id: string, path: string[]) => {
      const next = adj.get(id) || [];
      if (next.length === 0) {
        if (path.length > best.length) best = [...path];
        return;
      }
      next.forEach((n) => dfs(n, [...path, n]));
    };
    Array.from(new Set(allBloq.map((e) => e.fromId))).forEach((id) => dfs(id, [id]));
    return best.map((id) => buildNode(id, id));
  }, []);

  const isHighlighted = (edgeId: string) => {
    if (!hoverId) return false;
    const e = dependencies.find((x) => x.id === edgeId);
    return e?.fromId === hoverId || e?.toId === hoverId;
  };

  const nodeFill = (n: GraphNode) => {
    if (n.kind === "projeto") return "hsl(var(--secondary))";
    return "hsl(var(--card))";
  };
  const nodeText = (n: GraphNode) =>
    n.kind === "projeto" ? "hsl(var(--secondary-foreground))" : "hsl(var(--foreground))";

  return (
    <>
      <PageHeader
        eyebrow="Dependências"
        title="Mapa de dependências e bloqueios"
        subtitle="Visão em camadas do que precede o quê. Identifique bloqueios críticos, impacto entre projetos e o caminho crítico operacional."
        actions={
          <div className="flex border-2 border-foreground">
            <button
              onClick={() => setFilter("todos")}
              className={cn(
                "px-3 py-1.5 text-[11px] font-mono uppercase tracking-widest",
                filter === "todos" ? "bg-foreground text-background" : "bg-card hover:bg-muted"
              )}
            >
              <Filter className="inline h-3 w-3 mr-1" /> Todas
            </button>
            <button
              onClick={() => setFilter("bloqueantes")}
              className={cn(
                "px-3 py-1.5 text-[11px] font-mono uppercase tracking-widest border-l-2 border-foreground",
                filter === "bloqueantes" ? "bg-destructive text-destructive-foreground" : "bg-card hover:bg-muted"
              )}
            >
              Só bloqueantes
            </button>
          </div>
        }
      />

      <div className="p-6 lg:p-8 space-y-6">
        {/* KPIs */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <KPI label="Relações mapeadas" value={dependencies.length} sub="entre projetos e entregas" accent="primary" />
          <KPI label="Bloqueantes ativas" value={bloqueantes.length} sub="exigem atenção" accent="destructive" />
          <KPI label="Projetos impactados" value={projetosImpactados.size} sub="por bloqueios" accent="accent" />
          <KPI label="Caminho crítico" value={`${criticalPath.length} etapas`} sub="cadeia mais longa de bloqueios" accent="info" />
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Grafo em camadas */}
          <div className="lg:col-span-2 border-2 border-foreground bg-card shadow-brutal-sm">
            <div className="px-5 pt-5">
              <SectionTitle hint={`${nodes.length} nós · ${visibleEdges.length} relações · ${layers.length} camadas`}>
                <Network className="inline h-4 w-4 mr-1" /> Grafo em camadas
              </SectionTitle>
            </div>

            <div className="overflow-auto border-t-2 border-foreground bg-[linear-gradient(hsl(var(--muted))_1px,transparent_1px),linear-gradient(90deg,hsl(var(--muted))_1px,transparent_1px)] bg-[size:24px_24px]">
              <svg width={width} height={height} className="block min-w-full">
                <defs>
                  <marker id="arr-default" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto">
                    <path d="M0,0 L10,5 L0,10 z" fill="hsl(var(--foreground))" />
                  </marker>
                  <marker id="arr-block" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="8" markerHeight="8" orient="auto">
                    <path d="M0,0 L10,5 L0,10 z" fill="hsl(var(--destructive))" />
                  </marker>
                  <marker id="arr-hi" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="9" markerHeight="9" orient="auto">
                    <path d="M0,0 L10,5 L0,10 z" fill="hsl(var(--primary))" />
                  </marker>
                </defs>

                {/* labels de camadas */}
                {layers.map((_, ci) => (
                  <text
                    key={`lbl-${ci}`}
                    x={PAD_X + ci * COL_W + NODE_W / 2}
                    y={20}
                    textAnchor="middle"
                    className="font-mono"
                    fontSize="9"
                    fill="hsl(var(--muted-foreground))"
                    style={{ letterSpacing: "0.2em", textTransform: "uppercase" }}
                  >
                    Nível {ci + 1}
                  </text>
                ))}

                {/* edges como curvas Bézier */}
                {visibleEdges.map((e) => {
                  const a = positions.get(e.fromId);
                  const b = positions.get(e.toId);
                  if (!a || !b) return null;
                  const x1 = a.x + NODE_W;
                  const y1 = a.y + NODE_H / 2;
                  const x2 = b.x;
                  const y2 = b.y + NODE_H / 2;
                  const cx1 = x1 + (x2 - x1) * 0.5;
                  const cx2 = x2 - (x2 - x1) * 0.5;
                  const hi = isHighlighted(e.id);
                  const stroke = hi
                    ? "hsl(var(--primary))"
                    : e.bloqueante
                    ? "hsl(var(--destructive))"
                    : "hsl(var(--foreground) / 0.45)";
                  const marker = hi ? "url(#arr-hi)" : e.bloqueante ? "url(#arr-block)" : "url(#arr-default)";
                  return (
                    <g key={e.id}>
                      <path
                        d={`M ${x1},${y1} C ${cx1},${y1} ${cx2},${y2} ${x2},${y2}`}
                        fill="none"
                        stroke={stroke}
                        strokeWidth={hi ? 2.5 : e.bloqueante ? 2 : 1.25}
                        strokeDasharray={e.bloqueante ? "0" : "5 4"}
                        markerEnd={marker}
                      />
                      {/* badge tipo (FS/SS/FF) no meio */}
                      <g transform={`translate(${(x1 + x2) / 2 - 10}, ${(y1 + y2) / 2 - 8})`}>
                        <rect width="20" height="14" fill="hsl(var(--background))" stroke={stroke} strokeWidth="1" />
                        <text x="10" y="10" textAnchor="middle" fontSize="8" className="font-mono" fill={stroke}>
                          {e.tipo}
                        </text>
                      </g>
                    </g>
                  );
                })}

                {/* nodes */}
                {nodes.map((n) => {
                  const p = positions.get(n.id)!;
                  const isHover = hoverId === n.id;
                  return (
                    <g
                      key={n.id}
                      transform={`translate(${p.x}, ${p.y})`}
                      onMouseEnter={() => setHoverId(n.id)}
                      onMouseLeave={() => setHoverId(null)}
                      style={{ cursor: "pointer" }}
                    >
                      {/* sombra brutal */}
                      <rect x="3" y="3" width={NODE_W} height={NODE_H} fill="hsl(var(--foreground))" />
                      <rect
                        width={NODE_W}
                        height={NODE_H}
                        fill={nodeFill(n)}
                        stroke="hsl(var(--foreground))"
                        strokeWidth={isHover ? 3 : 2}
                      />
                      {/* faixa lateral por tipo */}
                      <rect
                        width="6"
                        height={NODE_H}
                        fill={n.kind === "projeto" ? "hsl(var(--primary))" : "hsl(var(--accent))"}
                      />
                      <foreignObject x="12" y="6" width={NODE_W - 18} height={NODE_H - 12}>
                        <div className="h-full flex flex-col justify-center" style={{ color: nodeText(n) as string }}>
                          <div className="font-mono text-[8px] uppercase tracking-widest opacity-70">
                            {n.kind === "projeto" ? "Projeto" : `Entrega · ${n.projectName ?? ""}`}
                          </div>
                          <div className="font-bold text-[11px] leading-tight line-clamp-2 mt-0.5">{n.label}</div>
                        </div>
                      </foreignObject>
                    </g>
                  );
                })}
              </svg>
            </div>

            {/* Legenda */}
            <div className="px-5 py-3 border-t-2 border-foreground bg-muted/40 flex flex-wrap items-center gap-x-5 gap-y-2 text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <span className="inline-block w-3 h-3 bg-secondary border-2 border-foreground" /> projeto
              </span>
              <span className="flex items-center gap-1.5">
                <span className="inline-block w-3 h-3 bg-card border-2 border-foreground" /> entrega
              </span>
              <span className="flex items-center gap-1.5">
                <svg width="28" height="6"><line x1="0" y1="3" x2="28" y2="3" stroke="hsl(var(--destructive))" strokeWidth="2" /></svg>
                bloqueante
              </span>
              <span className="flex items-center gap-1.5">
                <svg width="28" height="6"><line x1="0" y1="3" x2="28" y2="3" stroke="hsl(var(--foreground))" strokeWidth="1.5" strokeDasharray="4 3" /></svg>
                opcional
              </span>
              <span>FS = Finish→Start · SS = Start→Start · FF = Finish→Finish</span>
            </div>
          </div>

          {/* Painel lateral */}
          <div className="space-y-5">
            <div className="border-2 border-foreground bg-card p-5 shadow-brutal-sm">
              <SectionTitle>
                <AlertTriangle className="inline h-4 w-4 mr-1 text-destructive" /> Bloqueios ativos
              </SectionTitle>
              {bloqueantes.length === 0 ? (
                <p className="text-xs text-muted-foreground">Nenhum bloqueio crítico no momento.</p>
              ) : (
                <ul className="space-y-2">
                  {bloqueantes.map((d) => {
                    const fn = buildNode(d.fromId, d.fromLabel);
                    const tn = buildNode(d.toId, d.toLabel);
                    return (
                      <li
                        key={d.id}
                        className="border-2 border-destructive bg-destructive/5 p-2.5 text-xs hover:bg-destructive/10 transition-colors"
                        onMouseEnter={() => setHoverId(d.fromId)}
                        onMouseLeave={() => setHoverId(null)}
                      >
                        <div className="flex items-start gap-2">
                          <div className="flex-1 min-w-0">
                            <div className="font-bold leading-tight">{fn.label}</div>
                            <div className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground">
                              {fn.kind} {fn.projectName && fn.kind === "entrega" ? `· ${fn.projectName}` : ""}
                            </div>
                          </div>
                          <ArrowRight className="h-3.5 w-3.5 mt-1 shrink-0 text-destructive" />
                          <div className="flex-1 min-w-0">
                            <div className="font-bold leading-tight">{tn.label}</div>
                            <div className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground">
                              {tn.kind} {tn.projectName && tn.kind === "entrega" ? `· ${tn.projectName}` : ""}
                            </div>
                          </div>
                        </div>
                        <div className="font-mono text-[9px] uppercase tracking-widest text-destructive mt-1.5 flex items-center gap-1">
                          <Zap className="h-3 w-3" /> Tipo {d.tipo} · bloqueante
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>

            <div className="border-2 border-foreground bg-secondary text-secondary-foreground p-5 shadow-brutal-sm">
              <SectionTitle hint={`${criticalPath.length} etapas`}>
                <GitBranch className="inline h-4 w-4 mr-1" /> Caminho crítico
              </SectionTitle>
              <ol className="space-y-2">
                {criticalPath.map((n, i) => (
                  <li
                    key={n.id}
                    className="flex items-start gap-3"
                    onMouseEnter={() => setHoverId(n.id)}
                    onMouseLeave={() => setHoverId(null)}
                  >
                    <span className="h-7 w-7 shrink-0 border-2 border-accent bg-accent text-accent-foreground font-display flex items-center justify-center text-xs">
                      {i + 1}
                    </span>
                    <div className="text-sm leading-tight pt-0.5">
                      <div className="font-bold">{n.label}</div>
                      <div className="font-mono text-[9px] uppercase tracking-widest opacity-70">
                        {n.kind} {n.projectName && n.kind === "entrega" ? `· ${n.projectName}` : ""}
                      </div>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>

        {/* Matriz de dependências */}
        <div className="border-2 border-foreground bg-card shadow-brutal-sm">
          <div className="px-5 pt-5">
            <SectionTitle hint="origem → destino">Tabela de relações</SectionTitle>
          </div>
          <div className="overflow-auto border-t-2 border-foreground">
            <table className="w-full text-xs">
              <thead className="bg-muted/50">
                <tr className="text-left font-mono uppercase tracking-widest text-[10px] text-muted-foreground">
                  <th className="px-4 py-2.5">Origem</th>
                  <th className="px-4 py-2.5">Destino</th>
                  <th className="px-4 py-2.5">Tipo</th>
                  <th className="px-4 py-2.5">Status</th>
                </tr>
              </thead>
              <tbody>
                {dependencies.map((d) => {
                  const fn = buildNode(d.fromId, d.fromLabel);
                  const tn = buildNode(d.toId, d.toLabel);
                  return (
                    <tr
                      key={d.id}
                      className="border-t border-border hover:bg-muted/30 cursor-pointer"
                      onMouseEnter={() => setHoverId(d.fromId)}
                      onMouseLeave={() => setHoverId(null)}
                    >
                      <td className="px-4 py-2">
                        <div className="font-bold">{fn.label}</div>
                        <div className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground">
                          {fn.kind}{fn.projectName && fn.kind === "entrega" ? ` · ${fn.projectName}` : ""}
                        </div>
                      </td>
                      <td className="px-4 py-2">
                        <div className="font-bold">{tn.label}</div>
                        <div className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground">
                          {tn.kind}{tn.projectName && tn.kind === "entrega" ? ` · ${tn.projectName}` : ""}
                        </div>
                      </td>
                      <td className="px-4 py-2">
                        <span className="font-mono text-[10px] px-2 py-0.5 border-2 border-foreground bg-background">
                          {d.tipo}
                        </span>
                      </td>
                      <td className="px-4 py-2">
                        {d.bloqueante ? (
                          <span className="font-mono text-[10px] uppercase tracking-widest px-2 py-0.5 bg-destructive text-destructive-foreground border-2 border-foreground">
                            Bloqueante
                          </span>
                        ) : (
                          <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                            opcional
                          </span>
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
    </>
  );
};
