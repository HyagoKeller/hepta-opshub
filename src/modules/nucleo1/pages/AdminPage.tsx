import { useState } from "react";
import { PageHeader, SectionTitle } from "../ui";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import {
  KeyRound, Building2, Globe, Server, ShieldCheck, Settings as SettingsIcon, FileText, Users,
} from "lucide-react";

const tabs = [
  { id: "auth", label: "Autenticação & Diretórios", icon: ShieldCheck },
  { id: "templates", label: "Templates de projeto", icon: FileText },
  { id: "campos", label: "Campos & status", icon: SettingsIcon },
  { id: "perfis", label: "Perfis & permissões", icon: Users },
] as const;

export const AdminPage = () => {
  const [tab, setTab] = useState<typeof tabs[number]["id"]>("auth");
  return (
    <>
      <PageHeader
        eyebrow="Administração do núcleo"
        title="Configurações da plataforma"
        subtitle="Identidade corporativa, templates, status, campos customizados e matriz de permissões."
      />
      <div className="border-b-2 border-foreground bg-background px-6 lg:px-8 flex overflow-x-auto">
        {tabs.map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={cn(
              "flex items-center gap-2 px-4 py-3 text-xs font-bold uppercase tracking-widest border-b-2 transition-smooth",
              tab === t.id ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground",
            )}>
            <t.icon className="h-3.5 w-3.5" /> {t.label}
          </button>
        ))}
      </div>

      <div className="p-6 lg:p-8">
        {tab === "auth" && <AuthSection />}
        {tab === "templates" && <TemplatesSection />}
        {tab === "campos" && <FieldsSection />}
        {tab === "perfis" && <RolesSection />}
      </div>
    </>
  );
};

const AuthSection = () => {
  const [local, setLocal] = useState(true);
  const [entra, setEntra] = useState(false);
  const [google, setGoogle] = useState(false);
  const [ldap, setLdap] = useState(false);

  return (
    <div className="grid lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-5">
        <ConnectorCard
          icon={KeyRound} title="Login local" hint="Conta administrativa de homologação"
          enabled={local} onToggle={setLocal} accent="primary"
        >
          <div className="grid sm:grid-cols-2 gap-3">
            <FieldRO label="Usuário admin" value="admin@hepta.com.br" />
            <FieldRO label="Política de senha" value="12 chars · MFA opcional" />
            <FieldRO label="Bloqueio" value="5 tentativas / 15 min" />
            <FieldRO label="Recuperação" value="por e-mail (mock)" />
          </div>
          <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mt-3">
            ✓ Troca obrigatória de senha no primeiro acesso · ✓ Mantém-se mesmo com federação ativa
          </p>
        </ConnectorCard>

        <ConnectorCard icon={Building2} title="Microsoft Entra ID (Azure AD)"
          hint="SAML 2.0 ou OIDC · SCIM para provisionamento" enabled={entra} onToggle={setEntra} accent="info">
          <div className="grid sm:grid-cols-2 gap-3">
            <FieldInput label="Tenant ID" placeholder="00000000-0000-0000-0000-000000000000" />
            <FieldInput label="Client ID" placeholder="aplicação registrada" />
            <FieldInput label="Client Secret" placeholder="••••••••••••" type="password" />
            <FieldInput label="Redirect URI" placeholder="https://heptaproject.com/auth/callback" />
            <FieldSelect label="Método" options={["OIDC", "SAML"]} />
            <FieldInput label="Domínios permitidos" placeholder="hepta.com.br" />
          </div>
          <ProvisioningRow />
        </ConnectorCard>

        <ConnectorCard icon={Globe} title="Google Workspace"
          hint="OpenID Connect (OAuth 2.0)" enabled={google} onToggle={setGoogle} accent="accent">
          <div className="grid sm:grid-cols-2 gap-3">
            <FieldInput label="Client ID" placeholder="xxx.apps.googleusercontent.com" />
            <FieldInput label="Client Secret" placeholder="••••••••••••" type="password" />
            <FieldInput label="Redirect URI" placeholder="https://heptaproject.com/auth/google" />
            <FieldInput label="Domínios permitidos" placeholder="hepta.com.br" />
          </div>
        </ConnectorCard>

        <ConnectorCard icon={Server} title="Active Directory (LDAP)"
          hint="Bind e validação no diretório corporativo" enabled={ldap} onToggle={setLdap} accent="success">
          <div className="grid sm:grid-cols-2 gap-3">
            <FieldInput label="Host" placeholder="ldap.hepta.local" />
            <FieldInput label="Porta" placeholder="636" />
            <FieldInput label="Base DN" placeholder="dc=hepta,dc=local" />
            <FieldInput label="Bind DN" placeholder="cn=svc-app,ou=svc,dc=hepta,dc=local" />
            <FieldInput label="Bind Password" placeholder="••••••••" type="password" />
            <FieldInput label="Filtro de busca" placeholder="(sAMAccountName={user})" />
            <FieldInput label="Atributo de login" placeholder="sAMAccountName" />
            <FieldSelect label="TLS" options={["LDAPS", "StartTLS", "Nenhum"]} />
          </div>
        </ConnectorCard>
      </div>

      {/* Painel lateral */}
      <aside className="space-y-5">
        <div className="border-2 border-foreground bg-secondary text-secondary-foreground p-5 shadow-brutal-sm">
          <SectionTitle hint="prioridade">Método padrão de login</SectionTitle>
          <ol className="space-y-2 text-sm">
            {["Microsoft Entra ID", "Google Workspace", "LDAP/AD", "Login local"].map((m, i) => (
              <li key={m} className="flex items-center justify-between border-2 border-sidebar-border px-3 py-2">
                <span className="flex items-center gap-2">
                  <span className="font-mono text-[10px] opacity-70">#{i + 1}</span>
                  <span className="font-bold">{m}</span>
                </span>
                <span className="font-mono text-[10px] uppercase tracking-widest opacity-70">{i === 3 ? "fallback" : "ativo"}</span>
              </li>
            ))}
          </ol>
        </div>

        <div className="border-2 border-foreground bg-accent/30 p-5 shadow-brutal-sm">
          <SectionTitle>Política global</SectionTitle>
          <ul className="space-y-2 text-xs">
            <PolicyRow label="Criação automática de usuário" on />
            <PolicyRow label="Restrição por domínio" on />
            <PolicyRow label="MFA quando suportado" on />
            <PolicyRow label="Mapear grupos externos → perfis" on />
            <PolicyRow label="Logs de autenticação" on />
            <PolicyRow label="Fallback login local" on />
          </ul>
        </div>

        <div className="border-2 border-foreground bg-card p-5 shadow-brutal-sm">
          <SectionTitle>Logs recentes</SectionTitle>
          <ul className="space-y-1 text-[11px] font-mono">
            <li>14:22 ✓ admin@hepta · local</li>
            <li>13:08 ✗ ana.martins · senha inválida</li>
            <li>11:45 ✓ admin@hepta · local</li>
            <li>09:30 ⚠ ldap · timeout</li>
          </ul>
        </div>
      </aside>
    </div>
  );
};

