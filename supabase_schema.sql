-- ═══════════════════════════════════════════════════════════════════════════
-- iSportOne — Supabase Schema v1
-- Run this in the Supabase SQL Editor (Database > SQL Editor > New query)
-- ═══════════════════════════════════════════════════════════════════════════

-- ─── Enable UUID extension ───────────────────────────────────────────────────
create extension if not exists "uuid-ossp";

-- ─── Enums ───────────────────────────────────────────────────────────────────

create type sport_type as enum ('racquet', 'team', 'solo', 'generic');
create type match_format as enum ('singles', 'doubles');
create type match_result as enum ('win', 'loss', 'draw');
create type confirm_status as enum ('pending', 'confirmed', 'disputed');
create type post_type as enum ('match', 'moment', 'update', 'milestone');
create type notification_type as enum (
  'match_confirm_request',
  'match_confirmed',
  'match_disputed',
  'follow',
  'reaction',
  'comment',
  'club_invite',
  'club_post',
  'tournament_reminder'
);

-- ─── profiles ────────────────────────────────────────────────────────────────
-- One row per user. Extends auth.users (Supabase Auth).

create table profiles (
  id            uuid primary key references auth.users(id) on delete cascade,
  handle        text unique not null,          -- @handle, lowercase, no spaces
  name          text not null,
  bio           text,
  avatar_url    text,
  cover_url     text,
  city          text,
  country       text default 'India',
  dob           date,
  role          text,                          -- 'athlete' | 'coach' | 'fan' | 'club_admin'
  level         text,                          -- 'beginner' | 'intermediate' | 'advanced' | 'pro'
  looking_for_partners boolean default true,
  profile_complete boolean default false,
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);

-- ─── sports ──────────────────────────────────────────────────────────────────
-- Reference table of supported sports.

create table sports (
  id            serial primary key,
  name          text unique not null,          -- 'Badminton', 'Cricket', etc.
  slug          text unique not null,          -- 'badminton', 'cricket'
  sport_type    sport_type not null,
  icon          text,                          -- emoji or icon name
  color_accent  text                           -- hex, e.g. '#fb923c'
);

-- Insert core sports
insert into sports (name, slug, sport_type, icon, color_accent) values
  ('Badminton',    'badminton',   'racquet', '🏸', '#fb923c'),
  ('Tennis',       'tennis',      'racquet', '🎾', '#f59e0b'),
  ('Squash',       'squash',      'racquet', '🎾', '#a78bfa'),
  ('Table Tennis', 'tabletennis', 'racquet', '🏓', '#38bdf8'),
  ('Pickleball',   'pickleball',  'racquet', '🏓', '#84cc16'),
  ('Football',     'football',    'team',    '⚽', '#22c55e'),
  ('Cricket',      'cricket',     'team',    '🏏', '#a3e635'),
  ('Basketball',   'basketball',  'team',    '🏀', '#fb923c'),
  ('Hockey',       'hockey',      'team',    '🏒', '#38bdf8'),
  ('Volleyball',   'volleyball',  'team',    '🏐', '#f59e0b'),
  ('Kabaddi',      'kabaddi',     'team',    '🤼', '#f97316'),
  ('Swimming',     'swimming',    'solo',    '🏊', '#38bdf8'),
  ('Athletics',    'athletics',   'solo',    '🏃', '#f97316'),
  ('Cycling',      'cycling',     'solo',    '🚴', '#84cc16'),
  ('Running',      'running',     'solo',    '👟', '#f97316'),
  ('Gym',          'gym',         'solo',    '💪', '#a78bfa'),
  ('Yoga',         'yoga',        'solo',    '🧘', '#34d399'),
  ('Golf',         'golf',        'solo',    '⛳', '#22c55e');

-- ─── profile_sports ───────────────────────────────────────────────────────────
-- Sports a user has selected (ordered: primary sport first).

create table profile_sports (
  id            uuid primary key default uuid_generate_v4(),
  profile_id    uuid not null references profiles(id) on delete cascade,
  sport_id      integer not null references sports(id),
  sort_order    integer default 0,             -- 0 = primary
  unique (profile_id, sport_id)
);

-- ─── clubs ───────────────────────────────────────────────────────────────────

create table clubs (
  id            uuid primary key default uuid_generate_v4(),
  name          text not null,
  slug          text unique not null,
  sport_id      integer references sports(id),
  city          text,
  country       text default 'India',
  description   text,
  logo_url      text,
  cover_url     text,
  admin_id      uuid references profiles(id),
  member_count  integer default 0,            -- denormalized, updated by trigger
  created_at    timestamptz default now()
);

-- ─── club_members ────────────────────────────────────────────────────────────

