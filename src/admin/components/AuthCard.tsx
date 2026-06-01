import Link from "next/link";

/**
 * Centered card layout used by login / signup / forgot / reset pages.
 * Plain server component — no client state.
 */
export default function AuthCard({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <main
      className="min-h-screen flex items-center justify-center p-6"
      style={{ background: "var(--bg)" }}
    >
      <div className="w-full max-w-md">
        {/* Brand */}
        <Link href="/" className="flex items-center justify-center gap-2.5 mb-6 no-underline">
          <div
            className="w-9 h-9 rounded-md flex items-center justify-center text-white text-[.65rem] font-bold"
            style={{ background: "var(--grad)" }}
          >
            SDC
          </div>
          <span className="font-extrabold text-[1rem]" style={{ color: "var(--text)" }}>
            SDC INDIA Admin
          </span>
        </Link>

        {/* Card */}
        <div
          className="rounded-[14px] p-7"
          style={{ background: "var(--card)", border: "1px solid var(--border)" }}
        >
          <h1 className="text-[1.4rem] font-extrabold mb-1">{title}</h1>
          {subtitle && (
            <p className="text-[.84rem] mb-5" style={{ color: "var(--sub)" }}>
              {subtitle}
            </p>
          )}
          {children}
        </div>

        {footer && (
          <div className="mt-5 text-center text-[.78rem]" style={{ color: "var(--sub)" }}>
            {footer}
          </div>
        )}
      </div>
    </main>
  );
}
