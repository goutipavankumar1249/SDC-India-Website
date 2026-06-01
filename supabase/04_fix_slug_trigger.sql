-- ────────────────────────────────────────────────────────────────────────────
-- Migration 04 — fix _slug_from_title()
--
-- Bug: shared trigger referenced NEW.title directly, which crashes Postgres
-- with `record "new" has no field "title"` on any table that uses `name` or
-- `team_name` instead (team_members, partners, highlights).
--
-- Fix: cast NEW to jsonb first, then use `->> 'field'` which safely returns
-- NULL when the key is missing. coalesce now actually works across tables.
-- ────────────────────────────────────────────────────────────────────────────

create or replace function _slug_from_title()
returns trigger language plpgsql as $$
declare
  base         text;
  candidate    text;
  n            int := 0;
  tbl          text := tg_table_name;
  exists_count int;
  row_json     jsonb := to_jsonb(new);
begin
  -- Skip if caller already set a slug
  if (row_json ->> 'slug') is not null and (row_json ->> 'slug') <> '' then
    return new;
  end if;

  -- Safe fallback: ->> returns NULL for missing keys instead of erroring
  base := _slugify(coalesce(
    row_json ->> 'title',
    row_json ->> 'name',
    row_json ->> 'team_name',
    'item'
  ));

  candidate := base;
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
