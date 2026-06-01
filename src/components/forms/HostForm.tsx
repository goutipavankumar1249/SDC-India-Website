"use client";

import { useState, useTransition } from "react";
import { submitHostRequestAction } from "@/lib/actions/public-forms";

const EVENT_TYPES = ["Hackathon", "Workshop", "Dev Talk", "Bootcamp", "UI/UX Sprint", "AI/ML Workshop"];
const SIZES = ["50–100", "100–200", "200–500", "500+"];

export default function HostForm() {
  const [pending, startTransition] = useTransition();
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null); setSuccess(null); setFieldErrors({});
    const fd = new FormData(e.currentTarget);
    const formEl = e.currentTarget;
    startTransition(async () => {
      const r = await submitHostRequestAction(fd);
      if (r.ok) {
        setSuccess(r.message);
        formEl.reset();
      } else {
        setError(r.error);
        if (r.fieldErrors) setFieldErrors(r.fieldErrors);
      }
    });
  }

  if (success) {
    return (
      <div
        className="rounded-[14px] p-7 text-center"
        style={{ background: "var(--card)", border: "1px solid var(--border)" }}
      >
        <div className="text-4xl mb-3">🎉</div>
        <h3 className="font-extrabold text-[1.1rem] mb-2">Request submitted</h3>
        <p className="text-[.86rem]" style={{ color: "var(--sub)" }}>{success}</p>
        <button
          onClick={() => setSuccess(null)}
          className="mt-5 text-[.78rem]"
          style={{ color: "var(--a1)", background: "transparent", border: "none", cursor: "pointer" }}
        >
          Submit another →
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="rounded-[14px] p-4" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
      <h3 className="font-extrabold text-[.88rem] mb-3">📋 Submit a Hosting Request</h3>

      <div className="grid gap-2">
        <div className="grid grid-cols-2 gap-2">
          <Field label="Name *"        name="name"        placeholder="Ravi Shankar"        required error={fieldErrors.name} />
          <Field label="Designation"   name="designation" placeholder="Student Coordinator"        error={fieldErrors.designation} />
        </div>
        <Field label="College *" name="college" placeholder="MGIT, Hyderabad" required error={fieldErrors.college} />
        <div className="grid grid-cols-2 gap-2">
          <Field label="Email *" type="email" name="email" placeholder="you@college.edu.in" required error={fieldErrors.email} />
          <Field label="Phone"   type="tel"   name="phone" placeholder="+91 XXXXX XXXXX"            error={fieldErrors.phone} />
        </div>
        <div className="grid grid-cols-3 gap-2">
          <Select label="Event type" name="event_type" options={EVENT_TYPES} />
          <Field  label="Date"       type="date" name="preferred_date" />
          <Select label="Size"       name="expected_size" options={SIZES} />
        </div>
        <Field label="City *" name="city" placeholder="Hyderabad" required error={fieldErrors.city} />
        <label className="block">
          <span className="block text-[.62rem] mb-0.5 uppercase tracking-wider" style={{ color: "var(--sub)" }}>Details</span>
          <textarea
            name="details"
            rows={2}
            placeholder="Event description, facilities, requirements..."
            className="w-full px-2.5 py-1.5 rounded-md text-[.82rem] outline-none resize-y"
            style={{ background: "var(--surface)", border: "1px solid var(--border)", color: "var(--text)", minHeight: "48px" }}
          />
        </label>

        {error && (
          <p className="text-[.78rem]" style={{ color: "#f87171" }}>{error}</p>
        )}

        <button
          type="submit"
          disabled={pending}
          className="btn-grad w-full"
          style={{ padding: ".55rem", fontSize: ".82rem", opacity: pending ? 0.6 : 1 }}
        >
          {pending ? "Submitting…" : "Submit Hosting Request →"}
        </button>
        <p className="text-[.6rem] text-center" style={{ color: "var(--muted)" }}>
          📧 We'll reach out within 48 hours.
        </p>
      </div>
    </form>
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
        className="w-full px-2.5 py-1.5 rounded-md text-[.82rem] outline-none"
        style={{ background: "var(--surface)", border: `1px solid ${error ? "#f87171" : "var(--border)"}`, color: "var(--text)" }}
      />
      {error && <p className="text-[.66rem] mt-1" style={{ color: "#f87171" }}>{error}</p>}
    </label>
  );
}

function Select({ label, name, options }: { label: string; name: string; options: string[] }) {
  return (
    <label className="block">
      <span className="block text-[.62rem] mb-0.5 uppercase tracking-wider" style={{ color: "var(--sub)" }}>{label}</span>
      <select
        name={name}
        className="w-full px-2.5 py-1.5 rounded-md text-[.82rem] outline-none"
        style={{ background: "var(--surface)", border: "1px solid var(--border)", color: "var(--text)" }}
      >
        <option value="">—</option>
        {options.map((o) => <option key={o} value={o} style={{ background: "#1a1a1a" }}>{o}</option>)}
      </select>
    </label>
  );
}
