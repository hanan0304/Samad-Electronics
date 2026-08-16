import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Phone, Mail, MapPin } from "lucide-react";
import { WhatsAppIcon } from "@/components/ui/whatsapp-icon";
import type { OrderStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { formatPrice, formatDateTime } from "@/lib/utils";
import { StatusSelect } from "@/components/admin/status-select";
import { updateOrderStatusAction } from "@/app/admin/actions";

const ORDER_OPTIONS: { value: OrderStatus; label: string }[] = [
  { value: "NEW", label: "New" },
  { value: "CONFIRMED", label: "Confirmed" },
  { value: "COMPLETED", label: "Completed" },
  { value: "CANCELLED", label: "Cancelled" },
];

export default async function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const order = await prisma.order
    .findUnique({ where: { id }, include: { items: true } })
    .catch(() => null);
  if (!order) notFound();

  const wa = order.phone.replace(/[^\d]/g, "");

  return (
    <div>
      <Link href="/admin/orders" className="inline-flex items-center gap-1 text-sm font-semibold text-brand hover:underline">
        <ArrowLeft className="h-4 w-4" /> Back to orders
      </Link>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-brand-dark">
            Order <span className="font-mono">{order.orderNumber}</span>
          </h1>
          <p className="text-sm text-muted">{formatDateTime(order.createdAt)}</p>
        </div>
        <StatusSelect id={order.id} current={order.status} options={ORDER_OPTIONS} action={updateOrderStatusAction} />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="overflow-hidden rounded-xl bg-white shadow-card ring-1 ring-black/5">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-xs uppercase tracking-wide text-muted">
                  <th className="p-3">Product</th>
                  <th className="p-3 text-right">Price</th>
                  <th className="p-3 text-center">Qty</th>
                  <th className="p-3 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {order.items.map((item) => (
                  <tr key={item.id}>
                    <td className="p-3 font-medium text-ink">{item.productName}</td>
                    <td className="p-3 text-right text-muted">{formatPrice(Number(item.unitPrice))}</td>
                    <td className="p-3 text-center text-muted">{item.quantity}</td>
                    <td className="p-3 text-right font-semibold text-brand">{formatPrice(Number(item.lineTotal))}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t bg-brand-light/40">
                  <td colSpan={3} className="p-3 text-right font-bold text-ink">Total</td>
                  <td className="p-3 text-right text-lg font-extrabold text-brand">{formatPrice(Number(order.total))}</td>
                </tr>
              </tfoot>
            </table>
          </div>

          {order.notes && (
            <div className="mt-4 rounded-xl bg-white p-4 shadow-card ring-1 ring-black/5">
              <h2 className="text-sm font-bold text-brand-dark">Order notes</h2>
              <p className="mt-1 text-sm text-muted">{order.notes}</p>
            </div>
          )}
        </div>

        <aside className="h-fit space-y-3 rounded-xl bg-white p-5 shadow-card ring-1 ring-black/5">
          <h2 className="font-bold text-brand-dark">Customer</h2>
          <p className="font-semibold text-ink">{order.customerName}</p>
          <a href={`tel:${order.phone}`} className="flex items-center gap-2 text-sm text-muted hover:text-brand">
            <Phone className="h-4 w-4 text-brand" /> {order.phone}
          </a>
          <a href={`https://wa.me/${wa}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-muted hover:text-brand">
            <WhatsAppIcon className="h-4 w-4 text-[#25D366]" /> WhatsApp customer
          </a>
          {order.email && (
            <a href={`mailto:${order.email}`} className="flex items-center gap-2 break-all text-sm text-muted hover:text-brand">
              <Mail className="h-4 w-4 text-brand" /> {order.email}
            </a>
          )}
          <div className="flex items-start gap-2 border-t pt-3 text-sm text-muted">
            <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-brand" />
            <span>{order.address}, {order.city}</span>
          </div>
        </aside>
      </div>
    </div>
  );
}
