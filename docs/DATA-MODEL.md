# Modelo de Dados — Núcleo 1

Todas as entidades estão tipadas em [`src/modules/nucleo1/types.ts`](../src/modules/nucleo1/types.ts) e populadas em [`src/modules/nucleo1/mockData.ts`](../src/modules/nucleo1/mockData.ts).

## Entidades

### Nucleo
Unidade organizacional Hepta (Dados & IA, Cloud & Infra, Software, Cyber, Inovação).
```ts
{ id, nome, cor }
```

### Cliente
```ts
{ id, nome, tipo: 'publico' | 'privado' | 'interno' }
```

### Resource (Recurso humano)
```ts
{ id, nome, papel, kind: 'colaborador' | 'prestador' | 'parceiro',
  nucleoId?, capacidadeSemanal /* h */, skills[], avatar }
```

### Squad
```ts
{ id, nome, liderId, membrosIds[], vigencia: { inicio, fim? },
  tipo: 'permanente'|'temporario'|'hibrido', projetosIds[] }
```

### Portfolio / Programa
```ts
Portfolio { id, nome, responsavelId }
Programa  { id, nome, portfolioId }
```

### Project
```ts
{ id, codigo, nome,
  tipo: 'interno'|'cliente'|'inovacao'|'sustentacao'|'consultoria'|'implantacao'|'automacao',
  status: 'ideia'|'planejado'|'em_execucao'|'bloqueado'|'em_validacao'|'concluido'|'cancelado',
  prioridade: 'baixa'|'media'|'alta'|'critica',
  saude: 'verde'|'amarelo'|'vermelho',
  clienteId, nucleoId, gestorId, sponsorId?,
  inicio, fim, progresso /* 0-100 */,
  orcamento, consumido,
  risco: 'baixo'|'medio'|'alto',
  squadId?, programaId? }
```

### Allocation
```ts
{ id, resourceId, projectId, percentual /* 0-100 */, inicio, fim }
```

### Delivery
```ts
{ id, projectId, nome, data,
  status: 'planejada'|'em_andamento'|'concluida'|'atrasada',
  tipo: 'marco'|'entrega'|'contratual' }
```

### Risk (definido no DataStore)
```ts
{ id, projectId, titulo,
  severidade: 'baixo'|'medio'|'alto',
  status: 'aberto'|'monitorado'|'mitigado'|'fechado',
  mitigacao, responsavelId?, criadoEm }
```

### Dependency
```ts
{ id, fromId, toId, fromLabel, toLabel,
  tipo: 'FS'|'SS'|'FF', bloqueante: boolean }
```
`fromId`/`toId` podem referenciar **projetos** ou **entregas**.

---

## Diagrama de relacionamentos

```
Portfolio ─< Programa ─< Project >─ Cliente
                          │
                          ├─< Delivery
                          ├─< Risk
                          ├─< Allocation >─ Resource >─ Nucleo
                          └─ Squad ─< Resource (membros)

Dependency: (Project|Delivery) ─→ (Project|Delivery)
```

---

## Mapa para futuro schema Postgres (V2)

| Entidade | Tabela | RLS |
|---|---|---|
| Nucleo | `nucleos` | leitura pública autenticada |
| Cliente | `clientes` | restrita a perfil comercial/admin |
| Resource | `resources` | leitura para gestores; PII restrita |
| Squad | `squads` + `squad_members` | gestores e líderes |
| Portfolio/Programa | `portfolios`, `programas` | leitura ampla; escrita admin |
| Project | `projects` | leitura por membros do projeto |
| Allocation | `allocations` | leitura para gestores e o próprio recurso |
| Delivery / Risk | `deliveries`, `risks` | membros do projeto |
| Dependency | `dependencies` | membros dos projetos envolvidos |
| Roles | `user_roles` (separada!) | função `has_role()` security definer |

> ⚠️ Roles **nunca** ficam em `profiles`/`users` — sempre em tabela dedicada para evitar escalada de privilégio.
