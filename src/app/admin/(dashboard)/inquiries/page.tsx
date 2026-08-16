import { Phone, Mail } from "lucide-react";
import type { InquiryStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { formatDateTime } from "@/lib/utils";
import { PageHeader } from "@/components/admin/page-header";
import { StatusSelect } from "@/components/admin/status-select";
import { updateInquiryStatusAction } from "@/app/admin/actions";

const OPTIONS: { value: InquiryStatus; label: string }[] = [
  { value: "NEW", label: "New" },
  { value: "READ", label: "Read" },
  { value: "RESOLVED", label: "Resolved" },
];

export default async function AdminInquiriesPage() {
  let inquiries: {
    id: string;
    name: string;
    phone: string;
    email: string | null;
    subject: string | null;
    message: string;
    status: InquiryStatus;
    createdAt: Date;
  }[] = [];
  try {
    inquiries = await prisma.contactInquiry.findMany({ orderBy: { createdAt: "desc" } });
  } catch {
    /* DB not ready */
  }

  return (
    <div>
      <PageHeader title="Contact Inquiries" subtitle={`${inquiries.length} message(s).`} />

      {inquiries.length === 0 ? (
        <div className="rounded-xl border border-dashed border-brand/20 bg-white p-10 text-center text-muted">
          No inquiries yet. Messages from the Contact page will appear here.
        </div>
      ) : (
        <div className="space-y-3">
          {inquiries.map((q) => (
            <div key={q.id} className="rounded-xl bg-white p-4 shadow-card ring-1 ring-black/5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-bold text-ink">
                    {q.name}
                    {q.subject && <span className="font-normal text-muted"> · {q.subject}</span>}
                  </p>
                  <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted">
                    <a href={`tel:${q.phone}`} className="flex items-center gap-1 hover:text-brand">
                      <Phone className="h-3 w-3" /> {q.phone}
                    </a>
                    {q.email && (
                      <a href={`mailto:${q.email}`} className="flex items-center gap-1 hover:text-brand">
                        <Mail className="h-3 w-3" /> {q.email}
                      </a>
                    )}
                    <span>{formatDateTime(q.createdAt)}</span>
                  </div>
                </div>
                <StatusSelect id={q.id} current={q.status} options={OPTIONS} action={updateInquiryStatusAction} />
              </div>
              <p className="mt-3 whitespace-pre-wrap border-t pt-3 text-sm text-ink">{q.message}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
