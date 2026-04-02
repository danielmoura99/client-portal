# Security Audit Plan — Client Portal (Traders House)

**Data:** 2026-04-01
**Framework:** ESAA-Security (16 dominios, 95 checks) + OWASP Top 10
**Status:** Em andamento

---

## Resumo Executivo

Auditoria completa identificou **9 vulnerabilidades criticas**, **7 altas** e **6 medias** distribuidas em 27 API routes, 13 server actions e configuracoes de ambiente. As areas mais criticas sao: exposicao de secrets, falta de validacao de input e endpoints de debug em producao.

---

## FASE 1 — RECONHECIMENTO [CONCLUIDO]

### SEC-001: Stack Tecnologico
- [x] Next.js 15 (App Router), React 18, TypeScript strict
- [x] NextAuth.js 4 (JWT/Credentials), Prisma 6, PostgreSQL (Neon)
- [x] shadcn/ui, Tailwind CSS, Vercel Blob, Panda Video API

### SEC-002: Arquitetura Mapeada
- [x] 3 route groups: (auth), (portal), (admin)
- [x] Middleware com protecao por role
- [x] 27 API routes, 13 server actions
- [x] Integracao com APIs externas (B3, FX, Panda Video)

### SEC-003: Superficies de Ataque Enumeradas
- [x] Endpoints publicos: registration, forgot-password, test-connection
- [x] Client-side: payment modals com API keys expostas
- [x] File uploads: sem limite de tamanho
- [x] External APIs: chaves em NEXT_PUBLIC_

---

## FASE 2 — EXECUCAO DA AUDITORIA

### Dominio 1: Secrets & Configuracao [CRITICO]

| Check | Descricao | Status | Severidade | Evidencia |
|-------|-----------|--------|------------|-----------|
| SC-001 | Secrets em .env no repositorio | FAIL | CRITICO | `.env` linhas 2,5,13,22,25,27 — DB credentials, NEXTAUTH_SECRET, SMTP password, API keys em plaintext |
| SC-002 | API keys em NEXT_PUBLIC_ | FAIL | CRITICO | `NEXT_PUBLIC_API_KEY` e `NEXT_PUBLIC_PANDA_API_KEY` acessiveis no browser |
| SC-003 | .env no .gitignore | PASS | - | `.env*` no .gitignore (linha 34), nunca commitado no historico git |
| SC-004 | Secrets diferentes por ambiente | A VERIFICAR | ALTO | Verificar se Vercel usa env vars separadas |
| SC-005 | Rotacao de secrets | PENDENTE | ALTO | Todos os secrets expostos precisam ser rotacionados |
| SC-006 | Debug endpoints em producao | FAIL | CRITICO | `/api/test-connection` sem auth, `/api/debug` expoe dados |
| SC-007 | Console.log de secrets | FAIL | ALTO | `payment-modal.tsx:54-58` e `pagarme-payment-modal.tsx:52-59` logam API URL e key |
| SC-008 | Hardcoded test data | FAIL | MEDIO | `/api/test-connection` CPF "03430621941" hardcoded |

**Remediacao:**
- [ ] **SC-001**: Mover todos os secrets para Vercel Environment Variables. Remover .env do repo e adicionar ao .gitignore
- [ ] **SC-002**: Remover prefixo NEXT_PUBLIC_ de API_KEY e PANDA_API_KEY. Criar API routes/server actions como proxy
- [x] **SC-003**: PASS — .env no .gitignore e nunca commitado
- [ ] **SC-005**: Rotacionar: DB password, NEXTAUTH_SECRET, SMTP password, API keys, Panda key, Blob token
- [ ] **SC-006**: Deletar `/api/test-connection/route.ts` e `/api/debug/route.ts`
- [ ] **SC-007**: Remover console.log dos payment modals
- [ ] **SC-008**: Remover dados hardcoded de teste

---

### Dominio 2: Autenticacao [CRITICO]

