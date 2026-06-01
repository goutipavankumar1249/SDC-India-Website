import Link from "next/link";
import { requireAdmin } from "@/admin/lib/auth";
import { adminListHostRequests } from "@/admin/lib/data/inbox";
import PageHeader from "@/admin/components/PageHeader";
import HostRequestsTable from "@/admin/components/HostRequestsTable";

export const metadata = { title: "Host Requests · Admin" };

const TABS = [
  { value: "",          label: "All" },
  { value: "new",       label: "New" },
  { value: "contacted", label: "Contacted" },
  { value: "scheduled", label: "Scheduled" },
  { value: "completed", label: "Completed" },
  { value: "declined",  label: "Declined" },
];

export default async function AdminHostRequestsPage({
  searchParams,
}: { searchParams: Promise<{ status?: string }> }) {
  await requireAdmin();
  const { status } = await searchParams;
  const rows = await adminListHostRequests({ status: status || undefined });

  return (
    <div className="p-8 max-w-[1280px]">
      <PageHeader
        label="Inbox"
        title="Host Requests"
        description={`${rows.length} ${rows.length === 1 ? "request" : "requests"} from colleges wanting to host SDC events`}
      />

      <div className="flex gap-1 mb-5 flex-wrap" style={{ borderBottom: "1px solid var(--border)" }}>
        {TABS.map((t) => (
          <Link key={t.value || "all"}
                href={`/admin/host-requests${t.value ? "?status=" + t.value : ""}`}
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

      <HostRequestsTable rows={rows} />
    </div>
  );
}
