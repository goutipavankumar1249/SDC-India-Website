"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import StatusDropdown from "@/admin/components/StatusDropdown";
import { updateContactStatusAction, deleteContactMessageAction } from "@/admin/lib/actions/inbox";

const STATUSES = [
  { value: "new",      label: "New" },
  { value: "read",     label: "Read" },
  { value: "replied",  label: "Replied" },
  { value: "spam",     label: "Spam" },
  { value: "archived", label: "Archived" },
];

type Row = {
  id: string;
  name: string;
  email: string;
  subject: string | null;
  message: string;
  status: string;
  created_at: string;
};

export default function ContactMessagesTable({ rows }: { rows: Row[] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [open, setOpen] = useState<string | null>(null);

  function onDelete(id: string) {
    if (!confirm("Delete this message? Permanent.")) return;
    startTransition(async () => {
      await deleteContactMessageAction(id);
      router.refresh();
    });
  }

  if (rows.length === 0) {
    return (
      <div className="rounded-xl p-10 text-center text-[.88rem]"
           style={{ background: "var(--card)", border: "1px dashed var(--border)", color: "var(--muted)" }}>
        No messages yet.
      </div>
    );
  }

  return (
    <div className="grid gap-2">
      {rows.map((m) => {
        const isOpen = open === m.id;
        return (
          <div
            key={m.id}
            className="rounded-xl"
            style={{ background: "var(--card)", border: "1px solid var(--border)" }}
          >
            <button
              type="button"
              onClick={() => setOpen(isOpen ? null : m.id)}
              className="w-full p-4 flex items-center justify-between gap-3 text-left"
              style={{ background: "transparent", border: "none", color: "var(--text)", cursor: "pointer" }}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  {m.status === "new" && <Pill tone="green" label="NEW" />}
                  <span className="font-semibold">{m.name}</span>
                  <span className="text-[.72rem]" style={{ color: "var(--muted)" }}>
                    {new Date(m.created_at).toLocaleString()}
                  </span>
                </div>
                <div className="text-[.78rem] truncate" style={{ color: "var(--sub)" }}>
                  {m.subject ?? "(no subject)"} — {m.email}
                </div>
              </div>
              <span style={{ color: "var(--muted)" }}>{isOpen ? "▾" : "▸"}</span>
            </button>

            {isOpen && (
              <div className="px-4 pb-4 pt-1" style={{ borderTop: "1px solid var(--border)" }}>
                <pre className="whitespace-pre-wrap text-[.86rem] leading-[1.7] mt-3 mb-4"
                     style={{ color: "var(--text)", fontFamily: "inherit" }}>
                  {m.message}
                </pre>
                <div className="flex flex-wrap items-center gap-2 pt-3" style={{ borderTop: "1px dashed var(--border)" }}>
                  <a
                    href={`mailto:${m.email}?subject=Re:%20${encodeURIComponent(m.subject ?? "your message")}`}
                    className="text-[.78rem] px-3 py-1.5 rounded-md"
                    style={{ background: "var(--grad)", color: "#fff", textDecoration: "none" }}
                  >
                    Reply via email
                  </a>
                  <StatusDropdown
                    current={m.status}
                    options={STATUSES}
                    onChange={async (next) => updateContactStatusAction(m.id, next)}
                  />
                  <button
                    type="button"
                    onClick={() => onDelete(m.id)}
                    disabled={pending}
                    className="text-[.72rem] ml-auto"
                    style={{ color: "#f87171", background: "transparent", border: "none", cursor: "pointer" }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function Pill({ tone, label }: { tone: "green"; label: string }) {
  return (
    <span className="px-2 py-0.5 rounded-full text-[.6rem] font-bold uppercase tracking-wider"
          style={{ background: "rgba(34,197,94,.14)", color: "#22c55e" }}>
      {label}
    </span>
  );
}