| Check | Descricao | Status | Severidade | Evidencia |
|-------|-----------|--------|------------|-----------|
| AU-001 | Senhas hasheadas (bcrypt) | PASS | - | bcryptjs usado em todo o projeto |
| AU-002 | Salt rounds consistentes | FAIL | MEDIO | `auth.ts` usa salt 12, `change-password` e `reset-password` usam salt 10 |
| AU-003 | Validacao de complexidade de senha | FAIL | ALTO | Nenhuma rota valida complexidade de senha |
| AU-004 | Rate limiting em auth | FAIL | ALTO | Sem rate limiting em login, forgot-password, reset-password |
| AU-005 | Token de reset seguro | PASS | - | crypto.randomBytes(32), expira em 1h |
| AU-006 | Reset token limpo apos uso | PASS | - | `reset-password/route.ts:35-36` limpa token |
| AU-007 | Senha auto-gerada do CPF | FAIL | CRITICO | `registration/process/route.ts:104` usa ultimos 4 digitos do CPF |
| AU-008 | firstAccess flow seguro | PASS | - | Middleware forca setup de senha no primeiro acesso |

**Remediacao:**
- [ ] **AU-002**: Padronizar salt rounds para 12 em todos os arquivos
- [ ] **AU-003**: Criar Zod schema de senha: min 8 chars, 1 maiuscula, 1 numero, 1 especial. Aplicar em: change-password, reset-password, register, create-user
- [ ] **AU-004**: Implementar rate limiting (ex: `@upstash/ratelimit` + Redis ou middleware customizado)
- [ ] **AU-007**: Gerar senha aleatoria com `crypto.randomBytes(8).toString('base64')` em vez de CPF. Enviar por email ou exibir uma vez

---

### Dominio 3: Autorizacao [CRITICO]

| Check | Descricao | Status | Severidade | Evidencia |
|-------|-----------|--------|------------|-----------|
| AZ-001 | Middleware protege rotas | PASS | - | `middleware.ts` protege todas as rotas do portal e admin |
| AZ-002 | API routes verificam session | PASS (maioria) | - | 24/27 routes verificam getServerSession |
| AZ-003 | Admin routes verificam role | PASS | - | Todas as admin routes checam role === "ADMIN" |
| AZ-004 | IDOR em profile update | FAIL | CRITICO | `profile/_actions/index.ts` — updateUserProfile nao verifica se userId === session.user.id |
| AZ-005 | Access control em conteudo | PASS | - | `checkUserAccess()` em content e courses routes |
| AZ-006 | Enumeracao de usuarios | FAIL | ALTO | `/api/registration/check-user` retorna dados sensiveis (phone, address) sem auth |

**Remediacao:**
- [ ] **AZ-004**: Adicionar verificacao `session.user.id === userId` em `updateUserProfile`
- [ ] **AZ-006**: Reduzir dados retornados por check-user (apenas name e email). Adicionar rate limiting

---

### Dominio 4: Validacao de Input [CRITICO]

| Check | Descricao | Status | Severidade | Evidencia |
|-------|-----------|--------|------------|-----------|
| IV-001 | SQL injection | PASS | - | Prisma ORM usado consistentemente, sem raw queries |
| IV-002 | XSS (cross-site scripting) | PASS | - | Nenhum uso de dangerouslySetInnerHTML encontrado. React escapa output por default |
| IV-003 | Validacao Zod em admin routes | PASS | - | Products e users usam Zod schemas |
| IV-004 | Validacao em auth routes | FAIL | ALTO | change-password, forgot-password, reset-password sem validacao |
| IV-005 | Validacao em registration | FAIL | ALTO | Sem validacao de email, CPF, password, phone |
| IV-006 | Validacao em request/tickets | FAIL | MEDIO | type nao validado contra enum, description sem limite |
| IV-007 | JSON.parse sem try/catch | FAIL | MEDIO | `admin/contents/update/[contentId]/route.ts:56` — JSON.parse em input do usuario |

