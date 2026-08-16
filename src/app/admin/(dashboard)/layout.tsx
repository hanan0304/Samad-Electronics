import type { Metadata } from "next";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getSettings } from "@/lib/settings";
import { AdminShell, type AdminCounts } from "@/components/admin/admin-shell";

export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};

// Admin data must never be cached.
export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireAdmin();

  let counts: AdminCounts = { orders: 0, quotations: 0, inquiries: 0 };
  let shopName = "Samad Traders";
  try {
    const [orders, quotations, inquiries, settings] = await Promise.all([
      prisma.order.count({ where: { status: "NEW" } }),
      prisma.quotation.count({ where: { status: "NEW" } }),
      prisma.contactInquiry.count({ where: { status: "NEW" } }),
      getSettings(),
    ]);
    counts = { orders, quotations, inquiries };
    shopName = settings.shopName;
  } catch {
    /* DB not ready */
  }

  return (
    <AdminShell
      counts={counts}
      adminName={session.name || session.email}
      shopName={shopName}
    >
      {children}
    </AdminShell>
  );
}
