-- ════════════════════════════════════════════════════════════════════════════
-- SDC INDIA — Production Schema  v2  (run once in Supabase SQL Editor)
--
-- Design principles
-- ─────────────────
--   1. STANDARD ROW SHAPE — every "entity" table has the same audit/lifecycle
--      columns (id, slug, created_at, updated_at, created_by, updated_by,
--      deleted_at, is_published, display_order). Adding a new entity later
--      means following the same template — see supabase/README.md.
--
--   2. SOFT DELETES — DELETE is rarely run. Set deleted_at instead. RLS and
--      views filter it out. Recovering a "deleted" item = one UPDATE.
--
--   3. CHECK CONSTRAINTS — every enum-like column has an allowed-values check,
--      so the DB rejects bad data even if app code has bugs. Constraints are
--      easy to evolve via ALTER TABLE (vs. real Postgres enums).
--
--   4. INDEXES — every common filter / sort / FK has a matching index.
--
--   5. FULL-TEXT SEARCH — blog_posts + events have a tsvector + GIN index.
--      Use to_tsquery('hackathon | ai') for fast text search.
--
--   6. AUDIT — created_by / updated_by track which auth.user made each change.
--      System-seeded rows have these as NULL.
--
--   7. SELF-DOCUMENTING — every table + every non-obvious column has a
--      COMMENT. Tooling (e.g. supabase gen types) picks these up.
--
--   8. SAFE TO RE-RUN — uses IF NOT EXISTS, CREATE OR REPLACE, and slug-based
--      conflict resolution wherever practical.
--
-- Run order
-- ─────────
--   1. 01_schema.sql      ← THIS FILE (tables + indexes + triggers + RLS)
--   2. 02_storage.sql     (Supabase Storage buckets for images)
--   3. 03_seed.sql        (initial data migrated from src/data/*.ts)
-- ════════════════════════════════════════════════════════════════════════════

-- ═════════════ 0. EXTENSIONS ═════════════
create extension if not exists "pgcrypto"   with schema public;
create extension if not exists "uuid-ossp"  with schema public;
create extension if not exists "unaccent"   with schema public;   -- for slug gen
create extension if not exists "citext"     with schema public;   -- case-insensitive email

-- ═════════════ 1. HELPER FUNCTIONS ═════════════

-- updated_at trigger
create or replace function _set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  -- Stamp updated_by from the auth context if available
  if auth.uid() is not null then
    new.updated_by = auth.uid();
  end if;
  return new;
end $$;

-- Generate a kebab-case slug from any text
create or replace function _slugify(input text)
returns text language sql immutable strict as $$
  select trim(both '-' from regexp_replace(
           lower(unaccent(input)),
           '[^a-z0-9]+', '-', 'g'
         ));
$$;

-- Auto-generate slug from title when slug is null
create or replace function _slug_from_title()
returns trigger language plpgsql as $$
declare
  base text;
  candidate text;
  n int := 0;
  tbl text := tg_table_name;
  exists_count int;
begin
  if new.slug is not null and new.slug <> '' then
    return new;
  end if;
  base := _slugify(coalesce(new.title, new.name, 'item'));
  candidate := base;
  -- Uniqueness loop — same slug? append -2, -3, ...
  loop
    execute format('select count(*) from %I where slug = $1', tbl)
      into exists_count
      using candidate;
    exit when exists_count = 0;
    n := n + 1;
    candidate := base || '-' || (n + 1);
  end loop;
  new.slug := candidate;
  return new;
end $$;

-- ═════════════ 2. ADMIN ALLOWLIST ═════════════
-- (must exist BEFORE is_admin() can reference it)
create table if not exists admin_emails (
  email       citext primary key,
  role        text   not null default 'admin'
                check (role in ('admin','editor','viewer')),
  added_by    uuid   references auth.users(id) on delete set null,
  created_at  timestamptz not null default now(),
  deleted_at  timestamptz
);
comment on table  admin_emails               is 'Allowlist of emails permitted to access /admin. Membership is checked by is_admin() in every RLS policy.';
comment on column admin_emails.role          is 'admin = full CRUD; editor = content only; viewer = read-only admin (future).';
comment on column admin_emails.deleted_at    is 'Soft delete. NULL = active.';

-- Seed the founder admin (your account)
insert into admin_emails (email, role)
values ('goutipavankumar1249@gmail.com', 'admin')
on conflict (email) do nothing;

-- is_admin — security definer so RLS policies can call it without recursion.
-- Defined AFTER admin_emails so the function body validates cleanly.
create or replace function is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from admin_emails
    where lower(email) = lower(coalesce(auth.jwt() ->> 'email', ''))
      and deleted_at is null
  );
$$;

-- ═════════════ 3. ENTITY TABLES ═════════════
--
-- Standard column block — every "content" table includes:
--   id            uuid pk           — auto
--   slug          text unique       — URL-safe identifier
--   created_at    timestamptz       — auto, never changes
--   updated_at    timestamptz       — auto via trigger
--   created_by    uuid              — null for system seeds
--   updated_by    uuid              — null for system seeds
--   deleted_at    timestamptz       — soft delete
--   is_published  boolean           — public visibility toggle
--   display_order int               — manual sort
--
-- Plus entity-specific columns + table-level CHECK constraints.

-- ── 3.1 EVENTS ──────────────────────────────────────────────────────────────
create table if not exists events (
  id                  uuid primary key default gen_random_uuid(),
  slug                text unique,
  title               text not null,
  description         text not null,
  long_description    text,
  event_date          date,            -- NULL = TBA
  event_time          text,
  location            text,
  category            text   check (category in ('Hackathon','Workshop','Conference','Meetup','Bootcamp','Talk','Other')),
  mode                text   not null default 'OFFLINE'
                            check (mode in ('ONLINE','OFFLINE','HYBRID')),
  speakers            text,
  attendees           integer not null default 0 check (attendees >= 0),
  seats               integer check (seats is null or seats >= 0),
  duration            text,
  registration_url    text,
  registration_open   boolean not null default false,
  image_url           text,
  winners             text[] not null default '{}',
  tags                text[] not null default '{}',
  agenda              jsonb,                -- [{time,title,description}]
  what_you_will_learn text[] not null default '{}',
  who_should_attend   text[] not null default '{}',
  search_vector       tsvector,            -- generated below
  is_published        boolean not null default true,
  display_order       integer not null default 100,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now(),
  created_by          uuid references auth.users(id) on delete set null,
  updated_by          uuid references auth.users(id) on delete set null,
  deleted_at          timestamptz
);
comment on table  events                 is 'All SDC events — past + upcoming. is_past is computed at query time as (event_date < current_date).';
comment on column events.event_date      is 'NULL means Date TBA — render "DATE · TBA" instead of countdown.';
comment on column events.winners         is 'Array of winning team names in order (1st, 2nd, 3rd).';
comment on column events.search_vector   is 'Full-text search index. Maintained by trigger.';

-- Full-text search trigger
create or replace function _events_tsv_update()
returns trigger language plpgsql as $$
begin
  new.search_vector :=
    setweight(to_tsvector('english', coalesce(new.title, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(new.description, '')), 'B') ||
    setweight(to_tsvector('english', coalesce(new.long_description, '')), 'C') ||
    setweight(to_tsvector('english', coalesce(new.speakers, '')), 'C');
  return new;
end $$;
drop trigger if exists trg_events_tsv on events;
create trigger trg_events_tsv before insert or update on events
  for each row execute function _events_tsv_update();

drop trigger if exists trg_events_updated_at on events;
create trigger trg_events_updated_at before update on events
  for each row execute function _set_updated_at();

drop trigger if exists trg_events_slug on events;
create trigger trg_events_slug before insert on events
  for each row execute function _slug_from_title();

-- Indexes
create index if not exists idx_events_event_date     on events (event_date)         where deleted_at is null;
create index if not exists idx_events_published      on events (is_published)       where deleted_at is null;
create index if not exists idx_events_category       on events (category)           where deleted_at is null;
create index if not exists idx_events_mode           on events (mode)               where deleted_at is null;
create index if not exists idx_events_created_at     on events (created_at desc)    where deleted_at is null;
create index if not exists idx_events_search         on events using gin (search_vector);
create index if not exists idx_events_tags           on events using gin (tags);

-- ── 3.2 TEAM MEMBERS ────────────────────────────────────────────────────────
create table if not exists team_members (
  id            uuid primary key default gen_random_uuid(),
  slug          text unique,
  initials      text not null check (char_length(initials) between 1 and 4),
  name          text not null,
  role          text not null,
  bio           text,
  skills        text[] not null default '{}',
  impact        text,
  gradient      text,                                  -- inline CSS gradient
  section       text not null default 'Core'
                check (section in ('Founder','Board','Tech','Core','Alumni')),
  photo_url     text,
  github_url    text,
  linkedin_url  text,
  twitter_url   text,
  email         citext,
  is_published  boolean not null default true,
  display_order integer not null default 100,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  created_by    uuid references auth.users(id) on delete set null,
  updated_by    uuid references auth.users(id) on delete set null,
  deleted_at    timestamptz
);
comment on table team_members is 'Team & contributors. Sections: Founder, Board, Tech, Core, Alumni.';

drop trigger if exists trg_team_updated_at on team_members;
create trigger trg_team_updated_at before update on team_members
  for each row execute function _set_updated_at();
drop trigger if exists trg_team_slug on team_members;
create trigger trg_team_slug before insert on team_members
  for each row execute function _slug_from_title();

create index if not exists idx_team_section       on team_members (section, display_order) where deleted_at is null;
create index if not exists idx_team_published     on team_members (is_published)            where deleted_at is null;
create index if not exists idx_team_skills        on team_members using gin (skills);

-- ── 3.3 BLOG POSTS ──────────────────────────────────────────────────────────
create table if not exists blog_posts (
  id              uuid primary key default gen_random_uuid(),
  slug            text unique not null,
  title           text not null,
  category        text not null default 'article'
                  check (category in ('article','event','growth','community','digital','tutorial','announcement')),
  publish_date    date,
  read_time       text,
  cover_image_url text,
  excerpt         text,
  content_blocks  jsonb not null default '[]'::jsonb,
  search_vector   tsvector,
  is_published    boolean not null default false,    -- draft by default
  display_order   integer not null default 100,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  created_by      uuid references auth.users(id) on delete set null,
  updated_by      uuid references auth.users(id) on delete set null,
  deleted_at      timestamptz
);
comment on table  blog_posts                is 'Blog posts. content_blocks is an array of {title?,paragraphs?,bullets?,quote?}.';
comment on column blog_posts.is_published   is 'Defaults FALSE so drafts stay hidden. Toggle in admin.';

create or replace function _blog_tsv_update()
returns trigger language plpgsql as $$
begin
  new.search_vector :=
    setweight(to_tsvector('english', coalesce(new.title, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(new.excerpt, '')), 'B') ||
    setweight(to_tsvector('english', coalesce(new.content_blocks::text, '')), 'C');
  return new;
end $$;
drop trigger if exists trg_blog_tsv on blog_posts;
create trigger trg_blog_tsv before insert or update on blog_posts
  for each row execute function _blog_tsv_update();

drop trigger if exists trg_blog_updated_at on blog_posts;
create trigger trg_blog_updated_at before update on blog_posts
  for each row execute function _set_updated_at();

create index if not exists idx_blog_published    on blog_posts (is_published, publish_date desc) where deleted_at is null;
create index if not exists idx_blog_category     on blog_posts (category)                        where deleted_at is null;
create index if not exists idx_blog_search       on blog_posts using gin (search_vector);

-- ── 3.4 HIGHLIGHTS ──────────────────────────────────────────────────────────
create table if not exists highlights (
  id               uuid primary key default gen_random_uuid(),
  slug             text unique,
  team_name        text not null,
  initials         text not null check (char_length(initials) between 1 and 4),
  position         text not null check (position in ('1st','2nd','3rd','Honorable Mention','Featured')),
  position_icon    text not null default '🏆',
  event_id         uuid references events(id) on delete set null,
  event_name       text not null,
  event_date_label text,
  event_image_url  text,
  description      text,
  gradient         text,
  stats            jsonb,                              -- [{value, label}, ...]
  is_published     boolean not null default true,
  display_order    integer not null default 100,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),
  created_by       uuid references auth.users(id) on delete set null,
  updated_by       uuid references auth.users(id) on delete set null,
  deleted_at       timestamptz
);
comment on table  highlights        is 'Winning teams / standout moments. Optionally linked to events.id.';
comment on column highlights.stats  is 'Array of {value, label} pairs to render as stat cards.';

drop trigger if exists trg_highlights_updated_at on highlights;
create trigger trg_highlights_updated_at before update on highlights
  for each row execute function _set_updated_at();
drop trigger if exists trg_highlights_slug on highlights;
create trigger trg_highlights_slug before insert on highlights
  for each row execute function _slug_from_title();

create index if not exists idx_highlights_event       on highlights (event_id)                  where deleted_at is null;
create index if not exists idx_highlights_display     on highlights (display_order)             where deleted_at is null;

-- ── 3.5 GALLERY IMAGES ──────────────────────────────────────────────────────
create table if not exists gallery_images (
  id            uuid primary key default gen_random_uuid(),
  image_url     text not null,
  alt_text      text,
  caption       text,
  span_classes  text default 'aspect-square',
  event_id      uuid references events(id) on delete set null,
  is_published  boolean not null default true,
  display_order integer not null default 100,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  created_by    uuid references auth.users(id) on delete set null,
  updated_by    uuid references auth.users(id) on delete set null,
  deleted_at    timestamptz
);
comment on table gallery_images is 'Community gallery photos. Optionally tagged to a specific event.';

drop trigger if exists trg_gallery_updated_at on gallery_images;
create trigger trg_gallery_updated_at before update on gallery_images
  for each row execute function _set_updated_at();

create index if not exists idx_gallery_display    on gallery_images (display_order)        where deleted_at is null;
create index if not exists idx_gallery_event      on gallery_images (event_id)             where deleted_at is null;

-- ── 3.6 PARTNERS ────────────────────────────────────────────────────────────
create table if not exists partners (
  id            uuid primary key default gen_random_uuid(),
  slug          text unique,
  name          text not null,
  logo_url      text not null,
  website_url   text,
  description   text,
  tier          text default 'standard' check (tier in ('platinum','gold','silver','standard')),
  is_published  boolean not null default true,
  display_order integer not null default 100,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  created_by    uuid references auth.users(id) on delete set null,
  updated_by    uuid references auth.users(id) on delete set null,
  deleted_at    timestamptz
);
comment on table partners is 'Partner & sponsor organizations. tier allows for prominence in the future.';

drop trigger if exists trg_partners_updated_at on partners;
create trigger trg_partners_updated_at before update on partners
  for each row execute function _set_updated_at();
drop trigger if exists trg_partners_slug on partners;
create trigger trg_partners_slug before insert on partners
  for each row execute function _slug_from_title();

create index if not exists idx_partners_display   on partners (display_order)              where deleted_at is null;
create index if not exists idx_partners_tier      on partners (tier)                        where deleted_at is null;

-- ─────────────────────────────────────────────────────────────────────────────
-- 4. MEDIA ASSETS  — uploaded-file registry
-- ─────────────────────────────────────────────────────────────────────────────
create table if not exists media_assets (
  id            uuid primary key default gen_random_uuid(),
  storage_path  text not null,                          -- e.g. "events/vibe-code/poster.jpg"
  bucket        text not null default 'sdc-public',     -- supabase storage bucket name
  public_url    text,                                   -- derived for convenience
  mime_type     text,
  size_bytes    bigint check (size_bytes is null or size_bytes >= 0),
  width_px      integer,
  height_px     integer,
  alt_text      text,
  caption       text,
  entity_type   text,                                   -- 'event' | 'team_member' | 'blog_post' | ...
  entity_id     uuid,                                   -- FK by convention (cross-table)
  is_published  boolean not null default true,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  created_by    uuid references auth.users(id) on delete set null,
  updated_by    uuid references auth.users(id) on delete set null,
  deleted_at    timestamptz
);
comment on table  media_assets             is 'Central registry of uploaded files. Polymorphic via (entity_type, entity_id).';
comment on column media_assets.entity_type is 'Soft pointer to which table owns this asset (events, team_members, blog_posts, etc.).';

drop trigger if exists trg_media_updated_at on media_assets;
create trigger trg_media_updated_at before update on media_assets
  for each row execute function _set_updated_at();

create index if not exists idx_media_entity       on media_assets (entity_type, entity_id) where deleted_at is null;
create index if not exists idx_media_created_at   on media_assets (created_at desc)        where deleted_at is null;

-- ═════════════ 5. USER SUBMISSIONS ═════════════

-- ── 5.1 EVENT REGISTRATIONS ─────────────────────────────────────────────────
create table if not exists registrations (
  id            uuid primary key default gen_random_uuid(),
  event_id      uuid not null references events(id) on delete cascade,
  name          text not null,
  email         citext not null,
  phone         text,
  college       text,
  year_of_study text,
  branch        text,
  notes         text,
  extra_data    jsonb,                                 -- custom per-event Q&A
  status        text not null default 'pending'
                check (status in ('pending','confirmed','waitlist','cancelled','attended','no_show')),
  status_notes  text,
  user_agent    text,
  ip_address    inet,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  updated_by    uuid references auth.users(id) on delete set null,
  unique (event_id, email)                              -- one registration per email per event
);
comment on table  registrations              is 'Public-facing event signups. Anyone can INSERT; only admins can read/modify.';
comment on constraint registrations_event_id_email_key on registrations is 'Prevents the same email from registering twice for the same event.';

drop trigger if exists trg_registrations_updated_at on registrations;
create trigger trg_registrations_updated_at before update on registrations
  for each row execute function _set_updated_at();

create index if not exists idx_registrations_event_status on registrations (event_id, status);
create index if not exists idx_registrations_email        on registrations (email);
create index if not exists idx_registrations_created      on registrations (created_at desc);

-- ── 5.2 CONTACT MESSAGES ────────────────────────────────────────────────────
create table if not exists contact_messages (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  email       citext not null,
  subject     text,
  message     text not null,
  status      text not null default 'new'
              check (status in ('new','read','replied','spam','archived')),
  user_agent  text,
  ip_address  inet,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  updated_by  uuid references auth.users(id) on delete set null
);
comment on table contact_messages is 'Public Contact form submissions. Anyone can INSERT; only admins can read/modify.';

drop trigger if exists trg_contact_updated_at on contact_messages;
create trigger trg_contact_updated_at before update on contact_messages
  for each row execute function _set_updated_at();

create index if not exists idx_contact_status   on contact_messages (status, created_at desc);
create index if not exists idx_contact_email    on contact_messages (email);

-- ── 5.3 HOST REQUESTS ───────────────────────────────────────────────────────
create table if not exists host_requests (
  id             uuid primary key default gen_random_uuid(),
  name           text not null,
  designation    text,
  college        text not null,
  email          citext not null,
  phone          text,
  event_type     text,
  preferred_date date,
  expected_size  text,
  city           text,
  details        text,
  status         text not null default 'new'
                 check (status in ('new','contacted','scheduled','declined','completed')),
  status_notes   text,
  user_agent     text,
  ip_address     inet,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),
  updated_by     uuid references auth.users(id) on delete set null
);
comment on table host_requests is 'Public Host form submissions. Anyone can INSERT; only admins can read/modify.';

drop trigger if exists trg_host_updated_at on host_requests;
create trigger trg_host_updated_at before update on host_requests
  for each row execute function _set_updated_at();

create index if not exists idx_host_status      on host_requests (status, created_at desc);
create index if not exists idx_host_email       on host_requests (email);
create index if not exists idx_host_city        on host_requests (city);

-- ═════════════ 6. CONVENIENCE VIEWS ═════════════
-- Public-facing views that filter out deleted + unpublished — use these from
-- the app instead of querying base tables directly when you don't need admin
-- features (write/audit/etc).

create or replace view v_events_public as
  select *, (event_date is not null and event_date < current_date) as is_past
  from events
  where deleted_at is null and is_published = true;

create or replace view v_upcoming_events as
  select * from v_events_public
  where event_date is null or event_date >= current_date
  order by event_date asc nulls first, display_order, created_at desc;

create or replace view v_past_events as
  select * from v_events_public
  where event_date is not null and event_date < current_date
  order by event_date desc;

create or replace view v_team_public as
  select * from team_members where deleted_at is null and is_published = true
  order by section, display_order, name;

create or replace view v_blog_public as
  select * from blog_posts where deleted_at is null and is_published = true
  order by publish_date desc nulls last, created_at desc;

create or replace view v_highlights_public as
  select * from highlights where deleted_at is null and is_published = true
  order by display_order, created_at desc;

create or replace view v_partners_public as
  select * from partners where deleted_at is null and is_published = true
  order by display_order, name;

create or replace view v_gallery_public as
  select * from gallery_images where deleted_at is null and is_published = true
  order by display_order, created_at desc;

-- ═════════════ 7. ROW LEVEL SECURITY ═════════════

alter table admin_emails       enable row level security;
alter table events             enable row level security;
alter table team_members       enable row level security;
alter table blog_posts         enable row level security;
alter table highlights         enable row level security;
alter table gallery_images     enable row level security;
alter table partners           enable row level security;
alter table media_assets       enable row level security;
alter table registrations      enable row level security;
alter table contact_messages   enable row level security;
alter table host_requests      enable row level security;

-- Generic policy template applied to all content tables (entity tables):
--   • SELECT — public can read published rows that aren't soft-deleted
--   • ALL    — admins can do anything
-- Deletes from app code should usually be soft (UPDATE deleted_at) so even
-- accidental admin-mistakes are recoverable.

do $$
declare
  t text;
  content_tables text[] := array['events','team_members','blog_posts','highlights','gallery_images','partners','media_assets'];
begin
  foreach t in array content_tables loop
    execute format('drop policy if exists "%I public_read" on %I', t, t);
    execute format(
      'create policy "%I public_read" on %I for select using (is_published = true and deleted_at is null)',
      t, t
    );

    execute format('drop policy if exists "%I admin_all" on %I', t, t);
    execute format(
      'create policy "%I admin_all" on %I for all using (is_admin()) with check (is_admin())',
      t, t
    );
  end loop;
end $$;

-- admin_emails: only admins can do anything
drop policy if exists "admin_emails admin_all" on admin_emails;
create policy "admin_emails admin_all" on admin_emails for all
  using (is_admin()) with check (is_admin());

-- Public submission tables: anyone can INSERT, only admin can read/modify/delete
do $$
declare
  t text;
  submission_tables text[] := array['registrations','contact_messages','host_requests'];
begin
  foreach t in array submission_tables loop
    execute format('drop policy if exists "%I public_insert" on %I', t, t);
    execute format(
      'create policy "%I public_insert" on %I for insert with check (true)',
      t, t
    );

    execute format('drop policy if exists "%I admin_select" on %I', t, t);
    execute format(
      'create policy "%I admin_select" on %I for select using (is_admin())',
      t, t
    );

    execute format('drop policy if exists "%I admin_modify" on %I', t, t);
    execute format(
      'create policy "%I admin_modify" on %I for update using (is_admin()) with check (is_admin())',
      t, t
    );

    execute format('drop policy if exists "%I admin_delete" on %I', t, t);
    execute format(
      'create policy "%I admin_delete" on %I for delete using (is_admin())',
      t, t
    );
  end loop;
end $$;

-- ════════════════════════════════════════════════════════════════════════════
-- DONE.  Now run:
--   02_storage.sql  — Supabase Storage buckets for image uploads
--   03_seed.sql     — Migrate existing data from src/data/*.ts
-- ════════════════════════════════════════════════════════════════════════════
