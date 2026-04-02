---
description: Padroes para API routes do Next.js
paths:
  - "app/api/**/*.ts"
  - "lib/services/**/*.ts"
---

# API Routes

## Estrutura
- `app/api/[resource]/route.ts` — GET (listar) e POST (criar)
- `app/api/[resource]/[id]/route.ts` — GET (buscar), PATCH (atualizar), DELETE (remover)
- Variantes explicitas quando necessario: `/get/[id]/`, `/delete/[id]/`

## Padrao de Response
```typescript
// Sucesso
return NextResponse.json(data, { status: 200 })

// Criacao
return NextResponse.json(created, { status: 201 })

// Erro
return NextResponse.json({ error: "Mensagem" }, { status: 4xx })
```

## Autenticacao em API Routes
- Verificar session com `getServerSession(authOptions)`
- Checar role quando necessario: `session.user.role === "ADMIN"`
- Retornar 401 se nao autenticado, 403 se sem permissao

## Validacao
- Validar body com Zod antes de processar
- Retornar 400 com mensagem descritiva para input invalido

## Prisma Queries
- Usar `prisma` importado de `@/lib/prisma` (singleton)
- Include relacoes necessarias no select
- Tratar erros do Prisma (unique constraint, not found)

## APIs Externas (Evaluations)
- Usar header `Authorization: Bearer ${API_KEY}`
- Buscar de ambas APIs (B3 e FX) quando necessario
- Sem cache: `next: { revalidate: 0 }`
