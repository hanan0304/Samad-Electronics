import { organizationJsonLd, websiteJsonLd, localBusinessJsonLd } from "@/lib/seo";
import { JsonLd } from "@/components/seo/json-ld";
import { CartProvider } from "@/components/cart/cart-context";
import { CartDrawer } from "@/components/cart/cart-drawer";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { WhatsAppFab } from "@/components/layout/whatsapp-fab";
import { QuotationFab } from "@/components/layout/quotation-fab";
import { ScrollReveal } from "@/components/ui/scroll-reveal";

/**
 * Chrome for the public storefront only.
 *
 * `/admin` lives outside this route group, so the admin panel renders with its
 * own sidebar and none of the shop header, footer, cart or WhatsApp button.
 * The group name is in brackets, so it does not appear in any URL.
 */
export default function StoreLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      <JsonLd
        data={[organizationJsonLd(), websiteJsonLd(), localBusinessJsonLd()]}
      />
      <ScrollReveal />
      <CartProvider>
        <SiteHeader />
        <main className="flex-1">{children}</main>
        <SiteFooter />
        <CartDrawer />
        <QuotationFab />
        <WhatsAppFab />
      </CartProvider>
    </>
  );
}