const ConnectorCard = ({
  icon: Icon, title, hint, enabled, onToggle, children, accent,
}: any) => (
  <div className="border-2 border-foreground bg-card shadow-brutal-sm">
    <div className={cn("flex items-center justify-between p-4 border-b-2 border-foreground",
      accent === "primary" && "bg-primary/10",
      accent === "info" && "bg-info/10",
      accent === "accent" && "bg-accent/30",
      accent === "success" && "bg-success/10",
    )}>
      <div className="flex items-center gap-3">
        <Icon className="h-5 w-5" />
        <div>
          <div className="font-display text-base">{title}</div>
          <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">{hint}</div>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <Switch checked={enabled} onCheckedChange={onToggle} />
        <span className="font-mono text-[10px] uppercase tracking-widest">{enabled ? "ativo" : "desabilitado"}</span>
      </div>
    </div>
    <div className={cn("p-5", !enabled && "opacity-40 pointer-events-none")}>
      {children}
      <div className="flex justify-end gap-2 mt-4">
        <Button size="sm" variant="outline" disabled={!enabled}>Testar conexão</Button>
        <Button size="sm" variant="primary" disabled={!enabled}>Salvar</Button>
      </div>
    </div>
  </div>
);

const FieldInput = ({ label, placeholder, type = "text" }: any) => (
  <div>
    <Label className="text-[10px] font-bold uppercase tracking-widest">{label}</Label>
    <Input type={type} placeholder={placeholder} className="mt-1 border-2 border-foreground rounded-none h-9" />
  </div>
);
const FieldRO = ({ label, value }: { label: string; value: string }) => (
  <div className="border-2 border-foreground p-2.5 bg-muted/40">
    <div className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground">{label}</div>
    <div className="font-bold text-sm">{value}</div>
  </div>
);
const FieldSelect = ({ label, options }: { label: string; options: string[] }) => (
  <div>
    <Label className="text-[10px] font-bold uppercase tracking-widest">{label}</Label>
    <select className="mt-1 w-full h-9 border-2 border-foreground rounded-none bg-background px-2 text-xs font-bold uppercase tracking-wide">
      {options.map((o) => <option key={o}>{o}</option>)}
    </select>
  </div>
);
const ProvisioningRow = () => (
  <div className="mt-4 flex items-center justify-between border-2 border-dashed border-foreground p-3">
    <div className="text-xs">
      <div className="font-bold">Provisionamento automático (SCIM)</div>
      <div className="text-[10px] text-muted-foreground font-mono uppercase tracking-widest">Sincroniza usuários e grupos</div>
    </div>
    <Switch defaultChecked />
  </div>
);
const PolicyRow = ({ label, on }: { label: string; on?: boolean }) => (
  <li className="flex items-center justify-between">
    <span>{label}</span>
    <Switch defaultChecked={on} />
  </li>
);

