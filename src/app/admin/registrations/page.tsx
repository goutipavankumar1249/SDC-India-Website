import Link from "next/link";
import { requireAdmin } from "@/admin/lib/auth";
import { adminListRegistrations } from "@/admin/lib/data/inbox";
import PageHeader from "@/admin/components/PageHeader";
import RegistrationsTable from "@/admin/components/RegistrationsTable";

export const metadata = { title: "Registrations · Admin" };

const TABS = [
  { value: "",          label: "All" },
  { value: "pending",   label: "Pending" },
  { value: "confirmed", label: "Confirmed" },
  { value: "attended",  label: "Attended" },
  { value: "cancelled", label: "Cancelled" },
];

export default async function AdminRegistrationsPage({
  searchParams,
}: { searchParams: Promise<{ status?: string; event_id?: string }> }) {
  await requireAdmin();
  const { status, event_id } = await searchParams;
  const rows = await adminListRegistrations({ status: status || undefined, eventId: event_id });

  return (
    <div className="p-8 max-w-[1280px]">
      <PageHeader
        label="Inbox"
        title="Event Registrations"
        description={`${rows.length} ${rows.length === 1 ? "registration" : "registrations"}`}
      />

      <div className="flex gap-1 mb-5 flex-wrap" style={{ borderBottom: "1px solid var(--border)" }}>
        {TABS.map((t) => (
          <Link key={t.value || "all"}
                href={`/admin/registrations${t.value ? "?status=" + t.value : ""}`}
                className="px-4 py-2 text-[.78rem] font-semibold transition-colors"
                style={{
                  borderBottom: (status ?? "") === t.value ? "2px solid var(--a1)" : "2px solid transparent",
                  color: (status ?? "") === t.value ? "var(--text)" : "var(--sub)",
                  textDecoration: "none",
                }}>
            {t.label}
          </Link>
        ))}
      </div>

      <RegistrationsTable rows={rows} />
    </div>
  );
}
