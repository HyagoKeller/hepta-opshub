# RBAC — Controle de Acesso por Módulo

Documento de referência do modelo de permissões da plataforma HeptaProject. Cobre o modelo V1 (mock em `AuthContext`) e a migração para V2 (Postgres + RLS).

---

## 1. Conceitos

```ts
type Modulo = 'projetos_squads' | 'licitacoes' | 'automacoes';

type Usuario = {
  id: string;
  nome: string;
  email: string;
  avatar?: string;
  perfil: 'admin' | 'membro';         // admin enxerga tudo e gerencia permissões
  modulosPermitidos: Modulo[];        // ex.: ['licitacoes'] ou ['projetos_squads','automacoes']
};
```

- **`admin`** — acesso a todos os módulos + acesso à tela `/app/admin/acessos`.
- **`membro`** — acesso somente aos módulos listados em `modulosPermitidos`.

## 2. API do frontend (V1)

### Hook `usePermissoes()`
```ts
const { podeAcessar } = usePermissoes();
podeAcessar('licitacoes'); // boolean
// admin → sempre true
// membro → user.modulosPermitidos.includes(modulo)
```

### Guard de rota `RequireModuleAccess`
Envelope de rota que renderiza uma tela de **403 — Acesso restrito** quando o usuário não tem o módulo.

```tsx
<Route
  path="/app/licitacoes/*"
  element={<RequireModuleAccess modulo="licitacoes"><LicitacoesRoutes /></RequireModuleAccess>}
/>
```

### Seletor de núcleo
O `NucleoSwitcher` na topbar oculta os núcleos sem permissão para o usuário logado. Rota bloqueada por link direto cai no 403 do guard, com CTA para voltar ao primeiro núcleo permitido.

### Tela `/app/admin/acessos`
- Somente `perfil === 'admin'`.
- Tabela de usuários + `EditAccessDialog` com checkboxes por módulo.
- Persiste via `AuthContext.atualizarModulos(userId, modulos)` (localStorage na V1).

## 3. Usuários seed (demo)

| Nome | Perfil | Módulos | Uso na demo |
|---|---|---|---|
| Admin Hepta | admin | todos | Apresentação completa + gestão de acessos |
| Comercial | membro | `licitacoes` | Fluxo Radar → Triagem → Estratégica |
| Gestor de Projetos | membro | `projetos_squads`, `automacoes` | Portfólio + esteira de automações |

Senha de homologação: **`Hepta@2026`** (atalhos de click-to-fill em `LoginPage`).

## 4. Migração V2 — Postgres + RLS

**Este mock é temporário.** Em produção, roles e acessos NUNCA ficam em `profiles`/`users` para evitar escalada de privilégio (o usuário poderia editar o próprio perfil e virar admin).

### Esquema alvo

```sql
create type public.app_role as enum ('admin', 'membro');
create type public.app_module as enum ('projetos_squads', 'licitacoes', 'automacoes');

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role app_role not null,
  unique (user_id, role)
);

create table public.user_module_access (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  modulo app_module not null,
  unique (user_id, modulo)
);

grant select on public.user_roles         to authenticated;
grant select on public.user_module_access to authenticated;
grant all    on public.user_roles         to service_role;
grant all    on public.user_module_access to service_role;

alter table public.user_roles         enable row level security;
alter table public.user_module_access enable row level security;
```

### Funções security definer (evitam recursão de RLS)

```sql
create or replace function public.has_role(_user uuid, _role app_role)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.user_roles where user_id = _user and role = _role);
$$;

create or replace function public.has_module(_user uuid, _modulo app_module)
returns boolean language sql stable security definer set search_path = public as $$
  select
    public.has_role(_user, 'admin')
    or exists (
      select 1 from public.user_module_access
      where user_id = _user and modulo = _modulo
    );
$$;
```

### Uso nas policies dos núcleos

```sql
-- exemplo: leitura de automações só para quem tem acesso ao módulo
create policy "read automacoes"
  on public.automacoes for select to authenticated
  using (public.has_module(auth.uid(), 'automacoes'));
```

## 5. Onde o código está hoje

| Arquivo | Papel |
|---|---|
| `src/modules/nucleo1/AuthContext.tsx` | Tipos `Modulo`/`Usuario`, seed users, `hasModule`, `atualizarModulos` |
| `src/modules/platform/RequireModuleAccess.tsx` | Guard de rota + tela 403 |
| `src/modules/platform/nav.config.ts` | Metadata dos núcleos consumida pelo `NucleoSwitcher` |
| `src/modules/nucleo1/pages/AcessosPage.tsx` | Admin — tabela + `EditAccessDialog` |
| `src/modules/nucleo1/LoginPage.tsx` | Seed users + click-to-fill |
| `src/App.tsx` | Aplicação dos guards nas rotas de cada núcleo |

Todos os pontos acima trazem comentário `// V2: migrar para user_roles + user_module_access` sinalizando a substituição.
