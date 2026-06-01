"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

type NavItem = { href: string; label: string; cta?: boolean };

const NAV_ITEMS: NavItem[] = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/events", label: "Events" },
  { href: "/highlights", label: "Highlights" },
  { href: "/team", label: "Team" },
  { href: "/blog", label: "Blog" },
  { href: "/contact", label: "Contact" },
  { href: "/host", label: "Host With Us", cta: true },
];

export default function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => { setMobileOpen(false); }, [pathname]);

  // Hide the public navbar on admin pages (they have their own shell)
  if (pathname.startsWith("/admin")) return null;

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-[300] flex items-center justify-between px-4 md:px-8 py-2.5 backdrop-blur-xl"
      style={{
        background: "rgba(8,8,8,.92)",
        borderBottom: "1px solid var(--border)",
      }}
    >
      <Link href="/" className="flex items-center gap-2.5 no-underline">
        <div
          className="w-[32px] h-[32px] rounded-lg flex items-center justify-center font-bold text-[.62rem] text-white"
          style={{ background: "var(--grad)" }}
        >
          SDC
        </div>
        <span className="hidden md:inline font-extrabold text-[.88rem]" style={{ color: "var(--text)" }}>
          SDC INDIA · Student Developers Community
        </span>
        <span className="md:hidden font-extrabold text-sm" style={{ color: "var(--text)" }}>
          SDC INDIA
        </span>
      </Link>

      {/* Desktop nav — all items including Host CTA on one line */}
      <ul className="hidden lg:flex items-center gap-1 list-none m-0 p-0">
        {NAV_ITEMS.map((item) => (
          <li key={item.href}>
            <Link
              href={item.href}
              className="block text-[.8rem] font-medium px-3.5 py-1.5 rounded-md transition-all"
              style={
                item.cta
                  ? {
                      color: "#fff",
                      background: "var(--grad)",
                      fontWeight: 700,
                      boxShadow: "0 0 18px rgba(232,67,147,.25)",
                    }
                  : {
                      color: isActive(item.href) ? "var(--text)" : "var(--sub)",
                      background: isActive(item.href) ? "rgba(232,67,147,.1)" : "transparent",
                      border: isActive(item.href) ? "1px solid rgba(232,67,147,.2)" : "1px solid transparent",
                    }
              }
            >
              {item.label}
            </Link>
          </li>
        ))}
      </ul>

      {/* Mobile menu toggle */}
      <button
        aria-label="Toggle navigation"
        onClick={() => setMobileOpen((v) => !v)}
        className="lg:hidden w-9 h-9 rounded-md flex items-center justify-center"
        style={{ border: "1px solid var(--border2)", background: "var(--card)" }}
      >
        <span className="text-white text-lg">{mobileOpen ? "✕" : "☰"}</span>
      </button>

      {/* Mobile menu */}
      {mobileOpen && (
        <ul
          className="lg:hidden absolute top-full left-0 right-0 flex flex-col gap-1 list-none m-0 p-3 backdrop-blur-xl"
          style={{ background: "rgba(8,8,8,.97)", borderBottom: "1px solid var(--border)" }}
        >
          {NAV_ITEMS.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className="block text-sm font-medium px-3 py-2.5 rounded-md"
                style={
                  item.cta
                    ? { color: "#fff", background: "var(--grad)", fontWeight: 700, textAlign: "center" }
                    : {
                        color: isActive(item.href) ? "var(--text)" : "var(--sub)",
                        background: isActive(item.href) ? "rgba(232,67,147,.1)" : "transparent",
                      }
                }
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </nav>
  );
}
