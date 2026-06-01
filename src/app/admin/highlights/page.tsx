import Link from "next/link";
import { requireAdmin } from "@/admin/lib/auth";
import { adminListHighlights } from "@/admin/lib/data/highlights";
import PageHeader from "@/admin/components/PageHeader";

export const metadata = { title: "Highlights · Admin" };

export default async function AdminHighlightsPage({
  searchParams,
}: { searchParams: Promise<{ include_deleted?: string }> }) {
  await requireAdmin();
  const { include_deleted } = await searchParams;
  const includeDeleted = include_deleted === "1";
  const highlights = await adminListHighlights({ includeDeleted });

  return (
    <div className="p-8 max-w-[1280px]">
      <PageHeader
        label="Highlights"
        title="Event Highlights"
        description={`${highlights.length} ${highlights.length === 1 ? "highlight" : "highlights"} (winning teams)`}
        actions={
          <Link href="/admin/highlights/new" className="btn-grad" style={{ padding: ".55rem 1.1rem", fontSize: ".84rem" }}>
            + New highlight
          </Link>
        }
      />

      <div className="flex justify-end mb-3">
        <Link href={`/admin/highlights${!includeDeleted ? "?include_deleted=1" : ""}`}
              className="text-[.72rem]"
              style={{ color: includeDeleted ? "var(--a1)" : "var(--sub)", textDecoration: "underline" }}>
          {includeDeleted ? "✓ showing deleted" : "show deleted"}
        </Link>
      </div>

      {highlights.length === 0 ? (
        <Empty href="/admin/highlights/new" />
      ) : (
        <div className="rounded-xl overflow-hidden" style={{ border: "1px solid var(--border)" }}>
          <table className="w-full text-[.85rem]">
            <thead>
              <tr style={{ background: "var(--surface)", color: "var(--sub)" }}>
                <Th>Team</Th><Th>Event</Th><Th>Position</Th><Th align="right">Order</Th><Th>Status</Th>
              </tr>
            </thead>
            <tbody>
              {highlights.map((h) => (
                <tr key={h.id}>
                  <Td>
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-[.72rem] font-extrabold flex-shrink-0"
                           style={{ background: h.gradient ?? "var(--grad)" }}>
                        {h.initials}
                      </div>
                      <Link href={`/admin/highlights/${h.id}`} className="font-semibold"
                            style={{ color: "var(--text)", textDecoration: "none" }}>
                        {h.team_name}
                      </Link>
                    </div>
                  </Td>
                  <Td>
                    <div style={{ color: "var(--sub)" }}>{h.event_name}</div>
                    <div className="text-[.7rem]" style={{ color: "var(--muted)" }}>{h.event_date_label ?? ""}</div>
                  </Td>
                  <Td><span style={{ color: "var(--sub)" }}>{h.position_icon} {h.position}</span></Td>
                  <Td align="right"><span style={{ color: "var(--sub)" }}>{h.display_order}</span></Td>
                  <Td>
                    {!h.is_published && <Pill tone="muted" label="DRAFT" />}
                    {h.is_published && <Pill tone="green" label="LIVE" />}
                    {h.deleted_at && <Pill tone="red" label="DELETED" />}
                  </Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function Empty({ href }: { href: string }) {
  return (
    <div className="rounded-xl p-10 text-center text-[.88rem]"
         style={{ background: "var(--card)", border: "1px dashed var(--border)", color: "var(--muted)" }}>
      No highlights yet. <Link href={href} style={{ color: "var(--a1)" }}>Add one →</Link>
    </div>
  );
}
function Th({ children, align = "left" }: { children: React.ReactNode; align?: "left" | "right" }) {
  return <th className="px-4 py-2 text-[.68rem] font-bold uppercase tracking-widest"
             style={{ textAlign: align, borderBottom: "1px solid var(--border)" }}>{children}</th>;
}
function Td({ children, align = "left" }: { children: React.ReactNode; align?: "left" | "right" }) {
  return <td className="px-4 py-3" style={{ textAlign: align, borderTop: "1px solid var(--border)" }}>{children}</td>;
}
function Pill({ label, tone }: { label: string; tone: "green" | "muted" | "red" }) {
  const map = {
    green: { bg: "rgba(34,197,94,.14)", c: "#22c55e" },
    muted: { bg: "rgba(136,136,136,.14)", c: "var(--sub)" },
    red:   { bg: "rgba(248,113,113,.14)", c: "#f87171" },
  }[tone];
  return <span className="px-2 py-0.5 rounded-full text-[.6rem] font-bold uppercase tracking-wider"
               style={{ background: map.bg, color: map.c }}>{label}</span>;
}
