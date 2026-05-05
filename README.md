# HeptaProject — Plataforma Operacional Hepta

> Plataforma interna para gestão de **portfólio, projetos, squads, capacidade, alocação e performance** — com camadas adicionais para licitações e automações.

Este repositório contém o **front-end (V1)** da plataforma, construído como um aplicativo React/Vite com dados **mockados** (sem backend). Toda a estrutura está pronta para futura integração com Lovable Cloud / Supabase, SSO corporativo (Microsoft Entra ID, Google, LDAP) e provisionamento via SCIM.

---

## 🚀 Stack

| Camada | Tecnologia |
|---|---|
| Build | Vite 5 |
| UI | React 18 + TypeScript 5 |
| Estilo | Tailwind CSS v3 + design tokens semânticos (HSL) |
| Componentes | shadcn/ui (Radix) |
| Roteamento | React Router v6 |
| Estado | React Context + hooks (DataStore reativo em memória) |
| Ícones | lucide-react |
| Gráficos | Recharts + SVG nativo (Gantt / Heatmap / Grafo) |
| Testes | Vitest |

---

## 📁 Estrutura de pastas

```
src/
├── App.tsx                       # Providers globais + rotas
├── main.tsx
├── index.css                     # Design tokens (HSL) + utilitários
├── components/
│   ├── site/                     # Landing institucional (Hero, Manifesto, Modules…)
│   ├── projects/                 # Página pública /projetos-squads (apresentação do módulo)
│   └── ui/                       # shadcn/ui
├── pages/
│   ├── Index.tsx                 # Home institucional
│   ├── ProjectsSquads.tsx        # Página de entrada do Núcleo 1 (login → app)
│   └── NotFound.tsx
└── modules/
    └── nucleo1/                  # NÚCLEO 1 — Projetos & Squads
        ├── AppShell.tsx          # Layout autenticado (sidebar + topbar)
        ├── AuthContext.tsx       # Auth mockada (admin@hepta.com.br / Hepta@2026)
        ├── LoginPage.tsx
        ├── DataStore.tsx         # Store reativo (CRUD em memória)
        ├── Forms.tsx             # Diálogos de criação/edição
        ├── mockData.ts           # Catálogos seed (núcleos, clientes, recursos, projetos…)
        ├── types.ts              # Tipos do domínio
        ├── ui.tsx                # Primitivas visuais (KPI, Pill, Sparkline…)
        └── pages/
            ├── DashboardPage.tsx        # KPIs executivos + gráficos
            ├── PortfolioPage.tsx        # Lista/cards de projetos + CRUD
            ├── ProjectDetailPage.tsx    # Visão 360º (entregas, riscos, time, finanças)
            ├── SquadsPage.tsx           # Squads, líderes, membros, vigências
            ├── CapacityPage.tsx         # Mapa de capacidade + heatmap de sobrecarga
            ├── SchedulePage.tsx         # Timeline / Gantt leve
            ├── DependenciesPage.tsx     # Grafo + caminho crítico (com fullscreen)
            └── AdminPage.tsx            # Estrutura organizacional, perfis, integrações
```

---

## 🧭 Rotas

| Rota | Descrição | Auth |
|---|---|---|
| `/` | Landing institucional Hepta | pública |
| `/projetos-squads` | Apresentação do Núcleo 1 + entrada | pública |
| `/projetos-squads/login` | Login do módulo | pública |
| `/projetos-squads/app/dashboard` | Painel executivo | requer login |
| `/projetos-squads/app/portfolio` | Portfólio de projetos | requer login |
| `/projetos-squads/app/projetos/:id` | Detalhe do projeto | requer login |
| `/projetos-squads/app/squads` | Gestão de squads | requer login |
| `/projetos-squads/app/capacidade` | Capacidade & alocação | requer login |
| `/projetos-squads/app/cronograma` | Timeline / Gantt | requer login |
| `/projetos-squads/app/dependencias` | Grafo & caminho crítico | requer login |
| `/projetos-squads/app/admin` | Administração | requer login |

---

## 🔐 Credenciais de homologação (mock)

```
e-mail:  admin@hepta.com.br
senha:   Hepta@2026
```

A autenticação é **simulada via localStorage** (`hepta_n1_auth`). Em produção, será substituída por SSO corporativo (SAML/OIDC) + provisionamento SCIM.

---

## ▶️ Rodando localmente

Pré-requisitos: **Node 18+** e **npm** (ou bun/pnpm).

```bash
npm install
npm run dev          # http://localhost:5173
npm run build        # build de produção
npm run preview      # serve o build
npm run test         # vitest
npm run lint
```

Não há variáveis de ambiente nem backend — basta clonar e rodar.

---

## 📚 Documentação

Documentação detalhada na pasta [`docs/`](./docs):

- [`docs/ARCHITECTURE.md`](./docs/ARCHITECTURE.md) — visão técnica, camadas, fluxos de dados
- [`docs/MODULES.md`](./docs/MODULES.md) — Núcleo 1: telas, capacidades e regras de negócio
- [`docs/DATA-MODEL.md`](./docs/DATA-MODEL.md) — entidades, relacionamentos, mocks
- [`docs/DESIGN-SYSTEM.md`](./docs/DESIGN-SYSTEM.md) — tokens, tipografia, componentes
- [`docs/ROADMAP.md`](./docs/ROADMAP.md) — V2/V3, integrações corporativas
- [`docs/CONTRIBUTING.md`](./docs/CONTRIBUTING.md) — convenções de código e PRs

---

## 🗺️ Núcleo 1 em uma frase

> Centralizar **portfólio, capacidade, alocação e performance** em uma camada única, permitindo operação multi-entidade com colaboradores compartilhados entre projetos internos, clientes, parceiros e prestadores.

---

## 📦 Próximos núcleos previstos

- **Núcleo 2 — Licitações**: pipeline de oportunidades, qualificação, propostas, contratos.
- **Núcleo 3 — Automações**: motor de regras, RPA, integrações com sistemas Hepta.

---

## 📄 Licença

Uso interno Hepta. Todos os direitos reservados.
