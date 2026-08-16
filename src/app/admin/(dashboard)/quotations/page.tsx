import Link from "next/link";
import { Eye, Phone } from "lucide-react";
import type { QuotationStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { formatDateTime } from "@/lib/utils";
import { PageHeader } from "@/components/admin/page-header";
import { StatusSelect } from "@/components/admin/status-select";
import { updateQuotationStatusAction } from "@/app/admin/actions";

const OPTIONS: { value: QuotationStatus; label: string }[] = [
  { value: "NEW", label: "New" },
  { value: "RESPONDED", label: "Responded" },
  { value: "CLOSED", label: "Closed" },
];

export default async function AdminQuotationsPage() {
  let quotes: {
    id: string;
    quoteNumber: string;
    customerName: string;
    phone: string;
    status: QuotationStatus;
    createdAt: Date;
    _count: { items: number };
  }[] = [];
  try {
    quotes = await prisma.quotation.findMany({
      orderBy: { createdAt: "desc" },
      include: { _count: { select: { items: true } } },
    });
  } catch {
    /* DB not ready */
  }

  return (
    <div>
      <PageHeader title="Quotation Requests" subtitle={`${quotes.length} request(s).`} />

      {quotes.length === 0 ? (
        <div className="rounded-xl border border-dashed border-brand/20 bg-white p-10 text-center text-muted">
          No quotation requests yet.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl bg-white shadow-card ring-1 ring-black/5">
          <table className="w-full min-w-[720px] text-sm">
            <thead>
              <tr className="border-b text-left text-xs uppercase tracking-wide text-muted">
                <th className="p-3">Reference</th>
                <th className="p-3">Customer</th>
                <th className="p-3 text-center">Items</th>
                <th className="p-3">Status</th>
                <th className="p-3">Date</th>
                <th className="p-3 text-right">View</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {quotes.map((q) => (
                <tr key={q.id} className="hover:bg-brand-light/30">
                  <td className="p-3 font-mono font-semibold text-brand">{q.quoteNumber}</td>
                  <td className="p-3">
                    <p className="font-semibold text-ink">{q.customerName}</p>
                    <a href={`tel:${q.phone}`} className="flex items-center gap-1 text-xs text-muted hover:text-brand">
                      <Phone className="h-3 w-3" /> {q.phone}
                    </a>
                  </td>
                  <td className="p-3 text-center text-muted">{q._count.items}</td>
                  <td className="p-3">
                    <StatusSelect id={q.id} current={q.status} options={OPTIONS} action={updateQuotationStatusAction} />
                  </td>
                  <td className="p-3 text-xs text-muted">{formatDateTime(q.createdAt)}</td>
                  <td className="p-3 text-right">
                    <Link href={`/admin/quotations/${q.id}`} aria-label="View" className="inline-grid h-8 w-8 place-items-center rounded-md text-brand hover:bg-brand-light">
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
