import Link from "next/link";
import { requireAdmin } from "@/admin/lib/auth";
import { adminListPartners } from "@/admin/lib/data/partners";
import PageHeader from "@/admin/components/PageHeader";

export const metadata = { title: "Partners · Admin" };

export default async function AdminPartnersPage({
  searchParams,
}: { searchParams: Promise<{ include_deleted?: string }> }) {
  await requireAdmin();
  const { include_deleted } = await searchParams;
  const includeDeleted = include_deleted === "1";
  const partners = await adminListPartners({ includeDeleted });

  return (
    <div className="p-8 max-w-[1280px]">
      <PageHeader
        label="Partners"
        title="Partners"
        description={`${partners.length} ${partners.length === 1 ? "partner" : "partners"}`}
        actions={
          <Link href="/admin/partners/new" className="btn-grad" style={{ padding: ".55rem 1.1rem", fontSize: ".84rem" }}>
            + New partner
          </Link>
        }
      />

      <div className="flex justify-end mb-3">
        <Link href={`/admin/partners${!includeDeleted ? "?include_deleted=1" : ""}`}
              className="text-[.72rem]"
              style={{ color: includeDeleted ? "var(--a1)" : "var(--sub)", textDecoration: "underline" }}>
          {includeDeleted ? "✓ showing deleted" : "show deleted"}
        </Link>
      </div>

      {partners.length === 0 ? (
        <div className="rounded-xl p-10 text-center text-[.88rem]"
             style={{ background: "var(--card)", border: "1px dashed var(--border)", color: "var(--muted)" }}>
          No partners yet. <Link href="/admin/partners/new" style={{ color: "var(--a1)" }}>Add one →</Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {partners.map((p) => (
            <Link key={p.id} href={`/admin/partners/${p.id}`} className="block">
              <div
                className="rounded-xl bg-white p-4 aspect-[16/9] flex items-center justify-center relative"
                style={{ border: "1px solid var(--border)" }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={p.logo_url} alt={p.name} className="max-h-12 max-w-full object-contain" />
                {(!p.is_published || p.deleted_at) && (
                  <div className="absolute top-2 right-2 flex gap-1">
                    {!p.is_published && <Pill tone="muted" label="DRAFT" />}
                    {p.deleted_at && <Pill tone="red" label="DEL" />}
                  </div>
                )}
              </div>
              <div className="mt-2 text-[.82rem] font-semibold" style={{ color: "var(--text)" }}>{p.name}</div>
              <div className="text-[.66rem] capitalize" style={{ color: "var(--muted)" }}>{p.tier} · order {p.display_order}</div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

function Pill({ label, tone }: { label: string; tone: "muted" | "red" }) {
  const map = { muted: { bg: "#111", c: "#aaa" }, red: { bg: "#7a1c1c", c: "#fff" } }[tone];
  return (
    <span className="px-1.5 py-0.5 rounded text-[.55rem] font-bold uppercase tracking-wider"
          style={{ background: map.bg, color: map.c }}>{label}</span>
  );
}
