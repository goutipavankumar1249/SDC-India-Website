"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Field, TextArea, Select, Checkbox } from "@/admin/components/FormField";
import ImagePicker from "@/admin/components/ImagePicker";
import {
  createGalleryImageAction, updateGalleryImageAction,
  softDeleteGalleryImageAction, restoreGalleryImageAction,
} from "@/admin/lib/actions/gallery";
import type { GalleryImageRow } from "@/lib/supabase/database.types";

const SPAN_OPTIONS = [
  { value: "aspect-square",           label: "Square (1:1)" },
  { value: "col-span-2 aspect-[2/1]", label: "Wide  (2:1, spans 2 cols)" },
  { value: "row-span-2 aspect-[1/2]", label: "Tall  (1:2, spans 2 rows)" },
  { value: "aspect-[4/3]",            label: "Photo (4:3)" },
  { value: "aspect-video",            label: "Video (16:9)" },
];

export default function GalleryImageForm({ image }: { image?: GalleryImageRow }) {
  const router = useRouter();
  const isEdit = !!image;
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null); setFieldErrors({});
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      const r = isEdit
        ? await updateGalleryImageAction(image!.id, fd)
        : await createGalleryImageAction(fd);
      if (r.ok) { if (r.redirectTo) { router.push(r.redirectTo); router.refresh(); } }
      else { setError(r.error); if (r.fieldErrors) setFieldErrors(r.fieldErrors); }
    });
  }
  function onDelete() {
    if (!image || !confirm("Soft-delete this image?")) return;
    startTransition(async () => {
      const r = await softDeleteGalleryImageAction(image.id);
      if (r.ok && r.redirectTo) { router.push(r.redirectTo); router.refresh(); }
    });
  }
  function onRestore() {
    if (!image) return;
    startTransition(async () => {
      const r = await restoreGalleryImageAction(image.id);
      if (r.ok) router.refresh();
    });
  }
  const isSoftDeleted = !!image?.deleted_at;

  return (
    <form onSubmit={onSubmit} className="grid gap-5">
      <div className="grid lg:grid-cols-[2fr_1fr] gap-5">
        <div className="grid gap-4">
          <ImagePicker name="image_url" label="Image" required defaultValue={image?.image_url ?? ""} folder="gallery" hint="Upload from your computer or paste a URL." />
          <Field label="Alt text (accessibility)" name="alt_text" defaultValue={image?.alt_text ?? ""} placeholder="Describe what's in the image" />
          <TextArea label="Caption" name="caption" rows={2} defaultValue={image?.caption ?? ""} />
        </div>
        <aside className="grid gap-4">
          <div className="rounded-[12px] p-4" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
            <h3 className="text-[.78rem] uppercase tracking-widest mb-3" style={{ color: "var(--muted)" }}>Layout</h3>
            <Select label="Span / aspect" name="span_classes" required options={SPAN_OPTIONS} defaultValue={image?.span_classes ?? "aspect-square"} />
          </div>
          <div className="rounded-[12px] p-4" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
            <h3 className="text-[.78rem] uppercase tracking-widest mb-3" style={{ color: "var(--muted)" }}>Linked event (optional)</h3>
            <Field label="Event UUID" name="event_id" defaultValue={image?.event_id ?? ""} placeholder="UUID" hint="To group by event." />
          </div>
          <div className="rounded-[12px] p-4" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
            <h3 className="text-[.78rem] uppercase tracking-widest mb-3" style={{ color: "var(--muted)" }}>Visibility</h3>
            <div className="grid gap-3">
              <Checkbox label="Published" name="is_published" defaultChecked={image?.is_published ?? true} />
              <Field label="Display order" name="display_order" type="number" defaultValue={String(image?.display_order ?? 100)} />
            </div>
          </div>
          {image?.image_url && (
            <div className="rounded-[12px] p-2 overflow-hidden" style={{ border: "1px solid var(--border)" }}>
              <p className="px-2 pt-1 text-[.66rem] uppercase tracking-wider" style={{ color: "var(--muted)" }}>Preview</p>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={image.image_url} alt={image.alt_text ?? ""} className="w-full mt-1 rounded" />
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
          <Link href="/admin/gallery" className="px-4 py-2 rounded-md text-[.82rem]"
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
          {pending ? "Saving…" : isEdit ? "Save changes" : "Add image"}
        </button>
      </div>
    </form>
  );
}
