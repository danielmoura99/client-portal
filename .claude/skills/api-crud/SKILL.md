---
name: api-crud
description: Gera endpoint CRUD completo seguindo os padroes do projeto
argument-hint: "[nome-do-recurso]"
disable-model-invocation: true
allowed-tools: Read, Write, Edit, Glob, Grep, Bash
---

# Gerar CRUD para: $ARGUMENTS

Crie um endpoint CRUD completo seguindo os padroes deste projeto.

## Checklist

1. **Schema Prisma** — Verificar se o modelo ja existe em `prisma/schema.prisma`. Se nao:
   - Adicionar modelo com `@id @default(cuid())`, `createdAt`, `updatedAt`
   - Criar migration: `npx prisma migrate dev --name add-$0`
   - Gerar client: `npx prisma generate`

2. **API Routes** — Criar em `app/api/$0/`:
   - `route.ts` — GET (listar) e POST (criar)
   - `[id]/route.ts` — GET (buscar por id), PATCH (atualizar), DELETE (remover)
   - Incluir: validacao com Zod, verificacao de session, tratamento de erros
   - Seguir padrao de response: `NextResponse.json(data, { status })`

3. **Types** — Adicionar types necessarios em `types/index.ts`

4. **Validacao** — Criar Zod schemas para input de criacao e atualizacao

## Referencia de Padrao

Consulte arquivos existentes em `app/api/` para manter consistencia:
- `app/api/request/route.ts` — exemplo de GET + POST
- `app/api/admin/products/route.ts` — exemplo com validacao e roles

## Regras
- Usar Prisma singleton de `@/lib/prisma`
- Verificar `getServerSession(authOptions)` em todas as routes
- Retornar 401/403 apropriadamente
- Validar input com Zod antes de queries
