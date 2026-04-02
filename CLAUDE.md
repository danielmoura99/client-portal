# Client Portal - Traders House

Portal SaaS para gestao de avaliacoes de trading, conteudo educacional e suporte ao cliente.

## Stack

- **Framework:** Next.js 15 (App Router, Server Components)
- **UI:** React 18 + shadcn/ui (Radix) + Tailwind CSS (dark mode enforced)
- **Forms:** React Hook Form + Zod
- **Auth:** NextAuth.js 4 (JWT, Credentials provider)
- **DB:** PostgreSQL (Neon) via Prisma 6
- **Email:** Nodemailer + React Email
- **Video:** Panda Video API
- **Storage:** Vercel Blob
- **Deploy:** Vercel

## Comandos

- `npm run dev` — servidor local
- `npm run build` — build producao (inclui prisma generate + migrate)
- `npm run lint` — linting
- `npx prisma studio` — visualizar DB
- `npx prisma migrate dev --name <nome>` — nova migration
- `npx prisma generate` — gerar client apos mudar schema

## Arquitetura

```
app/
  (auth)/          # Rotas publicas (login, registro, reset senha)
  (portal)/        # Portal usuario (requer USER role)
  (admin)/         # Painel admin (requer ADMIN/SUPPORT role)
  api/             # REST API routes
  emails/          # Templates de email (React Email)
components/
  ui/              # shadcn/ui components (nao editar diretamente)
  providers/       # Context providers
lib/
  auth.ts          # Utilitarios de auth + hashing
  prisma.ts        # Prisma client singleton
  email-service.ts # Envio de emails
  services/        # Servicos de dominio (evaluations, access-control)
prisma/
  schema.prisma    # Schema do banco (source of truth)
types/             # TypeScript types e declaracoes
hooks/             # React hooks customizados
middleware.ts      # Protecao de rotas e redirecionamentos
```

## Convencoes

- **Imports:** sempre usar alias `@/` (mapeado para raiz)
- **Naming:** portugues para logica de negocio, ingles para codigo tecnico
- **Server-first:** preferir server components e server actions
- **Colocation:** `_components/` e `_actions/` dentro de cada feature
- **API pattern:** `/api/[resource]/` (GET all, POST) e `/api/[resource]/[id]/` (GET, PATCH, DELETE)
- **Validacao:** Zod schemas para forms e API inputs
- **Tema:** dark mode obrigatorio (class="dark" no html root)

## Dominio

- **Evaluations:** avaliacoes de trading (dados de APIs externas B3/FX)
- **Educational:** cursos com modulos e conteudos (video Panda, arquivos)
- **Requests:** sistema de chamados (8 tipos, fluxo PENDING > IN_ANALYSIS > COMPLETED)
- **Products:** cursos/ferramentas com controle de acesso por usuario
- **Users:** roles USER/ADMIN/SUPPORT, fluxo de primeiro acesso

## Auth & Middleware

- JWT stateless (sem session storage no servidor)
- Middleware protege rotas por role
- firstAccess flag redireciona para setup de senha
- Session inclui: id, email, name, role, firstAccess

## Integracao Externa

- **Evaluation APIs:** `NEXT_PUBLIC_ADMIN_API_URL` (B3) e `_FX` (Forex) com header `Authorization: Bearer API_KEY`
- **Panda Video:** folder ID fixo, ordena por numero da aula no titulo
- **Vercel Blob:** upload de imagens de capa de produtos

## Regras por Contexto

Regras especificas carregam automaticamente conforme o arquivo editado:
- Frontend/componentes: `.claude/rules/frontend.md`
- API routes: `.claude/rules/api.md`
- Database/Prisma: `.claude/rules/database.md`
- Auth/seguranca: `.claude/rules/auth.md`
- UI components: `.claude/rules/ui-components.md`

## Skills Disponiveis

- `/api-crud` — gerar endpoint CRUD completo
- `/new-feature` — scaffold de nova feature no portal

## Agents Disponiveis

- `code-reviewer` — revisao de codigo pos-mudanca
- `researcher` — exploracao profunda do codebase
