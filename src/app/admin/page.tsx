import { requireAdmin } from "@/admin/lib/auth";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export const metadata = { title: "Dashboard · SDC INDIA Admin" };

export default async function AdminDashboardPage() {
  const admin = await requireAdmin();
  const supabase = await getSupabaseServerClient();

  // Quick at-a-glance counts (admin RLS lets us see everything)
  const [events, team, blog, highlights, partners, gallery, registrations, messages, hostReqs] =
    await Promise.all([
      supabase.from("events").select("*", { count: "exact", head: true }).is("deleted_at", null),
      supabase.from("team_members").select("*", { count: "exact", head: true }).is("deleted_at", null),
      supabase.from("blog_posts").select("*", { count: "exact", head: true }).is("deleted_at", null),
      supabase.from("highlights").select("*", { count: "exact", head: true }).is("deleted_at", null),
      supabase.from("partners").select("*", { count: "exact", head: true }).is("deleted_at", null),
      supabase.from("gallery_images").select("*", { count: "exact", head: true }).is("deleted_at", null),
      supabase.from("registrations").select("*", { count: "exact", head: true }),
      supabase.from("contact_messages").select("*", { count: "exact", head: true }).eq("status", "new"),
      supabase.from("host_requests").select("*", { count: "exact", head: true }).eq("status", "new"),
    ]);

  const stats = [
    { label: "Events",         count: events.count ?? 0,        href: "/admin/events" },
    { label: "Team members",   count: team.count ?? 0,          href: "/admin/team" },
    { label: "Blog posts",     count: blog.count ?? 0,          href: "/admin/blog" },
    { label: "Highlights",     count: highlights.count ?? 0,    href: "/admin/highlights" },
    { label: "Partners",       count: partners.count ?? 0,      href: "/admin/partners" },
    { label: "Gallery photos", count: gallery.count ?? 0,       href: "/admin/gallery" },
  ];
  const inbox = [
    { label: "Registrations",      count: registrations.count ?? 0, href: "/admin/registrations" },
    { label: "Unread messages",    count: messages.count ?? 0,      href: "/admin/messages" },
    { label: "New host requests",  count: hostReqs.count ?? 0,      href: "/admin/host-requests" },
  ];

  return (
    <div className="p-8 max-w-[1280px]">
      <header className="mb-8">
        <p className="text-[.7rem] uppercase tracking-widest" style={{ color: "var(--a1)" }}>// Dashboard</p>
        <h1 className="text-[1.8rem] font-extrabold mt-1">Welcome back</h1>
        <p className="text-[.86rem] mt-1" style={{ color: "var(--sub)" }}>
          Signed in as <span style={{ color: "var(--text)" }}>{admin.email}</span> · role <span style={{ color: "var(--text)" }}>{admin.role}</span>
        </p>
      </header>

      <section className="mb-8">
        <h2 className="text-[.8rem] uppercase tracking-widest mb-3" style={{ color: "var(--muted)" }}>Content</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {stats.map((s) => (
            <a
              key={s.label}
              href={s.href}
              className="rounded-xl p-4 transition-colors hover:[border-color:var(--border2)]"
              style={{ background: "var(--card)", border: "1px solid var(--border)", textDecoration: "none" }}
            >
              <div className="text-[1.7rem] font-extrabold gtext leading-none">{s.count}</div>
              <div className="text-[.72rem] mt-1.5" style={{ color: "var(--sub)" }}>{s.label}</div>
            </a>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-[.8rem] uppercase tracking-widest mb-3" style={{ color: "var(--muted)" }}>Inbox</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {inbox.map((s) => (
            <a
              key={s.label}
              href={s.href}
              className="rounded-xl p-5 flex items-center justify-between transition-colors"
              style={{ background: "var(--card)", border: "1px solid var(--border)", textDecoration: "none" }}
            >
              <div>
                <div className="text-[.85rem] font-bold">{s.label}</div>
                <div className="text-[.7rem]" style={{ color: "var(--sub)" }}>Click to review</div>
              </div>
              <div className="text-[1.6rem] font-extrabold" style={{ color: s.count > 0 ? "var(--a1)" : "var(--muted)" }}>
                {s.count}
              </div>
            </a>
          ))}
        </div>
      </section>

      <section className="mt-10 text-[.78rem]" style={{ color: "var(--muted)" }}>
        Pages for each item above are coming next. Today: the dashboard +
        login. Next session: full CRUD pages for events, team, blog, etc.
      </section>
    </div>
  );
}
