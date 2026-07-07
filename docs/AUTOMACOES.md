# Núcleo 03 — Automações & Transformação Digital

Módulo de gestão da **esteira de automações** da Hepta — do registro da ideia à empacotagem como oferta para clientes. Compartilha o shell unificado (`/app`) e o design system brutalista com os demais núcleos.

---

## 1. Objetivos

- Centralizar o **backlog e o pipeline** de automações internas e comerciais.
- Padronizar o ciclo de vida em **7 estágios** (Ideia → Oferta/Case).
- Medir **economia gerada, ROI e confiança** de escala.
- Identificar automações **reusáveis** e prontas para virar oferta comercial.
- Manter **trilha de auditoria** completa das transições de estágio.

## 2. Rotas (`/app/automacoes`)

| Rota | Página | Descrição |
|---|---|---|
| `/app/automacoes` | `DashboardAutomacoesPage` | KPIs (ativos, economia acumulada, POC/Piloto, viradas em oferta) + top ROI. |
| `/app/automacoes/esteira` | `EsteiraPage` | Kanban de 7 colunas fixas com drag-and-drop e botão de avanço rápido. |
| `/app/automacoes/catalogo` | `CatalogoPage` | Tabela com filtros por tipo, estágio, núcleo, complexidade, risco. |
| `/app/automacoes/:id` | `DetalheAutomacaoPage` | Abas: Visão geral, Técnico, Reusabilidade, Histórico. |
| `/app/automacoes/ofertas` | `OfertasPage` | Automações em `oferta_cliente` com margem e clientes aplicáveis. |
| `/app/automacoes/config` | `ConfigPage` | Núcleos de origem e responsáveis padrão (localStorage na V1). |

Rotas legadas `/governanca*` redirecionam para `/app/automacoes*`.

## 3. Modelo de domínio

Tipos em [`src/modules/automacoes/types.ts`](../src/modules/automacoes/types.ts).

```ts
type AutomacaoTipo = 'no_code' | 'low_code' | 'code';
type AutomacaoEstagio =
  | 'ideia' | 'oportunidade' | 'viabilidade'
  | 'poc' | 'piloto' | 'produto_interno' | 'oferta_cliente';
type Complexidade = 'baixa' | 'media' | 'alta';
type Risco        = 'baixo' | 'medio' | 'alto';
type Maturidade   = 'experimental' | 'estavel' | 'consolidada';
```

### Entidade `Automacao`
Campos-chave: `nome`, `descricao`, `tipo`, `estagio`, `nucleo_origem_id`, `responsavel_id/nome`, `custo_estimado`, `economia_estimada`, `economia_realizada`, `complexidade`, `risco`, `maturidade`, `reusavel`, `stack_integracoes[]`, `tags[]`, `criado_em`, `atualizado_em`.

### Regras derivadas
- **Confiança de escala** (`calcConfianca`) — combina complexidade, risco e maturidade num score 3–9 → `baixa/media/alta`.
- **ROI** (`calcROI`) — `((economia_realizada ?? economia_estimada) − custo_estimado) / custo_estimado`, arredondado em %.
- **Reusabilidade** sinaliza candidatas naturais a virar oferta.

## 4. Esteira (Kanban)

Colunas na ordem canônica de `ESTAGIOS`:

| # | Estágio | Significado |
|---|---|---|
| 01 | Ideia | Hipótese registrada, sem validação. |
| 02 | Oportunidade | Problema priorizado, dor mapeada. |
| 03 | Viabilidade | Estudo técnico e de negócio. |
| 04 | POC | Prova de conceito construída. |
| 05 | Piloto | Uso controlado em produção interna. |
| 06 | Produto interno | Adoção interna consolidada. |
| 07 | Oferta / Case | Empacotada como oferta para clientes. |

Cada card exibe nome, badge de tipo, avatar do responsável e badges de complexidade/risco.

## 5. Banco de dados (Lovable Cloud)

Migração `20260703222621_*.sql`.

### `automacoes`
Registro mestre. RLS aberta (`open_all`) na V1, a ser restringida por `has_module('automacoes')` na V2.

### `automacao_historico`
Trilha imutável de transições. Populada automaticamente pelo trigger:

```sql
create trigger tg_automacao_log_estagio
  after update of estagio on public.automacoes
  for each row when (old.estagio is distinct from new.estagio)
  execute function public.log_automacao_estagio();
```

### `automacao_ofertas`
Empacotamento comercial das automações em `oferta_cliente`. Campos: `nome_oferta`, `descricao_comercial`, `clientes_aplicaveis[]`, `margem_estimada`, `status ∈ {ativa, descontinuada}`.

Todas as tabelas seguem o padrão: `CREATE TABLE` → `GRANT` → `ENABLE RLS` → `POLICY`.

## 6. Seed de demonstração

12 automações realistas distribuídas nos 7 estágios (pelo menos 2 em `oferta_cliente`) + 3 ofertas comerciais — garantindo que Dashboard, Kanban e Ofertas nunca fiquem vazios em apresentação.

## 7. Design system

- Tema visual do núcleo: `success` (teal) — aplicado no `AppShell` via `nav.config.ts`.
- Cards, tabelas e kanban usam `border-2 border-foreground` + `shadow-brutal-sm`.
- Tipografia: `font-display` para títulos, `font-mono` para códigos/números.
- Nenhum uso de `text-white`, `bg-black`, cores hex arbitrárias — apenas tokens semânticos.

## 8. Extensões previstas para V2

| Concern | Hoje | V2 |
|---|---|---|
| RLS | `open_all` | `has_module(auth.uid(), 'automacoes')` + owner por responsável |
| Config (núcleos, responsáveis) | `localStorage` | Tabelas dedicadas |
| Cross-núcleo | — | Vincular automação ↔ projetos (Núcleo 01) e ↔ oportunidades estratégicas (Núcleo 02) |
| IA | — | Sugestão automática de estágio, scoring de ROI, detecção de reusabilidade |
| Notificações | — | Realtime na transição de estágio |
