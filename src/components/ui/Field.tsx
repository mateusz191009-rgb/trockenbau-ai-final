import * as React from "react";

interface FieldProps {
  label: string;
  htmlFor?: string;
  hint?: string;
  required?: boolean;
  children: React.ReactNode;
}

/** Beschriftung über einem Eingabefeld — groß und gut lesbar. */
export function Field({ label, htmlFor, hint, required, children }: FieldProps) {
  return (
    <div className="space-y-1.5">
      <label
        htmlFor={htmlFor}
        className="block text-base font-semibold text-slate-800 dark:text-slate-200"
      >
        {label}
        {required ? <span className="text-brand-500"> *</span> : null}
      </label>
      {children}
      {hint ? (
        <p className="text-sm text-slate-400">{hint}</p>
      ) : null}
    </div>
  );
}
