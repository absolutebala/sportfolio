-- ============================================================
-- Sportfolio V1 — Supabase Schema
-- Run this in: Supabase Dashboard → SQL Editor → New Query
-- ============================================================

-- ── PROFILES ─────────────────────────────────────────────────
create table if not exists public.profiles (
  id            uuid primary key references auth.users(id) on delete cascade,
  full_name     text,
  avatar_url    text,
  cover_url     text,
  bio           text,
  sports        text[]   default '{}',
  updated_at    timestamptz default now()
);

-- Auto-create a profile row when a user signs up
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (
    new.id,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- RLS
alter table public.profiles enable row level security;
create policy "Profiles are viewable by everyone"   on public.profiles for select using (true);
create policy "Users can update their own profile"  on public.profiles for update using (auth.uid() = id);
create policy "Users can insert their own profile"  on public.profiles for insert with check (auth.uid() = id);


-- ── ACTIVITIES ───────────────────────────────────────────────
create table if not exists public.activities (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references public.profiles(id) on delete cascade,
  sport           text not null,          -- 'badminton' | 'cricket'
  summary         text,
  details         jsonb   default '{}',   -- sport-specific stats
  notes           text,
  reaction_count  int     default 0,
  comment_count   int     default 0,
  created_at      timestamptz default now()
);

alter table public.activities enable row level security;
create policy "Activities are viewable by everyone"    on public.activities for select using (true);
create policy "Users can insert their own activities"  on public.activities for insert with check (auth.uid() = user_id);
create policy "Users can update their own activities"  on public.activities for update using (auth.uid() = user_id);
create policy "Users can delete their own activities"  on public.activities for delete using (auth.uid() = user_id);


-- ── CLUBS ─────────────────────────────────────────────────────
create table if not exists public.clubs (
  id            uuid primary key default gen_random_uuid(),
  name          text not null,
  description   text,
  logo_url      text,
  cover_url     text,
  sports        text[]  default '{}',
  created_by    uuid references public.profiles(id),
  member_count  int     default 1,
  verified      boolean default false,
  created_at    timestamptz default now()
);

alter table public.clubs enable row level security;
create policy "Clubs are viewable by everyone"   on public.clubs for select using (true);
create policy "Authenticated users can create clubs" on public.clubs for insert with check (auth.uid() is not null);
create policy "Club creator can update their club"   on public.clubs for update using (auth.uid() = created_by);


-- ── REACTIONS ────────────────────────────────────────────────
create table if not exists public.reactions (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references public.profiles(id) on delete cascade,
  activity_id  uuid not null references public.activities(id) on delete cascade,
  emoji        text default '🔥',
  created_at   timestamptz default now(),
  unique (user_id, activity_id)
);

alter table public.reactions enable row level security;
create policy "Reactions viewable by everyone"         on public.reactions for select using (true);
create policy "Users can manage their own reactions"   on public.reactions for all using (auth.uid() = user_id);


-- ── COMMENTS ─────────────────────────────────────────────────
create table if not exists public.comments (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references public.profiles(id) on delete cascade,
  activity_id  uuid not null references public.activities(id) on delete cascade,
  body         text not null,
  created_at   timestamptz default now()
);

alter table public.comments enable row level security;
create policy "Comments viewable by everyone"        on public.comments for select using (true);
create policy "Users can insert their own comments"  on public.comments for insert with check (auth.uid() = user_id);
create policy "Users can delete their own comments"  on public.comments for delete using (auth.uid() = user_id);


-- ── FOLLOWS ──────────────────────────────────────────────────
create table if not exists public.follows (
  follower_id  uuid not null references public.profiles(id) on delete cascade,
  following_id uuid not null references public.profiles(id) on delete cascade,
  created_at   timestamptz default now(),
  primary key (follower_id, following_id)
);

alter table public.follows enable row level security;
create policy "Follows are viewable by everyone"   on public.follows for select using (true);
create policy "Users can manage their own follows" on public.follows for all using (auth.uid() = follower_id);
