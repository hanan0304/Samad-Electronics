import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/admin/page-header";
import { BrandManager, type BrandRow } from "@/components/admin/brand-manager";

export default async function AdminBrandsPage() {
  let brands: BrandRow[] = [];
  try {
    const rows = await prisma.brand.findMany({
      orderBy: { name: "asc" },
      include: { _count: { select: { products: true } } },
    });
    brands = rows.map((b) => ({
      id: b.id,
      name: b.name,
      logoUrl: b.logoUrl,
      discountPercent: Number(b.discountPercent),
      productCount: b._count.products,
    }));
  } catch {
    /* DB not ready */
  }

  return (
    <div>
      <PageHeader title="Brands" subtitle="Manage the brands customers can filter by." />
      <BrandManager brands={brands} />
    </div>
  );
}
