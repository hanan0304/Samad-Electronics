import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Phone, Mail } from "lucide-react";
import { WhatsAppIcon } from "@/components/ui/whatsapp-icon";
import type { QuotationStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { formatDateTime } from "@/lib/utils";
import { StatusSelect } from "@/components/admin/status-select";
import { updateQuotationStatusAction } from "@/app/admin/actions";

const OPTIONS: { value: QuotationStatus; label: string }[] = [
  { value: "NEW", label: "New" },
  { value: "RESPONDED", label: "Responded" },
  { value: "CLOSED", label: "Closed" },
];

export default async function AdminQuotationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const quote = await prisma.quotation
    .findUnique({ where: { id }, include: { items: true } })
    .catch(() => null);
  if (!quote) notFound();

  const wa = quote.phone.replace(/[^\d]/g, "");

  return (
    <div>
      <Link href="/admin/quotations" className="inline-flex items-center gap-1 text-sm font-semibold text-brand hover:underline">
        <ArrowLeft className="h-4 w-4" /> Back to quotations
      </Link>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-brand-dark">
            Quotation <span className="font-mono">{quote.quoteNumber}</span>
          </h1>
          <p className="text-sm text-muted">{formatDateTime(quote.createdAt)}</p>
        </div>
        <StatusSelect id={quote.id} current={quote.status} options={OPTIONS} action={updateQuotationStatusAction} />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="overflow-hidden rounded-xl bg-white shadow-card ring-1 ring-black/5">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-xs uppercase tracking-wide text-muted">
                  <th className="p-3">Product</th>
                  <th className="p-3 text-center">Quantity</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {quote.items.map((item) => (
                  <tr key={item.id}>
                    <td className="p-3 font-medium text-ink">{item.productName}</td>
                    <td className="p-3 text-center text-muted">{item.quantity}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {quote.message && (
            <div className="mt-4 rounded-xl bg-white p-4 shadow-card ring-1 ring-black/5">
              <h2 className="text-sm font-bold text-brand-dark">Message</h2>
              <p className="mt-1 text-sm text-muted">{quote.message}</p>
            </div>
          )}
        </div>

        <aside className="h-fit space-y-3 rounded-xl bg-white p-5 shadow-card ring-1 ring-black/5">
          <h2 className="font-bold text-brand-dark">Customer</h2>
          <p className="font-semibold text-ink">{quote.customerName}</p>
          <a href={`tel:${quote.phone}`} className="flex items-center gap-2 text-sm text-muted hover:text-brand">
            <Phone className="h-4 w-4 text-brand" /> {quote.phone}
          </a>
          <a href={`https://wa.me/${wa}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-muted hover:text-brand">
            <WhatsAppIcon className="h-4 w-4 text-[#25D366]" /> WhatsApp customer
          </a>
          {quote.email && (
            <a href={`mailto:${quote.email}`} className="flex items-center gap-2 break-all text-sm text-muted hover:text-brand">
              <Mail className="h-4 w-4 text-brand" /> {quote.email}
            </a>
          )}
        </aside>
      </div>
    </div>
  );
}
