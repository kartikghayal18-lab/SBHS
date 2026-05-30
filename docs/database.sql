create table if not exists public.erp_state (
  id text primary key,
  payload jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.erp_state enable row level security;

drop policy if exists "erp_state_public_read" on public.erp_state;
drop policy if exists "erp_state_public_upsert" on public.erp_state;

create policy "erp_state_public_read"
on public.erp_state
for select
using (true);

create policy "erp_state_public_upsert"
on public.erp_state
for all
using (true)
with check (true);

insert into public.erp_state (id, payload)
values ('sbhs-main', '{}'::jsonb)
on conflict (id) do nothing;
