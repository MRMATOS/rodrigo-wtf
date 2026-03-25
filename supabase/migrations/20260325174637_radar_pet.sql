-- Enum types
create type pet_type as enum ('lost', 'found');
create type pet_status as enum ('active', 'resolved', 'expired');
create type resolved_via as enum ('platform', 'other', 'no');

-- Tabela principal
create table pets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  type pet_type not null,
  name text,
  breed text,
  description text not null default '',
  photo_url text not null default '',
  whatsapp text not null,
  neighborhood text not null,
  lat float8 not null,
  lng float8 not null,
  city text not null,
  reward boolean not null default false,
  reward_amount text,
  status pet_status not null default 'active',
  resolved_via resolved_via,
  created_at timestamptz not null default now(),
  last_renewed_at timestamptz not null default now(),
  reminder_sent_at timestamptz,
  constraint reward_consistency check (
    (reward = false and reward_amount is null)
    or (reward = true)
  )
);

-- RLS
alter table pets enable row level security;

-- Leitura pública: apenas pets ativos
create policy "Public read active pets"
  on pets for select
  using (status = 'active');

-- Dono pode ler os próprios (qualquer status)
create policy "Owner reads own pets"
  on pets for select
  using (auth.uid() = user_id);

-- Dono cria
create policy "Owner inserts"
  on pets for insert
  with check (auth.uid() = user_id);

-- Dono atualiza
create policy "Owner updates"
  on pets for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Dono deleta
create policy "Owner deletes"
  on pets for delete
  using (auth.uid() = user_id);

-- Storage bucket
insert into storage.buckets (id, name, public)
values ('pet-photos', 'pet-photos', true)
on conflict do nothing;

-- Storage policy: leitura pública
create policy "Public read pet photos"
  on storage.objects for select
  using (bucket_id = 'pet-photos');

-- Storage policy: upload apenas autenticado
create policy "Auth upload pet photos"
  on storage.objects for insert
  with check (
    bucket_id = 'pet-photos'
    and auth.role() = 'authenticated'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

-- Storage policy: dono atualiza a própria foto
create policy "Auth update own pet photos"
  on storage.objects for update
  using (bucket_id = 'pet-photos' and auth.uid()::text = (storage.foldername(name))[1]);

-- Storage policy: dono deleta a própria foto
create policy "Auth delete own pet photos"
  on storage.objects for delete
  using (bucket_id = 'pet-photos' and auth.uid()::text = (storage.foldername(name))[1]);

-- Agendar o TTL diário às 3h UTC
-- Requer a extensão pg_cron (habilitada por padrão no Supabase)
-- A URL da função precisa ser configurada manualmente no Supabase Dashboard
-- ou via variável de ambiente SUPABASE_PROJECT_URL
-- select cron.schedule(
--   'radar-pet-ttl-daily',
--   '0 3 * * *',
--   $$ select net.http_post(url := current_setting(''app.supabase_url'') || ''/functions/v1/radar-pet-ttl'', headers := json_build_object(''Authorization'', ''Bearer '' || current_setting(''app.service_role_key''))::jsonb) $$
-- );
-- NOTE: Uncomment and configure after deploying the Edge Function.
-- Alternatively, set the schedule in the Supabase Dashboard under Edge Functions > radar-pet-ttl > Schedule.
