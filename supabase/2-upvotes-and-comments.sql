-- SlopCloud: upvotes + comments for the Write It Down board.
-- Run this once in Supabase → SQL Editor, AFTER 1-notes.sql.
-- Safe to run again; it only adds what's missing.

-- ---------- Upvotes ----------
alter table public.notes add column if not exists votes integer not null default 0;

-- Visitors may only fill in name + message when posting (not the vote count).
revoke insert on public.notes from anon;
grant insert (name, message) on public.notes to anon;

-- The only way to change a vote count: +1 or -1 through this function.
create or replace function public.vote_note(note_id uuid, delta integer)
returns integer
language sql
security definer
set search_path = public
as $$
  update public.notes
     set votes = greatest(0, votes + case when delta > 0 then 1 else -1 end)
   where id = note_id
  returning votes;
$$;
revoke execute on function public.vote_note(uuid, integer) from public;
grant execute on function public.vote_note(uuid, integer) to anon;

-- ---------- Comments ----------
create table if not exists public.comments (
  id uuid primary key default gen_random_uuid(),
  note_id uuid not null references public.notes(id) on delete cascade,
  created_at timestamptz not null default now(),
  name text check (name is null or char_length(name) <= 40),
  message text not null check (char_length(message) between 1 and 300)
);
create index if not exists comments_note_id_idx on public.comments (note_id);

alter table public.comments enable row level security;

drop policy if exists "Anyone can read comments" on public.comments;
create policy "Anyone can read comments" on public.comments
  for select to anon using (true);

drop policy if exists "Anyone can add comments" on public.comments;
create policy "Anyone can add comments" on public.comments
  for insert to anon with check (true);

grant select on public.comments to anon;
grant insert (note_id, name, message) on public.comments to anon;

-- Tell the API about the new column/table right away.
notify pgrst, 'reload schema';
