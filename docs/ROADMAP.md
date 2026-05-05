# Roadmap

## ✅ V1 — Atual (front-end mockado)
- Landing institucional Hepta.
- Núcleo 1 completo em UI: Dashboard, Portfólio, Detalhe, Squads, Capacidade, Cronograma, Dependências, Admin.
- CRUD reativo em memória para projetos, entregas, riscos e alocações.
- Grafo de dependências com caminho crítico e fullscreen.
- Auth mockada com conta de homologação.

## 🚧 V2 — Backend & identidade corporativa
**Sequência prática recomendada:**
1. Autenticação federada — **Microsoft Entra ID (OIDC)**, Google (OIDC), LDAP on-prem.
2. Provisionamento — **SCIM** para sincronizar usuários/grupos.
3. Estrutura organizacional persistida (Lovable Cloud / Postgres).
4. Usuários, times, squads e perfis com RBAC (`user_roles` + `has_role()`).
5. Portfólio de projetos persistido + auditoria.
6. Tela de projeto com anexos (Storage) e histórico.
7. Capacidade & alocação com motor de validação (alertas de sobrealocação).
8. Dashboards com filtros salvos por usuário.
9. Identidade corporativa: temas por cliente, white-label opcional.

## 🔮 V3 — Inteligência operacional
- **Cenários de alocação** (what-if) com comparativos.
- **Motor de priorização** por valor × risco × esforço × cliente.
- **Saúde automática** derivada (progresso × prazo × consumo).
- **Notificações realtime** (Supabase Realtime).
- **Exportações** PDF/CSV/XLSX.
- **IA**: sumarização de status, geração de risk register, recomendação de alocação (Lovable AI Gateway).

## 🧱 Núcleos seguintes
- **Núcleo 2 — Licitações**: pipeline, qualificação, propostas, contratos, SLA.
- **Núcleo 3 — Automações**: motor de regras, RPA, integrações com sistemas internos Hepta.

## 🔌 Integrações previstas
| Categoria | Solução |
|---|---|
| SSO | Microsoft Entra ID, Google Workspace, LDAP corporativo |
| Provisionamento | SCIM 2.0 |
| Comunicação | Microsoft Teams, Slack |
| ALM | Azure DevOps, Jira |
| Documentos | SharePoint, Google Drive |
| BI | Power BI (export semantic model) |
