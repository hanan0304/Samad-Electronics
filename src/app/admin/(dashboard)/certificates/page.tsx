import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/admin/page-header";
import {
  CertificateManager,
  type CertificateRow,
} from "@/components/admin/certificate-manager";

export default async function AdminCertificatesPage() {
  let items: CertificateRow[] = [];
  try {
    const rows = await prisma.certificate.findMany({
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    });
    items = rows.map((c) => ({
      id: c.id,
      name: c.name,
      logoUrl: c.logoUrl,
      fileUrl: c.fileUrl,
      sortOrder: c.sortOrder,
    }));
  } catch {
    /* DB not ready */
  }

  return (
    <div>
      <PageHeader
        title="Certificates"
        subtitle="Companies you are officially certified by. These appear on your About page — customers can tap a logo to view the certificate."
      />
      <CertificateManager items={items} />
    </div>
  );
}
