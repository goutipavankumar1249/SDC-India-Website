"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { logoutAction } from "@/admin/lib/actions/auth";

const NAV = [
  { href: "/admin",              label: "Dashboard",     icon: "📊" },
  { href: "/admin/events",       label: "Events",        icon: "🎯" },
  { href: "/admin/team",         label: "Team",          icon: "👥" },
  { href: "/admin/blog",         label: "Blog Posts",    icon: "✍️" },
  { href: "/admin/highlights",   label: "Highlights",    icon: "🏆" },
  { href: "/admin/gallery",      label: "Gallery",       icon: "📸" },
  { href: "/admin/partners",     label: "Partners",      icon: "🤝" },
  { href: "/admin/registrations",label: "Registrations", icon: "📋" },
  { href: "/admin/messages",     label: "Messages",      icon: "✉️" },
  { href: "/admin/host-requests",label: "Host Requests", icon: "🏫" },
];

export default function AdminSidebar({ email }: { email: string }) {
  const pathname = usePathname();
  const isActive = (href: string) =>
    href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);

  return (
    <aside
      className="fixed top-0 left-0 bottom-0 w-60 flex flex-col"
      style={{ background: "var(--surface)", borderRight: "1px solid var(--border)" }}
    >
      {/* Brand */}
      <div className="px-5 py-4 flex items-center gap-2.5" style={{ borderBottom: "1px solid var(--border)" }}>
        <div
          className="w-8 h-8 rounded-md flex items-center justify-center text-white text-[.6rem] font-bold"
          style={{ background: "var(--grad)" }}
        >
          SDC
        </div>
        <div>
          <div className="text-[.85rem] font-extrabold leading-tight">SDC INDIA</div>
          <div className="text-[.62rem] uppercase tracking-widest" style={{ color: "var(--muted)" }}>Admin</div>
        </div>
      </div>

      {/* Nav links */}
      <nav className="flex-1 overflow-y-auto py-3">
        <ul className="list-none p-0 m-0 space-y-0.5 px-2">
          {NAV.map(({ href, label, icon }) => (
            <li key={href}>
              <Link
                href={href}
                className="flex items-center gap-2.5 px-3 py-2 rounded-md text-[.85rem] transition-colors"
                style={{
                  color: isActive(href) ? "var(--text)" : "var(--sub)",
                  background: isActive(href) ? "rgba(232,67,147,.1)" : "transparent",
                  border: isActive(href) ? "1px solid rgba(232,67,147,.2)" : "1px solid transparent",
                }}
              >
                <span className="text-base">{icon}</span>
                {label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {/* Footer: user + logout */}
      <div className="px-3 py-3" style={{ borderTop: "1px solid var(--border)" }}>
        <div className="px-2 mb-2 truncate text-[.7rem]" style={{ color: "var(--sub)" }}>
          Signed in as <span style={{ color: "var(--text)" }}>{email}</span>
        </div>
        <form action={logoutAction}>
          <button
            type="submit"
            className="w-full px-3 py-1.5 rounded-md text-[.75rem] text-left transition-colors"
            style={{
              color: "var(--sub)",
              border: "1px solid var(--border)",
              background: "var(--card)",
            }}
          >
            ← Sign out
          </button>
        </form>
        <Link
          href="/"
          target="_blank"
          className="block mt-2 px-3 py-1.5 rounded-md text-[.7rem] text-center transition-colors"
          style={{ color: "var(--muted)", textDecoration: "none" }}
        >
          ↗ View public site
        </Link>
      </div>
    </aside>
  );
}
