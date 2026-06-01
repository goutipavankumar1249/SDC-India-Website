"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV = [
  { href: "/about", label: "About" },
  { href: "/events", label: "Events" },
  { href: "/highlights", label: "Highlights" },
  { href: "/team", label: "Team" },
  { href: "/blog", label: "Blog" },
];

const INVOLVED = [
  { href: "/host", label: "Host an Event", external: false },
  { href: "/contact", label: "Contact Us", external: false },
  { href: "https://github.com/SDC", label: "Open Source", external: true },
];

const CONNECT = [
  { href: "mailto:hello@sdcindia.tech",             value: "hello@sdcindia.tech" },
  { href: "https://sdcindia.tech",                  value: "sdcindia.tech" },
  { href: "https://github.com/SDC",                 value: "github.com/SDC" },
  { href: "https://linkedin.com/company/sdc-snist", value: "SDC SNIST" },
  { href: "https://instagram.com/sdc.snist",        value: "@sdc.snist" },
];

export default function Footer() {
  const pathname = usePathname();
  // Hide on admin pages
  if (pathname.startsWith("/admin")) return null;

  return (
    <footer
      className="mt-12 w-full pt-6 pb-4"
      style={{ borderTop: "1px solid var(--border)", background: "var(--surface)" }}
    >
      <div className="mx-auto max-w-[1280px] px-6 grid gap-6 md:grid-cols-4 md:gap-8 items-start">
        {/* Brand — uses the same heading style as other columns for alignment */}
        <div>
          <h4 className="mb-3 text-[.7rem] font-bold uppercase tracking-widest" style={{ color: "var(--text)" }}>
            SDC INDIA
          </h4>
          <div className="flex items-center gap-2 mb-2">
            <div
              className="w-7 h-7 rounded-md flex items-center justify-center text-white text-[.55rem] font-bold"
              style={{ background: "var(--grad)" }}
            >
              SDC
            </div>
            <span className="font-extrabold text-[.82rem]" style={{ color: "var(--text)" }}>SDC INDIA</span>
          </div>
          <p className="text-[.76rem] leading-relaxed" style={{ color: "var(--sub)" }}>
            Student-led developer community founded in 2022 at SNIST.
          </p>
        </div>

        <FooterColumn title="Navigation">
          {NAV.map(({ href, label }) => (
            <li key={href}>
              <Link href={href} className="text-[.8rem] transition-colors hover:text-white" style={{ color: "var(--sub)" }}>
                {label}
              </Link>
            </li>
          ))}
        </FooterColumn>

        <FooterColumn title="Get Involved">
          {INVOLVED.map((item) => (
            <li key={item.href}>
              {item.external ? (
                <a href={item.href} target="_blank" rel="noopener" className="text-[.8rem] transition-colors hover:text-white" style={{ color: "var(--sub)" }}>
                  {item.label}
                </a>
              ) : (
                <Link href={item.href} className="text-[.8rem] transition-colors hover:text-white" style={{ color: "var(--sub)" }}>
                  {item.label}
                </Link>
              )}
            </li>
          ))}
        </FooterColumn>

        <FooterColumn title="Connect">
          {CONNECT.map((s) => (
            <li key={s.href}>
              <a
                href={s.href}
                target={s.href.startsWith("http") ? "_blank" : undefined}
                rel={s.href.startsWith("http") ? "noopener" : undefined}
                className="text-[.8rem] transition-colors hover:text-white"
                style={{ color: "var(--sub)" }}
              >
                {s.value}
              </a>
            </li>
          ))}
        </FooterColumn>
      </div>

      <div
        className="mx-auto max-w-[1280px] mt-5 pt-3 px-6 flex flex-col md:flex-row items-center justify-between gap-2"
        style={{ borderTop: "1px solid var(--border)" }}
      >
        <span className="text-[.7rem]" style={{ color: "var(--muted)" }}>
          © 2026 SDC INDIA. Built by students, for students.
        </span>
        <span className="text-[.7rem]" style={{ color: "var(--muted)" }}>
          Since 2022 · Hyderabad · India
        </span>
      </div>
    </footer>
  );
}

function FooterColumn({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h4 className="mb-3 text-[.7rem] font-bold uppercase tracking-widest" style={{ color: "var(--text)" }}>
        {title}
      </h4>
      <ul className="space-y-1.5 list-none p-0">{children}</ul>
    </div>
  );
}
