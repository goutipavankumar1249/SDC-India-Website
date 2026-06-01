import Link from "next/link";
import { requireAdmin } from "@/admin/lib/auth";
import { adminListEvents } from "@/admin/lib/data/events";
import PageHeader from "@/admin/components/PageHeader";

export const metadata = { title: "Events · Admin" };

type FilterTab = "all" | "upcoming" | "past" | "drafts";

export default async function AdminEventsPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string; include_deleted?: string }>;
}) {
  await requireAdmin();
  const { filter: filterRaw, include_deleted } = await searchParams;
  const filter = ((["all", "upcoming", "past", "drafts"] as const).includes(filterRaw as FilterTab)
    ? (filterRaw as FilterTab)
    : "all");
  const includeDeleted = include_deleted === "1";

  const events = await adminListEvents({ filter, includeDeleted });

  const today = new Date().toISOString().slice(0, 10);

  return (
    <div className="p-8 max-w-[1280px]">
      <PageHeader
        label="Events"
        title="Events"
        description={`${events.length} ${events.length === 1 ? "event" : "events"} ${includeDeleted ? "(including soft-deleted)" : ""}`}
        actions={
          <Link href="/admin/events/new" className="btn-grad" style={{ padding: ".55rem 1.1rem", fontSize: ".84rem" }}>
            + New event
          </Link>
        }
      />

      {/* Filter tabs */}
      <div className="flex gap-1 mb-5 flex-wrap" style={{ borderBottom: "1px solid var(--border)" }}>
        {(["all", "upcoming", "past", "drafts"] as const).map((id) => (
          <Link
            key={id}
            href={`/admin/events?filter=${id}${includeDeleted ? "&include_deleted=1" : ""}`}
            className="px-4 py-2 text-[.78rem] font-semibold transition-colors capitalize"
            style={{
              borderBottom: filter === id ? "2px solid var(--a1)" : "2px solid transparent",
              color: filter === id ? "var(--text)" : "var(--sub)",
              textDecoration: "none",
            }}
          >
            {id}
          </Link>
        ))}
        <div className="ml-auto self-center">
          <Link
            href={`/admin/events?filter=${filter}${!includeDeleted ? "&include_deleted=1" : ""}`}
            className="text-[.72rem]"
            style={{ color: includeDeleted ? "var(--a1)" : "var(--sub)", textDecoration: "underline" }}
          >
            {includeDeleted ? "✓ showing deleted" : "show deleted"}
          </Link>
        </div>
      </div>

      {/* Table */}
      {events.length === 0 ? (
        <div
          className="rounded-xl p-10 text-center text-[.88rem]"
          style={{ background: "var(--card)", border: "1px dashed var(--border)", color: "var(--muted)" }}
        >
          No events in this filter. <Link href="/admin/events/new" style={{ color: "var(--a1)" }}>Create one →</Link>
        </div>
      ) : (
        <div className="rounded-xl overflow-hidden" style={{ border: "1px solid var(--border)" }}>
          <table className="w-full text-[.85rem]">
            <thead>
              <tr style={{ background: "var(--surface)", color: "var(--sub)" }}>
                <Th>Title</Th>
                <Th>Date</Th>
                <Th>Category</Th>
                <Th>Mode</Th>
                <Th align="right">Attendees</Th>
                <Th>Status</Th>
              </tr>
            </thead>
            <tbody>
              {events.map((e) => {
                const isPast = e.event_date && e.event_date < today;
                return (
                  <tr key={e.id} className="transition-colors hover:[background:var(--surface)]">
                    <Td>
                      <Link
                        href={`/admin/events/${e.id}`}
                        className="font-semibold"
                        style={{ color: "var(--text)", textDecoration: "none" }}
                      >
                        {e.title}
                      </Link>
                      <div className="text-[.7rem]" style={{ color: "var(--muted)" }}>{e.slug ?? "— no slug —"}</div>
                    </Td>
                    <Td><span style={{ color: "var(--sub)" }}>{e.event_date ?? "TBA"}</span></Td>
                    <Td><span style={{ color: "var(--sub)" }}>{e.category ?? "—"}</span></Td>
                    <Td><span style={{ color: "var(--sub)" }}>{e.mode}</span></Td>
                    <Td align="right"><span style={{ color: "var(--sub)" }}>{e.attendees}</span></Td>
                    <Td>
                      <div className="flex flex-wrap gap-1">
                        {!e.is_published && <Pill tone="muted" label="DRAFT" />}
                        {e.is_published && isPast  && <Pill tone="muted" label="PAST" />}
                        {e.is_published && !isPast && <Pill tone="green" label="LIVE" />}
                        {e.deleted_at  && <Pill tone="red"   label="DELETED" />}
                      </div>
                    </Td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function Th({ children, align = "left" }: { children: React.ReactNode; align?: "left" | "right" }) {
  return (
    <th
      className="px-4 py-2 text-[.68rem] font-bold uppercase tracking-widest"
      style={{ textAlign: align, borderBottom: "1px solid var(--border)" }}
    >
      {children}
    </th>
  );
}

function Td({ children, align = "left" }: { children: React.ReactNode; align?: "left" | "right" }) {
  return (
    <td
      className="px-4 py-3"
      style={{ textAlign: align, borderTop: "1px solid var(--border)" }}
    >
      {children}
    </td>
  );
}

function Pill({ label, tone }: { label: string; tone: "green" | "muted" | "red" }) {
  const map = {
    green: { bg: "rgba(34,197,94,.14)",  c: "#22c55e" },
    muted: { bg: "rgba(136,136,136,.14)", c: "var(--sub)" },
    red:   { bg: "rgba(248,113,113,.14)", c: "#f87171" },
  }[tone];
  return (
    <span
      className="px-2 py-0.5 rounded-full text-[.6rem] font-bold uppercase tracking-wider"
      style={{ background: map.bg, color: map.c }}
    >
      {label}
    </span>
  );
}
