import { createContext, useCallback, useContext, useEffect, useMemo, useState, ReactNode } from "react";

// ─────────────────────────────────────────────────────────────────────────────
// Tipos de módulo
// Em produção, isso vira RLS via tabela user_roles + user_module_access,
// nunca hardcoded em profiles — ver docs/security.md
// ─────────────────────────────────────────────────────────────────────────────
export type Modulo = "projetos_squads" | "licitacoes" | "automacoes";

// Legado: identificadores usados pelo shell/nav.config
export type ModuloId = "nucleo1" | "nucleo2" | "nucleo3";

export const MODULO_BY_NUCLEO: Record<ModuloId, Modulo> = {
  nucleo1: "projetos_squads",
  nucleo2: "licitacoes",
  nucleo3: "automacoes",
};
export const NUCLEO_BY_MODULO: Record<Modulo, ModuloId> = {
  projetos_squads: "nucleo1",
  licitacoes: "nucleo2",
  automacoes: "nucleo3",
};
export const MODULO_LABEL: Record<Modulo, string> = {
  projetos_squads: "Projetos & Squads",
  licitacoes: "Licitações",
  automacoes: "Automações & Governança",
};
export const ALL_MODULOS: Modulo[] = ["projetos_squads", "licitacoes", "automacoes"];

export type PerfilAcesso = "admin" | "membro";

export type Usuario = {
  id: string;
  nome: string;
  email: string;
  avatar?: string;
  perfil: PerfilAcesso;
  modulosPermitidos: Modulo[];
};

// Sessão em uso (inclui alias `modulos` para compatibilidade com o shell antigo)
export type User = Usuario & { modulos: ModuloId[] };

type AuthCtx = {
  user: User | null;
  usuarios: Usuario[];
  login: (email: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  logout: () => void;
  hasModule: (m: ModuloId | Modulo) => boolean;
  atualizarModulos: (userId: string, modulos: Modulo[]) => void;
};

const Ctx = createContext<AuthCtx | null>(null);
const STORAGE_SESSION = "hepta_n1_auth";
const STORAGE_USERS = "hepta_users_v2";

// Senha única de homologação para todos os mocks
const SEED_PASSWORD = "Hepta@2026";

// Seed didático para demo do CEO
const SEED_USERS: Usuario[] = [
  {
    id: "u-admin",
    nome: "Admin Hepta",
    email: "admin@hepta.com.br",
    perfil: "admin",
    modulosPermitidos: [...ALL_MODULOS],
  },
  {
    id: "u-comercial",
    nome: "Comercial",
    email: "comercial@hepta.com.br",
    perfil: "membro",
    modulosPermitidos: ["licitacoes"],
  },
  {
    id: "u-gestor",
    nome: "Gestor de Projetos",
    email: "gestor@hepta.com.br",
    perfil: "membro",
    modulosPermitidos: ["projetos_squads", "automacoes"],
  },
];

const toSessionUser = (u: Usuario): User => ({
  ...u,
  modulos: u.modulosPermitidos.map((m) => NUCLEO_BY_MODULO[m]),
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [usuarios, setUsuarios] = useState<Usuario[]>(() => {
    if (typeof window === "undefined") return SEED_USERS;
    try {
      const raw = localStorage.getItem(STORAGE_USERS);
      if (raw) return JSON.parse(raw) as Usuario[];
    } catch {}
    return SEED_USERS;
  });
  const [user, setUser] = useState<User | null>(null);

  // persiste diretório de usuários (mock)
  useEffect(() => {
    try { localStorage.setItem(STORAGE_USERS, JSON.stringify(usuarios)); } catch {}
  }, [usuarios]);

  // hidrata sessão
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_SESSION);
      if (!raw) return;
      const parsed = JSON.parse(raw) as Partial<User> & { email?: string };
      const u = usuarios.find((x) => x.email === parsed.email);
      if (u) setUser(toSessionUser(u));
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const login: AuthCtx["login"] = async (email, password) => {
    await new Promise((r) => setTimeout(r, 300));
    const found = usuarios.find((u) => u.email.trim().toLowerCase() === email.trim().toLowerCase());
    if (!found || password !== SEED_PASSWORD) {
      return { ok: false, error: "Credenciais inválidas. Use a conta de homologação." };
    }
    const sess = toSessionUser(found);
    localStorage.setItem(STORAGE_SESSION, JSON.stringify(sess));
    setUser(sess);
    return { ok: true };
  };

  const logout = () => { localStorage.removeItem(STORAGE_SESSION); setUser(null); };

  const hasModule = useCallback((m: ModuloId | Modulo) => {
    if (!user) return false;
    if (user.perfil === "admin") return true; // admin enxerga tudo
    const modulo: Modulo = (m in NUCLEO_BY_MODULO ? (m as Modulo) : MODULO_BY_NUCLEO[m as ModuloId]);
    return user.modulosPermitidos.includes(modulo);
  }, [user]);

  const atualizarModulos: AuthCtx["atualizarModulos"] = (userId, modulos) => {
    setUsuarios((prev) => prev.map((u) => u.id === userId ? { ...u, modulosPermitidos: modulos } : u));
    setUser((curr) => {
      if (!curr || curr.id !== userId) return curr;
      const next = toSessionUser({ ...curr, modulosPermitidos: modulos });
      try { localStorage.setItem(STORAGE_SESSION, JSON.stringify(next)); } catch {}
      return next;
    });
  };

  const value = useMemo<AuthCtx>(() => ({ user, usuarios, login, logout, hasModule, atualizarModulos }),
    [user, usuarios, hasModule]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
};

export const useAuth = () => {
  const c = useContext(Ctx);
  if (!c) throw new Error("useAuth must be inside AuthProvider");
  return c;
};

// ─────────────────────────────────────────────────────────────────────────────
// Hook de permissões
// Em produção: substituir por checagem server-side (RLS + policies).
// ─────────────────────────────────────────────────────────────────────────────
export const usePermissoes = () => {
  const { user, hasModule } = useAuth();
  const podeAcessar = useCallback((modulo: Modulo) => hasModule(modulo), [hasModule]);
  const isAdmin = user?.perfil === "admin";
  return { podeAcessar, isAdmin, user };
};

export const SEED_CREDENTIALS = { email: "admin@hepta.com.br", password: SEED_PASSWORD };
export const SEED_USERS_INFO = SEED_USERS.map((u) => ({ email: u.email, nome: u.nome, perfil: u.perfil }));
