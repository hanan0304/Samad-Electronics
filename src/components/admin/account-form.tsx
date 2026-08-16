"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Save, CheckCircle2, KeyRound, ShieldCheck } from "lucide-react";
import { updateAccountAction } from "@/app/admin/actions";
import { Button } from "@/components/ui/button";
import { Field, inputClass } from "@/components/forms/field";

export type AccountValues = {
  name: string;
  email: string;
};

/** Change the login email, display name and password for the signed-in admin. */
export function AccountForm({ initial }: { initial: AccountValues }) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [submitting, setSubmitting] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setSaved(false);
    const res = await updateAccountAction(new FormData(e.currentTarget));
    setSubmitting(false);
    if (res.ok) {
      setSaved(true);
      // Never leave passwords sitting in the form after a successful save.
      const f = formRef.current;
      if (f) {
        (f.elements.namedItem("currentPassword") as HTMLInputElement).value = "";
        (f.elements.namedItem("newPassword") as HTMLInputElement).value = "";
        (f.elements.namedItem("confirmPassword") as HTMLInputElement).value = "";
      }
      router.refresh();
      setTimeout(() => setSaved(false), 4000);
    } else {
      setError(res.error);
    }
  }

  return (
    <form ref={formRef} onSubmit={onSubmit} className="max-w-2xl space-y-6">
      <div className="space-y-4 rounded-xl bg-white p-5 shadow-card ring-1 ring-black/5">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-brand" />
          <h2 className="font-bold text-brand-dark">My login details</h2>
        </div>
        <p className="text-sm text-muted">
          This is the email and password you use to sign in to this admin panel.
        </p>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Your name" hint="Shown in the sidebar.">
            <input
              name="name"
              defaultValue={initial.name}
              className={inputClass}
              placeholder="Shop Owner"
            />
          </Field>
          <Field label="Login email" hint="You will sign in with this.">
            <input
              name="email"
              type="email"
              required
              defaultValue={initial.email}
              className={inputClass}
            />
          </Field>
        </div>
      </div>

      <div className="space-y-4 rounded-xl bg-white p-5 shadow-card ring-1 ring-black/5">
        <div className="flex items-center gap-2">
          <KeyRound className="h-5 w-5 text-brand" />
          <h2 className="font-bold text-brand-dark">Change password</h2>
        </div>
        <p className="text-sm text-muted">
          Leave both new password boxes empty if you only want to change your
          name or email.
        </p>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="New password" hint="At least 8 characters.">
            <input
              name="newPassword"
              type="password"
              autoComplete="new-password"
              className={inputClass}
              placeholder="••••••••"
            />
          </Field>
          <Field label="Repeat new password">
            <input
              name="confirmPassword"
              type="password"
              autoComplete="new-password"
              className={inputClass}
              placeholder="••••••••"
            />
          </Field>
        </div>
      </div>

      <div className="space-y-4 rounded-xl bg-accent/5 p-5 ring-1 ring-accent/20">
        <Field
          label="Your current password"
          hint="Required to save any change above — this keeps your account safe."
        >
          <input
            name="currentPassword"
            type="password"
            required
            autoComplete="current-password"
            className={inputClass}
            placeholder="••••••••"
          />
        </Field>

        {error && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-700">
            {error}
          </p>
        )}
        {saved && (
          <p className="flex items-center gap-2 rounded-lg bg-green-50 px-3 py-2 text-sm font-medium text-green-700">
            <CheckCircle2 className="h-4 w-4" /> Saved. Use your new details next
            time you sign in.
          </p>
        )}

        <Button type="submit" disabled={submitting}>
          {submitting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          Save login details
        </Button>
      </div>
    </form>
  );
}
