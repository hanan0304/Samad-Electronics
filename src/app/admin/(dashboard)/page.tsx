import Link from "next/link";
import {
  Package,
  ShoppingCart,
  FileText,
  MessageSquare,
  FolderTree,
  ArrowRight,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import { formatPrice, formatDateTime } from "@/lib/utils";
import { StatusBadge } from "@/components/admin/status-badge";

export default async function AdminDashboard() {
  let data = {
    products: 0,
    categories: 0,
    newOrders: 0,
    totalOrders: 0,
    newQuotes: 0,
    newInquiries: 0,
    recentOrders: [] as {
      id: string;
      orderNumber: string;
      customerName: string;
      total: unknown;
      status: string;
      createdAt: Date;
    }[],
  };
  let dbError = false;

  try {
    const [
      products,
      categories,
      newOrders,
      totalOrders,
      newQuotes,
      newInquiries,
      recentOrders,
    ] = await Promise.all([
      prisma.product.count(),
      prisma.category.count(),
      prisma.order.count({ where: { status: "NEW" } }),
      prisma.order.count(),
      prisma.quotation.count({ where: { status: "NEW" } }),
      prisma.contactInquiry.count({ where: { status: "NEW" } }),
      prisma.order.findMany({
        orderBy: { createdAt: "desc" },
        take: 6,
        select: {
          id: true,
          orderNumber: true,
          customerName: true,
          total: true,
          status: true,
          createdAt: true,
        },
      }),
    ]);
    data = {
      products,
      categories,
      newOrders,
      totalOrders,
      newQuotes,
      newInquiries,
      recentOrders,
    };
  } catch {
    dbError = true;
  }

  const stats = [
    { label: "Products", value: data.products, href: "/admin/products", Icon: Package },
    { label: "Categories", value: data.categories, href: "/admin/categories", Icon: FolderTree },
    { label: "New Orders", value: data.newOrders, href: "/admin/orders", Icon: ShoppingCart, highlight: data.newOrders > 0 },
    { label: "New Quotations", value: data.newQuotes, href: "/admin/quotations", Icon: FileText, highlight: data.newQuotes > 0 },
    { label: "New Inquiries", value: data.newInquiries, href: "/admin/inquiries", Icon: MessageSquare, highlight: data.newInquiries > 0 },
  ];

  return (
    <div>
      <h1 className="text-2xl font-extrabold text-brand-dark">Dashboard</h1>
      <p className="text-sm text-muted">Welcome back — here&apos;s what&apos;s happening in your store.</p>

      {dbError && (
        <div className="mt-4 rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-800 ring-1 ring-amber-200">
          Could not reach the database. Make sure your Supabase{" "}
          <code className="font-mono">DATABASE_URL</code> is set in <code>.env</code>{" "}
          and you have run <code className="font-mono">npm run db:push</code> and{" "}
          <code className="font-mono">npm run db:seed</code>.
        </div>
      )}

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {stats.map(({ label, value, href, Icon, highlight }) => (
          <Link
            key={label}
            href={href}
            className={`rounded-xl bg-white p-5 shadow-card ring-1 transition hover:shadow-lg ${
              highlight ? "ring-accent/50" : "ring-black/5"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="grid h-10 w-10 place-items-center rounded-lg bg-brand-light text-brand">
                <Icon className="h-5 w-5" />
              </span>
              {highlight && (
                <span className="rounded-full bg-accent px-2 py-0.5 text-[11px] font-bold text-brand-darker">
                  New
                </span>
              )}
            </div>
            <p className="mt-3 text-2xl font-extrabold text-ink">{value}</p>
            <p className="text-sm text-muted">{label}</p>
          </Link>
        ))}
      </div>

      <div className="mt-8 rounded-xl bg-white shadow-card ring-1 ring-black/5">
        <div className="flex items-center justify-between border-b p-4">
          <h2 className="font-bold text-brand-dark">Recent Orders</h2>
          <Link href="/admin/orders" className="flex items-center gap-1 text-sm font-semibold text-brand hover:underline">
            View all <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        {data.recentOrders.length === 0 ? (
          <p className="p-6 text-sm text-muted">No orders yet.</p>
        ) : (
          <div className="divide-y">
            {data.recentOrders.map((o) => (
              <Link
                key={o.id}
                href={`/admin/orders/${o.id}`}
                className="flex items-center justify-between gap-3 p-4 hover:bg-brand-light/40"
              >
                <div className="min-w-0">
                  <p className="font-semibold text-ink">
                    {o.orderNumber} · {o.customerName}
                  </p>
                  <p className="text-xs text-muted">{formatDateTime(o.createdAt)}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-bold text-brand">
                    {formatPrice(Number(o.total))}
                  </span>
                  <StatusBadge status={o.status} />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