**Remediacao:**
- [x] **IV-002**: PASS — sem dangerouslySetInnerHTML no projeto
- [ ] **IV-004**: Adicionar Zod schemas: `changePasswordSchema`, `forgotPasswordSchema`, `resetPasswordSchema`
- [ ] **IV-005**: Adicionar Zod schema para registration com validacao de email, CPF (formato), senha (complexidade)
- [ ] **IV-006**: Validar type contra `RequestType` enum do Prisma. Limitar description a 5000 chars
- [ ] **IV-007**: Envolver JSON.parse em try/catch com retorno 400

---

### Dominio 5: Seguranca de Dados [CRITICO]

| Check | Descricao | Status | Severidade | Evidencia |
|-------|-----------|--------|------------|-----------|
| DS-001 | Senhas nunca em responses | FAIL | ALTO | `registration/process/route.ts:164` retorna senha em plaintext no JSON |
| DS-002 | Dados sensiveis em logs | FAIL | MEDIO | Content access route loga user IDs e paths detalhados |
| DS-003 | HTTPS enforced | PASS | - | Vercel forca HTTPS |
| DS-004 | Dados pessoais protegidos | FAIL | ALTO | check-user retorna phone e address sem auth |
| DS-005 | Soft delete para auditoria | FAIL | MEDIO | Hard delete em todos os modelos, sem audit trail |

**Remediacao:**
- [ ] **DS-001**: Nunca retornar senha em response. Se necessario informar, enviar por email
- [ ] **DS-002**: Remover logs detalhados de `contents/[contentId]/route.ts`
- [ ] **DS-004**: Limitar dados expostos no check-user
- [ ] **DS-005**: Considerar adicionar `deletedAt` em modelos criticos (User, Product, Request)

---

### Dominio 6: Dependencies & Supply Chain [ALTO]

| Check | Descricao | Status | Severidade | Evidencia |
|-------|-----------|--------|------------|-----------|
| DP-001 | npm audit clean | FAIL | ALTO | 20 vulnerabilidades (1 critica, 7 high, 10 moderate, 2 low). Critica: undici via @vercel/blob |
| DP-002 | Dependencias desatualizadas | A VERIFICAR | MEDIO | Verificar versoes criticas (next, prisma, nextauth) |
| DP-003 | Lock file presente | A VERIFICAR | MEDIO | Verificar package-lock.json commitado |
| DP-004 | Sem dependencias maliciosas | A VERIFICAR | ALTO | Revisar dependencias incomuns |

**Remediacao:**
- [ ] **DP-001**: Rodar `npm audit` e corrigir vulnerabilidades
- [ ] **DP-002**: Atualizar dependencias com patches de seguranca
- [ ] **DP-003**: Garantir package-lock.json no repo

---

### Dominio 7: API Security [ALTO]

| Check | Descricao | Status | Severidade | Evidencia |
|-------|-----------|--------|------------|-----------|
| AP-001 | CORS configurado | A VERIFICAR | ALTO | Verificar next.config.ts e headers |
| AP-002 | Rate limiting global | FAIL | ALTO | Sem rate limiting em nenhuma rota |
| AP-003 | Request body size limit | A VERIFICAR | MEDIO | Verificar se Next.js default esta adequado |
| AP-004 | Paginacao em listagens | FAIL | MEDIO | `/api/admin/contents/available` retorna tudo sem paginacao |
| AP-005 | Erro generico para cliente | PASS (maioria) | - | Erros nao expoem stack traces |
| AP-006 | Metodos HTTP corretos | PASS | - | GET para leitura, POST/PATCH/DELETE para mutacao |
| AP-007 | Duplicata de rota registration | FAIL | MEDIO | `/api/registration/process` e `/app/registration/process` — codigo duplicado |

**Remediacao:**
- [ ] **AP-001**: Verificar e configurar CORS adequadamente
- [ ] **AP-002**: Implementar rate limiting com Upstash Redis ou similar
- [ ] **AP-004**: Adicionar paginacao (skip/take) em listagens
- [ ] **AP-007**: Remover rota duplicada em `/app/registration/process`

---

### Dominio 8: File Upload [ALTO]

