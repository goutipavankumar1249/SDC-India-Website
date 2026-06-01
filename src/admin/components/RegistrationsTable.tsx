"use client";

import StatusDropdown from "@/admin/components/StatusDropdown";
import { updateRegistrationStatusAction, deleteRegistrationAction } from "@/admin/lib/actions/inbox";
import { useRouter } from "next/navigation";
import { useTransition } from "react";

const STATUSES = [
  { value: "pending",    label: "Pending" },
  { value: "confirmed",  label: "Confirmed" },
  { value: "waitlist",   label: "Waitlist" },
  { value: "cancelled",  label: "Cancelled" },
  { value: "attended",   label: "Attended" },
  { value: "no_show",    label: "No-show" },
];

type Row = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  college: string | null;
  year_of_study: string | null;
  branch: string | null;
  status: string;
  notes: string | null;
  created_at: string;
  event_title?: string;
  event_slug?: string;
};

export default function RegistrationsTable({ rows }: { rows: Row[] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function onDelete(id: string, name: string) {
    if (!confirm(`Delete registration from ${name}? This is permanent.`)) return;
    startTransition(async () => {
      await deleteRegistrationAction(id);
      router.refresh();
    });
  }

  if (rows.length === 0) {
    return (
      <div className="rounded-xl p-10 text-center text-[.88rem]"
           style={{ background: "var(--card)", border: "1px dashed var(--border)", color: "var(--muted)" }}>
        No registrations yet.
      </div>
    );
  }

  return (
    <div className="rounded-xl overflow-hidden" style={{ border: "1px solid var(--border)" }}>
      <table className="w-full text-[.84rem]">
        <thead>
          <tr style={{ background: "var(--surface)", color: "var(--sub)" }}>
            <Th>Registrant</Th><Th>Event</Th><Th>College</Th><Th>Status</Th><Th>Submitted</Th><Th>{" "}</Th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.id}>
              <Td>
                <div className="font-semibold">{r.name}</div>
                <div className="text-[.7rem]" style={{ color: "var(--muted)" }}>
                  <a href={`mailto:${r.email}`} style={{ color: "var(--a1)" }}>{r.email}</a>
                  {r.phone && <span> · {r.phone}</span>}
                </div>
              </Td>
              <Td>
                <div style={{ color: "var(--sub)" }}>{r.event_title ?? "—"}</div>
                {r.event_slug && (
                  <div className="text-[.7rem]" style={{ color: "var(--muted)" }}>/events/{r.event_slug}</div>
                )}
              </Td>
              <Td>
                <div style={{ color: "var(--sub)" }}>{r.college ?? "—"}</div>
                <div className="text-[.7rem]" style={{ color: "var(--muted)" }}>
                  {[r.branch, r.year_of_study].filter(Boolean).join(" · ")}
                </div>
              </Td>
              <Td>
                <StatusDropdown
                  current={r.status}
                  options={STATUSES}
                  onChange={async (next) => updateRegistrationStatusAction(r.id, next)}
                />
              </Td>
              <Td><span className="text-[.72rem]" style={{ color: "var(--muted)" }}>{new Date(r.created_at).toLocaleDateString()}</span></Td>
              <Td>
                <button
                  type="button"
                  onClick={() => onDelete(r.id, r.name)}
                  disabled={pending}
                  className="text-[.7rem]"
                  style={{ color: "#f87171", background: "transparent", border: "none", cursor: "pointer" }}
                >
                  Delete
                </button>
              </Td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return <th className="px-4 py-2 text-[.66rem] font-bold uppercase tracking-widest text-left"
             style={{ borderBottom: "1px solid var(--border)" }}>{children}</th>;
}
function Td({ children }: { children: React.ReactNode }) {
  return <td className="px-4 py-3 align-top" style={{ borderTop: "1px solid var(--border)" }}>{children}</td>;
}
