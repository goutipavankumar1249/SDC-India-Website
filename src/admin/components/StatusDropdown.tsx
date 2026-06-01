"use client";

import { useTransition } from "react";

export default function StatusDropdown({
  current,
  options,
  onChange,
}: {
  current: string;
  options: { value: string; label: string; tone?: "green" | "amber" | "red" | "muted" | "blue" }[];
  onChange: (value: string) => Promise<{ ok: true } | { ok: false; error: string }>;
}) {
  const [pending, startTransition] = useTransition();

  function handle(e: React.ChangeEvent<HTMLSelectElement>) {
    const next = e.target.value;
    startTransition(async () => {
      await onChange(next);
    });
  }

  return (
    <select
      value={current}
      onChange={handle}
      disabled={pending}
      className="px-2 py-1 rounded text-[.75rem] outline-none cursor-pointer"
      style={{
        background: "var(--surface)",
        border: "1px solid var(--border)",
        color: "var(--text)",
        opacity: pending ? 0.5 : 1,
      }}
    >
      {options.map((o) => (
        <option key={o.value} value={o.value} style={{ background: "#1a1a1a" }}>
          {o.label}
        </option>
      ))}
    </select>
  );
}
