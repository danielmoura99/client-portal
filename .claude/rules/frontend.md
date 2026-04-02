---
description: Padroes para componentes React e paginas Next.js
paths:
  - "app/**/*.tsx"
  - "app/**/*.ts"
  - "components/**/*.tsx"
  - "hooks/**/*.ts"
---

# Frontend Patterns

## Server vs Client Components
- DEFAULT e server component — so usar "use client" quando necessario (interatividade, hooks, eventos)
- Paginas (page.tsx) sao async server components que buscam dados server-side
- Client components ficam em `_components/` colocados com a feature

## Server Actions
- Colocar em `_actions/` dentro da feature (ex: `evaluations/_actions/`)
- Marcar com "use server" no topo do arquivo
- Nomear descritivamente: fetchActiveEvaluations, createRequest, etc.

## Layouts
- `(auth)/` — layout sem sidebar (rotas publicas)
- `(portal)/` — layout com sidebar + header (requer auth)
- `(admin)/` — layout admin com sidebar propria

## Componentes
- Usar shadcn/ui como base (nao reinventar)
- Props tipadas com interface, nao inline
- Composicao sobre heranca
- Formularios: React Hook Form + Zod resolver + componentes Form do shadcn

## Data Fetching
- Server components: fetch direto ou Prisma queries
- Client components: fetch via API routes com useEffect ou SWR
- Sem cache agressivo para dados de avaliacao (revalidate: 0)

## Tabelas
- Usar TanStack Table (data-table.tsx) para tabelas com sort/filter/pagination
- Colunas definidas com columnHelper

## Toast/Notificacoes
- Usar hook `useToast` para feedback ao usuario
- Tipos: default, destructive
