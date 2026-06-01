"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Field, TextArea, Select, Checkbox } from "@/admin/components/FormField";
import {
  createHighlightAction, updateHighlightAction,
  softDeleteHighlightAction, restoreHighlightAction,
} from "@/admin/lib/actions/highlights";
import type { HighlightRow } from "@/lib/supabase/database.types";

const POSITIONS = [
  { value: "1st", label: "1st" },
  { value: "2nd", label: "2nd" },
  { value: "3rd", label: "3rd" },
  { value: "Honorable Mention", label: "Honorable Mention" },
  { value: "Featured", label: "Featured" },
];

export default function HighlightForm({ highlight }: { highlight?: HighlightRow }) {
  const router = useRouter();
  const isEdit = !!highlight;
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null); setFieldErrors({});
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      const r = isEdit
        ? await updateHighlightAction(highlight!.id, fd)
        : await createHighlightAction(fd);
      if (r.ok) { if (r.redirectTo) { router.push(r.redirectTo); router.refresh(); } }
      else { setError(r.error); if (r.fieldErrors) setFieldErrors(r.fieldErrors); }
    });
  }
  function onDelete() {
    if (!highlight || !confirm(`Soft-delete "${highlight.team_name}"?`)) return;
    startTransition(async () => {
      const r = await softDeleteHighlightAction(highlight.id);
      if (r.ok && r.redirectTo) { router.push(r.redirectTo); router.refresh(); }
    });
  }
  function onRestore() {
    if (!highlight) return;
    startTransition(async () => {
      const r = await restoreHighlightAction(highlight.id);
      if (r.ok) router.refresh();
    });
  }
  const isSoftDeleted = !!highlight?.deleted_at;
  const statsText = (highlight?.stats ?? []).map((s) => `${s.value}|${s.label}`).join("\n");

  return (
    <form onSubmit={onSubmit} className="grid gap-5">
      {highlight && (
        <div className="flex flex-wrap gap-2 mb-2">
          <Pill label={highlight.is_published ? "Published" : "Draft"} tone={highlight.is_published ? "green" : "muted"} />
          {isSoftDeleted && <Pill label="Soft-deleted" tone="red" />}
        </div>
      )}

      <div className="grid lg:grid-cols-[2fr_1fr] gap-5">
        <div className="grid gap-4">
          <div className="grid grid-cols-[110px_1fr] gap-3">
            <Field label="Initials" name="initials" required maxLength={4} defaultValue={highlight?.initials} error={fieldErrors.initials} />
            <Field label="Team name" name="team_name" required defaultValue={highlight?.team_name} error={fieldErrors.team_name} />
          </div>
          <Field label="Event name" name="event_name" required defaultValue={highlight?.event_name ?? ""} error={fieldErrors.event_name} placeholder="e.g. VIBE CODE Hackathon" />
          <div className="grid grid-cols-2 gap-4">
            <Field label="Event date label" name="event_date_label" defaultValue={highlight?.event_date_label ?? ""} placeholder="e.g. November 2025" />
            <Field label="Event image URL" name="event_image_url" defaultValue={highlight?.event_image_url ?? ""} placeholder="/assets/events/…" />
          </div>
          <TextArea label="Description" name="description" rows={4} defaultValue={highlight?.description ?? ""} error={fieldErrors.description} hint="The story that shows on the card + modal." />

          <div>
            <p className="text-[.66rem] uppercase tracking-wider mb-1" style={{ color: "var(--sub)" }}>Stats (max 4)</p>
            <textarea
              name="stats"
              defaultValue={statsText}
              rows={4}
              placeholder="1st|PLACE&#10;12h|BUILD TIME&#10;200|COMPETITORS"
              className="w-full px-3 py-2 rounded-md text-[.86rem] outline-none resize-y font-mono"
              style={{ background: "var(--surface)", border: "1px solid var(--border)", color: "var(--text)" }}
            />
            <p className="text-[.66rem] mt-1" style={{ color: "var(--muted)" }}>
              One pair per line. Format: <code>value|label</code> · e.g. <code>1st|PLACE</code>
            </p>
          </div>
        </div>

        <aside className="grid gap-4">
          <div className="rounded-[12px] p-4" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
            <h3 className="text-[.78rem] uppercase tracking-widest mb-3" style={{ color: "var(--muted)" }}>Position</h3>
            <div className="grid gap-3">
              <Select label="Position" name="position" required options={POSITIONS} defaultValue={highlight?.position ?? "1st"} />
              <Field label="Position icon" name="position_icon" defaultValue={highlight?.position_icon ?? "🏆"} maxLength={4} hint="e.g. 🏆 🥈 🥉" />
            </div>
          </div>

          <div className="rounded-[12px] p-4" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
            <h3 className="text-[.78rem] uppercase tracking-widest mb-3" style={{ color: "var(--muted)" }}>Linked event (optional)</h3>
            <Field label="Event UUID" name="event_id" defaultValue={highlight?.event_id ?? ""} placeholder="UUID from events table" hint="Optional foreign key." />
          </div>

          <div className="rounded-[12px] p-4" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
            <h3 className="text-[.78rem] uppercase tracking-widest mb-3" style={{ color: "var(--muted)" }}>Appearance</h3>
            <Field label="Avatar gradient" name="gradient" defaultValue={highlight?.gradient ?? "linear-gradient(135deg,#e84393,#f97316)"} hint="CSS linear-gradient." />
          </div>

          <div className="rounded-[12px] p-4" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
            <h3 className="text-[.78rem] uppercase tracking-widest mb-3" style={{ color: "var(--muted)" }}>Visibility</h3>
            <div className="grid gap-3">
              <Checkbox label="Published" name="is_published" defaultChecked={highlight?.is_published ?? true} />
              <Field label="Display order" name="display_order" type="number" defaultValue={String(highlight?.display_order ?? 100)} />
              <Field label="Slug" name="slug" defaultValue={highlight?.slug ?? ""} hint="Auto-generated if blank." />
            </div>
          </div>
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
          <Link href="/admin/highlights" className="px-4 py-2 rounded-md text-[.82rem]"
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
          {pending ? "Saving…" : isEdit ? "Save changes" : "Create highlight"}
        </button>
      </div>
    </form>
  );
}

function Pill({ label, tone }: { label: string; tone: "green" | "muted" | "red" }) {
  const map = {
    green: { bg: "rgba(34,197,94,.14)",  c: "#22c55e" },
    muted: { bg: "rgba(136,136,136,.14)", c: "var(--sub)" },
    red:   { bg: "rgba(248,113,113,.14)", c: "#f87171" },
  }[tone];
  return <span className="px-3 py-1 rounded-full text-[.65rem] uppercase tracking-wider font-bold"
               style={{ background: map.bg, color: map.c }}>{label}</span>;
}
