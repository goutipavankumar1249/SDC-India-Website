"use client";

import { forwardRef } from "react";

type CommonProps = {
  label: string;
  name: string;
  hint?: string;
  error?: string;
  required?: boolean;
};

export const Field = forwardRef<HTMLInputElement, CommonProps & React.InputHTMLAttributes<HTMLInputElement>>(
  function Field({ label, name, hint, error, required, ...rest }, ref) {
    return (
      <label className="block">
        <span className="block text-[.66rem] mb-1 uppercase tracking-wider" style={{ color: "var(--sub)" }}>
          {label}{required && <span style={{ color: "var(--a1)" }}> *</span>}
        </span>
        <input
          ref={ref}
          name={name}
          required={required}
          {...rest}
          className="w-full px-3 py-2 rounded-md text-[.86rem] outline-none transition-colors"
          style={{
            background: "var(--surface)",
            border: `1px solid ${error ? "#f87171" : "var(--border)"}`,
            color: "var(--text)",
          }}
        />
        {hint && !error && <p className="text-[.66rem] mt-1" style={{ color: "var(--muted)" }}>{hint}</p>}
        {error && <p className="text-[.7rem] mt-1" style={{ color: "#f87171" }}>{error}</p>}
      </label>
    );
  }
);

export function TextArea({
  label, name, hint, error, required, rows = 3, ...rest
}: CommonProps & React.TextareaHTMLAttributes<HTMLTextAreaElement> & { rows?: number }) {
  return (
    <label className="block">
      <span className="block text-[.66rem] mb-1 uppercase tracking-wider" style={{ color: "var(--sub)" }}>
        {label}{required && <span style={{ color: "var(--a1)" }}> *</span>}
      </span>
      <textarea
        name={name}
        required={required}
        rows={rows}
        {...rest}
        className="w-full px-3 py-2 rounded-md text-[.86rem] outline-none transition-colors resize-y"
        style={{
          background: "var(--surface)",
          border: `1px solid ${error ? "#f87171" : "var(--border)"}`,
          color: "var(--text)",
        }}
      />
      {hint && !error && <p className="text-[.66rem] mt-1" style={{ color: "var(--muted)" }}>{hint}</p>}
      {error && <p className="text-[.7rem] mt-1" style={{ color: "#f87171" }}>{error}</p>}
    </label>
  );
}

export function Select({
  label, name, hint, error, required, options, defaultValue,
}: CommonProps & { options: { value: string; label: string }[]; defaultValue?: string }) {
  return (
    <label className="block">
      <span className="block text-[.66rem] mb-1 uppercase tracking-wider" style={{ color: "var(--sub)" }}>
        {label}{required && <span style={{ color: "var(--a1)" }}> *</span>}
      </span>
      <select
        name={name}
        required={required}
        defaultValue={defaultValue ?? ""}
        className="w-full px-3 py-2 rounded-md text-[.86rem] outline-none"
        style={{
          background: "var(--surface)",
          border: `1px solid ${error ? "#f87171" : "var(--border)"}`,
          color: "var(--text)",
        }}
      >
        <option value="">— select —</option>
        {options.map((o) => (
          <option key={o.value} value={o.value} style={{ background: "#1a1a1a" }}>{o.label}</option>
        ))}
      </select>
      {hint && !error && <p className="text-[.66rem] mt-1" style={{ color: "var(--muted)" }}>{hint}</p>}
      {error && <p className="text-[.7rem] mt-1" style={{ color: "#f87171" }}>{error}</p>}
    </label>
  );
}

export function Checkbox({
  label, name, hint, defaultChecked,
}: { label: string; name: string; hint?: string; defaultChecked?: boolean }) {
  return (
    <label className="inline-flex items-start gap-2 cursor-pointer select-none">
      <input
        type="checkbox"
        name={name}
        defaultChecked={defaultChecked}
        className="mt-1 w-4 h-4 cursor-pointer"
        style={{ accentColor: "var(--a1)" }}
      />
      <span>
        <span className="block text-[.85rem]">{label}</span>
        {hint && <span className="block text-[.7rem]" style={{ color: "var(--muted)" }}>{hint}</span>}
      </span>
    </label>
  );
}
