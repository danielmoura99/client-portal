# Arquitetura do Client Portal - Traders House

## 📋 Índice
- [Visão Geral](#visão-geral)
- [Stack Tecnológica](#stack-tecnológica)
- [Arquitetura e Padrões](#arquitetura-e-padrões)
- [Modelo de Dados](#modelo-de-dados)
- [Segurança](#segurança)
- [Funcionalidades](#funcionalidades)
- [Fluxos Principais](#fluxos-principais)
- [Deploy e DevOps](#deploy-e-devops)
- [Guia para Desenvolvedores](#guia-para-desenvolvedores)

---

## 📊 Visão Geral

O **Client Portal** é uma aplicação web full-stack desenvolvida para intermediar a comunicação entre a Traders House e seus clientes traders. O sistema permite que traders:
- Acompanhem suas avaliações de trading
- Acessem conteúdo educacional
- Gerenciem seu perfil
- Se comuniquem com o suporte através de um sistema de tickets

### Características Principais
- ✅ **Aplicação Full-Stack** com Next.js 15
- ✅ **Autenticação Completa** com NextAuth.js
- ✅ **Sistema de Roles** (USER, ADMIN, SUPPORT)
- ✅ **Controle de Acesso** baseado em produtos e módulos
- ✅ **Sistema de Tickets** para suporte
- ✅ **Conteúdo Educacional** com liberação gradual
- ✅ **Painel Administrativo** completo
- ✅ **Design Responsivo** e acessível

---

## 🛠️ Stack Tecnológica

### Frontend
| Tecnologia | Versão | Propósito |
|-----------|---------|-----------|
| **Next.js** | 15.1.0 | Framework React com App Router |
| **React** | 18.2.0 | Biblioteca UI |
| **TypeScript** | 5+ | Tipagem estática |
| **Tailwind CSS** | 3.4.1 | Framework CSS utilitário |
| **shadcn/ui** | Latest | Sistema de componentes (Radix UI) |
| **Lucide React** | 0.469.0 | Biblioteca de ícones |
| **React Hook Form** | 7.54.1 | Gerenciamento de formulários |
| **Zod** | 3.24.1 | Validação de schemas |
| **TanStack Table** | 8.20.6 | Tabelas de dados avançadas |

### Backend
| Tecnologia | Versão | Propósito |
|-----------|---------|-----------|
| **Next.js API Routes** | 15.1.0 | Endpoints REST |
| **NextAuth.js** | 4.24.11 | Autenticação e sessões |
| **Prisma ORM** | 6.1.0 | Mapeamento objeto-relacional |
| **PostgreSQL** | - | Banco de dados relacional |
| **bcryptjs** | 2.4.3 | Hash de senhas |
| **JWT** | - | Tokens de sessão |

### Serviços Externos
| Serviço | Propósito |
|---------|-----------|
| **Vercel Blob Storage** | Armazenamento de imagens/arquivos |
| **Nodemailer / Resend** | Envio de emails |
| **React Email** | Templates de email |

---

## 🏗️ Arquitetura e Padrões

### Estrutura de Pastas

```
client-portal/
├── app/                                # Next.js App Router
│   ├── (auth)/                        # 🔓 Grupo de rotas de autenticação
│   │   ├── login/                     # Página de login
│   │   ├── register/                  # Cadastro de novos usuários
│   │   ├── esqueci-senha/            # Solicitação de reset de senha
│   │   ├── redefinir-senha/[token]/  # Reset de senha com token
│   │   └── primeiro-acesso/          # Onboarding de primeiro acesso
│   │
│   ├── (portal)/                      # 🔒 Grupo de rotas do portal (protegidas)
│   │   ├── layout.tsx                # Layout principal com sidebar
│   │   ├── dashboard/                # Dashboard principal
│   │   │   ├── page.tsx
│   │   │   └── _components/          # Componentes locais
│   │   ├── evaluations/              # Gestão de avaliações
│   │   │   ├── _actions/            # Server Actions
│   │   │   ├── _columns/            # Definições de colunas
│   │   │   └── _components/
│   │   ├── requests/                 # Sistema de tickets/solicitações
│   │   │   ├── new/                 # Nova solicitação
│   │   │   ├── _actions/
│   │   │   └── _components/
│   │   ├── profile/                  # Perfil do usuário
│   │   │   ├── _actions/
│   │   │   └── _components/
│   │   └── educational/              # Conteúdo educacional
│   │       ├── cursos/              # Listagem de cursos
│   │       ├── _actions/
│   │       └── _components/
│   │
│   ├── (admin)/                       # 👨‍💼 Painel administrativo
│   │   └── admin/
│   │       ├── layout.tsx            # Layout com AdminSidebar
│   │       ├── page.tsx              # Dashboard admin
│   │       ├── users/                # Gestão de usuários
│   │       │   ├── new/             # Novo usuário
│   │       │   ├── [userId]/        # Edição de usuário
│   │       │   │   ├── access/      # Gerenciar acessos
│   │       │   │   ├── role/        # Alterar role
│   │       │   │   └── reset-password/
│   │       │   └── page.tsx
│   │       ├── products/             # Gestão de produtos
│   │       │   ├── new/
│   │       │   ├── [productId]/
│   │       │   │   ├── contents/    # Vincular conteúdos
│   │       │   │   │   └── modules/ # Gestão de módulos
│   │       │   │   └── page.tsx
│   │       │   └── page.tsx
│   │       └── contents/             # Gestão de conteúdos
│   │           ├── new/
│   │           ├── edit/[contentId]/
│   │           ├── _components/
│   │           └── page.tsx
│   │
│   ├── api/                           # 🌐 API Routes
│   │   ├── auth/                     # Autenticação
│   │   │   ├── [...nextauth]/       # NextAuth handler
│   │   │   ├── me/                  # Dados do usuário atual
│   │   │   ├── change-password/
│   │   │   ├── forgot-password/
│   │   │   ├── reset-password/
│   │   │   └── validate-reset-token/
│   │   ├── evaluations/             # API de avaliações
│   │   │   └── user/                # Avaliações do usuário
│   │   ├── request/                 # API de solicitações
│   │   │   └── [requestId]/
│   │   ├── contents/                # API de conteúdos
│   │   │   └── [contentId]/
│   │   ├── courses/                 # API de cursos
│   │   │   └── [slug]/
│   │   ├── admin/                   # APIs administrativas
│   │   │   ├── products/
│   │   │   ├── contents/
│   │   │   ├── modules/
│   │   │   └── upload-image/       # Upload Vercel Blob
│   │   └── registration/            # Registro de usuários
│   │       ├── check-user/
│   │       └── process/
│   │
│   ├── emails/                       # Templates de email
│   ├── globals.css                   # Estilos globais
│   ├── layout.tsx                    # Root layout
│   └── favicon.ico
│
├── components/                        # 🧩 Componentes reutilizáveis
│   ├── ui/                           # Componentes shadcn/ui
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── dialog.tsx
│   │   ├── form.tsx
│   │   ├── sidebar.tsx
│   │   ├── table.tsx
│   │   └── ...
│   ├── providers/
│   │   └── session-provider.tsx     # Provider NextAuth
│   ├── app-sidebar.tsx              # Sidebar do portal
│   ├── admin-sidebar.tsx            # Sidebar admin
│   ├── nav-main.tsx
│   ├── nav-user.tsx
│   └── require-role.tsx             # HOC para controle de acesso
│
├── lib/                              # 📚 Utilitários e configurações
│   ├── auth.ts                      # Configuração NextAuth
│   ├── prisma.ts                    # Cliente Prisma singleton
│   ├── utils.ts                     # Utilidades gerais
│   ├── email-service.ts             # Serviço de email
│   └── services/                    # Lógica de negócio
│       ├── access-control.ts        # Controle de acesso a produtos
│       ├── module-access-control.ts # Controle de acesso a módulos
│       └── evaluations.ts           # Lógica de avaliações
│
├── hooks/                            # 🪝 Custom React Hooks
│   ├── use-mobile.tsx
│   ├── use-requests.ts
│   └── use-toast.ts
│
├── types/                            # 📝 Definições TypeScript
│
├── prisma/                           # 💾 Prisma ORM
│   ├── schema.prisma                # Schema do banco
│   └── migrations/                  # Histórico de migrations
│
├── scripts/                          # 🔧 Scripts utilitários
│   └── seed-educational-content.ts  # Seed de dados
│
├── public/                           # 📦 Assets estáticos
│   └── logo.png
│
├── docs/                             # 📖 Documentação
│   ├── ARCHITECTURE.md              # Este arquivo
│   └── screenshots/
│
├── .env                             # Variáveis de ambiente
├── next.config.ts                   # Configuração Next.js
├── tailwind.config.ts               # Configuração Tailwind
├── tsconfig.json                    # Configuração TypeScript
├── components.json                  # Configuração shadcn/ui
├── middleware.ts                    # Middleware de proteção de rotas
├── package.json
└── README.md
```

### Padrões Arquiteturais

#### 1. Next.js App Router (RSC - React Server Components)

**Server Components por Padrão**
- Todos os componentes são Server Components por padrão
- Renderização no servidor = melhor performance e SEO
- Menor bundle JavaScript no cliente

```tsx
// Server Component (padrão)
export default async function Page() {
  const data = await fetchData() // Fetch direto no servidor
  return <div>{data}</div>
}
```

**Client Components quando necessário**
```tsx
'use client' // Marca explicitamente como Client Component

import { useState } from 'react'

export default function InteractiveComponent() {
  const [count, setCount] = useState(0)
  return <button onClick={() => setCount(count + 1)}>{count}</button>
}
```

#### 2. Route Groups

Grupos de rotas que compartilham layout sem afetar a URL:

- **(auth)**: Rotas de autenticação (login, registro, etc.)
- **(portal)**: Rotas do portal do cliente (protegidas)
- **(admin)**: Rotas administrativas (protegidas com role ADMIN)

```
app/
├── (auth)/
│   └── login/
│       └── page.tsx          → URL: /login
├── (portal)/
│   └── dashboard/
│       └── page.tsx          → URL: /dashboard
└── (admin)/
    └── admin/
        └── page.tsx          → URL: /admin
```

#### 3. Colocation Pattern

Organização de código relacionado próximo ao seu uso:

```
feature/
├── page.tsx              # Página principal
├── layout.tsx            # Layout específico
├── _components/          # Componentes locais (não são rotas)
├── _actions/             # Server Actions
└── _columns/             # Definições de colunas de tabelas
```

**Prefixo `_` indica pastas/arquivos privados** que não geram rotas.

#### 4. Server Actions

Funções que executam no servidor, chamadas diretamente do cliente:

```tsx
// app/(portal)/profile/_actions/update-profile.ts
'use server'

export async function updateProfile(data: FormData) {
  const session = await getServerSession()
  if (!session) throw new Error('Unauthorized')

  await prisma.user.update({
    where: { id: session.user.id },
    data: { name: data.get('name') }
  })

  revalidatePath('/profile')
}

// Uso no Client Component
'use client'
import { updateProfile } from './_actions/update-profile'

export function ProfileForm() {
  return <form action={updateProfile}>...</form>
}
```

#### 5. Separation of Concerns

**Camadas bem definidas:**

```
Presentation Layer (Components)
       ↓
Business Logic (Services)
       ↓
Data Access (Prisma ORM)
       ↓
Database (PostgreSQL)
```

---

## 💾 Modelo de Dados

### Diagrama de Entidades

```
┌──────────────┐
│     User     │
├──────────────┤
│ id           │───┐
│ name         │   │
│ email        │   │
│ document     │   │
│ password     │   │
│ role         │   │
│ firstAccess  │   │
└──────────────┘   │
                   │
                   ├───── 1:N ────┐
                   │               ↓
                   │      ┌──────────────┐
                   │      │  Evaluation  │
                   │      ├──────────────┤
                   │      │ id           │
                   │      │ userId       │
                   │      │ plan         │
                   │      │ platform     │
                   │      │ status       │
                   │      │ startDate    │
                   │      └──────────────┘
                   │
                   ├───── 1:N ────┐
                   │               ↓
                   │      ┌──────────────┐
                   │      │   Request    │
                   │      ├──────────────┤
                   │      │ id           │
                   │      │ userId       │
                   │      │ type         │
                   │      │ status       │
                   │      │ description  │
                   │      └──────────────┘
                   │               │
                   │               └─── 1:N ───┐
                   │                           ↓
                   │                  ┌─────────────────┐
                   │                  │ RequestResponse │
                   │                  ├─────────────────┤
                   │                  │ id              │
                   │                  │ requestId       │
                   │                  │ message         │
                   │                  │ isFromAdmin     │
                   │                  └─────────────────┘
                   │
                   └───── N:M ────┐
                                  ↓
                        ┌──────────────┐
                        │ UserProduct  │
                        ├──────────────┤
                        │ id           │
                        │ userId       │
                        │ productId    │───┐
                        │ expiresAt    │   │
                        └──────────────┘   │
                                           │
                                           ↓
                                  ┌──────────────┐
                                  │   Product    │
                                  ├──────────────┤
                                  │ id           │
                                  │ courseId     │
                                  │ name         │
                                  │ type         │
                                  │ slug         │
                                  └──────────────┘
                                           │
                                           ├───── 1:N ────┐
                                           │               ↓
                                           │      ┌──────────────┐
                                           │      │    Module    │
                                           │      ├──────────────┤
                                           │      │ id           │
                                           │      │ productId    │
                                           │      │ title        │
                                           │      │ immediateAcc │
                                           │      │ releaseAfter │
                                           │      └──────────────┘
                                           │
                                           └───── N:M ────┐
                                                          ↓
                                                ┌─────────────────┐
                                                │ ProductContent  │
                                                ├─────────────────┤
                                                │ id              │
                                                │ productId       │
                                                │ contentId       │───┐
                                                │ moduleId        │   │
                                                │ sortOrder       │   │
                                                └─────────────────┘   │
                                                                      ↓
                                                            ┌──────────────┐
                                                            │   Content    │
                                                            ├──────────────┤
                                                            │ id           │
                                                            │ title        │
                                                            │ type         │
                                                            │ path         │
                                                            └──────────────┘
```

### Entidades Principais

#### **User**
Representa um usuário do sistema (trader, admin ou suporte).

```prisma
model User {
  id               String    @id @default(cuid())
  name             String
  email            String    @unique
  document         String    @unique
  password         String    // Hash bcrypt
  phone            String?
  address          String?
  zipCode          String?
  firstAccess      Boolean   @default(true)
  resetToken       String?
  resetTokenExpiry DateTime?
  role             UserRole  @default(USER)
  createdAt        DateTime  @default(now())
  updatedAt        DateTime  @updatedAt

  // Relações
  evaluations   Evaluation[]
  requests      Request[]
  products      UserProduct[]
  accessLogs    UserProductAccessLog[]
}

enum UserRole {
  USER
  ADMIN
  SUPPORT
}
```

**Campos importantes:**
- `firstAccess`: Controla se é o primeiro acesso (redireciona para onboarding)
- `resetToken`: Token temporário para reset de senha
- `role`: Define permissões (USER, ADMIN, SUPPORT)

#### **Evaluation**
Representa uma avaliação de trading do usuário.

```prisma
model Evaluation {
  id          String    @id @default(cuid())
  userId      String
  user        User      @relation(fields: [userId], references: [id])
  plan        String    // Ex: "50K", "100K", "200K"
  platform    String    // Ex: "MT4", "MT5", "TradingView"
  status      String    // Ex: "active", "completed", "failed"
  startDate   DateTime?
  endDate     DateTime?
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
}
```

#### **Request (Sistema de Tickets)**
Solicitações/tickets de suporte dos usuários.

```prisma
model Request {
  id          String          @id @default(cuid())
  userId      String
  user        User            @relation(fields: [userId], references: [id])
  type        RequestType
  status      RequestStatus   @default(PENDING)
  description String          @db.Text
  responses   RequestResponse[]
  createdAt   DateTime        @default(now())
  updatedAt   DateTime        @updatedAt
}

enum RequestType {
  EVALUATION_APPROVAL    // Aprovação de avaliação
  START_DATE_CHANGE      // Mudança de data de início
  WITHDRAWAL             // Solicitação de saque
  PLATFORM_ISSUE         // Problema na plataforma
  GENERAL                // Geral
  CAPITAL_REQUEST        // Solicitação de capital
  PLATFORM_REQUEST       // Solicitação de plataforma
}

enum RequestStatus {
  PENDING       // Pendente
  IN_ANALYSIS   // Em análise
  COMPLETED     // Concluído
}
```

#### **RequestResponse**
Respostas/mensagens dentro de um ticket.

```prisma
model RequestResponse {
  id          String    @id @default(cuid())
  requestId   String
  request     Request   @relation(fields: [requestId], references: [id])
  message     String    @db.Text
  isFromAdmin Boolean   @default(false)
  createdAt   DateTime  @default(now())
}
```

#### **Product (Sistema de Conteúdo)**
Produtos que podem ser cursos, ferramentas ou avaliações.

```prisma
model Product {
  id          String      @id @default(cuid())
  courseId    Int         @unique @default(autoincrement())
  name        String
  description String
  coverImage  String?     // URL da imagem (Vercel Blob)
  type        ProductType
  slug        String      @unique
  createdAt   DateTime    @default(now())
  updatedAt   DateTime    @updatedAt

  // Relações
  contents      ProductContent[]
  modules       Module[]
  userProducts  UserProduct[]
  accessLogs    UserProductAccessLog[]
}

enum ProductType {
  COURSE        // Curso educacional
  TOOL          // Ferramenta
  EVALUATION    // Avaliação
}
```

**Campos importantes:**
- `courseId`: ID numérico auto-incrementado para uso externo
- `slug`: URL-friendly identifier
- `type`: Define o tipo de produto

#### **Module**
Módulos para organização de conteúdo dentro de um produto.

```prisma
model Module {
  id               String    @id @default(cuid())
  title            String
  description      String?
  sortOrder        Int       @default(0)
  immediateAccess  Boolean   @default(true)
  releaseAfterDays Int?      // null = nunca liberado automaticamente

  // Relações
  productId   String
  product     Product   @relation(fields: [productId], references: [id])
  contents    ProductContent[]

  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
}
```

**Lógica de liberação:**
- `immediateAccess: true` → Liberado imediatamente após compra
- `releaseAfterDays: 7` → Liberado 7 dias após compra
- `releaseAfterDays: null` → Nunca liberado automaticamente

#### **Content**
Conteúdos individuais (vídeos, PDFs, artigos, etc.).

```prisma
model Content {
  id          String   @id @default(cuid())
  title       String
  description String?
  type        String   // "video", "pdf", "article", "file"
  path        String   // URL ou caminho do arquivo
  sortOrder   Int      @default(0)

  // Relações
  productContents ProductContent[]

  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```

#### **ProductContent (Tabela Pivot)**
Relacionamento N:M entre Product e Content, com informações adicionais.

```prisma
model ProductContent {
  id          String   @id @default(cuid())
  productId   String
  product     Product  @relation(fields: [productId], references: [id])
  contentId   String
  content     Content  @relation(fields: [contentId], references: [id])
  moduleId    String?  // Opcional: conteúdo pode estar em um módulo
  module      Module?  @relation(fields: [moduleId], references: [id])
  sortOrder   Int      @default(0)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@unique([productId, contentId])
}
```

#### **UserProduct**
Controle de acesso do usuário aos produtos.

```prisma
model UserProduct {
  id          String    @id @default(cuid())
  userId      String
  user        User      @relation(fields: [userId], references: [id])
  productId   String
  product     Product   @relation(fields: [productId], references: [id])
  expiresAt   DateTime? // null = acesso permanente
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  @@unique([userId, productId])
}
```

#### **UserProductAccessLog**
Auditoria de quando o acesso foi concedido.

```prisma
model UserProductAccessLog {
  id              String      @id @default(cuid())
  userId          String
  user            User        @relation(fields: [userId], references: [id], onDelete: Cascade)
  productId       String
  product         Product     @relation(fields: [productId], references: [id], onDelete: Cascade)
  accessGrantedAt DateTime    @default(now())

  @@unique([userId, productId])
  @@index([userId, productId])
}
```

---

## 🔐 Segurança

### 1. Autenticação (NextAuth.js)

**Configuração**: `lib/auth.ts`

```typescript
export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  providers: [
    CredentialsProvider({
      async authorize(credentials) {
        // 1. Buscar usuário no banco
        const user = await prisma.user.findUnique({
          where: { email: credentials.email }
        })

        // 2. Verificar senha (bcrypt)
        const isValid = await compare(credentials.password, user.password)

        // 3. Retornar dados do usuário
        return { id, email, name, role, firstAccess }
      }
    })
  ],
  callbacks: {
    // Adicionar dados customizados ao token JWT
    jwt: async ({ token, user }) => {
      if (user) {
        token.id = user.id
        token.role = user.role
        token.firstAccess = user.firstAccess
      }
      return token
    },
    // Expor dados na sessão do cliente
    session: async ({ session, token }) => {
      session.user.id = token.id
      session.user.role = token.role
      session.user.firstAccess = token.firstAccess
      return session
    }
  }
}
```

**Hash de senhas:**
```typescript
import { hash } from 'bcryptjs'

// Criar hash (12 rounds = seguro e performático)
const hashedPassword = await hash(password, 12)

// Verificar senha
const isValid = await compare(inputPassword, hashedPassword)
```

### 2. Autorização (Middleware)

**Arquivo**: `middleware.ts`

```typescript
export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token

    // 1. Verificar autenticação
    if (!token) {
      return NextResponse.redirect(new URL("/login", req.url))
    }

    // 2. Controle de primeiro acesso
    if (token.firstAccess && !req.nextUrl.pathname.startsWith("/primeiro-acesso")) {
      return NextResponse.redirect(new URL("/primeiro-acesso", req.url))
    }

    // 3. Verificação de roles para área admin
    const isAdmin = token.role === "ADMIN" || token.role === "SUPPORT"
    if (req.nextUrl.pathname.startsWith("/admin") && !isAdmin) {
      return NextResponse.redirect(new URL("/dashboard", req.url))
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token
    }
  }
)

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/profile/:path*",
    "/evaluations/:path*",
    "/requests/:path*",
    "/primeiro-acesso",
    "/admin/:path*"
  ]
}
```

### 3. Controle de Acesso a Produtos

**Arquivo**: `lib/services/access-control.ts`

```typescript
export async function checkUserAccess(
  userId: string,
  options: {
    productSlug?: string
    productType?: string
    contentId?: string
  }
): Promise<boolean> {
  // 1. Admins sempre têm acesso
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true }
  })

  if (user?.role === "ADMIN" || user?.role === "SUPPORT") {
    return true
  }

  // 2. Verificar acesso por slug do produto
  if (options.productSlug) {
    const product = await prisma.product.findUnique({
      where: { slug: options.productSlug }
    })

    const userProduct = await prisma.userProduct.findFirst({
      where: {
        userId,
        productId: product.id,
        OR: [
          { expiresAt: null },           // Acesso permanente
          { expiresAt: { gt: new Date() } } // Não expirado
        ]
      }
    })

    return !!userProduct
  }

  // 3. Verificar acesso por tipo de produto
  if (options.productType) {
    const userProducts = await prisma.userProduct.findMany({
      where: {
        userId,
        OR: [
          { expiresAt: null },
          { expiresAt: { gt: new Date() } }
        ]
      },
      include: { product: true }
    })

    return userProducts.some(up => up.product.type === options.productType)
  }

  // 4. Verificar acesso por contentId específico
  if (options.contentId) {
    const hasAccess = await prisma.content.findFirst({
      where: {
        id: options.contentId,
        productContents: {
          some: {
            product: {
              userProducts: {
                some: {
                  userId,
                  OR: [
                    { expiresAt: null },
                    { expiresAt: { gt: new Date() } }
                  ]
                }
              }
            }
          }
        }
      }
    })

    return !!hasAccess
  }

  return false
}
```

### 4. Controle de Acesso a Módulos

**Arquivo**: `lib/services/module-access-control.ts`

Verifica se um módulo está liberado para o usuário baseado em:
- Data de concessão do acesso ao produto
- Configuração `immediateAccess` do módulo
- Configuração `releaseAfterDays` do módulo

```typescript
export async function checkModuleAccess(
  userId: string,
  moduleId: string
): Promise<boolean> {
  // 1. Buscar módulo e produto
  const module = await prisma.module.findUnique({
    where: { id: moduleId },
    include: { product: true }
  })

  if (!module) return false

  // 2. Verificar se usuário tem acesso ao produto
  const userProduct = await prisma.userProduct.findFirst({
    where: {
      userId,
      productId: module.productId,
      OR: [
        { expiresAt: null },
        { expiresAt: { gt: new Date() } }
      ]
    }
  })

  if (!userProduct) return false

  // 3. Verificar liberação do módulo
  if (module.immediateAccess) {
    return true
  }

  if (module.releaseAfterDays !== null) {
    const daysSinceAccess = differenceInDays(
      new Date(),
      userProduct.createdAt
    )
    return daysSinceAccess >= module.releaseAfterDays
  }

  return false
}
```

### 5. Reset de Senha

**Fluxo completo:**

1. **Solicitação** (`POST /api/auth/forgot-password`)
```typescript
// Gerar token único
const resetToken = crypto.randomBytes(32).toString('hex')
const resetTokenExpiry = new Date(Date.now() + 3600000) // 1 hora

// Salvar no banco
await prisma.user.update({
  where: { email },
  data: { resetToken, resetTokenExpiry }
})

// Enviar email com link
const resetLink = `${process.env.NEXTAUTH_URL}/redefinir-senha/${resetToken}`
await sendEmail({
  to: email,
  subject: 'Reset de Senha',
  html: `<a href="${resetLink}">Redefinir senha</a>`
})
```

2. **Validação** (`POST /api/auth/validate-reset-token`)
```typescript
const user = await prisma.user.findFirst({
  where: {
    resetToken: token,
    resetTokenExpiry: { gt: new Date() } // Não expirado
  }
})

return { valid: !!user }
```

3. **Redefinição** (`POST /api/auth/reset-password`)
```typescript
const user = await prisma.user.findFirst({
  where: {
    resetToken: token,
    resetTokenExpiry: { gt: new Date() }
  }
})

if (!user) throw new Error('Token inválido')

// Atualizar senha e limpar token
const hashedPassword = await hash(newPassword, 12)
await prisma.user.update({
  where: { id: user.id },
  data: {
    password: hashedPassword,
    resetToken: null,
    resetTokenExpiry: null
  }
})
```

### 6. Validação de Dados (Zod)

Todos os formulários e APIs usam Zod para validação:

```typescript
import { z } from 'zod'

const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres')
})

// Em um form com React Hook Form
const form = useForm({
  resolver: zodResolver(loginSchema)
})

// Em uma API route
export async function POST(request: Request) {
  const body = await request.json()
  const validated = loginSchema.parse(body) // Lança erro se inválido
  // ...
}
```

### 7. Proteção CSRF

NextAuth.js já inclui proteção CSRF automática via tokens.

### 8. Sanitização de Inputs

- Prisma ORM previne SQL Injection automaticamente
- Zod valida e sanitiza dados de entrada
- Next.js escapa XSS automaticamente no JSX

---

## 🎯 Funcionalidades

### Para Usuários (Traders)

#### 1. Dashboard
**Arquivo**: `app/(portal)/dashboard/page.tsx`

- ✅ Visão geral de avaliações ativas
- ✅ Cards com status (ativo, concluído, falhou)
- ✅ Ações rápidas (nova avaliação, abrir ticket)
- ✅ Canais de suporte
- ✅ Base de conhecimento

#### 2. Avaliações
**Pasta**: `app/(portal)/evaluations/`

- ✅ Listagem de todas as avaliações
- ✅ Filtros e busca
- ✅ Detalhes de cada avaliação (plano, plataforma, datas)
- ✅ Status em tempo real

#### 3. Sistema de Solicitações (Tickets)
**Pasta**: `app/(portal)/requests/`

**Criar solicitação:**
- Formulário com tipos predefinidos
- Campo de descrição
- Validação de campos

**Acompanhar solicitações:**
- Listagem de todos os tickets
- Status (PENDING, IN_ANALYSIS, COMPLETED)
- Visualizar respostas do suporte
- Thread de conversação

**Tipos de solicitação:**
- Aprovação de avaliação
- Mudança de data de início
- Solicitação de saque
- Problema na plataforma
- Solicitação de capital
- Solicitação de plataforma
- Geral

#### 4. Conteúdo Educacional
**Pasta**: `app/(portal)/educational/`

**Tutoriais:**
- Listagem de conteúdos disponíveis
- Filtro por tipo (vídeo, PDF, artigo)
- Verificação de acesso

**Cursos:**
- Listagem de cursos disponíveis
- Organização por módulos
- Liberação gradual de conteúdo
- Player de vídeo integrado
- Download de materiais

#### 5. Perfil
**Pasta**: `app/(portal)/profile/`

- ✅ Visualizar dados pessoais
- ✅ Editar informações (nome, telefone, endereço)
- ✅ Alterar senha
- ✅ Visualizar histórico de acessos

### Para Administradores

#### 1. Dashboard Admin
**Arquivo**: `app/(admin)/admin/page.tsx`

- Estatísticas gerais
- Visão geral de usuários
- Solicitações pendentes
- Métricas de uso

#### 2. Gestão de Usuários
**Pasta**: `app/(admin)/admin/users/`

**Listar usuários:**
- Tabela com todos os usuários
- Busca e filtros
- Paginação

**Criar/Editar usuário:**
- Formulário completo
- Validação de CPF/email único
- Geração automática de senha

**Gerenciar acessos:**
- Conceder acesso a produtos
- Definir data de expiração
- Visualizar histórico de acessos

**Alterar role:**
- USER → ADMIN
- USER → SUPPORT

**Reset de senha:**
- Gerar nova senha
- Enviar por email

#### 3. Gestão de Produtos
**Pasta**: `app/(admin)/admin/products/`

**Criar produto:**
- Nome, descrição, tipo
- Upload de imagem de capa (Vercel Blob)
- Geração automática de slug
- courseId auto-incrementado

**Editar produto:**
- Alterar informações
- Trocar imagem

**Gerenciar conteúdos:**
- Vincular conteúdos existentes
- Definir ordem (sortOrder)
- Organizar por módulos

**Módulos:**
- Criar módulos dentro do produto
- Definir `immediateAccess`
- Configurar `releaseAfterDays`
- Vincular conteúdos ao módulo

#### 4. Gestão de Conteúdos
**Pasta**: `app/(admin)/admin/contents/`

**Criar conteúdo:**
- Título, descrição
- Tipo (video, pdf, article, file)
- Path/URL do conteúdo

**Editar conteúdo:**
- Alterar informações
- Atualizar path

**Excluir conteúdo:**
- Dialog de confirmação
- Cascade delete em ProductContent

#### 5. Upload de Imagens
**API**: `app/api/admin/upload-image/route.ts`

```typescript
import { put } from '@vercel/blob'

export async function POST(request: Request) {
  const form = await request.formData()
  const file = form.get('file') as File

  const blob = await put(file.name, file, {
    access: 'public',
    token: process.env.BLOB_READ_WRITE_TOKEN
  })

  return Response.json({ url: blob.url })
}
```

---

## 🔄 Fluxos Principais

### 1. Fluxo de Registro

```
┌─────────────────┐
│ /register       │
│ Formulário de   │
│ cadastro        │
└────────┬────────┘
         │
         ↓
┌─────────────────────────────┐
│ POST /api/registration/     │
│ process                     │
│                             │
│ 1. Validar dados (Zod)     │
│ 2. Verificar email único   │
│ 3. Hash da senha (bcrypt)  │
│ 4. Criar usuário no DB     │
│    - firstAccess = true    │
│    - role = USER           │
│ 5. Enviar email boas-vindas│
└────────┬────────────────────┘
         │
         ↓
┌─────────────────┐
│ /login          │
│ Fazer login     │
└────────┬────────┘
         │
         ↓
┌─────────────────────────┐
│ Middleware verifica     │
│ firstAccess === true    │
└────────┬────────────────┘
         │
         ↓
┌─────────────────────────┐
│ /primeiro-acesso        │
│                         │
│ 1. Completar perfil     │
│ 2. Aceitar termos       │
│ 3. Tutorial             │
└────────┬────────────────┘
         │
         ↓
┌─────────────────────────┐
│ Atualizar DB:           │
│ firstAccess = false     │
└────────┬────────────────┘
         │
         ↓
┌─────────────────┐
│ /dashboard      │
│ Acesso liberado │
└─────────────────┘
```

### 2. Fluxo de Autenticação

```
┌──────────────┐
│ /login       │
│ Email + Senha│
└──────┬───────┘
       │
       ↓
┌──────────────────────────────┐
│ NextAuth CredentialsProvider │
│                              │
│ 1. Buscar user no DB         │
│    (email)                   │
└──────┬───────────────────────┘
       │
       ↓
┌──────────────────────────────┐
│ 2. Verificar senha           │
│    bcrypt.compare()          │
└──────┬───────────────────────┘
       │
       ├─ Inválido ──→ Erro "Credenciais inválidas"
       │
       ↓ Válido
┌──────────────────────────────┐
│ 3. Gerar JWT                 │
│    - id                      │
│    - email                   │
│    - role                    │
│    - firstAccess             │
└──────┬───────────────────────┘
       │
       ↓
┌──────────────────────────────┐
│ 4. Criar sessão              │
│    (cookie httpOnly)         │
└──────┬───────────────────────┘
       │
       ↓
┌──────────────────────────────┐
│ Middleware verifica:         │
│ - Token válido?              │
│ - firstAccess?               │
│ - Role adequado?             │
└──────┬───────────────────────┘
       │
       ↓
┌──────────────┐
│ Redirecionar │
│ para rota    │
│ apropriada   │
└──────────────┘
```

### 3. Fluxo de Reset de Senha

```
┌─────────────────┐
│ /esqueci-senha  │
│ Informar email  │
└────────┬────────┘
         │
         ↓
┌────────────────────────────────┐
│ POST /api/auth/forgot-password │
│                                │
│ 1. Verificar se email existe   │
│ 2. Gerar token aleatório       │
│    crypto.randomBytes(32)      │
│ 3. Salvar token + expiry no DB │
│    (válido por 1 hora)         │
│ 4. Enviar email com link       │
└────────┬───────────────────────┘
         │
         ↓
┌─────────────────────────────────┐
│ Email recebido                  │
│ Link: /redefinir-senha/[token]  │
└────────┬────────────────────────┘
         │
         ↓
┌─────────────────────────────────────┐
│ GET /redefinir-senha/[token]        │
│                                     │
│ 1. Validar token                    │
│    POST /api/auth/validate-reset-   │
│    token                            │
└────────┬────────────────────────────┘
         │
         ├─ Inválido/Expirado ──→ Erro
         │
         ↓ Válido
┌─────────────────────────┐
│ Formulário nova senha   │
│ - Senha                 │
│ - Confirmar senha       │
└────────┬────────────────┘
         │
         ↓
┌──────────────────────────────────┐
│ POST /api/auth/reset-password    │
│                                  │
│ 1. Verificar token novamente     │
│ 2. Hash da nova senha            │
│ 3. Atualizar DB:                 │
│    - password = newHashedPass    │
│    - resetToken = null           │
│    - resetTokenExpiry = null     │
└────────┬─────────────────────────┘
         │
         ↓
┌─────────────────┐
│ Sucesso!        │
│ Redirecionar    │
│ para /login     │
└─────────────────┘
```

### 4. Fluxo de Acesso a Conteúdo

```
┌──────────────────────┐
│ Usuário acessa curso │
│ /educational/cursos/ │
│ [slug]               │
└──────────┬───────────┘
           │
           ↓
┌──────────────────────────────────┐
│ 1. Server Component              │
│    Buscar curso no DB            │
│    const course = await prisma   │
│      .product.findUnique()       │
└──────────┬───────────────────────┘
           │
           ↓
┌──────────────────────────────────┐
│ 2. Verificar acesso do usuário   │
│    checkUserAccess(userId, {     │
│      productSlug: slug           │
│    })                            │
└──────────┬───────────────────────┘
           │
           ├─ Sem acesso ──→ Mensagem "Sem acesso"
           │
           ↓ Com acesso
┌──────────────────────────────────┐
│ 3. Registrar log de acesso       │
│    (se primeira vez)             │
│    UserProductAccessLog.create() │
└──────────┬───────────────────────┘
           │
           ↓
┌──────────────────────────────────┐
│ 4. Buscar módulos do curso       │
│    com conteúdos                 │
└──────────┬───────────────────────┘
           │
           ↓
┌──────────────────────────────────┐
│ 5. Para cada módulo:             │
│    Verificar se está liberado    │
│    - immediateAccess?            │
│    - releaseAfterDays?           │
│    - dias desde acesso           │
└──────────┬───────────────────────┘
           │
           ↓
┌──────────────────────────────────┐
│ 6. Renderizar conteúdo           │
│    - Módulos liberados: visíveis │
│    - Módulos bloqueados:         │
│      "Liberado em X dias"        │
└──────────────────────────────────┘
```

### 5. Fluxo de Sistema de Tickets

```
┌─────────────────┐
│ /requests/new   │
│ Criar ticket    │
└────────┬────────┘
         │
         ↓
┌─────────────────────────┐
│ Formulário              │
│ - Tipo (select)         │
│ - Descrição (textarea)  │
└────────┬────────────────┘
         │
         ↓
┌─────────────────────────────┐
│ POST /api/request           │
│                             │
│ Request.create({            │
│   userId,                   │
│   type,                     │
│   description,              │
│   status: 'PENDING'         │
│ })                          │
└────────┬────────────────────┘
         │
         ↓
┌─────────────────────────┐
│ Notificação p/ admins   │
│ (email opcional)        │
└────────┬────────────────┘
         │
         ↓
┌─────────────────────────┐
│ /requests               │
│ Lista de tickets        │
└────────┬────────────────┘
         │
         ↓
┌─────────────────────────┐
│ Clicar em ticket        │
│ Ver detalhes + respostas│
└────────┬────────────────┘
         │
         │
         ↓
    ┌────────┴────────┐
    │                 │
┌───▼──────┐  ┌───────▼────┐
│ Admin    │  │ Usuário    │
│ responde │  │ responde   │
└───┬──────┘  └───────┬────┘
    │                 │
    └────────┬────────┘
             │
             ↓
┌─────────────────────────────┐
│ POST /api/request/          │
│ [requestId]                 │
│                             │
│ RequestResponse.create({    │
│   requestId,                │
│   message,                  │
│   isFromAdmin: true/false   │
│ })                          │
└────────┬────────────────────┘
         │
         ↓
┌─────────────────────────┐
│ Atualizar status        │
│ PENDING → IN_ANALYSIS   │
│ IN_ANALYSIS → COMPLETED │
└─────────────────────────┘
```

---

## 🚀 Deploy e DevOps

### Variáveis de Ambiente

Criar arquivo `.env` na raiz:

```bash
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/client_portal"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="seu-secret-muito-seguro-aqui"

# Email (Nodemailer)
EMAIL_SERVER_USER="seu-email@gmail.com"
EMAIL_SERVER_PASSWORD="sua-senha-app"
EMAIL_SERVER_HOST="smtp.gmail.com"
EMAIL_SERVER_PORT="587"
EMAIL_FROM="noreply@tradershouse.com"

# Vercel Blob (para upload de imagens)
BLOB_READ_WRITE_TOKEN="vercel_blob_rw_XXXXX"

# Opcional: Resend (alternativa ao Nodemailer)
RESEND_API_KEY="re_XXXXX"
```

### Scripts NPM

```json
{
  "scripts": {
    "dev": "next dev",                    // Servidor de desenvolvimento
    "build": "next build",                // Build de produção
    "start": "next start",                // Servidor de produção
    "lint": "next lint",                  // Linter
    "postinstall": "prisma generate",     // Gera cliente Prisma após install
    "vercel-build": "prisma generate && prisma migrate deploy && next build"
  }
}
```

### Configuração do Banco de Dados

**1. Desenvolvimento:**
```bash
# Criar migration
npx prisma migrate dev --name nome_da_migration

# Aplicar migrations
npx prisma migrate dev

# Abrir Prisma Studio (GUI)
npx prisma studio

# Seed de dados
npm run seed:educational
```

**2. Produção:**
```bash
# Aplicar migrations em produção
npx prisma migrate deploy

# Gerar cliente Prisma
npx prisma generate
```

### Deploy na Vercel

**1. Conectar repositório GitHub**

**2. Configurar variáveis de ambiente:**
- Ir em Settings → Environment Variables
- Adicionar todas as variáveis do `.env`

**3. Configurar banco de dados:**
- Opção 1: Vercel Postgres (integrado)
- Opção 2: Railway, Supabase, Neon, etc.

**4. Build settings:**
- Framework Preset: Next.js
- Build Command: `npm run vercel-build`
- Output Directory: `.next`

**5. Deploy automático:**
- Push para `main` → Deploy em produção
- Push para outras branches → Deploy de preview

### Vercel Blob Storage

**Configuração:**
1. Ir em Storage → Blob
2. Criar novo store
3. Copiar token `BLOB_READ_WRITE_TOKEN`

**Uso no código:**
```typescript
import { put } from '@vercel/blob'

const blob = await put(filename, file, {
  access: 'public',
  token: process.env.BLOB_READ_WRITE_TOKEN
})

console.log(blob.url) // URL pública da imagem
```

---

## 👨‍💻 Guia para Desenvolvedores

### Setup do Ambiente

```bash
# 1. Clonar repositório
git clone https://github.com/seu-usuario/client-portal.git
cd client-portal

# 2. Instalar dependências
npm install

# 3. Configurar variáveis de ambiente
cp .env.example .env
# Editar .env com suas configurações

# 4. Setup do banco de dados
npx prisma migrate dev
npm run seed:educational

# 5. Rodar servidor de desenvolvimento
npm run dev
```

Acessar: http://localhost:3000

### Estrutura de Desenvolvimento

**Criar nova página protegida:**
```bash
app/(portal)/
└── minha-feature/
    ├── page.tsx              # Página principal
    ├── layout.tsx            # Layout (opcional)
    ├── loading.tsx           # Loading state (opcional)
    ├── error.tsx             # Error boundary (opcional)
    ├── _components/          # Componentes locais
    │   ├── feature-card.tsx
    │   └── feature-list.tsx
    └── _actions/             # Server Actions
        └── create-feature.ts
```

**Criar nova API Route:**
```bash
app/api/
└── minha-api/
    └── route.ts              # GET, POST, PUT, DELETE
```

**Exemplo de API Route:**
```typescript
// app/api/minha-api/route.ts
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  // 1. Verificar autenticação
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // 2. Buscar dados
  const data = await prisma.myModel.findMany({
    where: { userId: session.user.id }
  })

  // 3. Retornar resposta
  return NextResponse.json({ data })
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()

  // Validar com Zod
  const schema = z.object({
    name: z.string()
  })
  const validated = schema.parse(body)

  // Criar registro
  const created = await prisma.myModel.create({
    data: {
      ...validated,
      userId: session.user.id
    }
  })

  return NextResponse.json({ created }, { status: 201 })
}
```

**Criar Server Action:**
```typescript
// app/(portal)/minha-feature/_actions/create-item.ts
'use server'

import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

const schema = z.object({
  name: z.string().min(3),
  description: z.string()
})

export async function createItem(formData: FormData) {
  // 1. Autenticação
  const session = await getServerSession(authOptions)
  if (!session) throw new Error('Unauthorized')

  // 2. Validação
  const data = {
    name: formData.get('name'),
    description: formData.get('description')
  }
  const validated = schema.parse(data)

  // 3. Criar no banco
  await prisma.item.create({
    data: {
      ...validated,
      userId: session.user.id
    }
  })

  // 4. Revalidar cache da página
  revalidatePath('/minha-feature')

  return { success: true }
}
```

**Usar Server Action no componente:**
```tsx
'use client'

import { createItem } from './_actions/create-item'
import { useTransition } from 'react'

export function CreateItemForm() {
  const [isPending, startTransition] = useTransition()

  return (
    <form action={(formData) => {
      startTransition(async () => {
        await createItem(formData)
      })
    }}>
      <input name="name" required />
      <textarea name="description" required />
      <button type="submit" disabled={isPending}>
        {isPending ? 'Salvando...' : 'Salvar'}
      </button>
    </form>
  )
}
```

### Criar Componente shadcn/ui

```bash
# Adicionar novo componente
npx shadcn@latest add dialog

# Componentes disponíveis:
# button, card, dialog, form, input, label, select,
# table, toast, tooltip, dropdown-menu, etc.
```

**Uso:**
```tsx
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader } from '@/components/ui/dialog'

export function MyComponent() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Abrir</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>Título</DialogHeader>
        Conteúdo do modal
      </DialogContent>
    </Dialog>
  )
}
```

### Adicionar Nova Migration

```bash
# 1. Editar schema.prisma
# Adicionar novo model ou campo

# 2. Criar migration
npx prisma migrate dev --name add_new_field

# 3. Verificar migration gerada
# prisma/migrations/XXXXXX_add_new_field/migration.sql

# 4. Aplicar (já aplicado no passo 2 em dev)
# Em produção:
npx prisma migrate deploy
```

### Boas Práticas

1. **Server vs Client Components:**
   - Use Server Components por padrão
   - Use Client Components apenas quando necessário:
     - useState, useEffect, event handlers
     - Bibliotecas que usam browser APIs

2. **Fetch de dados:**
   - Server Components: fetch direto ou Prisma
   - Client Components: useEffect + fetch ou React Query

3. **Tratamento de erros:**
   - Usar error.tsx para error boundaries
   - Try/catch em Server Actions
   - Validação com Zod

4. **Segurança:**
   - SEMPRE verificar autenticação em APIs
   - SEMPRE verificar autorização (role/access)
   - SEMPRE validar inputs com Zod
   - NUNCA expor dados sensíveis no cliente

5. **Performance:**
   - Usar Server Components para dados estáticos
   - Loading states com loading.tsx
   - Suspense boundaries
   - Imagens com next/image

### Troubleshooting

**Erro: "Cannot find module '@/...'"**
- Verificar `tsconfig.json` → `paths` → `"@/*": ["./*"]`
- Reiniciar TypeScript server (VSCode: Cmd+Shift+P → Restart TS Server)

**Erro: Prisma client não atualizado**
```bash
npx prisma generate
```

**Erro: NextAuth session undefined**
- Verificar NEXTAUTH_SECRET no .env
- Verificar NEXTAUTH_URL correto
- Limpar cookies do navegador

**Erro: Tailwind classes não funcionam**
- Verificar `tailwind.config.ts` → `content` inclui seus arquivos
- Reiniciar servidor (Ctrl+C → npm run dev)

---

## 📚 Recursos e Referências

### Documentação Oficial
- [Next.js 15 Docs](https://nextjs.org/docs)
- [React 18 Docs](https://react.dev)
- [Prisma Docs](https://www.prisma.io/docs)
- [NextAuth.js Docs](https://next-auth.js.org)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [shadcn/ui Docs](https://ui.shadcn.com)

### Padrões e Arquitetura
- [Next.js App Router](https://nextjs.org/docs/app)
- [React Server Components](https://react.dev/reference/react/use-server)
- [Server Actions](https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations)

### Bibliotecas Utilizadas
- [Zod](https://zod.dev) - Validação de schemas
- [React Hook Form](https://react-hook-form.com) - Formulários
- [TanStack Table](https://tanstack.com/table) - Tabelas
- [Lucide Icons](https://lucide.dev) - Ícones
- [Radix UI](https://www.radix-ui.com) - Componentes primitivos

---

## 🤝 Contribuindo

### Fluxo de Trabalho

1. Criar branch da feature
```bash
git checkout -b feature/nome-da-feature
```

2. Desenvolver e testar

3. Commit seguindo padrão:
```bash
git commit -m "feat: adiciona nova funcionalidade"
# ou
git commit -m "fix: corrige bug X"
# ou
git commit -m "docs: atualiza documentação"
```

4. Push e criar Pull Request
```bash
git push origin feature/nome-da-feature
```

### Convenção de Commits

- `feat:` Nova funcionalidade
- `fix:` Correção de bug
- `docs:` Documentação
- `style:` Formatação (não afeta código)
- `refactor:` Refatoração
- `test:` Testes
- `chore:` Manutenção

---

## 📞 Contato e Suporte

**Desenvolvedor:** Daniel Moura
**GitHub:** [@danielmoura99](https://github.com/danielmoura99)

---

**Última atualização:** 2025-11-05
**Versão:** 1.0.0
