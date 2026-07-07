# Roadmap

## ✅ V1 — Atual (plataforma unificada)

**Shell & navegação**
- Landing pública (`/`) só apresentação, CTA único **Acessar HeptaProject**.
- Shell unificado (`/app`) com Topbar + **Seletor de Núcleo** + Sidebar contextual.
- Rotas dos 3 núcleos sob prefixos: `/app/projetos`, `/app/licitacoes`, `/app/automacoes`.
- RBAC por módulo (mock): perfil `admin`/`membro`, `modulosPermitidos`, hook `usePermissoes()`, guard `RequireModuleAccess`, tela `/app/admin/acessos`.
- Seed users de homologação: `Admin Hepta`, `Comercial`, `Gestor de Projetos` (senha `Hepta@2026`).

**Núcleo 01 — Projetos & Squads**
- Dashboard, Portfólio, Detalhe, Squads, Capacidade, Cronograma, Dependências, Admin.
- CRUD reativo em memória (projetos, entregas, riscos, alocações).
- Grafo de dependências com caminho crítico e fullscreen.

**Núcleo 02 — Radar de Licitações TI**
- Integração PNCP + purificação determinística + triagem IA (Gemini/Lovable AI Gateway).
- `execution_match` com skills, certificações, headcount e alocação sugerida.
- Pipeline de Itens Estratégicos (gatilho REQ-10).
- **Redesign do RadarPage**: estados explícitos (idle · loading · vazio · erro · dados), **Modo Demo**, KPIs comparativos, Sheet lateral de detalhe.

**Núcleo 03 — Automações & Transformação Digital**
- Esteira Kanban de 7 estágios (Ideia → Oferta/Case).
- Dashboard com KPIs (ativos, economia acumulada, POC/Piloto, ofertas).
- Catálogo com filtros multi-dimensão, Detalhe com abas + histórico automático via trigger.
- Ofertas & Cases (automações comercializáveis) + Configuração de núcleos/responsáveis.
- Cálculo de Confiança e ROI.

## 🚧 V2 — Backend real & identidade corporativa

Sequência recomendada:
1. **Autenticação federada** — Microsoft Entra ID (OIDC), Google OIDC, LDAP on-prem.
2. **Provisionamento SCIM 2.0** para sincronizar usuários/grupos.
3. **RBAC persistido** — tabelas `user_roles` + `user_module_access` + função `has_role()` security definer. Remoção do mock.
4. **Núcleo 01 persistido** (Postgres + RLS + GRANTs), com auditoria e anexos (Storage).
5. **Motor de validação de capacidade** (alertas de sobrealocação, cenários what-if).
6. **Dashboards** com filtros salvos por usuário.
7. **Identidade corporativa** — temas por cliente, white-label opcional.
8. **Auditoria global** (`audit_log`) além do trigger específico de automações.

## 🔮 V3 — Inteligência operacional

- **Cenários de alocação** (what-if) com comparativos.
- **Motor de priorização** por valor × risco × esforço × cliente.
- **Saúde automática** derivada (progresso × prazo × consumo).
- **Notificações realtime** (Supabase Realtime).
- **Exportações** PDF/CSV/XLSX.
- **IA cross-núcleo**: sumarização de status, geração de risk register, recomendação de alocação, matchmaking automação↔licitação.

## 🔌 Integrações previstas

| Categoria | Solução |
|---|---|
| SSO | Microsoft Entra ID, Google Workspace, LDAP corporativo |
| Provisionamento | SCIM 2.0 |
| Comunicação | Microsoft Teams, Slack |
| ALM | Azure DevOps, Jira |
| Documentos | SharePoint, Google Drive |
| BI | Power BI (export semantic model) |
| PNCP | API pública (já integrada no Núcleo 02) |
