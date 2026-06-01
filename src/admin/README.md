# `src/admin/` — Admin module

This folder contains **all admin-only logic** for the SDC INDIA site.
It is intentionally separated from the public website code in `src/components/`
and `src/lib/` so that:

1. Admin code can never accidentally be imported into public pages
   (it lives in its own namespace `@/admin/...`).
2. Future contributors can find / understand the admin in one place.
3. We could extract this into a separate Next.js app later with minimal
   refactoring if the org wants a dedicated `admin.sdcindia.tech` subdomain.

## Boundary rules

```
src/admin/                  ← admin-only code (this folder)
├── lib/
│   ├── auth.ts             ← requireAdmin() guard
│   ├── actions/            ← Server Actions (Zod-validated DB writes)
│   └── schemas/            ← Zod validation schemas
├── components/             ← admin-only UI (Sidebar, DataTable, etc.)
└── README.md

src/components/             ← public website components ONLY — never import from src/admin
src/lib/                    ← SHARED utilities (Supabase client lives here)
src/data/                   ← public website static data
src/app/admin/              ← Next.js routes for admin pages (forced location)
                              These import from @/admin/* but live under app/ because
                              Next.js requires routes to be under app/.
src/app/(public pages)/     ← public routes — must NEVER import from @/admin
```

## Architecture decisions

### Why pages live in `src/app/admin/`, not `src/admin/`
Next.js's App Router requires page files to be under `src/app/`. We can't move
them out. But everything they *import* — components, actions, schemas, helpers —
lives under `src/admin/`. The page files themselves are thin wrappers that
import logic from `@/admin/*`.

### Read path (admin viewing data)
```
src/app/admin/<page>.tsx
  ↓ imports
src/admin/lib/data/<entity>.ts          (admin read helpers — bypass v_*_public)
  ↓ uses
src/lib/supabase/server.ts              (shared Supabase client)
  ↓
Supabase Postgres
```

### Write path (admin mutating data)
```
src/app/admin/<page>.tsx (form)
  ↓ submits to
src/admin/lib/actions/<entity>.ts       (Server Action, "use server")
  ↓ validates with
src/admin/lib/schemas/<entity>.ts       (Zod)
  ↓ guards with
src/admin/lib/auth.ts → requireAdmin()
  ↓ writes via
src/lib/supabase/server.ts
  ↓
Supabase Postgres (RLS double-checks is_admin())
```

## Pattern: adding a new admin CRUD page

For a new entity called `sponsors` (assuming the DB table already exists):

```
1. Schema:   src/admin/lib/schemas/sponsor.ts     (Zod schema + types)
2. Actions:  src/admin/lib/actions/sponsors.ts    ("use server" — create/update/softDelete)
3. Reads:    src/admin/lib/data/sponsors.ts       (list/getById helpers)
4. Pages:    src/app/admin/sponsors/page.tsx      (list)
             src/app/admin/sponsors/new/page.tsx  (create form)
             src/app/admin/sponsors/[id]/page.tsx (edit form)
5. Nav:      add Sponsors link to src/admin/components/AdminSidebar.tsx
```

Every CRUD follows this 5-step recipe. Copy an existing entity's files and
rename. See `events` (once built) as the canonical example.

## Production-grade guarantees (lock these in)

Every admin Server Action follows the same template:

```ts
"use server";
import { requireAdmin } from "@/admin/lib/auth";
import { eventSchema } from "@/admin/lib/schemas/event";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export async function createEventAction(formData: FormData) {
  const admin = await requireAdmin();                    // 1. AUTH
  const parsed = eventSchema.safeParse(toObject(formData));
  if (!parsed.success) return { ok: false, fieldErrors: ... };  // 2. VALIDATE
  const supabase = await getSupabaseServerClient();
  const { data, error } = await supabase                 // 3. WRITE via RLS
    .from("events")
    .insert({ ...parsed.data, created_by: admin.user.id })
    .select()
    .single();
  if (error) return { ok: false, error: error.message }; // 4. TYPED ERRORS
  revalidatePath("/events"); revalidatePath("/admin/events");  // 5. CACHE
  return { ok: true, data };
}
```

Soft deletes always:

```ts
await supabase
  .from("events")
  .update({ deleted_at: new Date().toISOString() })
  .eq("id", id);
// NEVER .delete()
```
