# Arquitetura — HeptaProject (V1)

## 1. Visão geral

A V1 é uma SPA front-end construída em **React 18 + Vite + TypeScript**, com dados totalmente mockados em memória. A arquitetura foi desenhada para que a substituição do mock por uma camada real (REST/GraphQL/Supabase) afete **apenas** o `DataStore` e as integrações de autenticação.

```
┌──────────────────────────────────────────────────────┐
│                    Browser (SPA)                     │
│                                                      │
│  ┌──────────────┐    ┌────────────────────────────┐  │
│  │  Landing /   │    │  Núcleo 1 (App autenticado)│  │
│  │  Apresent.   │───▶│  AppShell + Rotas internas │  │
│  └──────────────┘    └────────────┬───────────────┘  │
│                                   │                  │
│                       ┌───────────▼──────────────┐   │
│                       │  AuthContext (mock SSO)  │   │
│                       │  DataStore (CRUD memória)│   │
│                       └───────────┬──────────────┘   │
│                                   │                  │
│                       ┌───────────▼──────────────┐   │
│                       │  mockData.ts (catálogos) │   │
│                       └──────────────────────────┘   │
└──────────────────────────────────────────────────────┘
```

## 2. Camadas

### 2.1 Apresentação (`src/components/site`, `src/components/projects`)
Landing institucional Hepta com manifesto, módulos, diferenciais, CTA. Não dependem de auth.

### 2.2 Shell autenticado (`src/modules/nucleo1/AppShell.tsx`)
- Sidebar fixa com navegação por seção.
- Topbar com identidade do usuário, notificações e logout.
- Outlet do React Router para as páginas internas.

### 2.3 Páginas (`src/modules/nucleo1/pages`)
Cada arquivo concentra uma capacidade do módulo (Dashboard, Portfólio, Detalhe, Squads, Capacidade, Cronograma, Dependências, Admin). Páginas consomem **exclusivamente** o `useData()` do DataStore — não importam `mockData` diretamente para mutações.

### 2.4 Estado global

| Contexto | Responsabilidade |
|---|---|
| `AuthProvider` | Sessão simulada (login/logout, persistência em `localStorage`). |
| `DataProvider` | Fonte única para `projects`, `deliveries`, `allocations`, `risks`. Expõe `upsert*` / `delete*` e o helper `byProject(id)`. |

A reatividade é nativa do React: mutações disparam re-render em todas as telas que dependem do contexto.

### 2.5 Dados mock (`mockData.ts`)
Conjunto realista de **núcleos, clientes, recursos, squads, portfólios, programas, projetos, alocações, entregas e dependências** — calibrado para popular dashboards, heatmaps e o grafo de dependências sem aparentar dados de demo.

## 3. Fluxos principais

### 3.1 Login
1. Usuário acessa `/projetos-squads`.
2. Clica em **Acessar plataforma** → `/projetos-squads/login`.
3. `AuthContext.login` valida credenciais seed e grava sessão em `localStorage`.
4. Rota `/projetos-squads/app/*` passa a renderizar via `RequireAuth`.

### 3.2 CRUD de projeto
1. Usuário clica em **Novo projeto** em `PortfolioPage`.
2. Abre `ProjectFormDialog` (de `Forms.tsx`).
3. Submit chama `useData().upsertProject(...)`.
4. `DashboardPage`, `SchedulePage`, `CapacityPage`, `DependenciesPage` re-renderizam automaticamente.

### 3.3 Grafo de dependências
- Layout topológico em camadas (Sugiyama-light) com curvas Bézier.
- Distinção visual entre **projetos** e **entregas**.
- Cálculo do **caminho crítico** via DFS sobre `dependencies` bloqueantes.
- Botão fullscreen (`fixed inset-4 z-50`) para inspeção detalhada.

## 4. Convenções de código

- Tipos compartilhados em `types.ts`.
- Componentes funcionais + hooks; sem classes.
- Tailwind apenas com **tokens semânticos** (`bg-primary`, `text-foreground`…) — proibido `text-white`, `bg-black` etc.
- Cores HSL exclusivamente em `index.css` e `tailwind.config.ts`.
- Diálogos shadcn (`Dialog`, `AlertDialog`) para formulários e confirmações.

## 5. Pontos de extensão para V2

| Concern | Hoje | V2 |
|---|---|---|
| Auth | `AuthContext` mock | Microsoft Entra ID (OIDC), Google OIDC, LDAP, SCIM |
| Persistência | `useState` no DataStore | Lovable Cloud (Postgres + RLS) |
| API | — | Edge Functions / REST gerada |
| Notificações | — | Realtime (Supabase channels) |
| Auditoria | — | Tabela `audit_log` + triggers |
| Permissões | Perfil único na sessão | Tabela `user_roles` + função `has_role` |

## 6. Performance

- Lazy load das páginas internas via React Router pode ser ativado em V2.
- `DataStore` usa `useMemo` para recalcular helpers somente quando entidades mudam.
- Grafo SVG é virtualizado por camada (sem DOM excessivo).
