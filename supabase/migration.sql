-- ─────────────────────────────────────────────────────────────
-- rodrigo.wtf — Content System Migration
-- Run this in: Supabase Dashboard → SQL Editor
-- ─────────────────────────────────────────────────────────────

-- Posts table
create table if not exists posts (
  id           uuid primary key default gen_random_uuid(),
  title        text not null,
  slug         text not null unique,
  category     text not null check (category in ('analises', 'projetos')),
  content      text not null default '',
  tags         text[] not null default '{}',
  published_at timestamptz,
  created_at   timestamptz not null default now()
);

-- Index for fast queries by category + date
create index if not exists posts_category_published
  on posts (category, published_at desc)
  where published_at is not null;

-- Index for slug lookup
create index if not exists posts_slug on posts (slug);

-- Comments table
create table if not exists comments (
  id         uuid primary key default gen_random_uuid(),
  post_id    uuid not null references posts(id) on delete cascade,
  user_id    text not null,
  user_name  text not null,
  content    text not null,
  created_at timestamptz not null default now()
);

create index if not exists comments_post_id on comments (post_id, created_at asc);

-- ─── Row Level Security ───────────────────────────────────────
-- Posts: public read only
alter table posts enable row level security;

create policy "Posts are publicly readable"
  on posts for select
  using (published_at is not null and published_at <= now());

-- Comments: public read, authenticated write (add later with Google Auth)
alter table comments enable row level security;

create policy "Comments are publicly readable"
  on comments for select
  using (true);

-- ─── Seed data (optional — delete after testing) ──────────────
insert into posts (title, slug, category, content, tags, published_at) values
(
  'Automatizei minha casa com ESP32 e Home Assistant',
  'automacao-casa-esp32',
  'projetos',
  '## O Problema

Cansado de usar três apps diferentes para ligar a luz, o ar-condicionado e a televisão.

## A Solução

Um ESP32 de R$25 + Home Assistant rodando em um Raspberry Pi resolveu tudo.

## Resultado

- Controle unificado via app
- Automações por horário e presença
- Custo total: R$ 180',
  ARRAY['hardware', 'automação', 'esp32', 'iot'],
  now() - interval '2 days'
),
(
  'Notion como CRM: vale a pena?',
  'notion-como-crm',
  'analises',
  '## Contexto

Testei o Notion como CRM para um cliente pequeno durante 3 meses.

## O que funcionou

Pipeline visual, integração com email, templates de proposta.

## O que não funcionou

Sem automação real, sem histórico de interações integrado ao email.

## Veredicto

Para times de 1-3 pessoas: sim. Para mais que isso, use um CRM de verdade.',
  ARRAY['ferramentas', 'produtividade', 'crm', 'notion'],
  now() - interval '5 days'
),
(
  'Site com Next.js + Supabase: stack mínima que funciona',
  'nextjs-supabase-stack',
  'analises',
  '## Por que essa stack

Zero infra para gerenciar, deploy automático, banco de dados com RLS nativo.

## O que essa stack resolve

- Auth
- Banco de dados
- Storage de arquivos
- Deploy

## Custo

R$ 0 até 50k requests/mês.',
  ARRAY['nextjs', 'supabase', 'desenvolvimento', 'stack'],
  now() - interval '10 days'
),
(
  'Ferramenta de cotação para distribuidora de alimentos',
  'cotacao-distribuidora',
  'projetos',
  '## O problema do cliente

Processo de cotação feito no WhatsApp + planilha manual. Levava 2h por cotação.

## O que foi feito

App web com cadastro de produtos, geração de PDF e envio automático por email.

## Resultado

15 minutos por cotação. Cliente saiu do papel.',
  ARRAY['ferramentas', 'automação', 'negócios'],
  now() - interval '15 days'
);
