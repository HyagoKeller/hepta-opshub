# HeptaProject — Módulos da Plataforma

A plataforma está organizada em **3 núcleos** operando dentro de um **shell único autenticado** (`/app`). A troca de núcleo acontece no seletor da topbar; a navegação lateral muda conforme o núcleo ativo. Todo o design segue o sistema brutalista (`border-2 border-foreground`, `shadow-brutal-sm`, `font-display`, `font-mono`, tokens semânticos — nunca `text-white`/`bg-black`/hex arbitrários).

| Núcleo | Nome | Prefixo | Tema | Status V1 |
|---|---|---|---|---|
| 01 | Projetos & Squads | `/app/projetos` | primary (vermelho) | ✅ |
| 02 | Radar de Licitações TI | `/app/licitacoes` | accent (amarelo) | ✅ |
| 03 | Automações & Transformação Digital | `/app/automacoes` | success (teal) | ✅ |

Landing pública (`/`) é somente apresentação institucional — CTA único **Acessar HeptaProject** → `/app/login` (ou `/app` se já autenticado). Ver [`RBAC.md`](./RBAC.md) para o modelo de permissões por módulo e [`TAP.md`](./TAP.md) para o Termo de Abertura do Projeto.

---

## Núcleo 01 — Projetos & Squads

Módulo central: portfólio, capacidade, alocação, dependências e cronograma.

### Objetivos
- Centralizar **projetos, programas, iniciativas e squads**.
- Operar **multi-entidade** (clientes públicos/privados, parceiros, prestadores, times internos).
- Suportar **colaboradores compartilhados** entre múltiplos projetos.
- Visualizações adequadas para cada audiência (executiva, gerencial, operacional).

### Telas

| Rota | Página | Descrição |
|---|---|---|
| `/app/projetos` | Dashboard | KPIs, distribuição por núcleo/status/prioridade/saúde, top consumo/risco. |
| `/app/projetos/portfolio` | Portfólio | Cards/tabela com filtros por núcleo, cliente, status, prioridade, saúde, tipo. |
| `/app/projetos/:id` | Detalhe do projeto | Abas: visão geral, entregas, riscos, time & alocação, dependências. |
| `/app/projetos/squads` | Squads | Líder, membros, vigência, tipo (permanente/temporário/híbrido), projetos vinculados. |
| `/app/projetos/capacidade` | Capacidade | Mapa por colaborador + heatmap de sobrecarga (ociosidade/saudável/sobrealocação). |
| `/app/projetos/cronograma` | Cronograma | Gantt leve com marcos e entregas, cores por núcleo. |
| `/app/projetos/dependencias` | Dependências | Grafo SVG topológico, caminho crítico (DFS), badges FS/SS/FF, fullscreen. |
| `/app/projetos/admin` | Administração | Estrutura organizacional, integrações (mockadas), identidade. |
| `/app/admin/acessos` | Acessos & Módulos | Gestão RBAC — só perfil `admin`. |

### Capacidades V1

| Capacidade | Status |
|---|---|
| Portfólio interno e externo | ✅ |
| Programas / iniciativas / squads | ✅ |
| Capacidade por colaborador / time / núcleo | ✅ |
| Alocação `%` + horas | ✅ |
| Colaboradores compartilhados | ✅ |
| Dependências entre projetos e entregas | ✅ |
| Caminho crítico | ✅ |
| Priorização (valor, risco, esforço, cliente) | ✅ visual · 🔜 motor de score |
| Saúde do projeto | ✅ atributo · 🔜 derivada em V2 |
| Cenários de alocação | 🔜 V2 |
| Exportações (CSV/PDF) | 🔜 V2 |
| Notificações realtime | 🔜 V2 |

### Regras (V1 · mock em `DataStore`)
- **Saúde** (`verde/amarelo/vermelho`): atributo do projeto; V2 derivada de progresso × prazo × consumo.
- **Risco** (`baixo/medio/alto`): atributo + lista detalhada.
- **Sobrealocação**: soma de `percentual` das alocações ativas > 100% para o mesmo recurso.
- **Caminho crítico**: maior cadeia de dependências **bloqueantes** entre nós (projeto ou entrega).

Modelo de dados detalhado em [`DATA-MODEL.md`](./DATA-MODEL.md).

---

## Núcleo 02 — Radar de Licitações TI

