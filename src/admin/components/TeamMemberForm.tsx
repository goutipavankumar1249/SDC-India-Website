"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Field, TextArea, Select, Checkbox } from "@/admin/components/FormField";
import ImagePicker from "@/admin/components/ImagePicker";
import {
  createTeamMemberAction, updateTeamMemberAction,
  softDeleteTeamMemberAction, restoreTeamMemberAction,
} from "@/admin/lib/actions/team";
import type { TeamMemberRow } from "@/lib/supabase/database.types";

const SECTIONS = [
  { value: "Founder", label: "Founder" },
  { value: "Board",   label: "Board" },
  { value: "Tech",    label: "Tech" },
  { value: "Core",    label: "Core" },
  { value: "Alumni",  label: "Alumni" },
];

export default function TeamMemberForm({ member }: { member?: TeamMemberRow }) {
  const router = useRouter();
  const isEdit = !!member;
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null); setFieldErrors({});
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      const r = isEdit
        ? await updateTeamMemberAction(member!.id, fd)
        : await createTeamMemberAction(fd);
      if (r.ok) { if (r.redirectTo) { router.push(r.redirectTo); router.refresh(); } }
      else { setError(r.error); if (r.fieldErrors) setFieldErrors(r.fieldErrors); }
    });
  }

  function onDelete() {
    if (!member || !confirm(`Soft-delete "${member.name}"?`)) return;
    startTransition(async () => {
      const r = await softDeleteTeamMemberAction(member.id);
      if (r.ok && r.redirectTo) { router.push(r.redirectTo); router.refresh(); }
    });
  }
  function onRestore() {
    if (!member) return;
    startTransition(async () => {
      const r = await restoreTeamMemberAction(member.id);
      if (r.ok) router.refresh();
    });
  }
  const isSoftDeleted = !!member?.deleted_at;

  return (
    <form onSubmit={onSubmit} className="grid gap-5">
      {member && (
        <div className="flex flex-wrap gap-2 mb-2">
          <Pill label={member.is_published ? "Published" : "Draft"} tone={member.is_published ? "green" : "muted"} />
          {isSoftDeleted && <Pill label="Soft-deleted" tone="red" />}
          <Pill label={member.section} tone="purple" />
        </div>
      )}

      <div className="grid lg:grid-cols-[2fr_1fr] gap-5">
        <div className="grid gap-4">
          <div className="grid grid-cols-[110px_1fr] gap-3">
            <Field label="Initials" name="initials" required maxLength={4} defaultValue={member?.initials} error={fieldErrors.initials} hint="1–4 chars" />
            <Field label="Name"     name="name"     required defaultValue={member?.name}     error={fieldErrors.name} />
          </div>
          <Field label="Role" name="role" required defaultValue={member?.role} error={fieldErrors.role} placeholder="e.g. Lead Developer" />
          <TextArea label="Bio" name="bio" rows={4} defaultValue={member?.bio ?? ""} error={fieldErrors.bio} />
          <TextArea label="Impact (one line)" name="impact" rows={1} defaultValue={member?.impact ?? ""} error={fieldErrors.impact} placeholder="e.g. Engineering standards & platforms" />
          <div>
            <p className="text-[.66rem] uppercase tracking-wider mb-1" style={{ color: "var(--sub)" }}>Skills</p>
            <textarea
              name="skills"
              defaultValue={(member?.skills ?? []).join(", ")}
              rows={2}
              placeholder="React, TypeScript, Scaling, Architecture"
              className="w-full px-3 py-2 rounded-md text-[.86rem] outline-none resize-y"
              style={{ background: "var(--surface)", border: "1px solid var(--border)", color: "var(--text)" }}
            />
            <p className="text-[.66rem] mt-1" style={{ color: "var(--muted)" }}>Comma-separated.</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Field label="GitHub URL"   name="github_url"   type="url" defaultValue={member?.github_url ?? ""}   error={fieldErrors.github_url} />
            <Field label="LinkedIn URL" name="linkedin_url" type="url" defaultValue={member?.linkedin_url ?? ""} error={fieldErrors.linkedin_url} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Twitter / X URL" name="twitter_url" type="url" defaultValue={member?.twitter_url ?? ""} error={fieldErrors.twitter_url} />
            <Field label="Email" name="email" type="email" defaultValue={member?.email ?? ""} error={fieldErrors.email} />
          </div>
        </div>

        <aside className="grid gap-4">
          <div className="rounded-[12px] p-4" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
            <h3 className="text-[.78rem] uppercase tracking-widest mb-3" style={{ color: "var(--muted)" }}>Section</h3>
            <Select label="Section" name="section" required options={SECTIONS} defaultValue={member?.section ?? "Core"} />
          </div>
          <div className="rounded-[12px] p-4" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
            <h3 className="text-[.78rem] uppercase tracking-widest mb-3" style={{ color: "var(--muted)" }}>Appearance</h3>
            <div className="grid gap-3">
              <ImagePicker name="photo_url" label="Photo" defaultValue={member?.photo_url ?? ""} folder="team" hint="Upload from computer or paste URL." />
              <Field label="Avatar gradient"  name="gradient"  defaultValue={member?.gradient ?? "linear-gradient(135deg,#e84393,#f97316)"} hint="CSS linear-gradient value" />
            </div>
          </div>
          <div className="rounded-[12px] p-4" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
            <h3 className="text-[.78rem] uppercase tracking-widest mb-3" style={{ color: "var(--muted)" }}>Visibility</h3>
            <div className="grid gap-3">
              <Checkbox label="Published" name="is_published" defaultChecked={member?.is_published ?? true} hint="Off = hidden from public." />
              <Field label="Display order" name="display_order" type="number" defaultValue={String(member?.display_order ?? 100)} hint="Lower = appears first." />
              <Field label="Slug" name="slug" defaultValue={member?.slug ?? ""} hint="Auto-generated if blank." />
            </div>
          </div>
        </aside>
      </div>

      {error && (
        <div className="rounded-md p-3 text-[.84rem]" style={{ background: "rgba(248,113,113,.08)", border: "1px solid rgba(248,113,113,.3)", color: "#fca5a5" }}>
          {error}
        </div>
      )}

      <ActionBar
        isEdit={isEdit}
        pending={pending}
        isSoftDeleted={isSoftDeleted}
        onDelete={onDelete}
        onRestore={onRestore}
        backHref="/admin/team"
        primaryLabel={isEdit ? "Save changes" : "Create member"}
      />
    </form>
  );
}

