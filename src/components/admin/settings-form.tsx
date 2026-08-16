"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Save, CheckCircle2 } from "lucide-react";
import { saveSettingsAction } from "@/app/admin/actions";
import { Button } from "@/components/ui/button";
import { Field, inputClass } from "@/components/forms/field";

export type SettingsValues = {
  shopName: string;
  phone: string;
  phone2: string;
  whatsapp: string;
  whatsappLink: string;
  email: string;
  address: string;
  mapEmbedUrl: string;
  mapLink: string;
  facebook: string;
  instagram: string;
};

export function SettingsForm({ initial }: { initial: SettingsValues }) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setSaved(false);
    const res = await saveSettingsAction(new FormData(e.currentTarget));
    setSubmitting(false);
    if (res.ok) {
      setSaved(true);
      router.refresh();
      setTimeout(() => setSaved(false), 3000);
    } else {
      setError(res.error);
    }
  }

  return (
    <form onSubmit={onSubmit} className="max-w-2xl space-y-6">
      <div className="space-y-4 rounded-xl bg-white p-5 shadow-card ring-1 ring-black/5">
        <h2 className="font-bold text-brand-dark">Shop details</h2>
        <Field label="Shop name">
          <input name="shopName" defaultValue={initial.shopName} className={inputClass} />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Phone" hint="Main number shown across the site.">
            <input name="phone" defaultValue={initial.phone} className={inputClass} placeholder="042-35114229" />
          </Field>
          <Field label="Second phone" hint="Optional — e.g. your mobile.">
            <input name="phone2" defaultValue={initial.phone2} className={inputClass} placeholder="0309-5198898" />
          </Field>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            label="WhatsApp number"
            hint="Used to message customers when you confirm an order."
          >
            <input name="whatsapp" defaultValue={initial.whatsapp} className={inputClass} placeholder="0309-5198898" />
          </Field>
          <Field
            label="WhatsApp link"
            hint="Optional wa.me short link. If set, the chat buttons use this."
          >
            <input name="whatsappLink" defaultValue={initial.whatsappLink} className={inputClass} placeholder="https://wa.me/message/XXXX" />
          </Field>
        </div>
        <Field label="Email">
          <input name="email" defaultValue={initial.email} className={inputClass} />
        </Field>
        <Field label="Shop address">
          <textarea name="address" rows={2} defaultValue={initial.address} className={inputClass} />
        </Field>
      </div>

      <div className="space-y-4 rounded-xl bg-white p-5 shadow-card ring-1 ring-black/5">
        <h2 className="font-bold text-brand-dark">Location map</h2>
        <Field
          label="Google Maps embed URL"
          hint='On Google Maps: Share → Embed a map → copy the src="..." link only.'
        >
          <input name="mapEmbedUrl" defaultValue={initial.mapEmbedUrl} className={inputClass} placeholder="https://www.google.com/maps/embed?..." />
        </Field>
        <Field label="Google Maps link" hint="The normal share link for the 'Get Directions' button.">
          <input name="mapLink" defaultValue={initial.mapLink} className={inputClass} placeholder="https://maps.app.goo.gl/..." />
        </Field>
      </div>

      <div className="space-y-4 rounded-xl bg-white p-5 shadow-card ring-1 ring-black/5">
        <h2 className="font-bold text-brand-dark">Social links (optional)</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Facebook URL">
            <input name="facebook" defaultValue={initial.facebook} className={inputClass} />
          </Field>
          <Field label="Instagram URL">
            <input name="instagram" defaultValue={initial.instagram} className={inputClass} />
          </Field>
        </div>
      </div>

      {error && (
        <p className="rounded-lg bg-red-50 px-4 py-3 text-sm font-medium text-red-700">{error}</p>
      )}

      <div className="flex items-center gap-3">
        <Button type="submit" size="lg" disabled={submitting}>
          {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Save settings
        </Button>
        {saved && (
          <span className="flex items-center gap-1 text-sm font-semibold text-green-600">
            <CheckCircle2 className="h-4 w-4" /> Saved
          </span>
        )}
      </div>
    </form>
  );
}
