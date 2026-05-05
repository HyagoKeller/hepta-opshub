# Contribuindo

## Fluxo
1. Crie uma branch a partir de `main`: `feat/<tema>` ou `fix/<tema>`.
2. Commits no padrão **Conventional Commits** (`feat:`, `fix:`, `chore:`, `docs:`, `refactor:`).
3. Abra PR descrevendo: contexto, mudanças, screenshots (UI) e como testar.
4. CI deve passar (`npm run lint && npm run test && npm run build`).
5. Pelo menos 1 review aprovando.

## Convenções de código
- TypeScript estrito; evite `any`.
- Componentes funcionais + hooks.
- Estado de domínio → `DataStore`. Estado local de UI → `useState`.
- Tailwind apenas com **tokens semânticos**. Cores arbitrárias = revisão bloqueada.
- Páginas em `src/modules/<nucleo>/pages`. Componentes reutilizáveis do núcleo em `src/modules/<nucleo>/`.
- Diálogos sempre via shadcn `Dialog`/`AlertDialog`.

## Estrutura de PR
```
## Contexto
<por que>

## Mudanças
- ...

## Como testar
1. ...
2. ...

## Screenshots
...
```

## Testes
- Testes unitários com **Vitest** (`src/test/`).
- Para utilitários puros (cálculo de caminho crítico, agregações de capacidade), prefira testes diretos.

## Acessibilidade
- Todo botão sem rótulo visível precisa de `aria-label`.
- Não remova `focus-visible`.
- Contraste mínimo AA.

## Segurança (preparando V2)
- Nunca commitar segredos.
- Roles **sempre** em tabela separada (`user_roles`), nunca em `profiles`.
- Validação server-side obrigatória — não confiar em estado do cliente.
