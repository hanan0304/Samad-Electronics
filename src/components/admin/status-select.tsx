"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

type ActionResult = { ok: true } | { ok: false; error: string };

export function StatusSelect<T extends string>({
  id,
  current,
  options,
  action,
}: {
  id: string;
  current: T;
  options: { value: T; label: string }[];
  action: (id: string, status: T) => Promise<ActionResult>;
}) {
  const router = useRouter();
  const [value, setValue] = useState<T>(current);
  const [pending, startTransition] = useTransition();

  function onChange(next: T) {
    const prev = value;
    setValue(next);
    startTransition(async () => {
      const res = await action(id, next);
      if (!res.ok) {
        setValue(prev);
        window.alert(res.error);
      } else {
        router.refresh();
      }
    });
  }

  return (
    <span className="inline-flex items-center gap-1.5">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as T)}
        disabled={pending}
        className="rounded-lg border border-brand/20 bg-white px-2.5 py-1.5 text-sm font-medium outline-none focus:border-brand disabled:opacity-60"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      {pending && <Loader2 className="h-4 w-4 animate-spin text-brand" />}
    </span>
  );
}
