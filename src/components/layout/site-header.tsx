import { getNavCategories } from "@/lib/data";
import { getSettings } from "@/lib/settings";
import { HeaderClient, type NavData } from "./header-client";

/** Server component: loads nav categories + shop settings, then renders the header. */
export async function SiteHeader() {
  let nav: NavData = { ELECTRIC: [], SANITARY: [], FANCY_LIGHTS: [] };
  let phone = "";
  let phone2 = "";
  let shopName = "Samad Traders";

  try {
    const [cats, settings] = await Promise.all([
      getNavCategories(),
      getSettings(),
    ]);
    nav = {
      ELECTRIC: cats.ELECTRIC.map((c) => ({ name: c.name, slug: c.slug })),
      SANITARY: cats.SANITARY.map((c) => ({ name: c.name, slug: c.slug })),
      FANCY_LIGHTS: cats.FANCY_LIGHTS.map((c) => ({
        name: c.name,
        slug: c.slug,
      })),
    };
    phone = settings.phone;
    phone2 = settings.phone2;
    shopName = settings.shopName;
  } catch {
    // Database not configured yet — render a usable header with empty menus.
  }

  return (
    <HeaderClient nav={nav} phone={phone} phone2={phone2} shopName={shopName} />
  );
}
