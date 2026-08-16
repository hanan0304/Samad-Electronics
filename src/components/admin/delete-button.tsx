"use client";

import { useState, useTransition } from "react";
import { Trash2, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

type ActionResult = { ok: true } | { ok: false; error: string };

export function DeleteButton({
  id,
  action,
  label = "Delete",
  confirmText = "Are you sure you want to delete this? This cannot be undone.",
  compact = false,
}: {
  id: string;
  action: (id: string) => Promise<ActionResult>;
  label?: string;
  confirmText?: string;
  compact?: boolean;
}) {
  const [pending, startTransition] = useTransition();
  const [busy, setBusy] = useState(false);
  const router = useRouter();

  function onClick() {
    if (!window.confirm(confirmText)) return;
    setBusy(true);
    startTransition(async () => {
      const res = await action(id);
      setBusy(false);
      if (!res.ok) {
        window.alert(res.error);
      } else {
        router.refresh();
      }
    });
  }

  const loading = pending || busy;

  if (compact) {
    return (
      <button
        onClick={onClick}
        disabled={loading}
        aria-label={label}
        className="rounded-md p-2 text-muted hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
      >
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
      </button>
    );
  }

  return (
    <button
      onClick={onClick}
      disabled={loading}
      className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 px-3 py-1.5 text-sm font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50"
    >
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
      {label}
    </button>
  );
}
