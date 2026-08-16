import type { Metadata } from "next";
import { Phone, Mail, MapPin, Clock, Navigation, ArrowRight } from "lucide-react";
import { WhatsAppIcon } from "@/components/ui/whatsapp-icon";
import { ContactForm } from "@/components/forms/contact-form";
import { Breadcrumbs } from "@/components/catalog/breadcrumbs";
import { JsonLd } from "@/components/seo/json-ld";
import { buildMetadata, localBusinessJsonLd, breadcrumbJsonLd } from "@/lib/seo";
import { getSettings } from "@/lib/settings";
import { siteConfig } from "@/config/site";

export const revalidate = 3600;

export const metadata: Metadata = buildMetadata({
  title: `Contact & Location — ${siteConfig.name} in ${siteConfig.city}`,
  description: `Visit or contact ${siteConfig.name}, your electric, sanitary and fancy lights shop in ${siteConfig.city}. Find our address, phone number, WhatsApp and opening hours.`,
  path: "/contact",
});

export default async function ContactPage() {
  let settings;
  try {
    settings = await getSettings();
  } catch {
    settings = null;
  }
  const phone = settings?.phone || siteConfig.contact.phone;
  const phone2 = settings?.phone2 || siteConfig.contact.phone2;
  const whatsappHref =
    settings?.whatsappLink || siteConfig.contact.whatsappLink;
  const email = settings?.email || siteConfig.contact.email;
  const address = settings?.address || siteConfig.contact.fullAddress;
  // Accept either a full Google Maps URL or a plain address/place typed in
  // Admin → Settings; build a proper embed/link from a plain value so the map
  // always works.
  const rawEmbed = settings?.mapEmbedUrl || siteConfig.contact.mapEmbedUrl;
  const rawLink = settings?.mapLink || siteConfig.contact.mapLink;
  const isUrl = (v: string) => /^https?:\/\//i.test(v.trim());
  const mapEmbedUrl = isUrl(rawEmbed)
    ? rawEmbed
    : `https://www.google.com/maps?q=${encodeURIComponent(rawEmbed.trim())}&output=embed`;
  const mapLink = isUrl(rawLink)
    ? rawLink
    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(rawLink.trim())}`;

  return (
    <div className="container-page py-6">
      <JsonLd
        data={[
          localBusinessJsonLd({ phone, address }),
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Contact", path: "/contact" },
          ]),
        ]}
      />
      <Breadcrumbs items={[{ name: "Home", path: "/" }, { name: "Contact", path: "/contact" }]} />

      <h1 className="mt-4 text-2xl font-extrabold text-brand-dark sm:text-3xl">
        Contact &amp; Visit Us
      </h1>
      <p className="mt-2 max-w-2xl text-muted">
        Have a question about a product, price or your order? Reach out or visit our
        shop in {siteConfig.city}. We&apos;re happy to help builders, electricians,
        plumbers and homeowners.
      </p>

      <div className="mt-8 grid gap-8 lg:grid-cols-2">
        <div className="space-y-6">
          <div data-reveal className="grid gap-4 sm:grid-cols-2">
            <InfoCard Icon={MapPin} title="Address">
              {address}
            </InfoCard>
            <InfoCard Icon={Phone} title="Phone">
              <a href={`tel:${phone}`} className="hover:text-brand">{phone}</a>
              {phone2 && (
                <>
                  <br />
                  <a href={`tel:${phone2}`} className="hover:text-brand">
                    {phone2}
                  </a>
                </>
              )}
            </InfoCard>
            <ActionCard
              Icon={WhatsAppIcon}
              title="WhatsApp"
              subtitle="Chat with us instantly"
              href={whatsappHref}
              cta="Chat on WhatsApp"
              tone="whatsapp"
              external
            />
            <ActionCard
              Icon={Mail}
              title="Email"
              subtitle={email}
              href={`mailto:${email}`}
              cta="Send us an Email"
              tone="brand"
            />
          </div>

          <div data-reveal className="rounded-xl bg-white p-5 shadow-card ring-1 ring-black/5">
            <h2 className="flex items-center gap-2 font-bold text-brand-dark">
              <Clock className="h-5 w-5" /> Opening Hours
            </h2>
            <ul className="mt-3 space-y-1.5 text-sm">
              {siteConfig.hours.map((h) => (
                <li key={h.days} className="flex justify-between border-b border-black/5 py-1 last:border-0">
                  <span className="font-medium text-ink">{h.days}</span>
                  <span className="text-muted">
                    {h.close ? `${h.open} – ${h.close}` : h.open}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div className="overflow-hidden rounded-xl shadow-card ring-1 ring-black/5">
            <iframe
              title="Shop location map"
              src={mapEmbedUrl}
              width="100%"
              height="280"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="block border-0"
            />
            <a
              href={mapLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 bg-brand py-3 text-sm font-semibold text-white hover:bg-brand-dark"
            >
              <Navigation className="h-4 w-4" /> Get Directions
            </a>
          </div>
        </div>

        <ContactForm />
      </div>
    </div>
  );
}

/**
 * A contact card that is itself the button: the whole card is a link and
 * carries a clear call-to-action, so tapping anywhere opens WhatsApp or the
 * customer's email app.
 */
function ActionCard({
  Icon,
  title,
  subtitle,
  href,
  cta,
  tone,
  external = false,
}: {
  Icon: React.ComponentType<{ className?: string }>;
  title: string;
  subtitle: string;
  href: string;
  cta: string;
  tone: "whatsapp" | "brand";
  external?: boolean;
}) {
  const isWa = tone === "whatsapp";
  return (
    <a
      href={href}
      {...(external
        ? { target: "_blank", rel: "noopener noreferrer" }
        : {})}
      className="group flex flex-col rounded-xl bg-white p-4 shadow-card ring-1 ring-black/5 transition-all duration-200 hover:-translate-y-1 hover:shadow-lg"
    >
      <span
        className={`grid h-10 w-10 place-items-center rounded-lg ${
          isWa ? "bg-[#25D366]/12 text-[#25D366]" : "bg-brand-light text-brand"
        }`}
      >
        <Icon className="h-5 w-5" />
      </span>
      <p className="mt-3 font-bold text-ink">{title}</p>
      <p className="mt-0.5 break-all text-sm text-muted">{subtitle}</p>
      <span
        className={`mt-4 inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all duration-200 ${
          isWa
            ? "bg-[#25D366] group-hover:bg-[#1FBE5A] group-hover:shadow-[0_6px_18px_rgba(37,211,102,0.45)]"
            : "bg-brand group-hover:bg-brand-dark group-hover:shadow-[0_6px_18px_rgba(14,82,87,0.35)]"
        }`}
      >
        {cta}
        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
      </span>
    </a>
  );
}

function InfoCard({
  Icon,
  title,
  children,
}: {
  Icon: React.ComponentType<{ className?: string }>;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl bg-white p-4 shadow-card ring-1 ring-black/5">
      <span className="grid h-10 w-10 place-items-center rounded-lg bg-brand-light text-brand">
        <Icon className="h-5 w-5" />
      </span>
      <p className="mt-2 text-sm font-bold text-ink">{title}</p>
      <p className="text-sm text-muted">{children}</p>
    </div>
  );
}
