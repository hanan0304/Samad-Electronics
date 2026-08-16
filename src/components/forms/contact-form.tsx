"use client";

import { useState } from "react";
import { Loader2, Send, CheckCircle2 } from "lucide-react";
import { submitContact } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Field, inputClass } from "./field";

export function ContactForm() {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    const fd = new FormData(e.currentTarget);
    const res = await submitContact({
      name: fd.get("name"),
      phone: fd.get("phone"),
      email: fd.get("email"),
      subject: fd.get("subject"),
      message: fd.get("message"),
    });
    setSubmitting(false);
    if (res.ok) {
      setDone(true);
      (e.target as HTMLFormElement).reset();
    } else {
      setError(res.error);
    }
  }

  if (done) {
    return (
      <div className="rounded-xl bg-white p-8 text-center shadow-card ring-1 ring-black/5">
        <CheckCircle2 className="mx-auto h-14 w-14 text-green-600" />
        <h2 className="mt-3 text-xl font-bold text-ink">Message sent!</h2>
        <p className="mt-2 text-muted">
          Thank you for reaching out. We&apos;ll get back to you as soon as possible.
        </p>
        <button
          onClick={() => setDone(false)}
          className="mt-4 text-sm font-semibold text-brand hover:underline"
        >
          Send another message
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={onSubmit}
      className="space-y-4 rounded-xl bg-white p-5 shadow-card ring-1 ring-black/5"
    >
      <h2 className="text-lg font-bold text-brand-dark">Send us a message</h2>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Your name" required>
          <input name="name" required className={inputClass} placeholder="e.g. Ahmed Ali" />
        </Field>
        <Field label="Phone number" required>
          <input name="phone" required inputMode="tel" className={inputClass} placeholder="03xx-xxxxxxx" />
        </Field>
        <Field label="Email (optional)">
          <input name="email" type="email" className={inputClass} placeholder="you@example.com" />
        </Field>
        <Field label="Subject (optional)">
          <input name="subject" className={inputClass} placeholder="e.g. Product availability" />
        </Field>
      </div>
      <Field label="Message" required>
        <textarea name="message" required rows={4} className={inputClass} placeholder="How can we help you?" />
      </Field>

      {error && (
        <p className="rounded-lg bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {error}
        </p>
      )}

      <Button type="submit" size="lg" disabled={submitting}>
        {submitting ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" /> Sending…
          </>
        ) : (
          <>
            <Send className="h-4 w-4" /> Send Message
          </>
        )}
      </Button>
    </form>
  );
}
