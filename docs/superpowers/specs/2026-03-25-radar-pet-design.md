# Radar Pet — Design Spec (MVP)

**Data:** 2026-03-25
**Status:** Aprovado
**Escopo:** Nova ferramenta em `/ferramentas/radar-pet` dentro do projeto `rodrigo-wtf`

---

## 1. Visão Geral

Plataforma de utilidade pública para reportar pets perdidos e encontrados. Diferencial: geração de cartaz PNG para impressão física com QR Code integrado, e sistema de rastreamento por GPS client-side que envia localização de avistamentos via deep link do WhatsApp — sem custo de API.

---

## 2. Stack e Dependências

Aproveita 100% o que já está no projeto:

- **Next.js 16** — rotas e Server Components
- **Supabase** — auth (Google OAuth), banco de dados, Storage (fotos), Edge Functions (TTL cron)
- **Mapbox GL** — mapa interativo com pins
- **qrcode.react** — QR Code no cartaz
- **html2canvas** — exportação do cartaz como PNG
- **Resend** — e-mail plain text de renovação
- **Tailwind + Grotesk** — estilo do cartaz consistente com o site

**Nenhuma nova dependência necessária.**

---

## 3. Banco de Dados

### Tabela `pets`

| Coluna | Tipo | Notas |
|---|---|---|
| `id` | `uuid` | PK, gerado automaticamente |
| `user_id` | `uuid` | FK → auth.users |
| `type` | `enum('lost', 'found')` | Tipo do cadastro |
| `name` | `text nullable` | Só para pets perdidos |
| `breed` | `text nullable` | Só para pets perdidos |
| `description` | `text` | Texto livre, max 240 chars |
| `photo_url` | `text` | Armazenado no Supabase Storage |
| `whatsapp` | `text` | Número do dono/samaritano |
| `neighborhood` | `text` | Bairro onde sumiu/foi encontrado |
| `lat` | `float8` | Localização do evento |
| `lng` | `float8` | |
| `city` | `text` | Para filtro por cidade no mapa |
| `reward` | `boolean` | Default false |
| `reward_amount` | `text nullable` | Só preenchido se reward = true |
| `status` | `enum('active', 'resolved', 'expired')` | Default `active` |
| `resolved_via` | `enum('platform', 'other', 'no') nullable` | Métrica de sucesso |
| `created_at` | `timestamptz` | |
| `last_renewed_at` | `timestamptz` | Base para o TTL; atualizado ao renovar |
| `reminder_sent_at` | `timestamptz nullable` | Controle do e-mail do 28º dia |

### RLS
- Leitura pública apenas para `status = 'active'`
- Escrita/edição/deleção apenas pelo `user_id` dono do registro

### Storage
- Bucket `pet-photos` — público para leitura, upload apenas autenticado

---

## 4. Rotas (Next.js)

```
/ferramentas/radar-pet              → Hub: mapa + feed + filtros
/ferramentas/radar-pet/cadastro     → Formulário dinâmico (lost/found via query param)
/ferramentas/radar-pet/meus-pets    → Painel de gestão do usuário logado
/ferramentas/radar-pet/pet/[id]     → Página pública do pet (destino do QR Code)
```

---

## 5. Estrutura de Arquivos

```
src/app/ferramentas/radar-pet/
├── page.tsx
├── layout.tsx
├── cadastro/
│   └── page.tsx
├── meus-pets/
│   └── page.tsx
├── pet/
│   └── [id]/
│       └── page.tsx
├── _lib/
│   ├── supabase-pets.ts       → Queries e mutations
│   └── use-auth.ts            → Reaproveitado do Mapa do Sossego
└── _components/
    ├── MapHub.tsx              → Mapa Mapbox (pins vermelhos=perdido, verdes=encontrado)
    ├── PetFeed.tsx             → Feed de cards ao lado do mapa
    ├── FilterBar.tsx           → Filtros: status, espécie, cidade
    ├── PetCard.tsx             → Card individual no feed
    ├── PetForm.tsx             → Formulário dinâmico de cadastro
    ├── PetPageLost.tsx         → Layout página pública — pet perdido
    ├── PetPageFound.tsx        → Layout página pública — pet encontrado
    ├── PosterGenerator.tsx     → Canvas A4 com QR Code → export PNG
    ├── ResolveModal.tsx        → Modal "isso ajudou?"
    └── LoginModal.tsx          → Reaproveitado do Mapa do Sossego

supabase/functions/radar-pet-ttl/
└── index.ts                   → Edge Function cron diário (TTL + e-mail)
```

