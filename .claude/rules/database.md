---
description: Padroes para schema Prisma e operacoes de banco
paths:
  - "prisma/**"
  - "lib/prisma.ts"
---

# Database (Prisma + PostgreSQL)

## Schema (prisma/schema.prisma)
- Source of truth para estrutura do banco
- Usar `@id @default(cuid())` para PKs
- Usar `@updatedAt` para timestamps de atualizacao
- Relations explicitas com `@relation`
- Enums para valores fixos (UserRole, RequestStatus, ProductType, RequestType)

## Migrations
- `npx prisma migrate dev --name descricao-curta` para criar migration
- Nunca editar migrations existentes manualmente
- `npx prisma generate` apos qualquer mudanca no schema

## Modelos Principais
- **User** — auth, perfil, roles (USER/ADMIN/SUPPORT)
- **Product** — cursos/ferramentas/avaliacoes com tipo enum
- **Module** — subdivisoes de Product com ordem e controle de liberacao
- **Content** — conteudo individual (video/file/article)
- **ProductContent** — junction Product > Module > Content
- **UserProduct** — controle de acesso usuario-produto (com expiracao)
- **Evaluation** — avaliacoes de trading do usuario
- **Request/RequestResponse** — sistema de chamados com respostas

## Boas Praticas
- Prisma client singleton em `lib/prisma.ts` (evita conexoes multiplas em dev)
- Usar `include` e `select` para otimizar queries
- Transactions para operacoes que envolvem multiplas tabelas
- Soft delete quando fizer sentido para dados criticos
