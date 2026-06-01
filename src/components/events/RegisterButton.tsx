"use client";

import { useState, useTransition } from "react";
import { submitRegistrationAction } from "@/lib/actions/public-forms";

export default function RegisterButton({
  eventId,
  eventTitle,
  variant = "primary",
}: {
  eventId: string;
  eventTitle: string;
  variant?: "primary" | "outline";
}) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null); setSuccess(null); setFieldErrors({});
    const fd = new FormData(e.currentTarget);
    fd.set("event_id", eventId);
    startTransition(async () => {
      const r = await submitRegistrationAction(fd);
      if (r.ok) setSuccess(r.message);
      else { setError(r.error); if (r.fieldErrors) setFieldErrors(r.fieldErrors); }
    });
  }

  return (
    <>
      <button
        type="button"
        onClick={() => { setOpen(true); setSuccess(null); setError(null); }}
        className={variant === "primary" ? "btn-grad" : "btn-outline"}
        style={{ fontSize: ".85rem", padding: ".58rem 1.35rem" }}
      >
        Register Now →
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[400] flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,.7)", backdropFilter: "blur(6px)" }}
          onClick={(e) => { if (e.target === e.currentTarget) setOpen(false); }}
        >
          <div
            className="w-full max-w-md rounded-[16px] p-6 max-h-[90vh] overflow-y-auto"
            style={{ background: "var(--card)", border: "1px solid var(--border2)" }}
          >
            <div className="flex items-start justify-between gap-3 mb-4">
              <div>
                <p className="text-[.66rem] uppercase tracking-widest" style={{ color: "var(--a1)" }}>// Register</p>
                <h2 className="font-extrabold text-[1.15rem] mt-0.5">{eventTitle}</h2>
              </div>
              <button onClick={() => setOpen(false)} aria-label="Close"
                      className="text-[1.2rem] w-7 h-7 rounded flex items-center justify-center"
                      style={{ color: "var(--sub)", background: "var(--surface)", border: "1px solid var(--border)", cursor: "pointer" }}>
                ✕
              </button>
            </div>

            {success ? (
              <div className="text-center py-6">
                <div className="text-4xl mb-3">🎉</div>
                <h3 className="font-extrabold text-[1.05rem] mb-2">You're in!</h3>
                <p className="text-[.86rem] mb-5" style={{ color: "var(--sub)" }}>{success}</p>
                <button onClick={() => setOpen(false)} className="btn-outline" style={{ fontSize: ".82rem" }}>
                  Done
                </button>
              </div>
            ) : (
              <form onSubmit={onSubmit} className="grid gap-3">
                <Field label="Full name *" name="name" placeholder="Your name" required error={fieldErrors.name} />
                <Field label="Email *" type="email" name="email" placeholder="you@email.com" required error={fieldErrors.email} />
                <Field label="Phone" type="tel" name="phone" placeholder="+91 …" error={fieldErrors.phone} />
                <Field label="College" name="college" placeholder="e.g. SNIST" error={fieldErrors.college} />
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Year of study" name="year_of_study" placeholder="e.g. 3rd year" />
                  <Field label="Branch" name="branch" placeholder="e.g. CSE" />
                </div>
                <label className="block">
                  <span className="block text-[.62rem] mb-0.5 uppercase tracking-wider" style={{ color: "var(--sub)" }}>Notes (optional)</span>
                  <textarea
                    name="notes"
                    rows={2}
                    placeholder="Dietary needs, accessibility, t-shirt size, etc."
                    className="w-full px-2.5 py-1.5 rounded-md text-[.82rem] outline-none resize-y"
                    style={{ background: "var(--surface)", border: "1px solid var(--border)", color: "var(--text)" }}
                  />
                </label>

                {error && (
                  <p className="text-[.78rem]" style={{ color: "#f87171" }}>{error}</p>
                )}

                <button type="submit" disabled={pending} className="btn-grad w-full mt-1"
                        style={{ padding: ".65rem", fontSize: ".86rem", opacity: pending ? 0.6 : 1 }}>
                  {pending ? "Registering…" : "Confirm registration"}
                </button>
                <p className="text-[.66rem] text-center" style={{ color: "var(--muted)" }}>
                  Your details are stored securely. We&apos;ll email you details before the event.
                </p>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}

function Field({ label, name, type = "text", placeholder, required, error }: { label: string; name: string; type?: string; placeholder?: string; required?: boolean; error?: string }) {
  return (
    <label className="block">
      <span className="block text-[.62rem] mb-0.5 uppercase tracking-wider" style={{ color: "var(--sub)" }}>{label}</span>
      <input
        name={name}
        type={type}
        required={required}
        placeholder={placeholder}
        className="w-full px-2.5 py-1.5 rounded-md text-[.83rem] outline-none"
        style={{ background: "var(--surface)", border: `1px solid ${error ? "#f87171" : "var(--border)"}`, color: "var(--text)" }}
      />
      {error && <p className="text-[.65rem] mt-1" style={{ color: "#f87171" }}>{error}</p>}
    </label>
  );
}