create table club_members (
  id            uuid primary key default uuid_generate_v4(),
  club_id       uuid not null references clubs(id) on delete cascade,
  profile_id    uuid not null references profiles(id) on delete cascade,
  role          text default 'member',        -- 'admin' | 'coach' | 'member'
  joined_at     timestamptz default now(),
  unique (club_id, profile_id)
);

-- ─── follows ─────────────────────────────────────────────────────────────────

create table follows (
  id            uuid primary key default uuid_generate_v4(),
  follower_id   uuid not null references profiles(id) on delete cascade,
  following_id  uuid not null references profiles(id) on delete cascade,
  created_at    timestamptz default now(),
  unique (follower_id, following_id),
  check (follower_id <> following_id)
);

-- ─── posts ───────────────────────────────────────────────────────────────────
-- Every entry in the feed — matches, moments, updates, milestones.

create table posts (
  id              uuid primary key default uuid_generate_v4(),
  author_id       uuid not null references profiles(id) on delete cascade,
  post_type       post_type not null default 'moment',
  caption         text,
  image_url       text,
  sport_id        integer references sports(id),
  club_id         uuid references clubs(id),   -- optional: posted in a club
  is_public       boolean default true,
  reaction_count  jsonb default '{"fire":0,"trophy":0,"clap":0}',
  comment_count   integer default 0,
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);

-- ─── match_logs ──────────────────────────────────────────────────────────────
-- Attached to a post when post_type = 'match'. Contains the structured result.

create table match_logs (
  id              uuid primary key default uuid_generate_v4(),
  post_id         uuid not null references posts(id) on delete cascade,
  sport_id        integer not null references sports(id),
  sport_type      sport_type not null,
  match_format    match_format,               -- racquet only
  result          match_result,
  -- Racquet scores
  games_played    integer,
  games_won       integer,
  -- Team scores
  my_score        integer,
  their_score     integer,
  -- Solo performance
  solo_time       text,                       -- stored as '1h 23m 45s'
  solo_distance_km numeric(8,2),
  is_personal_best boolean default false,
  -- Generic
  result_note     text,
  created_at      timestamptz default now()
);

-- ─── match_participants ───────────────────────────────────────────────────────
-- Players tagged in a match (opponents and partners/teammates).

create table match_participants (
  id              uuid primary key default uuid_generate_v4(),
  match_log_id    uuid not null references match_logs(id) on delete cascade,
  profile_id      uuid not null references profiles(id) on delete cascade,
  role            text not null,              -- 'opponent' | 'partner' | 'teammate'
  confirm_status  confirm_status default 'pending',
  confirmed_at    timestamptz,
  unique (match_log_id, profile_id)
);

-- ─── reactions ───────────────────────────────────────────────────────────────

create table reactions (
  id          uuid primary key default uuid_generate_v4(),
  post_id     uuid not null references posts(id) on delete cascade,
  profile_id  uuid not null references profiles(id) on delete cascade,
  emoji       text not null,                  -- 'fire' | 'trophy' | 'clap'
  created_at  timestamptz default now(),
  unique (post_id, profile_id, emoji)
);

-- ─── comments ────────────────────────────────────────────────────────────────

