"use client";

import { useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { loginAction } from "@/admin/lib/actions/auth";

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "/admin";

  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setFieldErrors({});
    const formData = new FormData(e.currentTarget);
    formData.set("next", next);

    startTransition(async () => {
      const result = await loginAction(formData);
      if (result.ok) {
        router.push(result.redirectTo ?? "/admin");
        router.refresh();
      } else {
        setError(result.error);
        if (result.fieldErrors) setFieldErrors(result.fieldErrors);
      }
    });
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-3">
      <Field label="Email" name="email" type="email" autoComplete="email" autoFocus error={fieldErrors.email} />
      <Field label="Password" name="password" type="password" autoComplete="current-password" error={fieldErrors.password} />

      {error && (
        <p className="text-[.78rem]" style={{ color: "#f87171" }}>
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="btn-grad w-full mt-1"
        style={{ padding: ".7rem", fontSize: ".88rem", opacity: pending ? 0.6 : 1 }}
      >
        {pending ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}

function Field({
  label, name, type = "text", autoComplete, autoFocus, error,
}: {
  label: string; name: string; type?: string; autoComplete?: string; autoFocus?: boolean; error?: string;
}) {
  return (
    <label className="block">
      <span className="block text-[.66rem] mb-1 uppercase tracking-wider" style={{ color: "var(--sub)" }}>{label}</span>
      <input
        name={name}
        type={type}
        autoComplete={autoComplete}
        autoFocus={autoFocus}
        required
        className="w-full px-3 py-2 rounded-md text-[.86rem] outline-none transition-colors"
        style={{
          background: "var(--surface)",
          border: `1px solid ${error ? "#f87171" : "var(--border)"}`,
          color: "var(--text)",
        }}
      />
      {error && <p className="text-[.7rem] mt-1" style={{ color: "#f87171" }}>{error}</p>}
    </label>
  );
}
