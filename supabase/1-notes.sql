-- SlopCloud: the Write It Down board's posts table.
-- (Already run on the live project. Kept here for a fresh setup.)

create table public.notes (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name text check (name is null or char_length(name) <= 40),
  message text not null check (char_length(message) between 1 and 500),
  color smallint not null default 0 check (color between 0 and 5)
);

alter table public.notes enable row level security;

create policy "Anyone can read notes" on public.notes
  for select to anon using (true);

create policy "Anyone can add notes" on public.notes
  for insert to anon with check (true);

grant select, insert on public.notes to anon;
