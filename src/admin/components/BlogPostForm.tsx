"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Field, TextArea, Select, Checkbox } from "@/admin/components/FormField";
import BlogContentEditor from "@/admin/components/BlogContentEditor";
import ImagePicker from "@/admin/components/ImagePicker";
import {
  createBlogPostAction, updateBlogPostAction,
  softDeleteBlogPostAction, restoreBlogPostAction,
} from "@/admin/lib/actions/blog";
import type { BlogPostRow } from "@/lib/supabase/database.types";

const CATEGORIES = [
  { value: "article",       label: "Article" },
  { value: "event",         label: "Event" },
  { value: "growth",        label: "Growth" },
  { value: "community",     label: "Community" },
  { value: "digital",       label: "Digital" },
  { value: "tutorial",      label: "Tutorial" },
  { value: "announcement",  label: "Announcement" },
];

export default function BlogPostForm({ post }: { post?: BlogPostRow }) {
  const router = useRouter();
  const isEdit = !!post;
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null); setFieldErrors({});
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      const r = isEdit
        ? await updateBlogPostAction(post!.id, fd)
        : await createBlogPostAction(fd);
      if (r.ok) { if (r.redirectTo) { router.push(r.redirectTo); router.refresh(); } }
      else { setError(r.error); if (r.fieldErrors) setFieldErrors(r.fieldErrors); }
    });
  }
  function onDelete() {
    if (!post || !confirm(`Soft-delete "${post.title}"?`)) return;
    startTransition(async () => {
      const r = await softDeleteBlogPostAction(post.id);
      if (r.ok && r.redirectTo) { router.push(r.redirectTo); router.refresh(); }
    });
  }
  function onRestore() {
    if (!post) return;
    startTransition(async () => {
      const r = await restoreBlogPostAction(post.id);
      if (r.ok) router.refresh();
    });
  }
  const isSoftDeleted = !!post?.deleted_at;

  return (
    <form onSubmit={onSubmit} className="grid gap-5">
      {post && (
        <div className="flex flex-wrap gap-2 mb-2">
          <Pill label={post.is_published ? "Published" : "Draft"} tone={post.is_published ? "green" : "muted"} />
          {isSoftDeleted && <Pill label="Soft-deleted" tone="red" />}
        </div>
      )}

      <div className="grid lg:grid-cols-[2fr_1fr] gap-5">
        <div className="grid gap-4">
          <Field label="Title" name="title" required defaultValue={post?.title} error={fieldErrors.title} />
          <Field label="Slug (URL-safe)" name="slug" required defaultValue={post?.slug ?? ""} error={fieldErrors.slug} placeholder="story-behind-sdc" hint="kebab-case. The post lives at /blog/<slug>." />
          <TextArea label="Excerpt (preview text)" name="excerpt" rows={3} defaultValue={post?.excerpt ?? ""} error={fieldErrors.excerpt} hint="2-3 sentences shown on blog list cards." />

          <BlogContentEditor initial={post?.content_blocks ?? []} />
        </div>

        <aside className="grid gap-4">
          <div className="rounded-[12px] p-4" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
            <h3 className="text-[.78rem] uppercase tracking-widest mb-3" style={{ color: "var(--muted)" }}>Classification</h3>
            <div className="grid gap-3">
              <Select label="Category" name="category" required options={CATEGORIES} defaultValue={post?.category ?? "article"} />
              <Field label="Publish date" name="publish_date" type="date" defaultValue={post?.publish_date ?? ""} />
              <Field label="Read time" name="read_time" defaultValue={post?.read_time ?? ""} placeholder="e.g. 5 min read" />
            </div>
          </div>

          <div className="rounded-[12px] p-4" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
            <h3 className="text-[.78rem] uppercase tracking-widest mb-3" style={{ color: "var(--muted)" }}>Cover image</h3>
            <ImagePicker name="cover_image_url" label="Cover image" defaultValue={post?.cover_image_url ?? ""} folder="blog" />
          </div>

          <div className="rounded-[12px] p-4" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
            <h3 className="text-[.78rem] uppercase tracking-widest mb-3" style={{ color: "var(--muted)" }}>Visibility</h3>
            <div className="grid gap-3">
              <Checkbox label="Published" name="is_published" defaultChecked={post?.is_published ?? false} hint="Drafts are hidden from public." />
              <Field label="Display order" name="display_order" type="number" defaultValue={String(post?.display_order ?? 100)} />
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
          <Link href="/admin/blog" className="px-4 py-2 rounded-md text-[.82rem]"
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
          {pending ? "Saving…" : isEdit ? "Save changes" : "Create post"}
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
