import { ReactNode } from "react";
import { Navigate, useLocation, Link } from "react-router-dom";
import { ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  usePermissoes,
  type Modulo,
  MODULO_LABEL,
} from "@/modules/nucleo1/AuthContext";

/**
 * Guarda de rota por módulo.
 * Em produção, isso vira RLS via tabela user_roles + user_module_access,
 * nunca hardcoded em profiles — ver docs/security.md
 */
export const RequireModuleAccess = ({
  modulo,
  children,
}: {
  modulo: Modulo;
  children: ReactNode;
}) => {
  const { podeAcessar, user } = usePermissoes();
  const location = useLocation();

  if (!user) {
    return <Navigate to="/app/login" state={{ from: location }} replace />;
  }
  if (podeAcessar(modulo)) return <>{children}</>;

  return <AcessoRestrito modulo={modulo} />;
};

const AcessoRestrito = ({ modulo }: { modulo: Modulo }) => (
  <div className="min-h-[calc(100vh-3.5rem)] grid place-items-center p-8 bg-background">
    <div className="max-w-md w-full border-2 border-foreground bg-card shadow-brutal p-8 text-center">
      <div className="mx-auto h-12 w-12 grid place-items-center border-2 border-foreground bg-destructive/10 mb-4">
        <ShieldAlert className="h-6 w-6 text-destructive" />
      </div>
      <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-1">
        403 · Acesso restrito
      </div>
      <h1 className="font-display text-2xl mb-2">Módulo bloqueado</h1>
      <p className="text-sm text-muted-foreground mb-6">
        Você não tem permissão para acessar{" "}
        <strong className="text-foreground">{MODULO_LABEL[modulo]}</strong>. Solicite
        liberação ao administrador da plataforma.
      </p>
      <div className="flex gap-2 justify-center">
        <Button asChild variant="outline" size="sm">
          <Link to="/app">Voltar ao início</Link>
        </Button>
        <Button asChild variant="primary" size="sm">
          <a href="mailto:admin@hepta.com.br?subject=Solicitação%20de%20acesso%20a%20módulo">
            Solicitar acesso
          </a>
        </Button>
      </div>
    </div>
  </div>
);