---

## 6. Fluxos Principais

### Fluxo 1: Dono cadastra pet perdido
1. Clica "Perdi meu Pet" → verifica auth → se não logado, abre LoginModal (Google OAuth)
2. `/cadastro?type=lost` → campos: nome, raça, descrição (240 chars), foto, WhatsApp, bairro, gratificação (sim/não + valor), pin no mapa
3. Upload da foto → Supabase Storage → salva row na tabela `pets`
4. Redireciona para `/meus-pets` com botão "Gerar Cartaz" disponível

### Fluxo 2: Samaritano cadastra pet encontrado
1. Clica "Encontrei um Pet" → mesma verificação de auth
2. `/cadastro?type=found` → campos: descrição, foto, WhatsApp, bairro, pin no mapa (sem nome/raça/gratificação)
3. Salva e redireciona para `/meus-pets`

### Fluxo 3: Transeunte escaneia QR Code (sem login)
1. Abre `/ferramentas/radar-pet/pet/[id]` no celular
2. Vê foto, nome, raça, bairro
3. Clica "ESTOU VENDO / EU VI" → navegador solicita GPS via Geolocation API
4. Se GPS negado → alerta explicativo, botão desabilitado
5. Se GPS concedido → monta deep link: `wa.me/{numero}?text=Oi, vi seu cartaz! Vi o {Nome} aqui: https://maps.google.com/?q={lat},{lng}` → redireciona para WhatsApp

### Fluxo 4: Alguém vê pet encontrado
1. Abre `/ferramentas/radar-pet/pet/[id]`
2. Vê foto e características
3. Clica "SOU O DONO / CONHEÇO O DONO" → redireciona direto para `wa.me/{numero-do-samaritano}`

### Fluxo 5: TTL e renovação
1. Edge Function `radar-pet-ttl` agendada diariamente às 3h
2. Pets com `last_renewed_at` há 28+ dias e `reminder_sent_at` null → envia e-mail plain text via Resend + marca `reminder_sent_at`
3. Pets com `last_renewed_at` há 30+ dias → `status = 'expired'`, somem do mapa
4. E-mail contém link para `/meus-pets` onde dono clica "Renovar" (atualiza `last_renewed_at`)

### Fluxo 6: Marcar como resolvido
1. Em `/meus-pets`, clica "Marcar como Resolvido"
2. Abre `ResolveModal` → "A plataforma ajudou?" (Sim / Não / Por outros meios)
3. Salva `resolved_via` + `status = 'resolved'` → some do mapa

---

## 7. Mapa (Hub)

- Mapbox GL, centralizado na cidade do usuário por padrão
- Detecção de cidade: GPS do navegador (pede permissão) com fallback para campo de busca manual
- Pins: 🔴 vermelhos para `type=lost`, 🟢 verdes para `type=found`
- Filtros: Status (Perdido/Encontrado) · Bairro
- Feed de cards ao lado do mapa, sincronizado com os pins visíveis

---

## 8. Gerador de Cartaz (PNG)

Layout A4 (794×1123px), fundo branco, preto e branco para impressão barata. Usa fontes do site (Grotesk).

```
┌─────────────────────────────────┐
│  PROCURA-SE          (Grotesk)  │
├─────────────────────────────────┤
│                                 │
│          [FOTO GRANDE]          │
│                                 │
├─────────────────────────────────┤
│  Rex · Labrador · Pinheiros     │
│  Gratificação: R$ 500           │  ← omitido se reward=false
├──────────────────────┬──────────┤
│  Descrição livre     │  [QR]   │
│  (max 240 chars)     │         │
└──────────────────────┴──────────┘
```

- QR Code gerado com `qrcode.react` apontando para `/ferramentas/radar-pet/pet/[id]`
- `html2canvas` captura o `div` oculto → `canvas.toDataURL('image/png')` → download `cartaz-{nome}.png`
- Disponível apenas para `type=lost`

---

## 9. Integração com a Página de Ferramentas

Adicionar entrada no array de ferramentas em `src/i18n/pt.ts` e `src/i18n/en.ts`:
- Nome: "Radar Pet"
- Slug: `radar-pet`
- Status: "Beta Aberto"
- Tags: `GPS`, `WhatsApp`, `Pets`, `Comunidade`

---

## 10. Fora do Escopo (MVP)

- Versão colorida do cartaz
- Notificações push
- Chat interno na plataforma
- Moderação de conteúdo automatizada
- App mobile nativo
