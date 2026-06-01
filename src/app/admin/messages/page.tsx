import Link from "next/link";
import { requireAdmin } from "@/admin/lib/auth";
import { adminListContactMessages } from "@/admin/lib/data/inbox";
import PageHeader from "@/admin/components/PageHeader";
import ContactMessagesTable from "@/admin/components/ContactMessagesTable";

export const metadata = { title: "Messages · Admin" };

const TABS = [
  { value: "",         label: "All" },
  { value: "new",      label: "New" },
  { value: "read",     label: "Read" },
  { value: "replied",  label: "Replied" },
  { value: "spam",     label: "Spam" },
  { value: "archived", label: "Archived" },
];

export default async function AdminMessagesPage({
  searchParams,
}: { searchParams: Promise<{ status?: string }> }) {
  await requireAdmin();
  const { status } = await searchParams;
  const rows = await adminListContactMessages({ status: status || undefined });

  return (
    <div className="p-8 max-w-[1280px]">
      <PageHeader
        label="Inbox"
        title="Contact Messages"
        description={`${rows.length} ${rows.length === 1 ? "message" : "messages"} from the public Contact form`}
      />

      <div className="flex gap-1 mb-5 flex-wrap" style={{ borderBottom: "1px solid var(--border)" }}>
        {TABS.map((t) => (
          <Link key={t.value || "all"}
                href={`/admin/messages${t.value ? "?status=" + t.value : ""}`}
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

      <ContactMessagesTable rows={rows} />
    </div>
  );
}
