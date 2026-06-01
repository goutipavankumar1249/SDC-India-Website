# SDC INDIA — Supabase database guide

This folder holds the SQL definitions for the SDC INDIA Postgres database.
It is the **single source of truth** for the schema.

```
supabase/
├── 01_schema.sql      Tables, indexes, triggers, views, RLS policies
├── 02_storage.sql     Storage buckets + bucket policies
├── 03_seed.sql        Initial content migrated from src/data/*.ts
└── README.md          ← this file
```

To bring up a brand-new Supabase project from zero, run the SQL files in
order in the Supabase **SQL Editor**.

---

## Design principles (read once)

Every table in this schema follows the same pattern. **When you add a new
table, follow the same pattern** — it's what keeps things consistent.

### 1. Standard row shape for "entity" tables

| Column | Type | Why |
|---|---|---|
| `id` | `uuid primary key default gen_random_uuid()` | Unguessable, globally unique |
| `slug` | `text unique` | Human-readable URL identifier (auto-generated from title via trigger) |
| `created_at` | `timestamptz not null default now()` | Audit |
| `updated_at` | `timestamptz not null default now()` | Audit (updated by trigger) |
| `created_by` | `uuid references auth.users(id) on delete set null` | Who created (null = system seed) |
| `updated_by` | `uuid references auth.users(id) on delete set null` | Who last edited |
| `deleted_at` | `timestamptz` | **Soft delete** — never run real DELETE on entity rows |
| `is_published` | `boolean not null default true` | Public visibility toggle |
| `display_order` | `integer not null default 100` | Manual sort key (lower = first) |

### 2. CHECK constraints on every "enum"

Use `CHECK (col in ('a','b','c'))` instead of Postgres enums. Easier to
evolve later via `ALTER TABLE ... DROP/ADD CONSTRAINT`. Examples:
`events.mode`, `team_members.section`, `registrations.status`, etc.

### 3. Index every common filter / sort

Rules of thumb:
- Every foreign key gets an index.
- Every column you filter on (e.g. `is_published`, `category`, `status`) gets one.
- Every column you sort by (`created_at desc`, `display_order`) gets one.
- Use **partial indexes** to skip soft-deleted rows:
  `where deleted_at is null`.
- For full-text search: add a `search_vector tsvector` column +
  `GIN` index + a trigger to keep it updated.

### 4. Soft deletes, always

Set `deleted_at = now()` instead of running `DELETE`. RLS and views filter
it out. Recovering a row is a single UPDATE.

The only tables that allow real DELETE are submission tables (`registrations`,
`contact_messages`, `host_requests`) and only via admin RLS.

### 5. Comments on tables + non-obvious columns

```sql
comment on table foo is 'High-level description.';
comment on column foo.bar is 'What this column means; gotchas.';
```

These show up in the Supabase Table Editor, the Studio diagrams, and
`supabase gen types` output. Free documentation.

### 6. RLS — public reads, admin writes

The standard RLS policy for any entity table:

```sql
alter table <new_table> enable row level security;

create policy "<new_table> public_read" on <new_table>
  for select using (is_published = true and deleted_at is null);

create policy "<new_table> admin_all" on <new_table>
  for all using (is_admin()) with check (is_admin());
```

For submission tables (`registrations`-style):

```sql
create policy "<table> public_insert" on <table>
  for insert with check (true);

create policy "<table> admin_select" on <table>
  for select using (is_admin());

create policy "<table> admin_modify" on <table>
  for update using (is_admin()) with check (is_admin());

create policy "<table> admin_delete" on <table>
  for delete using (is_admin());
```

### 7. Use views for public-facing reads

Avoid leaking soft-deleted or unpublished rows. Query the `v_*_public` views
from the app instead of the base tables when you don't need admin features.
Examples already in place: `v_events_public`, `v_upcoming_events`,
`v_past_events`, `v_team_public`, `v_blog_public`, `v_highlights_public`,
`v_partners_public`, `v_gallery_public`.

---

## How to add a new entity table (the template)

Say tomorrow we add a `sponsors` table. Here's the recipe — copy & adapt.

### Step 1. Create a new SQL migration file

```
supabase/04_add_sponsors.sql
```

Number it sequentially after the last file. Never rename existing files.

### Step 2. Define the table + standard columns

```sql
create table if not exists sponsors (
  -- ── standard columns ────────────────────
  id            uuid primary key default gen_random_uuid(),
  slug          text unique,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  created_by    uuid references auth.users(id) on delete set null,
  updated_by    uuid references auth.users(id) on delete set null,
  deleted_at    timestamptz,
  is_published  boolean not null default true,
  display_order integer not null default 100,

  -- ── entity columns ──────────────────────
  name          text not null,
  logo_url      text,
  tier          text not null default 'silver'
                check (tier in ('platinum','gold','silver','community')),
  amount        numeric(10,2) check (amount is null or amount >= 0),
  event_id      uuid references events(id) on delete set null,

  -- ── any unique constraints / extra ──────
  unique (event_id, name)
);

comment on table sponsors is 'Per-event sponsors. Linked to events.id.';
```