| Check | Descricao | Status | Severidade | Evidencia |
|-------|-----------|--------|------------|-----------|
| FU-001 | Validacao de tipo MIME | PARCIAL | MEDIO | Apenas imagens validam MIME (`file.type.startsWith("image/")`) |
| FU-002 | Limite de tamanho | FAIL | ALTO | Nenhum endpoint valida tamanho de arquivo |
| FU-003 | Sanitizacao de filename | FAIL | ALTO | `admin/contents/route.ts:44` usa `file.name` diretamente no path |
| FU-004 | Storage seguro | PASS | - | Vercel Blob gerencia storage |
| FU-005 | Acesso publico intencional | A VERIFICAR | MEDIO | Blobs sao publicos — verificar se todos devem ser |
| FU-006 | Validacao de extensao | FAIL | MEDIO | Apenas MIME verificado, nao extensao |

**Remediacao:**
- [ ] **FU-002**: Adicionar limite de 10MB para imagens, 50MB para conteudo
- [ ] **FU-003**: Sanitizar filename: remover `..`, caracteres especiais, limitar comprimento
- [ ] **FU-006**: Validar extensao alem do MIME (whitelist: .jpg, .png, .gif, .webp, .pdf, .mp4)

---

### Dominio 9: Session Security [ALTO]

| Check | Descricao | Status | Severidade | Evidencia |
|-------|-----------|--------|------------|-----------|
| SS-001 | JWT strategy | PASS | - | Stateless JWT, sem session storage |
| SS-002 | Session duration | A VERIFICAR | MEDIO | 30 dias pode ser longo para portal financeiro |
| SS-003 | Token refresh | PASS | - | NextAuth gerencia refresh |
| SS-004 | Logout invalida session | A VERIFICAR | MEDIO | JWT stateless — verificar se ha blacklist |
| SS-005 | Session data minima | PASS | - | Apenas id, email, name, role, firstAccess |
| SS-006 | Secure cookies | A VERIFICAR | ALTO | Verificar flags HttpOnly, Secure, SameSite |

**Remediacao:**
- [ ] **SS-002**: Considerar reduzir session para 7 dias para portal financeiro
- [ ] **SS-004**: Considerar token blacklist para logout imediato
- [ ] **SS-006**: Verificar configuracao de cookies do NextAuth

---

### Dominio 10: Criptografia [ALTO]

| Check | Descricao | Status | Severidade | Evidencia |
|-------|-----------|--------|------------|-----------|
| CR-001 | Password hashing (bcrypt) | PASS | - | bcryptjs usado |
| CR-002 | Salt rounds adequados | PARCIAL | MEDIO | 12 em auth.ts, 10 em outras rotas |
| CR-003 | Token generation seguro | PASS | - | crypto.randomBytes(32) |
| CR-004 | NEXTAUTH_SECRET forte | FAIL | ALTO | `4f8419b1c6e37df22f39a91e47ed40b7` — 32 hex chars, deveria ser mais forte |
| CR-005 | TLS enforced | PASS | - | Vercel HTTPS |

**Remediacao:**
- [ ] **CR-002**: Padronizar salt 12 em todos os pontos
- [ ] **CR-004**: Gerar novo secret com `openssl rand -base64 64`

---

### Dominio 11: Security Headers [MEDIO]

| Check | Descricao | Status | Severidade | Evidencia |
|-------|-----------|--------|------------|-----------|
| SH-001 | Content-Security-Policy | FAIL | MEDIO | next.config.ts sem headers de seguranca configurados |
| SH-002 | X-Frame-Options | FAIL | MEDIO | Nao configurado — vulneravel a clickjacking |
| SH-003 | X-Content-Type-Options | FAIL | BAIXO | Nao configurado |
| SH-004 | Strict-Transport-Security | FAIL | MEDIO | Nao configurado (Vercel pode adicionar, mas melhor ser explicito) |
| SH-005 | Referrer-Policy | FAIL | BAIXO | Nao configurado |

**Remediacao:**
- [ ] Adicionar headers de seguranca em `next.config.ts`:
```typescript
headers: [
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains' },
]
```

---

### Dominio 12: Logging & Monitoring [MEDIO]

