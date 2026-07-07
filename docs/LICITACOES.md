# Núcleo 02 — Radar de Licitações TI (HeptaProject)

Documentação completa do módulo de Licitações — arquitetura, rotas, fluxos de dados, regras de negócio, esquema de banco, edge functions e status de implementação.

Última atualização: 07/07/2026.

---

## 1. Visão geral

O módulo **Licitações** consome a API pública do **PNCP (Portal Nacional de Contratações Públicas)**, aplica uma **camada determinística de purificação** (código) e, em seguida, uma **camada semântica de triagem** (IA — Gemini via Lovable AI Gateway) para transformar editais brutos em oportunidades acionáveis para o time comercial da Hepta.

Base legal coberta:
- **Portaria SGD/MGI 750/2023** — contratação de soluções de TIC.
- **Portaria SGD/MGI 1.070/2023** — planejamento de contratações de TIC.
- **Lei 14.133/2021 + IN SGD 94/2022** — Nova Lei de Licitações aplicada a TI.
- CATSER/CATMAT de TI (objeto livre).

Backend: **Lovable Cloud** (Postgres + Edge Functions em Deno).
Frontend: React 18 + Vite + Tailwind + shadcn — vive dentro do shell unificado (`/app`), com RBAC por módulo (ver [`RBAC.md`](./RBAC.md)).

---

## 2. Rotas do módulo (`/app/licitacoes`)

Definidas em `src/App.tsx` sob o `AppShell` unificado (`src/app/AppShell.tsx`). O antigo `LicitacoesShell` foi convertido em re-export para compatibilidade.

| Rota | Página | Ícone | Descrição |
|---|---|---|---|
| `/app/licitacoes` | `RadarPage` | Radar | Busca e purificação de editais no PNCP com KPIs comparativos, estados explícitos e **Modo Demo**. |
| `/app/licitacoes/triagem` | `TriagemPage` | FileSearch | Histórico das últimas 50 triagens IA. |
| `/app/licitacoes/estrategicas` | `EstrategicasPage` | Crown | Pipeline de oportunidades aprovadas (gatilho REQ-10). |
| `/app/licitacoes/atestados` | `AtestadosPage` | Award | CRUD do acervo técnico (CAT). |
| `/app/licitacoes/solucoes` | `SolucoesPage` | Boxes | Catálogo de soluções/produtos ofertáveis. |
| `/app/licitacoes/perfis` | `PerfisPage` | Users | Quadro de pessoas reais (skills, senioridade, custo/hora, disponibilidade). |
| `/app/licitacoes/perfil` | `PerfilPage` | Building2 | Core Business da empresa + blacklist customizada + valor mínimo. |
| `/app/licitacoes/favoritos` | `FavoritosPage` | Star | Editais marcados como favoritos. |

### 2.1 Estados da RadarPage (redesign)

Máquina de estados explícita (sem fetch automático no mount):

| Estado | Visual |
|---|---|
| `idle` | Card central com CTA "Buscar últimos 7 dias, todo o Brasil" + atalho **Modo Demo**. |
| `loading` | Skeletons nas KPIs e na lista. |
| `vazio (PNCP retornou zero)` | Sugestão de alargar filtros. |
| `vazio (tudo descartado)` | Botão "Ver descartados". |
| `erro` | Banner persistente com retry + fallback para Modo Demo. |
| `dados` | Cards densos + `Sheet` lateral de detalhe (`execution_match`, alocação sugerida, motivos_descarte). |

KPIs: `Candidatos = X de Y coletados` · `Pipeline` soma apenas candidatos. Auto-refresh só ativa após primeiro fetch manual bem-sucedido. Modo Demo usa dataset em `src/modules/licitacoes/demoData.ts` (2 BID, 3 PARCIAL, restante NO-BID/descartado) preservando badges de aderência e o fluxo Triar com IA → Aprovar como Estratégico.

---

## 3. Página a página

### 3.1 Radar PNCP (`RadarPage`)

Objetivo: reduzir o volume bruto do PNCP a **candidatos de TI de fato relevantes** antes de gastar tokens de IA.

Controles:
- Dias atrás (janela de publicação).
- UF (opcional).
- Palavra-chave (filtro textual pós-normalização).
- Valor mínimo (default R$ 50.000).
- Filtro TI (on/off).
- Incluir descartados (para auditoria dos motivos).

Saída:
- KPIs: **Bruto**, **Candidatos**, **Descartados** (subdivididos em blacklist, fora-TI, valor).
- Lista de editais com badge de aderência (TI / Portaria 750 / Portaria 1070 / Lei 14.133).
- Ação **Triar com IA** por linha.
- Ação **Favoritar**.
- Ação **Aprovar como Estratégico** (REQ-10) — visível para editais classificados **BID**.

