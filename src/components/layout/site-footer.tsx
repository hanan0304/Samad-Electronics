import Link from "next/link";
import Image from "next/image";
import { Phone, Mail, MapPin, Share2 } from "lucide-react";
import { WhatsAppIcon } from "@/components/ui/whatsapp-icon";
import { getSettings } from "@/lib/settings";
import { siteConfig } from "@/config/site";

export async function SiteFooter() {
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
  const facebook = settings?.facebook || siteConfig.social.facebook;
  const instagram = settings?.instagram || siteConfig.social.instagram;

  return (
    <footer className="mt-16 bg-brand-darker text-white/85">
      <div className="container-page grid gap-8 py-12 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <div className="flex items-center gap-2.5">
            <Image
              src="/logo-mark-white.png"
              alt=""
              width={467}
              height={711}
              className="h-10 w-auto"
            />
            <span className="text-lg font-extrabold text-white">
              {settings?.shopName || siteConfig.name}
            </span>
          </div>
          <p className="mt-3 text-sm leading-relaxed">
            Your trusted shop in {siteConfig.city} for electrical goods, sanitary
            ware, bathroom fittings and fancy lights. Quality brands, live prices,
            and friendly local service.
          </p>
        </div>

        <div>
          <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-white">
            Shop
          </h3>
          <ul className="space-y-2 text-sm">
            <li><Link href="/electric" className="hover:text-accent">Electric</Link></li>
            <li><Link href="/sanitary" className="hover:text-accent">Sanitary</Link></li>
            <li><Link href="/fancy-lights" className="hover:text-accent">Fancy Lights</Link></li>
            <li><Link href="/products" className="hover:text-accent">All Products</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-white">
            Company
          </h3>
          <ul className="space-y-2 text-sm">
            <li><Link href="/about" className="hover:text-accent">About Us</Link></li>
            <li><Link href="/contact" className="hover:text-accent">Contact</Link></li>
            <li><Link href="/quotation" className="hover:text-accent">Request a Quotation</Link></li>
            <li><Link href="/cart" className="hover:text-accent">Your Cart</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-white">
            Contact
          </h3>
          <ul className="space-y-2.5 text-sm">
            <li className="flex items-start gap-2">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
              <span>{address}</span>
            </li>
            <li>
              <a href={`tel:${phone}`} className="flex items-center gap-2 hover:text-accent">
                <Phone className="h-4 w-4 text-accent" /> {phone}
              </a>
            </li>
            {phone2 && (
              <li>
                <a href={`tel:${phone2}`} className="flex items-center gap-2 hover:text-accent">
                  <Phone className="h-4 w-4 text-accent" /> {phone2}
                </a>
              </li>
            )}
            <li>
              <a
                href={whatsappHref}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 hover:text-accent"
              >
                <WhatsAppIcon className="h-4 w-4 text-[#25D366]" /> WhatsApp
              </a>
            </li>
            <li>
              <a href={`mailto:${email}`} className="flex items-center gap-2 hover:text-accent">
                <Mail className="h-4 w-4 text-accent" /> {email}
              </a>
            </li>
          </ul>
          {(facebook || instagram) && (
            <div className="mt-4 flex gap-3">
              {facebook && (
                <a href={facebook} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-sm hover:text-accent">
                  <Share2 className="h-4 w-4" /> Facebook
                </a>
              )}
              {instagram && (
                <a href={instagram} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-sm hover:text-accent">
                  <Share2 className="h-4 w-4" /> Instagram
                </a>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="container-page flex flex-col items-center justify-between gap-2 py-4 text-xs text-white/60 sm:flex-row">
          <p>
            © {new Date().getFullYear()} {settings?.shopName || siteConfig.name}. All rights reserved.
          </p>
          <p>Electric · Sanitary · Fancy Lights in {siteConfig.city}, {siteConfig.country}</p>
        </div>
      </div>
    </footer>
  );
}
