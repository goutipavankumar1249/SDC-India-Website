"use client";

import { useState, useTransition, useRef } from "react";
import { uploadImageAction } from "@/admin/lib/actions/upload";

/**
 * Drop-in replacement for a plain URL <input>: accepts either:
 *   • a typed URL (paste a /assets/... path), or
 *   • a file upload (drag/drop or click → uploads to Supabase Storage,
 *     returns a public URL that's stored in the hidden form field).
 *
 * Renders the current value as a preview below the input.
 */
export default function ImagePicker({
  name,
  label,
  defaultValue,
  folder = "misc",
  hint,
  required,
}: {
  name: string;
  label: string;
  defaultValue?: string | null;
  folder?: string;          // e.g. "events", "team", "blog", "gallery"
  hint?: string;
  required?: boolean;
}) {
  const [url, setUrl] = useState<string>(defaultValue ?? "");
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  function onFileSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);
    const fd = new FormData();
    fd.set("file", file);
    startTransition(async () => {
      const r = await uploadImageAction(folder, fd);
      if (r.ok) setUrl(r.publicUrl);
      else setError(r.error);
      if (fileRef.current) fileRef.current.value = "";
    });
  }

  return (
    <div className="block">
      <span className="block text-[.66rem] mb-1 uppercase tracking-wider" style={{ color: "var(--sub)" }}>
        {label}{required && <span style={{ color: "var(--a1)" }}> *</span>}
      </span>

      <div className="flex gap-2">
        <input
          name={name}
          type="text"
          required={required}
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="Paste a URL — or use Upload"
          className="flex-1 px-3 py-2 rounded-md text-[.82rem] outline-none"
          style={{ background: "var(--surface)", border: "1px solid var(--border)", color: "var(--text)" }}
        />
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={pending}
          className="px-3 py-2 rounded-md text-[.78rem] whitespace-nowrap"
          style={{
            background: "var(--card)",
            border: "1px solid var(--border2)",
            color: "var(--text)",
            cursor: pending ? "wait" : "pointer",
            opacity: pending ? 0.6 : 1,
          }}
        >
          {pending ? "Uploading…" : "📤 Upload"}
        </button>
        <input ref={fileRef} type="file" accept="image/*" hidden onChange={onFileSelected} />
      </div>

      {hint && !error && <p className="text-[.66rem] mt-1" style={{ color: "var(--muted)" }}>{hint}</p>}
      {error && <p className="text-[.7rem] mt-1" style={{ color: "#f87171" }}>{error}</p>}

      {url && (
        <div className="mt-2 rounded-md overflow-hidden" style={{ border: "1px solid var(--border)" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={url} alt="" className="w-full max-h-48 object-contain bg-white" />
        </div>
      )}
    </div>
  );
}