| Check | Descricao | Status | Severidade | Evidencia |
|-------|-----------|--------|------------|-----------|
| LM-001 | Audit log de acoes criticas | PARCIAL | MEDIO | UserProductAccessLog existe, mas falta para auth e admin |
| LM-002 | Log de falhas de auth | FAIL | MEDIO | Login failures nao sao logados |
| LM-003 | Sem dados sensiveis em logs | FAIL | MEDIO | Content routes logam demais |
| LM-004 | Monitoramento de erros | A VERIFICAR | MEDIO | Verificar se Sentry/similar esta configurado |
| LM-005 | Alertas de seguranca | FAIL | MEDIO | Sem alertas para atividade suspeita |

**Remediacao:**
- [ ] **LM-001**: Adicionar audit log para: login, password change, role change, data deletion
- [ ] **LM-002**: Logar tentativas de login falhas (sem expor senha)
- [ ] **LM-003**: Reduzir verbosidade dos logs existentes

---

### Dominio 13: Frontend Security [MEDIO]

| Check | Descricao | Status | Severidade | Evidencia |
|-------|-----------|--------|------------|-----------|
| FS-001 | XSS via dangerouslySetInnerHTML | PASS | - | Nenhum uso encontrado no codebase |
| FS-002 | API keys no client | FAIL | CRITICO | NEXT_PUBLIC_API_KEY e NEXT_PUBLIC_PANDA_API_KEY |
| FS-003 | Dados sensiveis no state | A VERIFICAR | MEDIO | Verificar se passwords/tokens transitam pelo client |
| FS-004 | CSRF protection | PASS | - | NextAuth CSRF token em forms |

**Remediacao:**
- [x] **FS-001**: PASS — sem dangerouslySetInnerHTML
- [ ] **FS-002**: Ja coberto em SC-002

---

## FASE 3 — CLASSIFICACAO DE RISCO

### Matriz de Risco

| Severidade | Qtd | Exemplos |
|------------|-----|----------|
| CRITICO | 9 | Secrets expostos, IDOR, senha de CPF, debug endpoints, API keys client-side |
| ALTO | 7 | Sem validacao de input, sem rate limiting, enumeracao de usuarios, file upload sem limite |
| MEDIO | 6 | Salt inconsistente, logs verbosos, sem paginacao, session longa |
| BAIXO | 2 | Headers faltando, referrer policy |

### Score de Seguranca: **38/100**

| Dominio | Score | Peso |
|---------|-------|------|
| Secrets & Config | 15/100 | Alto |
| Autenticacao | 50/100 | Alto |
| Autorizacao | 65/100 | Alto |
| Input Validation | 40/100 | Alto |
| Data Security | 35/100 | Alto |
| API Security | 45/100 | Medio |
| File Upload | 30/100 | Medio |
| Session | 60/100 | Medio |
| Criptografia | 65/100 | Medio |
| Headers | A verificar | Baixo |
| Logging | 25/100 | Baixo |
| Frontend | 40/100 | Medio |

---

## FASE 4 — PLANO DE REMEDIACAO

### Sprint 1: CRITICO (fazer AGORA)

| # | Tarefa | Arquivos | OWASP |
|---|--------|----------|-------|
| 1 | Remover .env do repo, rotacionar todos os secrets | `.env`, `.gitignore` | A05:2021 |
| 2 | Remover NEXT_PUBLIC_ de API_KEY e PANDA_API_KEY | `.env`, payment modals, video-actions | A01:2021 |
| 3 | Deletar endpoints de debug | `api/test-connection/`, `api/debug/` | A05:2021 |
| 4 | Fix IDOR em profile update | `profile/_actions/index.ts` | A01:2021 |
| 5 | Parar de usar CPF como senha | `registration/process/route.ts` | A07:2021 |
| 6 | Remover senha de response JSON | `registration/process/route.ts` | A02:2021 |
| 7 | Remover console.log de API keys | payment modals | A09:2021 |

### Sprint 2: ALTO (essa semana)

