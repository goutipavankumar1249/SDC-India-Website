import Link from "next/link";
import { requireAdmin } from "@/admin/lib/auth";
import { adminListBlogPosts } from "@/admin/lib/data/blog";
import PageHeader from "@/admin/components/PageHeader";

export const metadata = { title: "Blog · Admin" };

export default async function AdminBlogPage({
  searchParams,
}: { searchParams: Promise<{ filter?: string; include_deleted?: string }> }) {
  await requireAdmin();
  const { filter: f, include_deleted } = await searchParams;
  const filter = (["all", "published", "drafts"].includes(f ?? "") ? (f as "all"|"published"|"drafts") : "all");
  const includeDeleted = include_deleted === "1";
  const posts = await adminListBlogPosts({ filter, includeDeleted });

  return (
    <div className="p-8 max-w-[1280px]">
      <PageHeader
        label="Blog"
        title="Blog Posts"
        description={`${posts.length} ${posts.length === 1 ? "post" : "posts"} ${includeDeleted ? "(incl. deleted)" : ""}`}
        actions={
          <Link href="/admin/blog/new" className="btn-grad" style={{ padding: ".55rem 1.1rem", fontSize: ".84rem" }}>
            + New post
          </Link>
        }
      />

      <div className="flex gap-1 mb-5 flex-wrap" style={{ borderBottom: "1px solid var(--border)" }}>
        {(["all", "published", "drafts"] as const).map((id) => (
          <Link key={id}
                href={`/admin/blog?filter=${id}${includeDeleted ? "&include_deleted=1" : ""}`}
                className="px-4 py-2 text-[.78rem] font-semibold transition-colors capitalize"
                style={{
                  borderBottom: filter === id ? "2px solid var(--a1)" : "2px solid transparent",
                  color: filter === id ? "var(--text)" : "var(--sub)",
                  textDecoration: "none",
                }}>
            {id}
          </Link>
        ))}
        <div className="ml-auto self-center">
          <Link href={`/admin/blog?filter=${filter}${!includeDeleted ? "&include_deleted=1" : ""}`}
                className="text-[.72rem]"
                style={{ color: includeDeleted ? "var(--a1)" : "var(--sub)", textDecoration: "underline" }}>
            {includeDeleted ? "✓ showing deleted" : "show deleted"}
          </Link>
        </div>
      </div>

      {posts.length === 0 ? (
        <div className="rounded-xl p-10 text-center text-[.88rem]"
             style={{ background: "var(--card)", border: "1px dashed var(--border)", color: "var(--muted)" }}>
          No posts. <Link href="/admin/blog/new" style={{ color: "var(--a1)" }}>Write one →</Link>
        </div>
      ) : (
        <div className="rounded-xl overflow-hidden" style={{ border: "1px solid var(--border)" }}>
          <table className="w-full text-[.85rem]">
            <thead>
              <tr style={{ background: "var(--surface)", color: "var(--sub)" }}>
                <Th>Post</Th><Th>Category</Th><Th>Publish date</Th><Th>Status</Th>
              </tr>
            </thead>
            <tbody>
              {posts.map((p) => (
                <tr key={p.id}>
                  <Td>
                    <Link href={`/admin/blog/${p.id}`} className="font-semibold"
                          style={{ color: "var(--text)", textDecoration: "none" }}>
                      {p.title}
                    </Link>
                    <div className="text-[.7rem]" style={{ color: "var(--muted)" }}>/blog/{p.slug}</div>
                  </Td>
                  <Td><span style={{ color: "var(--sub)" }}>{p.category}</span></Td>
                  <Td><span style={{ color: "var(--sub)" }}>{p.publish_date ?? "—"}</span></Td>
                  <Td>
                    <div className="flex flex-wrap gap-1">
                      {!p.is_published && <Pill tone="muted" label="DRAFT" />}
                      {p.is_published && <Pill tone="green" label="LIVE" />}
                      {p.deleted_at && <Pill tone="red" label="DELETED" />}
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

function Th({ children }: { children: React.ReactNode }) {
  return <th className="px-4 py-2 text-[.68rem] font-bold uppercase tracking-widest text-left"
             style={{ borderBottom: "1px solid var(--border)" }}>{children}</th>;
}
function Td({ children }: { children: React.ReactNode }) {
  return <td className="px-4 py-3" style={{ borderTop: "1px solid var(--border)" }}>{children}</td>;
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
