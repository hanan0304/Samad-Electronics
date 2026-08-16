"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Lock } from "lucide-react";
import { loginAction } from "@/app/admin/actions";
import { Button } from "@/components/ui/button";
import { inputClass } from "@/components/forms/field";

export function LoginForm() {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(loginAction, null);

  useEffect(() => {
    if (state?.ok) {
      router.replace("/admin");
      router.refresh();
    }
  }, [state, router]);

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <label className="mb-1 block text-sm font-semibold text-ink">Email</label>
        <input name="email" type="email" required className={inputClass} placeholder="owner@samadtraders.example" />
      </div>
      <div>
        <label className="mb-1 block text-sm font-semibold text-ink">Password</label>
        <input name="password" type="password" required className={inputClass} placeholder="••••••••" />
      </div>

      {state && !state.ok && (
        <p className="rounded-lg bg-red-50 px-4 py-2.5 text-sm font-medium text-red-700">
          {state.error}
        </p>
      )}

      <Button type="submit" size="lg" disabled={pending} className="w-full">
        {pending ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" /> Signing in…
          </>
        ) : (
          <>
            <Lock className="h-4 w-4" /> Sign In
          </>
        )}
      </Button>
    </form>
  );
}