### Step 3. Triggers (updated_at + auto-slug)

```sql
drop trigger if exists trg_sponsors_updated_at on sponsors;
create trigger trg_sponsors_updated_at before update on sponsors
  for each row execute function _set_updated_at();

drop trigger if exists trg_sponsors_slug on sponsors;
create trigger trg_sponsors_slug before insert on sponsors
  for each row execute function _slug_from_title();
```

### Step 4. Indexes

```sql
create index if not exists idx_sponsors_event       on sponsors (event_id)       where deleted_at is null;
create index if not exists idx_sponsors_tier        on sponsors (tier)           where deleted_at is null;
create index if not exists idx_sponsors_display     on sponsors (display_order)  where deleted_at is null;
```

### Step 5. RLS

```sql
alter table sponsors enable row level security;

create policy "sponsors public_read" on sponsors for select
  using (is_published = true and deleted_at is null);

create policy "sponsors admin_all" on sponsors for all
  using (is_admin()) with check (is_admin());
```

### Step 6. Public view

```sql
create or replace view v_sponsors_public as
  select * from sponsors
  where deleted_at is null and is_published = true
  order by tier, display_order, name;
```

### Step 7. (App side) Regenerate TypeScript types

```bash
npx supabase gen types typescript --project-id xqfyncycgybhgzrlpitc > src/lib/supabase/types.ts
```

(Needs the Supabase CLI installed. Until we set that up, add the type by hand
in `src/types/sponsors.ts`.)

### Step 8. (App side) Create a data helper

```ts
// src/lib/data/sponsors.ts
import { getSupabaseServerClient } from "@/lib/supabase/server";

export async function listSponsors() {
  const supabase = await getSupabaseServerClient();
  const { data, error } = await supabase
    .from("v_sponsors_public")
    .select("*");
  if (error) throw error;
  return data ?? [];
}
```

### Step 9. (App side) Build the admin CRUD page

Follow the same pattern as `src/app/admin/events/page.tsx` (once it exists).

---

## Production checklist (re-run when you make any schema change)

- [ ] Run the new migration in Supabase SQL Editor — no errors.
- [ ] `select count(*)` from the new table → 0 rows OK.
- [ ] Insert a test row → RLS allows admin write.
- [ ] Try inserting as anonymous → RLS rejects.
- [ ] Query the public view → only published + non-deleted rows show.
- [ ] Set `deleted_at = now()` on a row → it disappears from the view.
- [ ] Re-generate TypeScript types & commit.
- [ ] Update `supabase/README.md` with any new convention.

---

## Common patterns cheat sheet

### Soft delete a row

```sql
update events set deleted_at = now(), updated_by = auth.uid()
where id = '...';
```

### Restore a "deleted" row

```sql
update events set deleted_at = null where id = '...';
```

### Hard delete (rare, irreversible)

```sql
-- Only for old soft-deleted rows you're sure you don't need
delete from events where deleted_at < now() - interval '90 days';
```

### Add a new admin

```sql
insert into admin_emails (email, role) values ('newperson@example.com', 'admin')
on conflict (email) do nothing;
```

### Promote a contributor to founder section

```sql
update team_members set section = 'Founder' where slug = '...';
```

### Search the blog

```sql
select id, title, ts_rank(search_vector, query) as rank
from blog_posts, websearch_to_tsquery('english', 'ai workshop microsoft') as query
where search_vector @@ query and is_published = true and deleted_at is null
order by rank desc
limit 20;
```

### Get all registrations for an event

```sql
select * from registrations
where event_id = (select id from events where slug = 'hack-for-hyderabad-1')
order by created_at desc;
```

---

## Backup & restore (Supabase free tier)

Supabase Free includes **7 days of automatic daily backups**.
To download a backup or restore:

- Dashboard → **Database** → **Backups** → click date → **Restore**.
- For exporting: **Database** → **Backups** → **Download SQL**.

Manual backup via CLI (if installed):

```bash
supabase db dump --linked > backups/$(date +%F).sql
```

Schedule this weekly via a cron / GitHub Action for extra safety.

---

## Don't do this

- ❌ Don't run `DROP TABLE` in production. Use `ALTER TABLE ... RENAME TO _archive_<table>` first.
- ❌ Don't add columns without a `default` if there's existing data — the
      backfill will block the table.
- ❌ Don't disable RLS on a table that already had it enabled in prod.
- ❌ Don't paste the `service_role` key into chat / commit it.
- ❌ Don't query base tables (e.g. `events`) for public reads — use the views.
