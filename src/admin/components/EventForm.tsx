"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Field, TextArea, Select, Checkbox } from "@/admin/components/FormField";
import ImagePicker from "@/admin/components/ImagePicker";
import {
  createEventAction, updateEventAction, softDeleteEventAction, restoreEventAction,
} from "@/admin/lib/actions/events";
import type { EventRow } from "@/lib/supabase/database.types";

const MODE_OPTIONS = [
  { value: "OFFLINE", label: "Offline" },
  { value: "ONLINE", label: "Online" },
  { value: "HYBRID", label: "Hybrid" },
];

const CATEGORY_OPTIONS = [
  { value: "Hackathon",  label: "Hackathon" },
  { value: "Workshop",   label: "Workshop" },
  { value: "Conference", label: "Conference" },
  { value: "Meetup",     label: "Meetup" },
  { value: "Bootcamp",   label: "Bootcamp" },
  { value: "Talk",       label: "Talk" },
  { value: "Other",      label: "Other" },
];

export default function EventForm({ event }: { event?: EventRow }) {
  const router = useRouter();
  const isEdit = !!event;

  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setFieldErrors({});
    const fd = new FormData(e.currentTarget);

    startTransition(async () => {
      const result = isEdit
        ? await updateEventAction(event!.id, fd)
        : await createEventAction(fd);

      if (result.ok) {
        if (result.redirectTo) {
          router.push(result.redirectTo);
          router.refresh();
        }
      } else {
        setError(result.error);
        if (result.fieldErrors) setFieldErrors(result.fieldErrors);
      }
    });
  }

  function onDelete() {
    if (!event) return;
    if (!confirm(`Soft-delete "${event.title}"? It will be hidden from the public site but can be restored.`)) return;
    startTransition(async () => {
      const r = await softDeleteEventAction(event.id);
      if (r.ok && r.redirectTo) { router.push(r.redirectTo); router.refresh(); }
    });
  }

  function onRestore() {
    if (!event) return;
    startTransition(async () => {
      const r = await restoreEventAction(event.id);
      if (r.ok) router.refresh();
    });
  }

  const isSoftDeleted = !!event?.deleted_at;

  return (
    <form onSubmit={onSubmit} className="grid gap-5">
      {/* Status badges */}
      {event && (
        <div className="flex flex-wrap gap-2 mb-2">
          <Badge label={event.is_published ? "Published" : "Draft"} tone={event.is_published ? "green" : "muted"} />
          {isSoftDeleted && <Badge label="Soft-deleted" tone="red" />}
        </div>
      )}

      {/* Two-column main grid */}
      <div className="grid lg:grid-cols-[2fr_1fr] gap-5">
        <div className="grid gap-4">
          <Field label="Title" name="title" required defaultValue={event?.title} error={fieldErrors.title} maxLength={200} />
          <TextArea label="Short description" name="description" required rows={2} defaultValue={event?.description} error={fieldErrors.description} hint="Shown on cards and previews. 10–2000 chars." />
          <TextArea label="Long description" name="long_description" rows={5} defaultValue={event?.long_description ?? ""} error={fieldErrors.long_description} hint="Full event copy (event detail page)." />

          <div className="grid grid-cols-2 gap-4">
            <Field label="Event date" name="event_date" type="date" defaultValue={event?.event_date ?? ""} error={fieldErrors.event_date} hint="Leave blank for TBA." />
            <Field label="Event time" name="event_time" defaultValue={event?.event_time ?? ""} placeholder="e.g. 9:00 AM" error={fieldErrors.event_time} />
          </div>

          <Field label="Location" name="location" defaultValue={event?.location ?? ""} error={fieldErrors.location} placeholder="e.g. SNIST Campus, Hyderabad" />
          <Field label="Speakers / Mentors" name="speakers" defaultValue={event?.speakers ?? ""} error={fieldErrors.speakers} placeholder="Comma-separated" />

          <div>
            <p className="text-[.66rem] uppercase tracking-wider mb-1" style={{ color: "var(--sub)" }}>Winners</p>
            <textarea
              name="winners"
              defaultValue={(event?.winners ?? []).join(", ")}
              rows={2}
              placeholder="e.g. Team A, Team B, Team C"
              className="w-full px-3 py-2 rounded-md text-[.86rem] outline-none resize-y"
              style={{ background: "var(--surface)", border: "1px solid var(--border)", color: "var(--text)" }}
            />
            <p className="text-[.66rem] mt-1" style={{ color: "var(--muted)" }}>Comma-separated. Order = 1st, 2nd, 3rd…</p>
          </div>

          <div>
            <p className="text-[.66rem] uppercase tracking-wider mb-1" style={{ color: "var(--sub)" }}>Tags</p>
            <textarea
              name="tags"
              defaultValue={(event?.tags ?? []).join(", ")}
              rows={1}
              placeholder="e.g. AI, Web3, beginners"
              className="w-full px-3 py-2 rounded-md text-[.86rem] outline-none resize-y"
              style={{ background: "var(--surface)", border: "1px solid var(--border)", color: "var(--text)" }}
            />
          </div>
        </div>

        {/* Sidebar */}
        <aside className="grid gap-4">
          <div className="rounded-[12px] p-4" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
            <h3 className="text-[.78rem] uppercase tracking-widest mb-3" style={{ color: "var(--muted)" }}>Classification</h3>
            <div className="grid gap-3">
              <Select label="Category" name="category" options={CATEGORY_OPTIONS} defaultValue={event?.category ?? ""} />
              <Select label="Mode" name="mode" required options={MODE_OPTIONS} defaultValue={event?.mode ?? "OFFLINE"} />
              <Field label="Duration" name="duration" defaultValue={event?.duration ?? ""} placeholder="e.g. 1 Day · 12 Hours" />
            </div>
          </div>

          <div className="rounded-[12px] p-4" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
            <h3 className="text-[.78rem] uppercase tracking-widest mb-3" style={{ color: "var(--muted)" }}>Capacity</h3>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Attended" name="attendees" type="number" min={0} defaultValue={String(event?.attendees ?? 0)} />
              <Field label="Seats" name="seats" type="number" min={0} defaultValue={event?.seats != null ? String(event.seats) : ""} hint="Limit for upcoming." />
            </div>
          </div>

          <div className="rounded-[12px] p-4" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
            <h3 className="text-[.78rem] uppercase tracking-widest mb-3" style={{ color: "var(--muted)" }}>Registration</h3>
            <div className="grid gap-3">
              <Field label="Registration URL" name="registration_url" type="url" defaultValue={event?.registration_url ?? ""} placeholder="https://…" />
              <Checkbox label="Open for registration" name="registration_open" defaultChecked={event?.registration_open} hint="Show the Register button publicly." />
            </div>
          </div>

          <div className="rounded-[12px] p-4" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
            <h3 className="text-[.78rem] uppercase tracking-widest mb-3" style={{ color: "var(--muted)" }}>Image</h3>
            <ImagePicker name="image_url" label="Event image" defaultValue={event?.image_url ?? ""} folder="events" hint="Click Upload to add from your computer, or paste a URL." />
          </div>

          <div className="rounded-[12px] p-4" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
            <h3 className="text-[.78rem] uppercase tracking-widest mb-3" style={{ color: "var(--muted)" }}>Visibility</h3>
            <div className="grid gap-3">
              <Checkbox label="Published" name="is_published" defaultChecked={event?.is_published ?? true} hint="Off = draft (hidden from public)." />
              <Field label="Display order" name="display_order" type="number" defaultValue={String(event?.display_order ?? 100)} hint="Lower = appears first." />
              <Field label="Slug" name="slug" defaultValue={event?.slug ?? ""} hint="Leave blank to auto-generate from title." />
            </div>
          </div>
        </aside>
      </div>

      {error && (
        <div className="rounded-md p-3 text-[.84rem]" style={{ background: "rgba(248,113,113,.08)", border: "1px solid rgba(248,113,113,.3)", color: "#fca5a5" }}>
          {error}
        </div>
      )}

      {/* Action bar (sticky bottom) */}
      <div
        className="sticky bottom-0 -mx-8 px-8 py-3 flex flex-wrap items-center justify-between gap-3 mt-2"
        style={{ background: "rgba(8,8,8,.92)", borderTop: "1px solid var(--border)", backdropFilter: "blur(12px)" }}
      >
        <div className="flex gap-2">
          <Link
            href="/admin/events"
            className="px-4 py-2 rounded-md text-[.82rem] transition-colors"
            style={{ border: "1px solid var(--border2)", color: "var(--sub)", textDecoration: "none" }}
          >
            Cancel
          </Link>
          {isEdit && !isSoftDeleted && (
            <button
              type="button"
              onClick={onDelete}
              disabled={pending}
              className="px-4 py-2 rounded-md text-[.82rem] transition-colors"
              style={{ border: "1px solid rgba(248,113,113,.4)", color: "#f87171", background: "transparent" }}
            >
              Soft delete
            </button>
          )}
          {isEdit && isSoftDeleted && (
            <button
              type="button"
              onClick={onRestore}
              disabled={pending}
              className="px-4 py-2 rounded-md text-[.82rem] transition-colors"
              style={{ border: "1px solid rgba(34,197,94,.4)", color: "#22c55e", background: "transparent" }}
            >
              Restore
            </button>
          )}
        </div>

        <button
          type="submit"
          disabled={pending}
          className="btn-grad"
          style={{ padding: ".6rem 1.4rem", fontSize: ".86rem", opacity: pending ? 0.6 : 1 }}
        >
          {pending ? "Saving…" : isEdit ? "Save changes" : "Create event"}
        </button>
      </div>
    </form>
  );
}

function Badge({ label, tone }: { label: string; tone: "green" | "muted" | "red" }) {
  const map = {
    green: { bg: "rgba(34,197,94,.12)", color: "#22c55e" },
    muted: { bg: "rgba(136,136,136,.12)", color: "var(--sub)" },
    red:   { bg: "rgba(248,113,113,.12)", color: "#f87171" },
  }[tone];
  return (
    <span
      className="px-3 py-1 rounded-full text-[.65rem] uppercase tracking-wider font-bold"
      style={{ background: map.bg, color: map.color }}
    >
      {label}
    </span>
  );
}