function Pill({ label, tone }: { label: string; tone: "green" | "muted" | "red" | "purple" }) {
  const map = {
    green:  { bg: "rgba(34,197,94,.14)",  c: "#22c55e" },
    muted:  { bg: "rgba(136,136,136,.14)", c: "var(--sub)" },
    red:    { bg: "rgba(248,113,113,.14)", c: "#f87171" },
    purple: { bg: "rgba(168,85,247,.14)",  c: "var(--a3)" },
  }[tone];
  return (
    <span
      className="px-3 py-1 rounded-full text-[.65rem] uppercase tracking-wider font-bold"
      style={{ background: map.bg, color: map.c }}
    >
      {label}
    </span>
  );
}

function ActionBar({
  isEdit, pending, isSoftDeleted, onDelete, onRestore, backHref, primaryLabel,
}: {
  isEdit: boolean; pending: boolean; isSoftDeleted: boolean;
  onDelete: () => void; onRestore: () => void; backHref: string; primaryLabel: string;
}) {
  return (
    <div
      className="sticky bottom-0 -mx-8 px-8 py-3 flex flex-wrap items-center justify-between gap-3 mt-2"
      style={{ background: "rgba(8,8,8,.92)", borderTop: "1px solid var(--border)", backdropFilter: "blur(12px)" }}
    >
      <div className="flex gap-2">
        <Link href={backHref} className="px-4 py-2 rounded-md text-[.82rem] transition-colors"
              style={{ border: "1px solid var(--border2)", color: "var(--sub)", textDecoration: "none" }}>
          Cancel
        </Link>
        {isEdit && !isSoftDeleted && (
          <button type="button" onClick={onDelete} disabled={pending}
                  className="px-4 py-2 rounded-md text-[.82rem] transition-colors"
                  style={{ border: "1px solid rgba(248,113,113,.4)", color: "#f87171", background: "transparent" }}>
            Soft delete
          </button>
        )}
        {isEdit && isSoftDeleted && (
          <button type="button" onClick={onRestore} disabled={pending}
                  className="px-4 py-2 rounded-md text-[.82rem] transition-colors"
                  style={{ border: "1px solid rgba(34,197,94,.4)", color: "#22c55e", background: "transparent" }}>
            Restore
          </button>
        )}
      </div>
      <button type="submit" disabled={pending} className="btn-grad"
              style={{ padding: ".6rem 1.4rem", fontSize: ".86rem", opacity: pending ? 0.6 : 1 }}>
        {pending ? "Saving…" : primaryLabel}
      </button>
    </div>
  );
}