const TemplatesSection = () => (
  <div className="grid md:grid-cols-3 gap-5">
    {[
      { t: "Implantação cliente", uso: "12 projetos", fases: "Discovery · Setup · Go-live · Sustentação" },
      { t: "POC inovação", uso: "5 projetos", fases: "Hipótese · Build · Validação · Decisão" },
      { t: "Sustentação evolutiva", uso: "8 projetos", fases: "Backlog contínuo · Sprint · Release" },
      { t: "Automação RPA", uso: "3 projetos", fases: "Mapeamento · Build · Testes · Esteira" },
      { t: "Consultoria", uso: "6 projetos", fases: "Diagnóstico · Recomendação · Hand-off" },
      { t: "Projeto interno Hepta", uso: "9 projetos", fases: "Plano · Execução · Adoção interna" },
    ].map((tpl) => (
      <div key={tpl.t} className="border-2 border-foreground bg-card p-5 shadow-brutal-sm hover-brutal">
        <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-1">Template</div>
        <h3 className="font-display text-lg mb-2">{tpl.t}</h3>
        <p className="text-xs">{tpl.fases}</p>
        <div className="mt-3 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">{tpl.uso}</div>
      </div>
    ))}
  </div>
);

const FieldsSection = () => (
  <div className="grid lg:grid-cols-2 gap-6">
    <div className="border-2 border-foreground bg-card p-5 shadow-brutal-sm">
      <SectionTitle>Status configuráveis</SectionTitle>
      <ul className="divide-y-2 divide-foreground">
        {["Ideia", "Planejado", "Em execução", "Bloqueado", "Em validação", "Concluído", "Cancelado"].map((s, i) => (
          <li key={s} className="py-2.5 flex items-center justify-between">
            <span className="flex items-center gap-3">
              <span className="font-mono text-[10px] text-muted-foreground">#{i + 1}</span>
              <span className="font-bold">{s}</span>
            </span>
            <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">cor + regra</span>
          </li>
        ))}
      </ul>
    </div>
    <div className="border-2 border-foreground bg-card p-5 shadow-brutal-sm">
      <SectionTitle>Campos customizados</SectionTitle>
      <ul className="divide-y-2 divide-foreground">
        {[
          ["Sponsor executivo", "pessoa"], ["Centro de custo", "texto"], ["Modalidade contratual", "select"],
          ["Risco regulatório", "select"], ["Anexos contratuais", "arquivo"], ["Score CSAT", "número"],
        ].map(([n, t]) => (
          <li key={n} className="py-2.5 flex items-center justify-between">
            <span className="font-bold">{n}</span>
            <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">{t}</span>
          </li>
        ))}
      </ul>
    </div>
  </div>
);

const RolesSection = () => {
  const perfis = [
    "Super Admin", "Admin Plataforma", "Gestor Portfólio", "Gestor Projeto",
    "Líder Squad", "Colaborador", "Prestador", "Parceiro", "Cliente Observador", "Cliente Gestor",
  ];
  const perms = [
    "Criar projeto", "Editar projeto", "Encerrar projeto", "Criar squad",
    "Alocar recurso", "Aprovar alocação", "Ver custos", "Ver indicadores execs",
    "Exportar dados", "Configurar autenticação",
  ];
  // matriz determinística
  const allow = (p: string, perm: string) => {
    if (p === "Super Admin" || p === "Admin Plataforma") return true;
    if (p === "Gestor Portfólio") return !["Configurar autenticação"].includes(perm);
    if (p === "Gestor Projeto") return ["Criar projeto", "Editar projeto", "Encerrar projeto", "Criar squad", "Alocar recurso", "Ver indicadores execs", "Exportar dados"].includes(perm);
    if (p === "Líder Squad") return ["Criar squad", "Alocar recurso", "Ver indicadores execs"].includes(perm);
    if (p === "Cliente Gestor") return ["Ver indicadores execs", "Exportar dados"].includes(perm);
    if (p === "Cliente Observador") return ["Ver indicadores execs"].includes(perm);
    return false;
  };
  return (
    <div className="border-2 border-foreground bg-card shadow-brutal-sm overflow-x-auto">
      <table className="w-full text-xs">
        <thead className="bg-foreground text-background">
          <tr>
            <th className="text-left p-3 sticky left-0 bg-foreground">Perfil</th>
            {perms.map((p) => <th key={p} className="text-center p-2 font-mono text-[10px] uppercase tracking-widest">{p}</th>)}
          </tr>
        </thead>
        <tbody className="divide-y-2 divide-foreground">
          {perfis.map((perfil) => (
            <tr key={perfil} className="hover:bg-muted/30">
              <td className="p-3 font-bold sticky left-0 bg-card">{perfil}</td>
              {perms.map((perm) => (
                <td key={perm} className="text-center p-2">
                  {allow(perfil, perm)
                    ? <span className="inline-block h-4 w-4 bg-success border-2 border-foreground" />
                    : <span className="inline-block h-4 w-4 bg-muted border-2 border-foreground/30" />}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
