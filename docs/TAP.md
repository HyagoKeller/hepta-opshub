# TAP — Termo de Abertura do Projeto

**Projeto:** HeptaProject — Plataforma unificada de Gestão de Projetos, Licitações e Automações
**Cliente interno:** Hepta Tecnologia
**Sponsor:** CEO
**Data-base:** Julho/2026
**Versão do documento:** 1.0

---

## 1. Contexto e justificativa

A Hepta opera três frentes críticas — **entrega de projetos e squads**, **captação de licitações públicas de TI** e **transformação digital via automações internas** — hoje sustentadas por planilhas, ferramentas isoladas e conhecimento tácito. Isso gera:

- Falta de visão unificada de **capacidade × demanda**.
- Baixa taxa de conversão em **licitações** por triagem manual e lenta.
- Automações desenvolvidas sem esteira, sem métrica de ROI e sem reuso.
- Governança de acesso frágil (planilhas de permissão, sem trilha).

O **HeptaProject** consolida essas três frentes numa **plataforma única, autenticada e governada**, com base tecnológica moderna (React + Lovable Cloud) e um design system corporativo próprio (brutalista, tokens semânticos).

## 2. Objetivo do projeto

Entregar a **V1** de uma plataforma corporativa capaz de:

1. Gerir portfólio, squads, capacidade, cronograma e dependências (Núcleo 01).
2. Automatizar a captação e triagem de editais do PNCP com IA e casar com o `execution_match` da Hepta (Núcleo 02).
3. Gerir a esteira de automações da ideia à oferta comercial (Núcleo 03).
4. Aplicar **controle de acesso por módulo** com governança pelo administrador.

## 3. Escopo

### Dentro do escopo (V1 — entregue)
- Landing pública institucional (`/`) com CTA único de acesso à plataforma.
- Shell unificado (`/app`) com Seletor de Núcleo e Sidebar contextual.
- **Núcleo 01 — Projetos & Squads**: Dashboard, Portfólio, Detalhe de projeto, Squads, Capacidade, Cronograma, Dependências (com caminho crítico), Admin.
- **Núcleo 02 — Radar de Licitações TI**: integração PNCP, purificação determinística, triagem IA (Gemini/Lovable AI Gateway), `execution_match`, Itens Estratégicos, Atestados, Soluções, Perfis, Core Business, Favoritos. Redesign do Radar com estados explícitos e **Modo Demo**.
- **Núcleo 03 — Automações**: Dashboard, Esteira Kanban de 7 estágios, Catálogo, Detalhe com histórico via trigger, Ofertas & Cases, Configuração.
- **RBAC por módulo** (perfis `admin`/`membro`, `modulosPermitidos`), guard `RequireModuleAccess`, tela de gestão `/app/admin/acessos`, seed users de homologação.
- Design system brutalista consistente nos 3 núcleos.
- Documentação técnica em `docs/` (arquitetura, módulos, licitações, automações, RBAC, data model, roadmap, TAP).

### Fora do escopo (V1 · previstos para V2/V3)
- SSO federado (Entra ID, Google, LDAP) e SCIM.
- RBAC persistido em `user_roles` + `user_module_access` (hoje mock).
- Persistência real do Núcleo 01 em Postgres.
- Notificações realtime, exportações PDF/CSV/XLSX.
- Cenários de alocação what-if, motor de priorização, saúde derivada.
- IA cross-núcleo (matchmaking automação↔edital, sumarização de status).
- Auditoria global (`audit_log`) além do trigger de automações.

## 4. Entregáveis

| # | Entregável | Status V1 |
|---|---|---|
| 1 | Landing pública + CTA único | ✅ |
| 2 | Shell unificado `/app` + Seletor de Núcleo | ✅ |
| 3 | Núcleo 01 completo (UI + mock reativo) | ✅ |
| 4 | Núcleo 02 completo (Postgres + Edge Functions) | ✅ |
| 5 | Redesign do RadarPage (estados + Modo Demo) | ✅ |
| 6 | Núcleo 03 completo (Postgres + trigger de auditoria) | ✅ |
| 7 | RBAC por módulo + tela de administração de acessos | ✅ |
| 8 | Documentação técnica completa em `docs/` | ✅ |
| 9 | Seed users e datasets de demonstração | ✅ |

## 5. Stakeholders