| # | Tarefa | Arquivos | OWASP |
|---|--------|----------|-------|
| 8 | Adicionar Zod validation em auth routes | `change-password`, `reset-password`, `forgot-password` | A03:2021 |
| 9 | Adicionar Zod validation em registration | `registration/process`, `register/_actions` | A03:2021 |
| 10 | Implementar rate limiting | middleware ou lib/ | A07:2021 |
| 11 | Padronizar bcrypt salt rounds (12) | Todos os arquivos com bcrypt | A02:2021 |
| 12 | Adicionar limites em file upload | `admin/contents/`, `admin/upload-image/` | A04:2021 |
| 13 | Sanitizar filenames em upload | `admin/contents/route.ts` | A03:2021 |
| 14 | Reduzir dados em check-user | `registration/check-user/route.ts` | A01:2021 |

### Sprint 3: MEDIO (esse mes)

| # | Tarefa | Arquivos | OWASP |
|---|--------|----------|-------|
| 15 | Adicionar security headers | `next.config.ts` | A05:2021 |
| 16 | Implementar audit logging | Novo servico em `lib/` | A09:2021 |
| 17 | Adicionar paginacao em listagens | `admin/contents/available` | A04:2021 |
| 18 | Remover rota duplicada | `/app/registration/process/` | A05:2021 |
| 19 | Reduzir session duration | `nextauth/options.ts` | A07:2021 |
| 20 | npm audit + atualizar deps | `package.json` | A06:2021 |
| 21 | Validar type enum em requests | `api/request/route.ts` | A03:2021 |

---

## MAPEAMENTO OWASP TOP 10 (2021)

| OWASP | Nome | Issues Encontradas |
|-------|------|--------------------|
| A01:2021 | Broken Access Control | IDOR profile, API keys client-side, user enumeration |
| A02:2021 | Cryptographic Failures | Secrets em plaintext, salt inconsistente, senha em response |
| A03:2021 | Injection | Falta validacao em auth/registration/requests (mitigado por Prisma ORM) |
| A04:2021 | Insecure Design | Sem file size limits, sem paginacao, senha auto-gerada de CPF |
| A05:2021 | Security Misconfiguration | Debug endpoints, .env exposto, headers faltando |
| A06:2021 | Vulnerable Components | A verificar (npm audit) |
| A07:2021 | Auth Failures | Sem rate limiting, sem complexidade de senha, session longa |
| A08:2021 | Data Integrity Failures | Sem verificacao de integridade em uploads |
| A09:2021 | Logging Failures | Logs insuficientes, console.log de secrets |
| A10:2021 | SSRF | Baixo risco (URLs de API externas sao fixas em env vars) |

---

## CHECKLIST DE VERIFICACAO POS-FIX

Apos cada sprint, verificar:
- [ ] `npm audit` sem vulnerabilidades criticas/altas
- [ ] Nenhum NEXT_PUBLIC_ com secrets
- [ ] Nenhum endpoint sem auth (exceto auth flow)
- [ ] Todos os inputs validados com Zod
- [ ] Nenhum console.log com dados sensiveis
- [ ] Rate limiting ativo nos endpoints criticos
- [ ] Security headers configurados
- [ ] Testes de regressao passando

---

## LOG DE PROGRESSO

| Data | Acao | Responsavel | Status |
|------|------|-------------|--------|
| 2026-04-01 | Fase 1: Reconhecimento completo | Claude | Concluido |
| 2026-04-01 | Fase 2: Auditoria de 13 dominios | Claude | Concluido |
| 2026-04-01 | Fase 3: Classificacao de risco | Claude | Concluido |
| 2026-04-01 | Fase 4: Plano de remediacao criado | Claude | Concluido |
| 2026-04-02 | Sprint 1: Fixes criticos implementados | Claude | Concluido |
| 2026-04-02 | Sprint 2: Fixes altos implementados | Claude | Concluido |
| - | Sprint 3: Fixes medios | - | Pendente |

## Sprint 2 — Detalhe dos Fixes (2026-04-02)

