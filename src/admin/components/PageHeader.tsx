import Link from "next/link";

export default function PageHeader({
  label, title, description, actions,
}: {
  label?: string;
  title: string;
  description?: string;
  actions?: React.ReactNode;
}) {
  return (
    <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        {label && (
          <p className="text-[.68rem] uppercase tracking-widest" style={{ color: "var(--a1)" }}>
            // {label}
          </p>
        )}
        <h1 className="text-[1.55rem] font-extrabold mt-1">{title}</h1>
        {description && (
          <p className="text-[.85rem] mt-1 max-w-xl" style={{ color: "var(--sub)" }}>
            {description}
          </p>
        )}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </header>
  );
}

export function BackLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="inline-block text-[.78rem] mb-3 transition-colors hover:text-white"
      style={{ color: "var(--sub)" }}
    >
      ← {label}
    </Link>
  );
}
