# Arquitetura — HeptaProject (V1)

## 1. Visão geral

SPA em **React 18 + Vite + TypeScript + Tailwind + shadcn**. A landing pública é puramente institucional; o ambiente autenticado vive sob um **shell único** (`/app`) que abriga os 3 núcleos, com **RBAC por módulo** aplicado nas rotas.

O Núcleo 01 usa dados **mockados em memória** (`DataStore`). Os Núcleos 02 e 03 usam **Lovable Cloud** (Postgres + Edge Functions). A substituição do mock do Núcleo 01 por persistência real afeta apenas o `DataStore`.

```text
┌────────────────────────────────────────────────────────────────┐
│                          Browser (SPA)                         │
│                                                                │
│  Landing pública (/)                                           │
│     └── CTA único → /app/login (ou /app se autenticado)        │
│                                                                │
│  AppShell (/app/*)  ── src/app/AppShell.tsx                    │
│     ├── Topbar: logo + Seletor de Núcleo + Usuário/Logout      │
│     ├── Sidebar: itens do núcleo ativo (nav.config.ts)         │
│     └── Outlet                                                 │
│         ├── Núcleo 01 (/app/projetos/*)  ── DataStore mock     │
│         ├── Núcleo 02 (/app/licitacoes/*) ── Lovable Cloud     │
│         └── Núcleo 03 (/app/automacoes/*) ── Lovable Cloud     │
│                                                                │
│  Guards                                                        │
│     ├── RequireAuth        (sessão via AuthContext)            │
│     └── RequireModuleAccess(modulo)  → 403 se não permitido    │
└────────────────────────────────────────────────────────────────┘
```

## 2. Camadas

### 2.1 Apresentação institucional (`src/components/site`, `src/components/projects`)
Landing Hepta — manifesto, módulos, diferenciais, CTA. Não depende de auth. Único CTA de acesso à plataforma.

### 2.2 Shell autenticado (`src/app/AppShell.tsx`)
Shell **único** para os 3 núcleos:
- **Topbar** fixa com logo, **Seletor de Núcleo** (`NucleoSwitcher`), avatar e logout.
- **Sidebar** que renderiza os itens do núcleo ativo (definidos em `src/modules/platform/nav.config.ts`).
- Tema visual muda por núcleo (primary/accent/success) mantendo tokens semânticos.
- Os antigos `nucleo1/AppShell` e `licitacoes/AppShell` foram convertidos em re-exports de `@/app/AppShell` para manter compatibilidade.

### 2.3 Núcleos

| Núcleo | Prefixo | Fonte de dados |
|---|---|---|
| 01 · Projetos & Squads | `/app/projetos` | `DataStore` (mock em memória, persistido em `localStorage`) |
| 02 · Licitações | `/app/licitacoes` | Lovable Cloud + Edge Functions (`pncp-search`, `ai-triagem`) |
| 03 · Automações | `/app/automacoes` | Lovable Cloud (`automacoes`, `automacao_historico`, `automacao_ofertas`) |

### 2.4 Estado global

| Contexto | Responsabilidade |
|---|---|
| `AuthProvider` | Sessão mock (`Usuario`, `perfil`, `modulosPermitidos`), persistida em `localStorage`. Expõe `hasModule(m)` e `atualizarModulos()`. |
| `DataProvider` (Núcleo 01) | Fonte única para `projects`, `deliveries`, `allocations`, `risks`. `upsert*` / `delete*` + helper `byProject(id)`. |

Núcleos 02 e 03 leem/gravam diretamente via `@/integrations/supabase/client`.

### 2.5 RBAC por módulo (V1)
Modelo detalhado em [`RBAC.md`](./RBAC.md). Resumo:
- `Usuario.perfil ∈ {admin, membro}` e `Usuario.modulosPermitidos: Modulo[]`.
- Hook `usePermissoes()` expõe `podeAcessar(modulo)`.
- Guard `RequireModuleAccess` embrulha as rotas de cada núcleo.
- `PlatformShell/NucleoSwitcher` esconde núcleos sem permissão.
- Página `/app/admin/acessos` (só `admin`) gerencia acessos por módulo via `Dialog`.
- **Em produção** vira RLS via `user_roles` + `user_module_access` (ver comentários no código).

## 3. Fluxos principais

### 3.1 Login
1. Usuário abre `/` → clica em **Acessar HeptaProject**.
2. `/app/login` valida seed users (`Admin Hepta`, `Comercial`, `Gestor de Projetos` · senha `Hepta@2026`).
3. `AuthContext.login` grava sessão em `localStorage`.
4. Rotas `/app/*` passam a renderizar via `RequireAuth`. Cada núcleo é envelopado por `RequireModuleAccess`.

### 3.2 CRUD Núcleo 01
1. **Novo projeto** em `PortfolioPage` → `ProjectFormDialog`.
2. Submit → `useData().upsertProject(...)`.
3. `Dashboard`, `Schedule`, `Capacity`, `Dependencies` re-renderizam.

### 3.3 Radar de Licitações (Núcleo 02)
Máquina de estados explícita (`idle → loading → dados|vazio|erro`) com **Modo Demo** (`demoData.ts`) como fallback. Detalhe abre em `Sheet` lateral com `execution_match` e alocação sugerida. Não altera as edge functions.

### 3.4 Esteira de Automações (Núcleo 03)
Kanban com 7 estágios. `moverEstagio()` atualiza `automacoes.estagio`; o trigger `tg_automacao_log_estagio` grava a transição em `automacao_historico`. Automações em `oferta_cliente` aparecem em **Ofertas & Cases** com `automacao_ofertas` correlacionada.

## 4. Convenções

- Tipos por núcleo em `src/modules/<nucleo>/types.ts`.
- Componentes funcionais + hooks.
- Tailwind **apenas com tokens semânticos** (`bg-primary`, `text-foreground`, `border-foreground`...) — proibido `text-white`, `bg-black`, cores arbitrárias.
- Cores HSL vivem em `index.css` e `tailwind.config.ts`.
- Formulários e confirmações via shadcn `Dialog` / `AlertDialog`.
- Roles **nunca** em `profiles`/`users` — tabela dedicada + `has_role()` security definer na V2 (ver [`RBAC.md`](./RBAC.md)).

## 5. Pontos de extensão para V2

| Concern | Hoje | V2 |
|---|---|---|
| Auth | `AuthContext` mock (seed users) | Microsoft Entra ID (OIDC), Google OIDC, LDAP, SCIM |
| Núcleo 01 persistência | `useState` no DataStore | Tabelas Postgres com RLS + GRANTs |
| RBAC | `modulosPermitidos` no user mock | `user_roles` + `user_module_access` + `has_role()` |
| API | Edge Functions só p/ Núcleo 02 | Cobertura para todos os núcleos |
| Notificações | — | Realtime (Supabase channels) |
| Auditoria | Trigger em `automacoes` | `audit_log` global |

## 6. Performance

- Lazy load de páginas via React Router é candidato para V2.
- `DataStore` usa `useMemo` para recomputar helpers apenas quando entidades mudam.
- Grafo SVG do Núcleo 01 renderiza por camada (sem DOM excessivo).
- Radar (Núcleo 02) evita fetch automático no mount para não desperdiçar chamadas PNCP.