Consome a API pública do **PNCP**, aplica purificação determinística e triagem semântica (IA/Gemini via Lovable AI Gateway) para transformar editais brutos em oportunidades acionáveis. Documentação completa em [`LICITACOES.md`](./LICITACOES.md).

### Telas

| Rota | Página | Descrição |
|---|---|---|
| `/app/licitacoes` | Radar PNCP | Busca + purificação com **estados explícitos** (idle · loading · vazio · erro · dados) e **Modo Demo** para apresentação sem depender do PNCP em tempo real. |
| `/app/licitacoes/triagem` | Triagem IA | Histórico das últimas 50 triagens. |
| `/app/licitacoes/estrategicas` | Itens Estratégicos | Pipeline de oportunidades aprovadas (gatilho REQ-10). |
| `/app/licitacoes/atestados` | Atestados (CAT) | CRUD do acervo técnico. |
| `/app/licitacoes/solucoes` | Soluções | Catálogo de produtos/soluções ofertáveis. |
| `/app/licitacoes/perfis` | Quadro de Perfis | Pessoas reais — skills, senioridade, custo/hora, disponibilidade. |
| `/app/licitacoes/perfil` | Core Business | Especialidades, frameworks, blacklist, valor mínimo. |
| `/app/licitacoes/favoritos` | Favoritos | Editais marcados. |

### Estados da RadarPage (redesign)
1. **Idle** — card central com CTA "Buscar últimos 7 dias, todo o Brasil" e atalho para **Modo Demo**.
2. **Loading** — skeletons nas KPIs e na lista.
3. **Zero resultados PNCP** — sugere alargar filtros.
4. **Todos descartados** — botão "Ver descartados".
5. **Erro** — banner persistente com retry + fallback para Modo Demo.
6. **Dados** — cards densos + `Sheet` lateral de detalhe (execution_match, alocação sugerida, motivos_descarte).

KPIs comparativos: `Candidatos = 42 de 310 coletados` · `Pipeline` soma apenas candidatos. Auto-refresh só ativa após primeiro fetch manual bem-sucedido.

---

## Núcleo 03 — Automações & Transformação Digital

Gestão da **esteira de automações** da Hepta (interna e comercial): da ideia à oferta empacotada para o cliente. Documentação completa em [`AUTOMACOES.md`](./AUTOMACOES.md).

### Telas

| Rota | Página | Descrição |
|---|---|---|
| `/app/automacoes` | Dashboard | KPIs (ativos, economia acumulada, em POC/Piloto, viradas em oferta) + top ROI. |
| `/app/automacoes/esteira` | Esteira (Kanban) | 7 colunas fixas: Ideia → Oportunidade → Viabilidade → POC → Piloto → Produto interno → Oferta/Case. |
| `/app/automacoes/catalogo` | Catálogo | Tabela com filtros por tipo, estágio, núcleo, complexidade, risco. |
| `/app/automacoes/ofertas` | Ofertas & Cases | Automações que chegaram em `oferta_cliente` com margem estimada e clientes aplicáveis. |
| `/app/automacoes/config` | Configuração | Núcleos de origem e responsáveis padrão (`localStorage` na V1). |

### Regras (V1)
- **Estágios** (`ESTAGIOS` em `types.ts`): `ideia · oportunidade · viabilidade · poc · piloto · produto_interno · oferta_cliente`.
- **Confiança** = função (`complexidade`, `risco`, `maturidade`): score 3–9 → `baixa/media/alta`.
- **ROI** = `((economia_realizada || economia_estimada) − custo_estimado) / custo_estimado`.
- **Trigger de banco** `tg_automacao_log_estagio` grava toda mudança de estágio em `automacao_historico`.
- **Ofertas** ficam em `automacao_ofertas` (status `ativa/descontinuada`).

---

## Visualizações por tela (visão geral)

| Visualização | Onde aparece |
|---|---|
| Painel executivo | Núcleo 01 · Dashboard · Núcleo 03 · Dashboard |
| Timeline / Gantt | Núcleo 01 · Cronograma |
| Board (kanban) | Núcleo 01 · Portfólio (filtro status) · Núcleo 03 · Esteira |
| Tabela analítica | Núcleo 01 · Portfólio, Dependências · Núcleo 03 · Catálogo · Núcleo 02 · Perfis, Atestados |
| Mapa de capacidade + heatmap | Núcleo 01 · Capacidade |
| Grafo + caminho crítico | Núcleo 01 · Dependências |
| Cards densos + Sheet detalhe | Núcleo 02 · Radar |
