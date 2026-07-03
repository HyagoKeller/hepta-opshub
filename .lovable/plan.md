
# Reestruturação HeptaProject — Shell, RBAC, Radar e Núcleo 03

Objetivo: reorganizar a **casca** da plataforma (navegação, autenticação por módulo, layout comum) e entregar o **Núcleo 03**, sem alterar CRUD, caminho crítico, `execution_match` ou edge functions já implementadas.

## Escopo desta etapa

### 1. Shell unificado (`PlatformShell`)
Novo componente `src/modules/platform/PlatformShell.tsx` que substitui `nucleo1/AppShell` e `licitacoes/AppShell` por um shell único:

- Sidebar em duas camadas:
  - **Seletor de Núcleo** (topo): Núcleo 01 · Núcleo 02 · Núcleo 03
  - **Navegação do núcleo ativo** (baixo): itens do núcleo selecionado
- Header comum com breadcrumb `Plataforma / Núcleo XX / Página`
- Sessão + logout no rodapé da sidebar (herda `AuthContext` atual)
- Mantém tokens: `border-2 border-foreground`, `bg-secondary`, `shadow-brutal-sm`, `font-display`, `font-mono`

Os dois `AppShell` antigos passam a re-exportar `PlatformShell` para não quebrar imports.

### 2. RBAC por módulo
Extensão mínima do `AuthContext` já existente (sem trocar mock login):

- Novo campo `modulos: ('nucleo1'|'nucleo2'|'nucleo3')[]` no `User`
- Conta admin recebe os três; adiciona helper `hasModule(m)`
- `PlatformShell` esconde núcleos sem permissão e redireciona rota bloqueada para o primeiro núcleo permitido
- Nenhuma mudança em RLS/edge functions

### 3. Redesign do `RadarPage`
Reorganização apenas visual/estrutural da página `/licitacoes` — chamadas de API, filtros de purificação, triagem IA e execution_match permanecem intactos:

- Topo: barra de KPIs (Total captado · TI aprovado · Descartes · % match médio)
- Filtros colapsáveis num painel lateral direito (modalidade, valor, UF, keywords)
- Lista principal em cards densos com: header (órgão + valor + modalidade), corpo (objeto truncado), rodapé (badges de status + botão "Triagem IA" + estrela favoritar)
- Painel de detalhe abre em `Sheet` lateral (não modal), mostrando execution_match, alocação sugerida, motivos_descarte
- Estado vazio e loading com skeleton no mesmo padrão do Núcleo 1

### 4. Núcleo 03 — Governança & Automações (novo)
Módulo novo, somente frontend + tabela simples, com 3 páginas placeholder funcionais:

- `/governanca` — **Dashboard de Governança**: KPIs cruzados dos núcleos 1 e 2 (projetos ativos, editais aprovados no mês, capacity vs. demanda de editais BID)
- `/governanca/automacoes` — **Catálogo de Automações**: CRUD simples de "gatilhos" (nome, trigger, ação, status ativo)
- `/governanca/auditoria` — **Trilha de Auditoria**: lista somente-leitura de eventos (aprovação de edital, criação de projeto)

Tabelas novas (migração à parte, aprovação do usuário):
- `automacoes` (nome, trigger, acao, ativo)
- `auditoria` (evento, origem, payload jsonb, user_id)

Ambas com RLS `open_all` (padrão atual do projeto) + GRANTs.

## O que NÃO muda
- Núcleo 1: `DataStore`, caminho crítico, capacidade, dependências, cronograma
- Núcleo 2: `pncp-search`, `ai-triagem`, cálculo de `execution_match`, tabelas `perfis/atestados/solucoes/favoritos/triagens/oportunidades_estrategicas`
- Design tokens em `index.css` e `tailwind.config.ts`
- Rotas atuais continuam válidas (compat)

## Detalhes técnicos

```text
src/modules/
  platform/
    PlatformShell.tsx      (novo — shell único)
    NucleoSwitcher.tsx     (novo)
    nav.config.ts          (novo — mapa núcleo → itens)
  nucleo1/AppShell.tsx     (vira re-export do PlatformShell)
  licitacoes/AppShell.tsx  (vira re-export do PlatformShell)
  nucleo3/
    pages/GovernancaPage.tsx
    pages/AutomacoesPage.tsx
    pages/AuditoriaPage.tsx
    api.ts
    types.ts
```

Rotas adicionadas em `App.tsx`:
- `/governanca`
- `/governanca/automacoes`
- `/governanca/auditoria`

Migração Supabase: `automacoes` + `auditoria` com `GRANT` + RLS `open_all` seguindo o padrão do projeto.

## Entregáveis
1. `PlatformShell` + `NucleoSwitcher` + `nav.config.ts`
2. Ajuste do `AuthContext` (campo `modulos` + `hasModule`)
3. `RadarPage` reorganizada (mesma lógica, novo layout)
4. Núcleo 03 com 3 páginas + migração de 2 tabelas
5. `docs/LICITACOES.md` atualizado com nota sobre o novo shell (sem reescrever)

## Fora do escopo (próxima etapa, se quiser)
- Login real / roles em `user_roles` table (hoje é mock)
- Automações executáveis de verdade (agora só CRUD)
- Integração cross-núcleo do gatilho REQ-10 com Núcleo 1 (hoje já existe conversão local)

Quer que eu siga com essa reorganização, ou prefere ajustar algo antes (ex.: pular Núcleo 03 nesta etapa, ou fazer só o redesign do Radar primeiro)?