| Papel | Responsabilidade |
|---|---|
| Sponsor (CEO) | Aprovação estratégica, priorização de núcleos. |
| Diretoria Comercial | Owner de Licitações (Núcleo 02). |
| Diretoria de Delivery | Owner de Projetos & Squads (Núcleo 01). |
| Diretoria de Inovação | Owner de Automações (Núcleo 03). |
| Time de TI Interno | Operação da plataforma, evolução V2. |
| Administrador de Acessos | Gestão de perfis e módulos por usuário. |

## 6. Premissas

- V1 opera com **Lovable Cloud** (Postgres + Edge Functions) para Núcleos 02 e 03; Núcleo 01 usa mock reativo em memória, com persistência local por `localStorage`.
- **Lovable AI Gateway** (Gemini) é o provedor único de IA na triagem de editais.
- API pública do **PNCP** disponível; degradação coberta por Modo Demo.
- Design system brutalista fixo (tokens semânticos, `border-2 border-foreground`, `shadow-brutal-sm`, `font-display`, `font-mono`) — nenhum uso de `text-white`, `bg-black` ou cores arbitrárias.
- Autenticação por SSO corporativo é **fora do escopo V1** (implementada em V2).

## 7. Restrições

- Frontend em React 18 + Vite + TypeScript + Tailwind + shadcn (stack Lovable padrão).
- Backend limitado a Supabase (Lovable Cloud); sem servidor Node/Python custom.
- Nenhuma alteração em edge functions ou cálculos do Núcleo 02 nesta fase de reestruturação.
- Roles nunca persistidos em `profiles`/`users` (evitar escalada de privilégio) — na V2 vão para tabela dedicada.

## 8. Riscos principais

| Risco | Impacto | Mitigação |
|---|---|---|
| Indisponibilidade da API do PNCP na demo | Alto | Modo Demo com dataset realista em `demoData.ts`. |
| Uso indevido do mock de RBAC em produção | Alto | Comentários no código sinalizando migração V2, RBAC documentado em [`RBAC.md`](./RBAC.md). |
| Divergência de estilo entre núcleos | Médio | Design system centralizado + code review contra `text-white`/`bg-black`. |
| Núcleo 01 mock perdendo dados | Baixo | Persistência em `localStorage` na V1, migração para Postgres em V2. |
| Escalada de escopo em V2 | Médio | Roadmap priorizado em [`ROADMAP.md`](./ROADMAP.md). |

## 9. Critérios de aceite (V1)

- Login funcional com os 3 seed users (`Admin Hepta`, `Comercial`, `Gestor de Projetos`).
- Navegação entre os 3 núcleos pelo Seletor da topbar sem regressão de layout.
- RBAC bloqueando módulos não permitidos com tela 403 e ocultando no `NucleoSwitcher`.
- Radar operando os 5 estados (idle, loading, vazio, erro, dados) + Modo Demo funcionando offline do PNCP.
- Esteira de Automações com drag-and-drop entre os 7 estágios e histórico gravado automaticamente.
- Zero uso de `text-white`, `bg-black` ou hex arbitrário em componentes.
- Documentação em `docs/` cobrindo os 3 núcleos, RBAC e este TAP.

## 10. Cronograma macro

| Fase | Escopo | Status |
|---|---|---|
| Bloco 1 | Shell unificado + RBAC + redesign Radar + Núcleo 03 | ✅ Concluído |
| V2 | SSO, RBAC persistido, Núcleo 01 em Postgres, cenários e exportações | 🚧 Planejado |
| V3 | IA cross-núcleo, realtime, motor de priorização, saúde derivada | 🔮 Previsto |

## 11. Referências

- [`ARCHITECTURE.md`](./ARCHITECTURE.md) — arquitetura técnica
- [`MODULES.md`](./MODULES.md) — visão consolidada dos 3 núcleos
- [`LICITACOES.md`](./LICITACOES.md) — especificação do Núcleo 02
- [`AUTOMACOES.md`](./AUTOMACOES.md) — especificação do Núcleo 03
- [`RBAC.md`](./RBAC.md) — modelo de permissões
- [`DATA-MODEL.md`](./DATA-MODEL.md) — modelo de dados do Núcleo 01
- [`ROADMAP.md`](./ROADMAP.md) — plano evolutivo
- [`DESIGN-SYSTEM.md`](./DESIGN-SYSTEM.md) — tokens e regras visuais
