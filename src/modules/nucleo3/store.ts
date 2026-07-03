// Núcleo 03 — persistência local (sem dependência de schema).
// Migrar para Supabase é uma etapa opcional futura.

export type Automacao = {
  id: string;
  nome: string;
  trigger: "edital_aprovado" | "projeto_criado" | "capacidade_critica" | "manual";
  acao: string;
  ativo: boolean;
  criado_em: string;
};

export type AuditoriaEvento = {
  id: string;
  evento: string;
  origem: "nucleo1" | "nucleo2" | "nucleo3" | "plataforma";
  descricao: string;
  ator?: string;
  criado_em: string;
};

const AUT_KEY = "hepta_n3_automacoes";
const AUD_KEY = "hepta_n3_auditoria";

const uuid = () =>
  (globalThis.crypto?.randomUUID?.() ?? Math.random().toString(36).slice(2) + Date.now().toString(36));

const read = <T,>(k: string): T[] => {
  try { return JSON.parse(localStorage.getItem(k) ?? "[]"); } catch { return []; }
};
const write = <T,>(k: string, v: T[]) => localStorage.setItem(k, JSON.stringify(v));

export const listarAutomacoes = (): Automacao[] => read<Automacao>(AUT_KEY);

export const upsertAutomacao = (a: Partial<Automacao> & { id?: string }): Automacao => {
  const list = listarAutomacoes();
  if (a.id) {
    const i = list.findIndex((x) => x.id === a.id);
    if (i >= 0) list[i] = { ...list[i], ...a } as Automacao;
  } else {
    list.unshift({
      id: uuid(),
      nome: a.nome ?? "Nova automação",
      trigger: (a.trigger as Automacao["trigger"]) ?? "manual",
      acao: a.acao ?? "",
      ativo: a.ativo ?? true,
      criado_em: new Date().toISOString(),
    });
    registrarEvento({
      evento: "automacao.criada",
      origem: "nucleo3",
      descricao: `Automação "${a.nome ?? "Nova automação"}" criada`,
    });
  }
  write(AUT_KEY, list);
  return list[0];
};

export const deletarAutomacao = (id: string) => {
  const list = listarAutomacoes().filter((a) => a.id !== id);
  write(AUT_KEY, list);
  registrarEvento({
    evento: "automacao.removida",
    origem: "nucleo3",
    descricao: `Automação ${id.slice(0, 8)} removida`,
  });
};

export const listarAuditoria = (): AuditoriaEvento[] => read<AuditoriaEvento>(AUD_KEY);

export const registrarEvento = (e: Omit<AuditoriaEvento, "id" | "criado_em">) => {
  const list = listarAuditoria();
  list.unshift({ ...e, id: uuid(), criado_em: new Date().toISOString() });
  write(AUD_KEY, list.slice(0, 500));
};

// Seed inicial na primeira execução
if (typeof window !== "undefined" && listarAuditoria().length === 0) {
  registrarEvento({
    evento: "plataforma.inicializada",
    origem: "plataforma",
    descricao: "Núcleo 03 ativado — trilha de auditoria iniciada",
  });
}
