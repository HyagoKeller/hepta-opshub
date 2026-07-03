import { useState } from "react";
import { Navigate, useLocation, useNavigate, Link } from "react-router-dom";
import { useAuth, SEED_CREDENTIALS } from "./AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { HeptaMark } from "@/components/site/SiteHeader";
import {
  AlertCircle, Building2, KeyRound, Loader2, ShieldCheck, Mail, Lock,
} from "lucide-react";

const providers = [
  { id: "entra", label: "Microsoft Entra ID", enabled: false, hint: "OIDC/SAML" },
  { id: "google", label: "Google Workspace", enabled: false, hint: "OIDC" },
  { id: "ldap", label: "Active Directory (LDAP)", enabled: false, hint: "LDAP" },
];

export const LoginPage = () => {
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState(SEED_CREDENTIALS.email);
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showHint, setShowHint] = useState(false);

  if (user) {
    const from = (location.state as any)?.from?.pathname ?? "/app";
    return <Navigate to={from} replace />;
  }

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError(null);
    const res = await login(email, password);
    setLoading(false);
    if (res.ok) navigate("/app", { replace: true });
    else setError(res.error ?? "Falha de autenticação");
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-5 bg-background">
      {/* Painel lateral institucional */}
      <aside className="hidden lg:flex lg:col-span-2 bg-secondary text-secondary-foreground p-10 flex-col justify-between border-r-2 border-foreground relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-brutal opacity-20" />
        <div className="relative">
          <Link to="/" className="flex items-center gap-3">
            <HeptaMark />
            <div>
              <div className="font-display text-xl">Hepta<span className="text-primary">Project</span></div>
              <div className="text-[10px] font-mono uppercase tracking-widest opacity-70">Plataforma operacional</div>
            </div>
          </Link>
          <div className="mt-12">
            <div className="inline-block border-2 border-accent bg-accent text-accent-foreground px-3 py-1 text-[10px] font-bold uppercase tracking-widest mb-5 shadow-brutal-sm">
              Núcleo 01 · Projetos & Squads
            </div>
            <h1 className="font-display text-4xl lg:text-5xl leading-[0.95]">
              Centralize portfólio, squads e capacidade em <span className="text-primary">um só lugar</span>.
            </h1>
            <p className="mt-5 text-sm font-medium opacity-80 max-w-sm">
              Operação multi-entidade com colaboradores, prestadores e parceiros — projetos internos
              e externos no mesmo ambiente, com isolamento lógico.
            </p>
          </div>
        </div>
        <div className="relative grid grid-cols-3 gap-3">
          {[
            { k: "Portfólio", v: "+40 projetos" },
            { k: "Squads", v: "12 ativos" },
            { k: "Pessoas", v: "180" },
          ].map((s) => (
            <div key={s.k} className="border-2 border-sidebar-border p-3">
              <div className="font-display text-2xl">{s.v}</div>
              <div className="text-[9px] font-mono uppercase tracking-widest opacity-70">{s.k}</div>
            </div>
          ))}
        </div>
      </aside>

      {/* Form */}
      <div className="lg:col-span-3 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <HeptaMark />
            <div className="font-display text-lg">Hepta<span className="text-primary">Project</span></div>
          </div>

          <div className="border-2 border-foreground bg-card shadow-brutal p-8">
            <div className="flex items-center gap-2 mb-6">
              <KeyRound className="h-5 w-5 text-primary" />
              <h2 className="font-display text-2xl">Acesso à plataforma</h2>
            </div>

            <form onSubmit={onSubmit} className="space-y-4">
              <div>
                <Label htmlFor="email" className="text-[11px] font-bold uppercase tracking-widest">E-mail corporativo</Label>
                <div className="relative mt-1.5">
                  <Mail className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="email" type="email" autoComplete="email" required
                    value={email} onChange={(e) => setEmail(e.target.value)}
                    className="pl-9 border-2 border-foreground rounded-none h-11"
                    placeholder="seu.usuario@hepta.com.br"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-[11px] font-bold uppercase tracking-widest">Senha</Label>
                  <button type="button" className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground hover:text-foreground">
                    Esqueci minha senha
                  </button>
                </div>
                <div className="relative mt-1.5">
                  <Lock className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="password" type="password" autoComplete="current-password" required
                    value={password} onChange={(e) => setPassword(e.target.value)}
                    className="pl-9 border-2 border-foreground rounded-none h-11"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              {error && (
                <div className="flex items-start gap-2 border-2 border-destructive bg-destructive/10 px-3 py-2 text-xs text-destructive font-medium">
                  <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <Button type="submit" variant="primary" className="w-full" disabled={loading}>
                {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> Autenticando…</> : "Entrar"}
              </Button>

              <button
                type="button"
                onClick={() => setShowHint((v) => !v)}
                className="w-full text-[10px] font-mono uppercase tracking-widest text-muted-foreground hover:text-foreground"
              >
                {showHint ? "Ocultar" : "Mostrar"} credenciais de homologação
              </button>
              {showHint && (
                <div className="border-2 border-dashed border-foreground bg-accent/30 p-3 text-xs">
                  <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-1">Conta de teste</div>
                  <div><strong>E-mail:</strong> {SEED_CREDENTIALS.email}</div>
                  <div><strong>Senha:</strong> {SEED_CREDENTIALS.password}</div>
                  <div className="mt-2 text-[10px] text-muted-foreground">
                    Política: troca obrigatória no primeiro acesso (homologação).
                  </div>
                </div>
              )}
            </form>

            {/* Provedores corporativos */}
            <div className="mt-7">
              <div className="flex items-center gap-3 mb-3">
                <div className="flex-1 h-px bg-foreground/20" />
                <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">Login corporativo</div>
                <div className="flex-1 h-px bg-foreground/20" />
              </div>
              <div className="grid gap-2">
                {providers.map((p) => (
                  <button
                    key={p.id}
                    type="button" disabled
                    className="flex items-center justify-between border-2 border-foreground/30 px-3 py-2 text-xs font-bold uppercase tracking-wide opacity-60 cursor-not-allowed"
                    title="Configurar em Administração → Autenticação e Diretórios"
                  >
                    <span className="flex items-center gap-2">
                      <Building2 className="h-3.5 w-3.5" />
                      {p.label}
                    </span>
                    <span className="font-mono text-[9px] tracking-widest">{p.hint} · desabilitado</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-5 flex items-center justify-between text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
            <span className="flex items-center gap-1.5"><ShieldCheck className="h-3 w-3" /> HTTPS · MFA opcional</span>
            <span>Desenvolvido por Hyago Keller</span>
          </div>
        </div>
      </div>
    </div>
  );
};
