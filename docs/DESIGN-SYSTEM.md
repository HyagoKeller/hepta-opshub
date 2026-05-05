# Design System — HeptaProject

Linguagem visual editorial / brutalista controlado, inspirada em painéis operacionais densos (Bloomberg, Linear) com identidade Hepta.

## Princípios
1. **Clareza operacional** acima de adorno.
2. **Tipografia com personalidade** — display serif/condensada para títulos, mono/sans neutra para dados.
3. **Cor como sinal** — saúde, risco e status usam tokens dedicados, nunca cores arbitrárias.
4. **Densidade controlada** — telas executivas respiram; telas analíticas adensam.

## Tokens semânticos
Definidos em [`src/index.css`](../src/index.css) e expostos via [`tailwind.config.ts`](../tailwind.config.ts). Sempre **HSL**.

| Token | Uso |
|---|---|
| `--background` / `--foreground` | superfícies base e texto |
| `--primary` / `--primary-foreground` | ações principais, marca |
| `--secondary` | superfícies de ênfase secundária |
| `--accent` | destaques, hover de navegação |
| `--muted` / `--muted-foreground` | hierarquia tipográfica |
| `--card` / `--card-foreground` | containers |
| `--border` / `--input` / `--ring` | controles |
| `--success` / `--info` / `--warning` / `--destructive` | sinais |
| `--steel` | acentos neutros frios |

> ❌ **Nunca** use `text-white`, `bg-black`, `text-[#fff]` em componentes. Use sempre tokens.

## Tipografia
- **Display**: usada em títulos institucionais e KPIs grandes (`font-display`).
- **Mono**: códigos de projeto, métricas e labels técnicas (`font-mono`).
- **Sans**: corpo padrão.

## Componentes base
- shadcn/ui (Button, Card, Dialog, Tabs, Table, Tooltip, Sheet, Badge…).
- Primitivas próprias em [`src/modules/nucleo1/ui.tsx`](../src/modules/nucleo1/ui.tsx): `KPI`, `Pill`, `Sparkline`, `SectionHeader`.

## Padrões de UI
- **Sidebar fixa** (≥ lg): navegação primária do app.
- **Cards com borda 2px** + sombra plana: estética brutalista controlada.
- **Pills** para status / prioridade / saúde — sempre com cor semântica + texto.
- **Diálogos** (Radix Dialog) para todo CRUD.
- **AlertDialog** para confirmações destrutivas.

## Acessibilidade
- Contraste AA mínimo em ambos os temas.
- `aria-label` em ícones-only.
- Foco visível via `--ring`.
