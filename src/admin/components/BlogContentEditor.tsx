"use client";

import { useState } from "react";
import type { BlogContentBlock } from "@/lib/supabase/database.types";

/**
 * Block-based blog content editor.
 *
 * Each post is composed of N blocks. Each block has:
 *   - optional title
 *   - optional paragraphs (one per line)
 *   - optional bullets (one per line)
 *   - optional pull-quote
 *
 * The component emits its state as a hidden JSON-encoded form field
 * called `content_blocks` so the server action can JSON.parse it.
 */
export default function BlogContentEditor({
  initial,
}: {
  initial?: BlogContentBlock[];
}) {
  const [blocks, setBlocks] = useState<BlogContentBlock[]>(initial ?? []);

  function update(i: number, patch: Partial<BlogContentBlock>) {
    setBlocks((b) => b.map((x, idx) => (idx === i ? { ...x, ...patch } : x)));
  }
  function remove(i: number) {
    setBlocks((b) => b.filter((_, idx) => idx !== i));
  }
  function move(i: number, dir: -1 | 1) {
    setBlocks((b) => {
      const j = i + dir;
      if (j < 0 || j >= b.length) return b;
      const out = [...b];
      [out[i], out[j]] = [out[j], out[i]];
      return out;
    });
  }
  function add() {
    setBlocks((b) => [...b, { title: "", paragraphs: [], bullets: [], quote: "" }]);
  }

  return (
    <div className="grid gap-3">
      <input type="hidden" name="content_blocks" value={JSON.stringify(blocks)} />

      <div className="flex items-center justify-between">
        <p className="text-[.66rem] uppercase tracking-wider" style={{ color: "var(--sub)" }}>
          Content blocks ({blocks.length})
        </p>
        <button
          type="button"
          onClick={add}
          className="text-[.78rem] px-3 py-1.5 rounded-md transition-colors"
          style={{ background: "var(--card)", border: "1px solid var(--border)", color: "var(--text)" }}
        >
          + Add block
        </button>
      </div>

      {blocks.length === 0 && (
        <div className="rounded-md p-6 text-center text-[.82rem]"
             style={{ background: "var(--card)", border: "1px dashed var(--border)", color: "var(--muted)" }}>
          No blocks yet. Click "+ Add block" to start writing.
        </div>
      )}

      {blocks.map((block, i) => (
        <div key={i} className="rounded-md p-3"
             style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
          <div className="flex justify-between items-center mb-2">
            <span className="text-[.62rem] uppercase tracking-widest" style={{ color: "var(--muted)" }}>
              Block #{i + 1}
            </span>
            <div className="flex gap-1">
              <IconBtn onClick={() => move(i, -1)} disabled={i === 0} title="Move up">↑</IconBtn>
              <IconBtn onClick={() => move(i, 1)}  disabled={i === blocks.length - 1} title="Move down">↓</IconBtn>
              <IconBtn onClick={() => remove(i)}   title="Remove">✕</IconBtn>
            </div>
          </div>

          <div className="grid gap-2">
            <BlockField
              label="Heading (optional)"
              value={block.title ?? ""}
              onChange={(v) => update(i, { title: v })}
              placeholder="e.g. Our Core Values"
            />
            <BlockTextarea
              label="Paragraphs (one per line)"
              value={(block.paragraphs ?? []).join("\n")}
              onChange={(v) => update(i, { paragraphs: v.split("\n").map((s) => s.trim()).filter(Boolean) })}
              rows={3}
              placeholder="First paragraph…&#10;Second paragraph…"
            />
            <BlockTextarea
              label="Bullets (one per line)"
              value={(block.bullets ?? []).join("\n")}
              onChange={(v) => update(i, { bullets: v.split("\n").map((s) => s.trim()).filter(Boolean) })}
              rows={3}
              placeholder="First bullet&#10;Second bullet"
            />
            <BlockField
              label="Pull quote (optional)"
              value={block.quote ?? ""}
              onChange={(v) => update(i, { quote: v })}
              placeholder="A standout quote to highlight"
            />
          </div>
        </div>
      ))}
    </div>
  );
}

function BlockField({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <label className="block">
      <span className="block text-[.6rem] mb-0.5 uppercase tracking-wider" style={{ color: "var(--sub)" }}>{label}</span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-2.5 py-1.5 rounded text-[.82rem] outline-none"
        style={{ background: "var(--surface)", border: "1px solid var(--border)", color: "var(--text)" }}
      />
    </label>
  );
}

function BlockTextarea({ label, value, onChange, placeholder, rows = 3 }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; rows?: number }) {
  return (
    <label className="block">
      <span className="block text-[.6rem] mb-0.5 uppercase tracking-wider" style={{ color: "var(--sub)" }}>{label}</span>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        className="w-full px-2.5 py-1.5 rounded text-[.82rem] outline-none resize-y"
        style={{ background: "var(--surface)", border: "1px solid var(--border)", color: "var(--text)" }}
      />
    </label>
  );
}

function IconBtn({ children, onClick, disabled, title }: { children: React.ReactNode; onClick: () => void; disabled?: boolean; title: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className="w-7 h-7 rounded text-[.72rem] transition-colors"
      style={{
        background: "var(--surface)",
        border: "1px solid var(--border)",
        color: disabled ? "var(--muted)" : "var(--text)",
        opacity: disabled ? 0.4 : 1,
        cursor: disabled ? "not-allowed" : "pointer",
      }}
    >
      {children}
    </button>
  );
}
