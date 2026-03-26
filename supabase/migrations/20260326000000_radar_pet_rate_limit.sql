-- Limite de 2 pets ativos por usuário
create policy "Max active pets per user"
  on pets for insert
  with check (
    (select count(*) from pets where user_id = auth.uid() and status = 'active') < 2
  );