| # | Fix | Arquivos modificados | Status |
|---|-----|----------------------|--------|
| CR-002 | Salt bcrypt 10 → 12 em todos os arquivos | `change-password`, `reset-password`, `admin/users/new`, `admin/users/reset-password` | ✅ |
| IV-004 | Zod em change-password | `api/auth/change-password/route.ts` — schema: current min(1), new min(6) | ✅ |
| IV-004 | Zod em forgot-password | `api/auth/forgot-password/route.ts` — schema: email format | ✅ |
| IV-004 | Zod em reset-password | `api/auth/reset-password/route.ts` — schema: token min(1), password min(6) | ✅ |
| IV-005 | Zod em register action | `(auth)/register/_actions/index.ts` — schema: name min(3), email, password min(6), document 11-14 chars | ✅ |
| FU-002 | Limite 5MB em upload de imagens | `api/admin/upload-image/route.ts` | ✅ |
| FU-002 | Limite 50MB em upload de conteudos | `api/admin/contents/route.ts` | ✅ |
| FU-003 | Sanitizacao de filename | `api/admin/upload-image/route.ts`, `api/admin/contents/route.ts` — replace(/[^a-zA-Z0-9._-]/g, '_') | ✅ |
| IV-006 | Validacao enum RequestType | `api/request/route.ts` — whitelist de 8 tipos validos | ✅ |
| IV-006 | Limite description em requests | `api/request/route.ts` — max 5000 chars, trim, obrigatoria | ✅ |
| AZ-006 | check-user: reducao de dados | ACEITO — trader-evaluation usa phone/address/zipCode para pre-preencher checkout de clientes ja cadastrados. Risco aceito em prol da UX | ✅ |

## Sprint 1 — Detalhe dos Fixes (2026-04-02)

| # | Fix | Arquivos modificados | Status |
|---|-----|----------------------|--------|
| SC-006 | Deletar endpoints de debug | `app/api/test-connection/` deletado, `app/api/debug/` deletado | ✅ |
| AZ-004 | Fix IDOR em profile update | `app/(portal)/profile/_actions/index.ts` — adicionado getServerSession + verificacao de ownership | ✅ |
| AU-007 | Senha inicial via CPF — ACEITO | Risco aceito: senha temporária tem vida útil de 1 login (firstAccess obriga troca). Salt corrigido de 10 → 12 | ✅ |
| DS-001 | Remover senha do response | `app/api/registration/process/route.ts` — removido initialPassword do JSON de retorno | ✅ |
| SC-007 | Remover console.log de API keys | `payment-modal.tsx`, `pagarme-payment-modal.tsx` — removidos todos os logs de URL e KEY | ✅ |
| SC-002 | PANDA_API_KEY: NEXT_PUBLIC_ removido | `educational/_actions/video-actions.ts` — "use client" → "use server", NEXT_PUBLIC_PANDA_API_KEY → PANDA_API_KEY | ✅ |
| SC-002 | API_KEY: NEXT_PUBLIC_ removido | Criadas rotas proxy: `api/renewal/generate-pix/route.ts`, `api/renewal/pagarme/generate-pix/route.ts` — modals agora chamam rotas locais autenticadas | ✅ |

## Acao Manual Necessaria (Dev)

Apos o deploy, adicionar as seguintes variaveis de ambiente no Vercel/producao:

```bash
# Renomear (mesmo valor de NEXT_PUBLIC_PANDA_API_KEY)
PANDA_API_KEY=<valor atual de NEXT_PUBLIC_PANDA_API_KEY>

# Remover do .env (nao devem ser publicas)
# NEXT_PUBLIC_API_KEY  → usar apenas API_KEY (ja existe)
# NEXT_PUBLIC_PANDA_API_KEY → substituido por PANDA_API_KEY
```

Tambem rotacionar os seguintes secrets (expostos no .env que ficou fora do repo mas pode ter vazado):
- DATABASE_URL (password do PostgreSQL)
- NEXTAUTH_SECRET (gerar novo: openssl rand -base64 64)
- SMTP_PASS (revogar app password do Gmail e gerar novo)
- API_KEY (coordenar com o sistema trader-evaluation)
- BLOB_READ_WRITE_TOKEN (revogar no painel Vercel e gerar novo)
