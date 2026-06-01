"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import StatusDropdown from "@/admin/components/StatusDropdown";
import { updateHostRequestStatusAction, deleteHostRequestAction } from "@/admin/lib/actions/inbox";

const STATUSES = [
  { value: "new",        label: "New" },
  { value: "contacted",  label: "Contacted" },
  { value: "scheduled",  label: "Scheduled" },
  { value: "declined",   label: "Declined" },
  { value: "completed",  label: "Completed" },
];

type Row = {
  id: string;
  name: string;
  designation: string | null;
  college: string;
  email: string;
  phone: string | null;
  event_type: string | null;
  preferred_date: string | null;
  expected_size: string | null;
  city: string | null;
  details: string | null;
  status: string;
  status_notes: string | null;
  created_at: string;
};

export default function HostRequestsTable({ rows }: { rows: Row[] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [open, setOpen] = useState<string | null>(null);

  function onDelete(id: string) {
    if (!confirm("Delete this host request? Permanent.")) return;
    startTransition(async () => {
      await deleteHostRequestAction(id);
      router.refresh();
    });
  }

  if (rows.length === 0) {
    return (
      <div className="rounded-xl p-10 text-center text-[.88rem]"
           style={{ background: "var(--card)", border: "1px dashed var(--border)", color: "var(--muted)" }}>
        No host requests yet.
      </div>
    );
  }

  return (
    <div className="grid gap-2">
      {rows.map((r) => {
        const isOpen = open === r.id;
        return (
          <div key={r.id} className="rounded-xl"
               style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
            <button
              type="button"
              onClick={() => setOpen(isOpen ? null : r.id)}
              className="w-full p-4 flex items-center justify-between gap-3 text-left"
              style={{ background: "transparent", border: "none", color: "var(--text)", cursor: "pointer" }}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  {r.status === "new" && <Pill tone="green" label="NEW" />}
                  <span className="font-semibold">{r.college}</span>
                  <span className="text-[.72rem]" style={{ color: "var(--muted)" }}>
                    {new Date(r.created_at).toLocaleDateString()}
                  </span>
                </div>
                <div className="text-[.78rem] truncate" style={{ color: "var(--sub)" }}>
                  {r.name}{r.designation ? ` (${r.designation})` : ""} · {r.event_type ?? "—"}
                  {r.city ? ` · ${r.city}` : ""}
                </div>
              </div>
              <span style={{ color: "var(--muted)" }}>{isOpen ? "▾" : "▸"}</span>
            </button>

            {isOpen && (
              <div className="px-4 pb-4 pt-1" style={{ borderTop: "1px solid var(--border)" }}>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3 mb-3 text-[.82rem]">
                  <DataField label="Email" value={<a href={`mailto:${r.email}`} style={{ color: "var(--a1)" }}>{r.email}</a>} />
                  <DataField label="Phone" value={r.phone ?? "—"} />
                  <DataField label="Event type" value={r.event_type ?? "—"} />
                  <DataField label="Preferred date" value={r.preferred_date ?? "TBA"} />
                  <DataField label="Expected size" value={r.expected_size ?? "—"} />
                  <DataField label="City" value={r.city ?? "—"} />
                </div>
                {r.details && (
                  <>
                    <div className="text-[.66rem] uppercase tracking-widest mt-3" style={{ color: "var(--muted)" }}>Details</div>
                    <pre className="whitespace-pre-wrap text-[.86rem] leading-[1.7] mt-1"
                         style={{ color: "var(--text)", fontFamily: "inherit" }}>
                      {r.details}
                    </pre>
                  </>
                )}
                <div className="flex flex-wrap items-center gap-2 pt-3 mt-3" style={{ borderTop: "1px dashed var(--border)" }}>
                  <a
                    href={`mailto:${r.email}?subject=Re:%20Hosting%20Request%20for%20${encodeURIComponent(r.college)}`}
                    className="text-[.78rem] px-3 py-1.5 rounded-md"
                    style={{ background: "var(--grad)", color: "#fff", textDecoration: "none" }}
                  >
                    Reply via email
                  </a>
                  <StatusDropdown
                    current={r.status}
                    options={STATUSES}
                    onChange={async (next) => updateHostRequestStatusAction(r.id, next)}
                  />
                  <button
                    type="button"
                    onClick={() => onDelete(r.id)}
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

function DataField({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <div className="text-[.6rem] uppercase tracking-widest" style={{ color: "var(--muted)" }}>{label}</div>
      <div className="mt-0.5" style={{ color: "var(--text)" }}>{value}</div>
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
