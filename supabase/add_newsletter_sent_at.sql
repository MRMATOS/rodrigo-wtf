-- ─────────────────────────────────────────────────────────────
-- Add newsletter_sent_at to posts table (idempotency guard)
-- Run this in: Supabase Dashboard → SQL Editor
-- ─────────────────────────────────────────────────────────────

alter table posts add column if not exists newsletter_sent_at timestamptz;
