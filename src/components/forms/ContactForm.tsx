"use client";

import { useState, useTransition } from "react";
import { submitContactAction } from "@/lib/actions/public-forms";

export default function ContactForm() {
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
      const r = await submitContactAction(fd);
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
        className="rounded-[18px] p-7 text-center"
        style={{ background: "var(--card)", border: "1px solid var(--border)" }}
      >
        <div className="text-4xl mb-3">✅</div>
        <h3 className="font-extrabold text-[1.1rem] mb-2">Message sent</h3>
        <p className="text-[.88rem]" style={{ color: "var(--sub)" }}>{success}</p>
        <button
          onClick={() => setSuccess(null)}
          className="mt-5 text-[.78rem]"
          style={{ color: "var(--a1)", background: "transparent", border: "none", cursor: "pointer" }}
        >
          Send another →
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="rounded-[18px] p-6" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
      <h3 className="font-extrabold text-[.95rem] mb-4">Send us a message</h3>
      <div className="grid gap-3">
        <Field label="Name" name="name" placeholder="Your name" required error={fieldErrors.name} />
        <Field label="Email" name="email" type="email" placeholder="you@email.com" required error={fieldErrors.email} />
        <Field label="Subject" name="subject" placeholder="I want to join SDC!" error={fieldErrors.subject} />
        <label className="block">
          <span className="block text-[.65rem] mb-1" style={{ color: "var(--sub)", letterSpacing: ".06em", textTransform: "uppercase" }}>Message</span>
          <textarea
            name="message"
            required
            rows={5}
            placeholder="What's on your mind?"
            className="w-full px-3.5 py-2.5 rounded-lg text-[.86rem] outline-none resize-y"
            style={{ background: "var(--surface)", border: `1px solid ${fieldErrors.message ? "#f87171" : "var(--border)"}`, color: "var(--text)" }}
          />
          {fieldErrors.message && <p className="text-[.7rem] mt-1" style={{ color: "#f87171" }}>{fieldErrors.message}</p>}
        </label>

        {error && (
          <p className="text-[.78rem]" style={{ color: "#f87171" }}>{error}</p>
        )}

        <button
          type="submit"
          disabled={pending}
          className="btn-grad w-full"
          style={{ padding: ".85rem", opacity: pending ? 0.6 : 1 }}
        >
          {pending ? "Sending…" : "Send Message →"}
        </button>
      </div>
    </form>
  );
}

function Field({ label, name, type = "text", placeholder, required, error }: { label: string; name: string; type?: string; placeholder?: string; required?: boolean; error?: string }) {
  return (
    <label className="block">
      <span className="block text-[.65rem] mb-1" style={{ color: "var(--sub)", letterSpacing: ".06em", textTransform: "uppercase" }}>{label}</span>
      <input
        name={name}
        type={type}
        required={required}
        placeholder={placeholder}
        className="w-full px-3.5 py-2.5 rounded-lg text-[.86rem] outline-none"
        style={{ background: "var(--surface)", border: `1px solid ${error ? "#f87171" : "var(--border)"}`, color: "var(--text)" }}
      />
      {error && <p className="text-[.7rem] mt-1" style={{ color: "#f87171" }}>{error}</p>}
    </label>
  );
}