create table comments (
  id          uuid primary key default uuid_generate_v4(),
  post_id     uuid not null references posts(id) on delete cascade,
  author_id   uuid not null references profiles(id) on delete cascade,
  parent_id   uuid references comments(id),   -- for replies
  body        text not null,
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

-- ─── notifications ───────────────────────────────────────────────────────────

create table notifications (
  id              uuid primary key default uuid_generate_v4(),
  recipient_id    uuid not null references profiles(id) on delete cascade,
  sender_id       uuid references profiles(id),
  type            notification_type not null,
  entity_id       uuid,                       -- post_id, match_log_id, club_id…
  entity_type     text,                       -- 'post' | 'match_log' | 'club'
  message         text,
  is_read         boolean default false,
  created_at      timestamptz default now()
);

create index on notifications (recipient_id, is_read, created_at desc);

-- ─── Row Level Security ───────────────────────────────────────────────────────

alter table profiles           enable row level security;
alter table profile_sports     enable row level security;
alter table clubs              enable row level security;
alter table club_members       enable row level security;
alter table follows            enable row level security;
alter table posts              enable row level security;
alter table match_logs         enable row level security;
alter table match_participants enable row level security;
alter table reactions          enable row level security;
alter table comments           enable row level security;
alter table notifications      enable row level security;

-- profiles: anyone can read public profiles; only owner can write
create policy "Public profiles are viewable by all"
  on profiles for select using (true);
create policy "Users can update own profile"
  on profiles for update using (auth.uid() = id);
create policy "Users can insert own profile"
  on profiles for insert with check (auth.uid() = id);

-- posts: public posts visible to all; only author can insert/update/delete
create policy "Public posts are viewable"
  on posts for select using (is_public = true);
create policy "Authors can insert posts"
  on posts for insert with check (auth.uid() = author_id);
create policy "Authors can update posts"
  on posts for update using (auth.uid() = author_id);
create policy "Authors can delete posts"
  on posts for delete using (auth.uid() = author_id);

-- match_logs: readable if linked post is public; writable by post author
create policy "Match logs readable if post is public"
  on match_logs for select using (
    exists (select 1 from posts where posts.id = match_logs.post_id and posts.is_public = true)
  );
create policy "Post author can insert match logs"
  on match_logs for insert with check (
    exists (select 1 from posts where posts.id = match_logs.post_id and posts.author_id = auth.uid())
  );

-- match_participants: participants can update their own confirm_status
create policy "Participants can update own confirm status"
  on match_participants for update
  using (auth.uid() = profile_id);
create policy "Match participants are viewable"
  on match_participants for select using (true);

-- notifications: users see only their own
create policy "Users see own notifications"
  on notifications for select using (auth.uid() = recipient_id);
create policy "Users can mark own notifications read"
  on notifications for update using (auth.uid() = recipient_id);

-- reactions: visible to all; insert/delete by owner
create policy "Reactions are viewable"
  on reactions for select using (true);
create policy "Users can react"
  on reactions for insert with check (auth.uid() = profile_id);
create policy "Users can remove own reaction"
  on reactions for delete using (auth.uid() = profile_id);

-- comments: public; owner can insert/delete
create policy "Comments are viewable"
  on comments for select using (true);
create policy "Users can comment"
  on comments for insert with check (auth.uid() = author_id);
create policy "Users can delete own comments"
  on comments for delete using (auth.uid() = author_id);

-- follows: visible to all; owner can insert/delete
create policy "Follows are viewable"
  on follows for select using (true);
create policy "Users can follow"
  on follows for insert with check (auth.uid() = follower_id);
create policy "Users can unfollow"
  on follows for delete using (auth.uid() = follower_id);

-- ─── Useful views ─────────────────────────────────────────────────────────────

-- Feed: posts with author info, match summary, and participant count
create or replace view feed_view as
select
  p.id,
  p.post_type,
  p.caption,
  p.image_url,
  p.reaction_count,
  p.comment_count,
  p.created_at,
  pr.id          as author_id,
  pr.handle      as author_handle,
  pr.name        as author_name,
  pr.avatar_url  as author_avatar,
  pr.city        as author_city,
  s.name         as sport_name,
  s.slug         as sport_slug,
  s.color_accent as sport_color,
  ml.result,
  ml.games_played,
  ml.games_won,
  ml.my_score,
  ml.their_score,
  ml.is_personal_best,
  (select count(*) from match_participants mp where mp.match_log_id = ml.id and mp.confirm_status = 'confirmed') as confirmed_participants
from posts p
join profiles pr on pr.id = p.author_id
left join sports s on s.id = p.sport_id
left join match_logs ml on ml.post_id = p.id
where p.is_public = true
order by p.created_at desc;

-- ─── Triggers ─────────────────────────────────────────────────────────────────

-- Auto-update updated_at on profiles and posts
create or replace function set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_updated_at before update on profiles
  for each row execute procedure set_updated_at();

create trigger posts_updated_at before update on posts
  for each row execute procedure set_updated_at();

-- Auto-create profile on auth signup
create or replace function handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into profiles (id, handle, name)
  values (
    new.id,
    lower(regexp_replace(coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)), '[^a-z0-9]', '', 'g')),
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1))
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();

-- Notify tagged players when a match is logged (creates notification rows)
create or replace function notify_match_participants()
returns trigger language plpgsql security definer as $$
declare
  post_author_id uuid;
  author_name text;
begin
  select p.author_id, pr.name into post_author_id, author_name
  from posts p
  join profiles pr on pr.id = p.author_id
  where p.id = new.post_id;

  insert into notifications (recipient_id, sender_id, type, entity_id, entity_type, message)
  select
    mp.profile_id,
    post_author_id,
    'match_confirm_request',
    new.id,
    'match_log',
    author_name || ' tagged you in a match — tap to confirm the result.'
  from match_participants mp
  where mp.match_log_id = new.id
    and mp.profile_id <> post_author_id;

  return new;
end;
$$;

create trigger on_match_log_created
  after insert on match_logs
  for each row execute procedure notify_match_participants();
