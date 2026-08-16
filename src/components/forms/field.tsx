import type { ReactNode } from "react";

export const inputClass =
  "w-full rounded-lg border border-brand/20 bg-white px-3.5 py-2.5 text-sm text-ink outline-none placeholder:text-muted/60 focus:border-brand";

export function Field({
  label,
  required,
  hint,
  children,
}: {
  label: string;
  required?: boolean;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-semibold text-ink">
        {label}
        {required && <span className="text-red-500"> *</span>}
      </span>
      {children}
      {hint && <span className="mt-1 block text-xs text-muted">{hint}</span>}
    </label>
  );
}
