# Núcleo 1 — Projetos & Squads

Módulo central da plataforma: portfólio, capacidade, alocação, performance e colaboração.

## Objetivos
- Centralizar **projetos, programas, iniciativas e squads**.
- Operar **multi-entidade**: clientes públicos/privados, parceiros, prestadores e times internos.
- Suportar **colaboradores compartilhados** entre múltiplos projetos.
- Disponibilizar **visualizações** apropriadas para cada audiência (executiva, gerencial, operacional).

---

## Telas

### 1. Dashboard (`/app/dashboard`)
Painel executivo com:
- KPIs: total de projetos ativos, projetos em risco, capacidade média alocada, orçamento consumido.
- Gráficos: distribuição por núcleo, status, prioridade e saúde.
- Top projetos por consumo orçamentário e por risco.

### 2. Portfólio (`/app/portfolio`)
- Visualização em **cards** ou **tabela analítica**.
- Filtros: núcleo, cliente, status, prioridade, saúde, tipo.
- Ações: **Novo projeto**, editar, excluir.
- Cada card mostra: código, nome, cliente, gestor, progresso, orçamento × consumido, indicadores de saúde/risco/prioridade.

### 3. Detalhe do projeto (`/app/projetos/:id`)
Visão 360º com abas:
- **Visão geral**: dados-mestre, sponsor, datas, financeiro.
- **Entregas**: marcos, entregas e contratuais, com status (CRUD).
- **Riscos**: severidade, status, mitigação, responsável (CRUD).
- **Time & alocação**: recursos alocados com `%` e janela de vigência (CRUD).
- **Dependências**: lista de relações de entrada/saída do projeto.

### 4. Squads (`/app/squads`)
- Lista de squads com **líder, membros, vigência, tipo** (permanente/temporário/híbrido) e projetos vinculados.
- Avatares dos membros, núcleo de origem.

### 5. Capacidade (`/app/capacidade`)
- **Mapa de capacidade** por colaborador: capacidade semanal × alocação total.
- **Heatmap de sobrecarga**: cores indicam ociosidade (<60%), saudável (60–100%), sobrealocação (>100%).
- Filtros por núcleo e tipo de recurso.

### 6. Cronograma (`/app/cronograma`)
- Timeline / Gantt leve com projetos como barras.
- Marcos e entregas plotados sobre as barras.
- Eixo temporal mensal, com cores por núcleo.

### 7. Dependências (`/app/dependencias`)
- **Grafo SVG** em camadas (topológico) com curvas Bézier.
- Nós distintos para **projetos** e **entregas** (com rótulo do projeto-pai).
- Badges de tipo (**FS / SS / FF**) sobre as linhas; bloqueantes em vermelho sólido, opcionais tracejadas.
- **Caminho crítico** calculado via DFS.
- KPIs: total de relações, bloqueantes ativos, projetos impactados.
- Filtro **Apenas bloqueantes**.
- Hover: highlight de ancestrais e descendentes do nó.
- **Botão fullscreen** (Maximize/Minimize).
- Painel lateral com bloqueantes ativos e o caminho crítico.
- Matriz de dependências (tabela analítica) abaixo do grafo.

### 8. Admin (`/app/admin`)
- **Estrutura organizacional**: portfólios, programas, núcleos.
- **Usuários, perfis e RBAC**.
- **Integrações**: Microsoft Entra ID, Google, LDAP, SCIM (mockado).
- **Identidade corporativa**.

---

## Capacidades funcionais

| Capacidade | Status V1 |
|---|---|
| Portfólio interno e externo | ✅ |
| Programas / iniciativas / squads | ✅ |
| Capacidade por colaborador / time / núcleo | ✅ |
| Alocação `%` + horas | ✅ |
| Colaboradores compartilhados | ✅ |
| Dependências entre projetos e entregas | ✅ |
| Priorização (valor, risco, esforço, cliente) | ✅ visual / 🔜 motor de score |
| Cenários de alocação | 🔜 V2 |
| Saúde do projeto | ✅ |
| Indicadores de performance | ✅ |
| Exportações (CSV/PDF) | 🔜 V2 |
| Notificações realtime | 🔜 V2 |

---

## Visualizações por tela

| Visualização | Onde aparece |
|---|---|
| Timeline | Cronograma |
| Gantt leve | Cronograma |
| Board (kanban) | Portfólio (filtro por status) |
| Tabela analítica | Portfólio, Dependências |
| Mapa de capacidade | Capacidade |
| Heatmap de sobrecarga | Capacidade |
| Painel executivo | Dashboard |
| Grafo + caminho crítico | Dependências |

---

## Regras de negócio (V1, mock)

- **Saúde** (`verde / amarelo / vermelho`): atributo direto do projeto; em V2 será derivada de progresso × prazo × consumo orçamentário.
- **Risco** (`baixo / medio / alto`): atributo do projeto + lista detalhada de riscos.
- **Sobrealocação**: somatório de `percentual` em alocações ativas > 100% para o mesmo recurso.
- **Caminho crítico**: maior cadeia de dependências **bloqueantes** entre nós (projetos ou entregas).