### 3.2 Triagem IA (`TriagemPage`)
Lista das últimas 50 triagens persistidas em `triagens`, com nível, score e resumo executivo.

### 3.3 Itens Estratégicos (`EstrategicasPage`)
Pipeline pós-aprovação. Permite atualizar status (`em_proposta`, `proposta_enviada`, `ganha`, `perdida`) e responsável. Alimenta o **Núcleo 01 — Projetos & Squads**.

### 3.4 Atestados (`AtestadosPage`)
CRUD de CATs. Campos: título, cliente, tipo de serviço, valor, período, vigência, tags, URL do arquivo.

### 3.5 Soluções (`SolucoesPage`)
CRUD de ofertas. Campos: nome, categoria, fabricante, diferenciais, margem estimada, certificações, tags.

### 3.6 Quadro de Perfis (`PerfisPage`)
CRUD de **pessoas reais** da Hepta. Alimenta o cálculo de *execution match*.
Campos: nome, cargo, senioridade (junior/pleno/senior/especialista), skills[], certificações[], frameworks[], custo/hora, disponibilidade %, ativo.

### 3.7 Core Business (`PerfilPage`)
Perfil singleton da empresa. Missão, especialidades (área/nível/descrição), frameworks (ITIL/COBIT/…), tecnologias, certificações, diferenciais, **blacklist customizada** e **valor mínimo padrão**.

### 3.8 Favoritos (`FavoritosPage`)
Editais marcados manualmente para acompanhamento.

---

## 4. Arquitetura de dados

Cliente Supabase: `src/integrations/supabase/client.ts` (auto-gerado — não editar).
Camada de acesso: `src/modules/licitacoes/api.ts`.
Tipos TypeScript: `src/modules/licitacoes/types.ts`.

### 4.1 Tabelas (schema `public`)

| Tabela | Papel |
|---|---|
| `company_profile` | Singleton com Core Business, blacklist e valor mínimo. |
| `perfis` | Quadro de pessoas reais (skills, senioridade, custo/hora). |
| `atestados` | Acervo de CATs. |
| `solucoes` | Catálogo de soluções. |
| `favoritos` | Editais salvos para acompanhamento. |
| `triagens` | Histórico das análises IA. |
| `oportunidades_estrategicas` | Pipeline pós-aprovação (REQ-10). |

Todas com RLS habilitada + policy `open_all` (o projeto ainda não tem auth). Ao introduzir autenticação, refatorar policies para `auth.uid()` + tabela de roles.

---

## 5. Edge Functions

Localizadas em `supabase/functions/`.

### 5.1 `pncp-search`
Proxy do PNCP com **camada de purificação determinística**.

- Endpoint PNCP: `GET /api/consulta/v1/contratacoes/publicacao`.
- Modalidades default: **6 Pregão Eletrônico**, **4 Concorrência Eletrônica**, **8 Dispensa**.
- Paginação: até 3 páginas × 500 registros por modalidade.
- **REQ-01 (filtro TI)**: lista `TI_KEYWORDS` cobrindo CATSER/CATMAT — Cloud, IA/Copilot, ITSM, Cibersegurança, Fábrica de Software, USTs, Ponto de Função, DevOps, low-code, etc.
- **REQ-02 (blacklist)**: descarta objetos com termos vetados (alimentos, obras, jardinagem, vigilância armada…) + blacklist customizada do `company_profile`.
- **REQ-03 (modalidade + valor)**: descarta abaixo do valor mínimo (default R$ 50.000).
- Resposta: `items[]` com `status: 'candidate' | 'discarded'`, `motivos_descarte[]` e `meta` com estatísticas por categoria de descarte.

### 5.2 `ai-triagem`
Motor de triagem semântica em duas etapas usando **Lovable AI Gateway** (modelo `google/gemini-2.5-flash` para validação rápida, `google/gemini-2.5-pro` para score contextual).

Entrada: `{ licitacao, atestados, solucoes, perfis, companyProfile }`.

Saída (`TriagemResultado`):
- `score_aderencia` (0-100), `nivel` (BID / PARCIAL / NO-BID).
- `resumo_executivo[3]` — O que fazer, Prazo, Orçamento (REQ-09).
- `requisitos_extraidos` — tecnologias, certificações, volume, perfis exigidos, prazo.
- `atestados_match[]` e `solucoes_match[]` com relevância + justificativa.
- **`execution_match`** — score de execução calculado sobre o **Quadro de Perfis**:
  - `45% skills + 30% certificações + 25% headcount`.
  - `gap_skills`, `gap_certificacoes`, `gap_headcount`.
  - `alocacao_sugerida[]` mapeando `perfil_id → papel no projeto`.
  - `risco_execucao` (baixo/médio/alto).
