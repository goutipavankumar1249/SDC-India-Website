import HostForm from "@/components/forms/HostForm";

const PERKS = [
  { icon: "🎯", text: "Tailored workshops & events for your students" },
  { icon: "👨‍💻", text: "Expert speakers from SDC's network" },
  { icon: "📦", text: "Full event kit — slides, logistics, promotion" },
  { icon: "🏆", text: "Prizes, certifications, and recognition" },
  { icon: "🤝", text: "Long-term collaboration access" },
  { icon: "📊", text: "Post-event report and feedback" },
];

export default function HostPage() {
  return (
    <main className="pt-16 pb-6">
      <div className="max-w-[1280px] mx-auto px-6">
        <div className="flex items-baseline justify-between gap-4 flex-wrap mb-4">
          <div>
            <div className="sec-label mb-1">// PARTNER WITH SDC</div>
            <h1 className="sec-title" style={{ fontSize: "clamp(1.5rem, 3vw, 2rem)" }}>Host an SDC event at your college</h1>
          </div>
          <p className="text-[.84rem] max-w-md" style={{ color: "var(--sub)" }}>
            We bring the experience, content, and energy — your college provides the venue.
          </p>
        </div>

        <div className="grid lg:grid-cols-[1.3fr_1fr] gap-6">
          {/* Form first/left — prominent */}
          <HostForm />

          {/* Perks on right */}
          <div>
            <div className="text-[.65rem] mb-3 uppercase tracking-widest font-bold" style={{ color: "var(--muted)" }}>
              What you get
            </div>
            <ul className="space-y-2 list-none p-0">
              {PERKS.map((p) => (
                <li key={p.text} className="flex gap-2.5 text-[.82rem] leading-[1.45]" style={{ color: "var(--sub)" }}>
                  <span className="shrink-0 text-[.95rem] mt-0.5">{p.icon}</span>
                  {p.text}
                </li>
              ))}
            </ul>
            <div className="rounded-[10px] p-3 mt-4" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
              <div className="text-[.6rem] mb-1 uppercase tracking-widest" style={{ color: "var(--muted)" }}>Or reach us directly</div>
              <a href="mailto:goutipavankumar1249@gmail.com" className="text-[.82rem] font-semibold break-all" style={{ color: "var(--a1)" }}>
                goutipavankumar1249@gmail.com →
              </a>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
