"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Field, TextArea, Select, Checkbox } from "@/admin/components/FormField";
import ImagePicker from "@/admin/components/ImagePicker";
import {
  createPartnerAction, updatePartnerAction,
  softDeletePartnerAction, restorePartnerAction,
} from "@/admin/lib/actions/partners";
import type { PartnerRow } from "@/lib/supabase/database.types";

const TIERS = [
  { value: "platinum", label: "Platinum" },
  { value: "gold",     label: "Gold" },
  { value: "silver",   label: "Silver" },
  { value: "standard", label: "Standard" },
];

export default function PartnerForm({ partner }: { partner?: PartnerRow }) {
  const router = useRouter();
  const isEdit = !!partner;
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null); setFieldErrors({});
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      const r = isEdit
        ? await updatePartnerAction(partner!.id, fd)
        : await createPartnerAction(fd);
      if (r.ok) { if (r.redirectTo) { router.push(r.redirectTo); router.refresh(); } }
      else { setError(r.error); if (r.fieldErrors) setFieldErrors(r.fieldErrors); }
    });
  }
  function onDelete() {
    if (!partner || !confirm(`Soft-delete "${partner.name}"?`)) return;
    startTransition(async () => {
      const r = await softDeletePartnerAction(partner.id);
      if (r.ok && r.redirectTo) { router.push(r.redirectTo); router.refresh(); }
    });
  }
  function onRestore() {
    if (!partner) return;
    startTransition(async () => {
      const r = await restorePartnerAction(partner.id);
      if (r.ok) router.refresh();
    });
  }
  const isSoftDeleted = !!partner?.deleted_at;

  return (
    <form onSubmit={onSubmit} className="grid gap-5">
      <div className="grid lg:grid-cols-[2fr_1fr] gap-5">
        <div className="grid gap-4">
          <Field label="Name" name="name" required defaultValue={partner?.name} error={fieldErrors.name} placeholder="Microsoft Learn" />
          <ImagePicker name="logo_url" label="Logo" required defaultValue={partner?.logo_url ?? ""} folder="partners" hint="Upload an SVG/PNG or paste a URL." />
          <Field label="Website URL" name="website_url" type="url" defaultValue={partner?.website_url ?? ""} error={fieldErrors.website_url} />
          <TextArea label="Description (optional)" name="description" rows={3} defaultValue={partner?.description ?? ""} />
        </div>
        <aside className="grid gap-4">
          <div className="rounded-[12px] p-4" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
            <h3 className="text-[.78rem] uppercase tracking-widest mb-3" style={{ color: "var(--muted)" }}>Tier</h3>
            <Select label="Tier" name="tier" required options={TIERS} defaultValue={partner?.tier ?? "standard"} />
          </div>
          <div className="rounded-[12px] p-4" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
            <h3 className="text-[.78rem] uppercase tracking-widest mb-3" style={{ color: "var(--muted)" }}>Visibility</h3>
            <div className="grid gap-3">
              <Checkbox label="Published" name="is_published" defaultChecked={partner?.is_published ?? true} />
              <Field label="Display order" name="display_order" type="number" defaultValue={String(partner?.display_order ?? 100)} />
              <Field label="Slug" name="slug" defaultValue={partner?.slug ?? ""} hint="Auto-generated if blank." />
            </div>
          </div>
          {partner?.logo_url && (
            <div className="rounded-[12px] p-4 bg-white" style={{ border: "1px solid var(--border)" }}>
              <p className="text-[.66rem] uppercase tracking-wider mb-2" style={{ color: "var(--muted)" }}>Preview</p>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={partner.logo_url} alt={partner.name} className="max-h-16 mx-auto" />
            </div>
          )}
        </aside>
      </div>

      {error && (
        <div className="rounded-md p-3 text-[.84rem]" style={{ background: "rgba(248,113,113,.08)", border: "1px solid rgba(248,113,113,.3)", color: "#fca5a5" }}>
          {error}
        </div>
      )}

      <div
        className="sticky bottom-0 -mx-8 px-8 py-3 flex flex-wrap items-center justify-between gap-3 mt-2"
        style={{ background: "rgba(8,8,8,.92)", borderTop: "1px solid var(--border)", backdropFilter: "blur(12px)" }}
      >
        <div className="flex gap-2">
          <Link href="/admin/partners" className="px-4 py-2 rounded-md text-[.82rem]"
                style={{ border: "1px solid var(--border2)", color: "var(--sub)", textDecoration: "none" }}>
            Cancel
          </Link>
          {isEdit && !isSoftDeleted && (
            <button type="button" onClick={onDelete} disabled={pending}
                    className="px-4 py-2 rounded-md text-[.82rem]"
                    style={{ border: "1px solid rgba(248,113,113,.4)", color: "#f87171", background: "transparent" }}>
              Soft delete
            </button>
          )}
          {isEdit && isSoftDeleted && (
            <button type="button" onClick={onRestore} disabled={pending}
                    className="px-4 py-2 rounded-md text-[.82rem]"
                    style={{ border: "1px solid rgba(34,197,94,.4)", color: "#22c55e", background: "transparent" }}>
              Restore
            </button>
          )}
        </div>
        <button type="submit" disabled={pending} className="btn-grad"
                style={{ padding: ".6rem 1.4rem", fontSize: ".86rem", opacity: pending ? 0.6 : 1 }}>
          {pending ? "Saving…" : isEdit ? "Save changes" : "Create partner"}
        </button>
      </div>
    </form>
  );
}
