import Link from "next/link";
import { Eye, Phone } from "lucide-react";
import type { OrderStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { formatPrice, formatDateTime } from "@/lib/utils";
import { PageHeader } from "@/components/admin/page-header";
import { StatusSelect } from "@/components/admin/status-select";
import { updateOrderStatusAction } from "@/app/admin/actions";

const ORDER_OPTIONS: { value: OrderStatus; label: string }[] = [
  { value: "NEW", label: "New" },
  { value: "CONFIRMED", label: "Confirmed" },
  { value: "COMPLETED", label: "Completed" },
  { value: "CANCELLED", label: "Cancelled" },
];

export default async function AdminOrdersPage() {
  let orders: {
    id: string;
    orderNumber: string;
    customerName: string;
    phone: string;
    total: unknown;
    status: OrderStatus;
    createdAt: Date;
    _count: { items: number };
  }[] = [];
  try {
    orders = await prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      include: { _count: { select: { items: true } } },
    });
  } catch {
    /* DB not ready */
  }

  return (
    <div>
      <PageHeader title="Orders" subtitle={`${orders.length} order(s) received.`} />

      {orders.length === 0 ? (
        <div className="rounded-xl border border-dashed border-brand/20 bg-white p-10 text-center text-muted">
          No orders yet. They will appear here as soon as customers place them.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl bg-white shadow-card ring-1 ring-black/5">
          <table className="w-full min-w-[820px] text-sm">
            <thead>
              <tr className="border-b text-left text-xs uppercase tracking-wide text-muted">
                <th className="p-3">Order</th>
                <th className="p-3">Customer</th>
                <th className="p-3 text-center">Items</th>
                <th className="p-3 text-right">Total</th>
                <th className="p-3">Status</th>
                <th className="p-3">Date</th>
                <th className="p-3 text-right">View</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {orders.map((o) => (
                <tr key={o.id} className="hover:bg-brand-light/30">
                  <td className="p-3 font-mono font-semibold text-brand">{o.orderNumber}</td>
                  <td className="p-3">
                    <p className="font-semibold text-ink">{o.customerName}</p>
                    <a href={`tel:${o.phone}`} className="flex items-center gap-1 text-xs text-muted hover:text-brand">
                      <Phone className="h-3 w-3" /> {o.phone}
                    </a>
                  </td>
                  <td className="p-3 text-center text-muted">{o._count.items}</td>
                  <td className="p-3 text-right font-bold text-brand">{formatPrice(Number(o.total))}</td>
                  <td className="p-3">
                    <StatusSelect id={o.id} current={o.status} options={ORDER_OPTIONS} action={updateOrderStatusAction} />
                  </td>
                  <td className="p-3 text-xs text-muted">{formatDateTime(o.createdAt)}</td>
                  <td className="p-3 text-right">
                    <Link href={`/admin/orders/${o.id}`} aria-label="View order" className="inline-grid h-8 w-8 place-items-center rounded-md text-brand hover:bg-brand-light">
                      <Eye className="h-4 w-4" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
