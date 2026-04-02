---
name: new-feature
description: Scaffold de nova feature completa no portal do usuario
argument-hint: "[nome-da-feature]"
disable-model-invocation: true
allowed-tools: Read, Write, Edit, Glob, Grep, Bash
---

# Nova Feature: $ARGUMENTS

Crie o scaffold completo para uma nova feature no portal.

## Estrutura a Criar

```
app/(portal)/$0/
  page.tsx              # Pagina principal (async server component)
  _components/          # Componentes client da feature
    $0-form.tsx         # Form se necessario (React Hook Form + Zod)
    $0-table.tsx        # Tabela se necessario (TanStack Table)
  _actions/             # Server actions
    index.ts            # Fetch e mutacoes
```

## Checklist

1. **Page** (`page.tsx`):
   - Async server component
   - Buscar dados server-side via server actions ou Prisma
   - Layout consistente com outras paginas do portal

2. **Componentes** (`_components/`):
   - "use client" apenas quando necessario
   - Usar shadcn/ui como base
   - Forms com React Hook Form + Zod + componentes Form do shadcn

3. **Server Actions** (`_actions/`):
   - "use server" no topo
   - Verificar session antes de queries
   - Return tipado

4. **Navegacao**:
   - Adicionar item no sidebar em `components/app-sidebar.tsx`
   - Usar icone do Lucide React consistente com os existentes

5. **API Route** (se necessario):
   - Criar em `app/api/$0/` seguindo padrao REST

## Referencia

Consulte features existentes para manter consistencia:
- `app/(portal)/evaluations/` — feature com tabela e modais
- `app/(portal)/requests/` — feature com form e listagem
- `app/(portal)/profile/` — feature com form de edicao
