---
description: Padroes de autenticacao e seguranca
paths:
  - "app/api/auth/**"
  - "lib/auth.ts"
  - "middleware.ts"
  - "app/(auth)/**"
---

# Autenticacao & Seguranca

## NextAuth.js
- Provider: Credentials (email + password)
- Strategy: JWT (stateless, sem session no servidor)
- Config em: `app/api/auth/[...nextauth]/options.ts`
- Session extendida com: id, role, firstAccess

## Callbacks
- `jwt`: popula token com dados do user (id, role, firstAccess)
- `session`: expoe dados do token na session

## Password
- Hash com bcryptjs (salt rounds padrao)
- Nunca armazenar senha em texto plano
- Reset via token com expiracao

## Middleware (middleware.ts)
- Protege rotas: /, /dashboard, /profile, /evaluations, /requests, /admin
- Redireciona nao-autenticados para /login
- Verifica role para rotas /admin (ADMIN ou SUPPORT)
- Redireciona firstAccess para /primeiro-acesso

## Fluxos
- **Login:** email + senha > JWT > session
- **Primeiro acesso:** firstAccess=true > redireciona > setup senha > firstAccess=false
- **Esqueci senha:** email > token > email com link > reset > login
- **Registro:** form > criar user > firstAccess=true

## Seguranca
- Nunca expor senhas ou tokens em responses
- Validar session em toda API route protegida
- Checar role antes de operacoes admin
- Rate limiting futuro em endpoints de auth
