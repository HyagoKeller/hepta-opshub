import { createContext, useContext, useEffect, useState, ReactNode } from "react";

type User = { email: string; nome: string; perfil: string };

type AuthCtx = {
  user: User | null;
  login: (email: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  logout: () => void;
};

const Ctx = createContext<AuthCtx | null>(null);
const STORAGE = "hepta_n1_auth";

// Conta de homologação (mock)
const SEED_EMAIL = "admin@hepta.com.br";
const SEED_PASSWORD = "Hepta@2026";

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const raw = localStorage.getItem(STORAGE);
    if (raw) try { setUser(JSON.parse(raw)); } catch {}
  }, []);

  const login: AuthCtx["login"] = async (email, password) => {
    await new Promise((r) => setTimeout(r, 400));
    if (email.trim().toLowerCase() === SEED_EMAIL && password === SEED_PASSWORD) {
      const u: User = { email: SEED_EMAIL, nome: "Administrador Hepta", perfil: "Super Admin" };
      localStorage.setItem(STORAGE, JSON.stringify(u));
      setUser(u);
      return { ok: true };
    }
    return { ok: false, error: "Credenciais inválidas. Use a conta de homologação." };
  };

  const logout = () => { localStorage.removeItem(STORAGE); setUser(null); };

  return <Ctx.Provider value={{ user, login, logout }}>{children}</Ctx.Provider>;
};

export const useAuth = () => {
  const c = useContext(Ctx);
  if (!c) throw new Error("useAuth must be inside AuthProvider");
  return c;
};

export const SEED_CREDENTIALS = { email: SEED_EMAIL, password: SEED_PASSWORD };
