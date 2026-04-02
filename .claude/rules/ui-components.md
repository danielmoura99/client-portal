---
description: Padroes para uso de componentes UI (shadcn/ui)
paths:
  - "components/ui/**"
  - "components/*.tsx"
---

# UI Components (shadcn/ui)

## Regra Principal
- Componentes em `components/ui/` sao gerados pelo shadcn — evitar editar diretamente
- Para customizar, criar wrapper ou usar className/variants
- Adicionar novos: `npx shadcn@latest add <componente>`

## Tema
- Dark mode obrigatorio (class="dark" no root)
- Cores via CSS variables HSL (globals.css)
- Base: neutral
- Usar classes do Tailwind, nao estilos inline

## Componentes Disponiveis
button, card, input, form, dialog, dropdown-menu, sidebar, table, data-table,
select, tabs, toast, badge, avatar, separator, sheet, skeleton, tooltip,
collapsible, breadcrumb, checkbox, label, textarea, popover, calendar,
scroll-area

## Forms
- Sempre usar: Form + FormField + FormItem + FormLabel + FormControl + FormMessage
- Controller via React Hook Form + Zod resolver
- Pattern:
  ```tsx
  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: { ... }
  })
  ```

## Sidebar
- Portal: `app-sidebar.tsx` (usuario)
- Admin: `admin-sidebar.tsx` (admin/suporte)
- Componentes de sidebar do shadcn: Sidebar, SidebarMenu, SidebarMenuItem, etc.
