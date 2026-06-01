import Link from "next/link";
import { requireAdmin } from "@/admin/lib/auth";
import { adminListTeam } from "@/admin/lib/data/team";
import PageHeader from "@/admin/components/PageHeader";

export const metadata = { title: "Team · Admin" };

export default async function AdminTeamPage({
  searchParams,
}: {
  searchParams: Promise<{ section?: string; include_deleted?: string }>;
}) {
  await requireAdmin();
  const { section, include_deleted } = await searchParams;
  const includeDeleted = include_deleted === "1";
  const members = await adminListTeam({ section: section || undefined, includeDeleted });

  const sections = ["all", "Founder", "Board", "Tech", "Core", "Alumni"] as const;
  const active = section || "all";

  return (
    <div className="p-8 max-w-[1280px]">
      <PageHeader
        label="Team"
        title="Team Members"
        description={`${members.length} ${members.length === 1 ? "member" : "members"} ${includeDeleted ? "(incl. deleted)" : ""}`}
        actions={
          <Link href="/admin/team/new" className="btn-grad" style={{ padding: ".55rem 1.1rem", fontSize: ".84rem" }}>
            + New member
          </Link>
        }
      />

      <div className="flex gap-1 mb-5 flex-wrap" style={{ borderBottom: "1px solid var(--border)" }}>
        {sections.map((s) => {
          const params = new URLSearchParams();
          if (s !== "all") params.set("section", s);
          if (includeDeleted) params.set("include_deleted", "1");
          const qs = params.toString();
          return (
            <Link key={s}
                  href={`/admin/team${qs ? "?" + qs : ""}`}
                  className="px-4 py-2 text-[.78rem] font-semibold transition-colors capitalize"
                  style={{
                    borderBottom: active === s ? "2px solid var(--a1)" : "2px solid transparent",
                    color: active === s ? "var(--text)" : "var(--sub)",
                    textDecoration: "none",
                  }}>
              {s}
            </Link>
          );
        })}
        <div className="ml-auto self-center">
          <Link href={`/admin/team?${section ? "section=" + section + "&" : ""}${!includeDeleted ? "include_deleted=1" : ""}`}
                className="text-[.72rem]"
                style={{ color: includeDeleted ? "var(--a1)" : "var(--sub)", textDecoration: "underline" }}>
            {includeDeleted ? "✓ showing deleted" : "show deleted"}
          </Link>
        </div>
      </div>

      {members.length === 0 ? (
        <div className="rounded-xl p-10 text-center text-[.88rem]"
             style={{ background: "var(--card)", border: "1px dashed var(--border)", color: "var(--muted)" }}>
          No team members in this filter. <Link href="/admin/team/new" style={{ color: "var(--a1)" }}>Add one →</Link>
        </div>
      ) : (
        <div className="rounded-xl overflow-hidden" style={{ border: "1px solid var(--border)" }}>
          <table className="w-full text-[.85rem]">
            <thead>
              <tr style={{ background: "var(--surface)", color: "var(--sub)" }}>
                <Th>Member</Th>
                <Th>Role</Th>
                <Th>Section</Th>
                <Th align="right">Order</Th>
                <Th>Status</Th>
              </tr>
            </thead>
            <tbody>
              {members.map((m) => (
                <tr key={m.id}>
                  <Td>
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-[.72rem] font-extrabold flex-shrink-0"
                           style={{ background: m.gradient ?? "var(--grad)" }}>
                        {m.initials}
                      </div>
                      <div>
                        <Link href={`/admin/team/${m.id}`} className="font-semibold"
                              style={{ color: "var(--text)", textDecoration: "none" }}>
                          {m.name}
                        </Link>
                        <div className="text-[.7rem]" style={{ color: "var(--muted)" }}>{m.slug ?? "— no slug —"}</div>
                      </div>
                    </div>
                  </Td>
                  <Td><span style={{ color: "var(--sub)" }}>{m.role}</span></Td>
                  <Td><span style={{ color: "var(--sub)" }}>{m.section}</span></Td>
                  <Td align="right"><span style={{ color: "var(--sub)" }}>{m.display_order}</span></Td>
                  <Td>
                    <div className="flex flex-wrap gap-1">
                      {!m.is_published && <Pill tone="muted" label="DRAFT" />}
                      {m.is_published && <Pill tone="green" label="LIVE" />}
                      {m.deleted_at && <Pill tone="red" label="DELETED" />}
                    </div>
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

function Th({ children, align = "left" }: { children: React.ReactNode; align?: "left" | "right" }) {
  return <th className="px-4 py-2 text-[.68rem] font-bold uppercase tracking-widest"
             style={{ textAlign: align, borderBottom: "1px solid var(--border)" }}>{children}</th>;
}
function Td({ children, align = "left" }: { children: React.ReactNode; align?: "left" | "right" }) {
  return <td className="px-4 py-3" style={{ textAlign: align, borderTop: "1px solid var(--border)" }}>{children}</td>;
}
function Pill({ label, tone }: { label: string; tone: "green" | "muted" | "red" }) {
  const map = {
    green: { bg: "rgba(34,197,94,.14)",  c: "#22c55e" },
    muted: { bg: "rgba(136,136,136,.14)", c: "var(--sub)" },
    red:   { bg: "rgba(248,113,113,.14)", c: "#f87171" },
  }[tone];
  return <span className="px-2 py-0.5 rounded-full text-[.6rem] font-bold uppercase tracking-wider"
               style={{ background: map.bg, color: map.c }}>{label}</span>;
}