- `rentabilidade` — margem, custo, lucro estimado e risco.
- `recomendacao` — participar / monitorar / descartar.

Regra de categorização:
- **BID** exige score ≥ 80 **e** execution_match ≥ 70.
- **PARCIAL**: 50-79 ou gaps recuperáveis.
- **NO-BID**: < 50 ou certificação obrigatória ausente.

---

## 6. Fluxos de negócio implementados

### 6.1 Purificação → Triagem → Aprovação
1. Usuário abre `/licitacoes`, escolhe janela + UF + valor mínimo.
2. `pncp-search` retorna candidatos limpos + KPIs de descarte transparentes.
3. Usuário clica **Triar com IA** → `ai-triagem` roda 2 etapas Gemini e persiste em `triagens`.
4. Se **BID**, botão **Aprovar como Estratégico** cria registro em `oportunidades_estrategicas` (REQ-10) — gatilho para o Núcleo 01 iniciar a proposta técnica.

### 6.2 Execution Match
- `PerfisPage` mantém o quadro real.
- `ai-triagem` recebe `perfis` e calcula cobertura (skills/certs/headcount) contra os requisitos extraídos do edital.
- `RadarPage` mostra progress bars + lista de alocação sugerida com pessoas reais.

---

## 7. Design System

Reutiliza o DS brutalista do site institucional (`src/index.css` + `tailwind.config.ts`):
- Tokens semânticos (`--primary`, `--accent`, `--success`, `--warning`, `--destructive`, `--info`).
- `border-2 border-foreground`, `shadow-brutal-sm`, tipografia `font-display` + `font-mono` para eyebrows.
- Componentes locais: `PageHeader`, `KPI`, `NivelBadge`, helpers `formatBRL` / `formatDate` em `src/modules/licitacoes/ui.tsx`.

---

## 8. Estrutura de arquivos

```
src/modules/licitacoes/
  AppShell.tsx           # Sidebar + header do módulo
  api.ts                 # Camada de acesso Supabase + edge functions
  types.ts               # PncpItem, TriagemResultado, ExecutionMatch, Perfil, ...
  ui.tsx                 # PageHeader, KPI, NivelBadge, formatters
  pages/
    RadarPage.tsx
    TriagemPage.tsx
    EstrategicasPage.tsx
    AtestadosPage.tsx
    SolucoesPage.tsx
    PerfisPage.tsx
    PerfilPage.tsx
    FavoritosPage.tsx

supabase/functions/
  pncp-search/index.ts   # Purificação determinística
  ai-triagem/index.ts    # Triagem IA em 2 etapas + execution match

supabase/migrations/
  20260621150858_*.sql   # company_profile, atestados, solucoes, favoritos, triagens
  20260621160041_*.sql   # oportunidades_estrategicas
  20260703004248_*.sql   # perfis
```

---

## 9. Requisitos do Pilar 1 — status

| ID | Requisito | Status |
|---|---|---|
| REQ-01 | Filtro CATSER/CATMAT TI via keywords | ✅ |
| REQ-02 | Blacklist determinística + custom | ✅ |
| REQ-03 | Modalidade + valor mínimo | ✅ |
| REQ-04 | Company memory (Core Business) | ✅ |
| REQ-05 | Validação semântica Gemini Flash | ✅ |
| REQ-06 | Score contextual Gemini Pro | ✅ |
| REQ-07 | Extração de requisitos (JSON) | ✅ |
| REQ-08 | Categorização BID / PARCIAL / NO-BID | ✅ |
| REQ-09 | Resumo executivo (3 tópicos) | ✅ |
| REQ-10 | Gatilho → Núcleo de Transformação | ✅ |
| Extra | Execution match sobre pessoas reais | ✅ |
| Extra | KPIs de descarte transparentes | ✅ |

---

## 10. Próximos passos sugeridos

- Autenticação + RLS por usuário/role (hoje `open_all`).
- Agendamento (cron) para varrer o PNCP diariamente e alimentar um inbox.
- Notificações (e-mail/Slack) quando surgir edital 🟢 BID.
- Enriquecimento com o texto completo do edital (download do PDF + RAG).
- Dashboard consolidado de conversão (candidato → BID → proposta → ganho).
