import { WhatsAppIcon } from "@/components/ui/whatsapp-icon";
import { getSettings } from "@/lib/settings";
import { siteConfig } from "@/config/site";

/** Floating WhatsApp button for quick customer contact. */
export async function WhatsAppFab() {
  let href: string = siteConfig.contact.whatsappLink;
  try {
    const s = await getSettings();
    href = s.whatsappLink;
  } catch {
    /* use config default */
  }
  if (!href) return null;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat on WhatsApp"
      className="no-print fixed bottom-5 right-5 z-30 grid h-14 w-14 place-items-center rounded-full bg-[#25D366] text-white shadow-lg ring-1 ring-black/5 transition hover:scale-105 hover:bg-[#1FBE5A]"
    >
      <WhatsAppIcon className="h-8 w-8" />
    </a>
  );
}
