-- ════════════════════════════════════════════════════════════════════════════
-- SDC INDIA — Supabase Storage buckets  (run after 01_schema.sql)
--
-- Creates:
--   sdc-public   — public-read bucket for event/team/blog cover images.
--   sdc-private  — admin-only bucket for sensitive uploads (e.g. registration
--                  attachments, draft event materials).
--
-- Both buckets are admin-write only. Public can READ sdc-public but never
-- write or list-private. File size is capped at 10 MB per object.
-- ════════════════════════════════════════════════════════════════════════════

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('sdc-public',  'sdc-public',  true,  10485760, array[
    'image/jpeg','image/png','image/webp','image/gif','image/svg+xml','image/avif'
  ]),
  ('sdc-private', 'sdc-private', false, 10485760, null)
on conflict (id) do update set
  public           = excluded.public,
  file_size_limit  = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- ═════════════ RLS policies on storage.objects ═════════════
-- Note: storage.objects is a Supabase-managed table. RLS is already enabled.

-- ── sdc-public: anyone can read, only admins can write ─────────────────────
drop policy if exists "sdc-public read all" on storage.objects;
create policy "sdc-public read all" on storage.objects for select
  using (bucket_id = 'sdc-public');

drop policy if exists "sdc-public admin insert" on storage.objects;
create policy "sdc-public admin insert" on storage.objects for insert
  with check (bucket_id = 'sdc-public' and is_admin());

drop policy if exists "sdc-public admin update" on storage.objects;
create policy "sdc-public admin update" on storage.objects for update
  using (bucket_id = 'sdc-public' and is_admin())
  with check (bucket_id = 'sdc-public' and is_admin());

drop policy if exists "sdc-public admin delete" on storage.objects;
create policy "sdc-public admin delete" on storage.objects for delete
  using (bucket_id = 'sdc-public' and is_admin());

-- ── sdc-private: admin-only for everything ─────────────────────────────────
drop policy if exists "sdc-private admin select" on storage.objects;
create policy "sdc-private admin select" on storage.objects for select
  using (bucket_id = 'sdc-private' and is_admin());

drop policy if exists "sdc-private admin insert" on storage.objects;
create policy "sdc-private admin insert" on storage.objects for insert
  with check (bucket_id = 'sdc-private' and is_admin());

drop policy if exists "sdc-private admin update" on storage.objects;
create policy "sdc-private admin update" on storage.objects for update
  using (bucket_id = 'sdc-private' and is_admin())
  with check (bucket_id = 'sdc-private' and is_admin());

drop policy if exists "sdc-private admin delete" on storage.objects;
create policy "sdc-private admin delete" on storage.objects for delete
  using (bucket_id = 'sdc-private' and is_admin());

-- ════════════════════════════════════════════════════════════════════════════
-- DONE. Next: run 03_seed.sql.
-- ════════════════════════════════════════════════════════════════════════════
