import { PageHeader } from "@/components/admin/page-header";
import { SettingsForm, type SettingsValues } from "@/components/admin/settings-form";
import { AccountForm, type AccountValues } from "@/components/admin/account-form";
import { getSettings } from "@/lib/settings";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function AdminSettingsPage() {
  let values: SettingsValues = {
    shopName: "",
    phone: "",
    phone2: "",
    whatsapp: "",
    whatsappLink: "",
    email: "",
    address: "",
    mapEmbedUrl: "",
    mapLink: "",
    facebook: "",
    instagram: "",
  };
  try {
    const [s, row] = await Promise.all([
      getSettings(),
      // Raw row: the link field must show what is actually stored, not the
      // one auto-built from the number.
      prisma.setting.findUnique({
        where: { id: "main" },
        select: { whatsappLink: true },
      }),
    ]);
    values = {
      shopName: s.shopName,
      phone: s.phone,
      phone2: s.phone2,
      whatsapp: s.whatsapp,
      whatsappLink: row?.whatsappLink || "",
      email: s.email,
      address: s.address,
      mapEmbedUrl: s.mapEmbedUrl,
      mapLink: s.mapLink,
      facebook: s.facebook,
      instagram: s.instagram,
    };
  } catch {
    /* DB not ready */
  }

  // The signed-in admin's own login details.
  let account: AccountValues = { name: "", email: "" };
  try {
    const session = await getSession();
    if (session) {
      const user = await prisma.adminUser.findUnique({
        where: { id: session.userId },
        select: { name: true, email: true },
      });
      account = { name: user?.name || "", email: user?.email || session.email };
    }
  } catch {
    /* DB not ready */
  }

  return (
    <div>
      <PageHeader
        title="Settings"
        subtitle="Update your shop's contact details, map and social links. These show on your website."
      />
      <SettingsForm initial={values} />

      <div className="mt-12 border-t border-black/10 pt-8">
        <h2 className="text-xl font-extrabold text-brand-dark">My Account</h2>
        <p className="mb-6 mt-1 text-sm text-muted">
          Change the email and password you use to sign in here. These are
          private — they never appear on your website.
        </p>
        <AccountForm initial={account} />
      </div>
    </div>
  );
}
