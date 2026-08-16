import { prisma } from "@/lib/prisma";
import { DEPARTMENT_META } from "@/lib/departments";
import { PageHeader } from "@/components/admin/page-header";
import { ProductImport } from "@/components/admin/product-import";

export default async function ImportProductsPage() {
  let categories: { id: string; name: string }[] = [];
  try {
    const rows = await prisma.category.findMany({
      orderBy: [{ department: "asc" }, { sortOrder: "asc" }],
    });
    categories = rows.map((c) => ({
      id: c.id,
      name: `${DEPARTMENT_META[c.department].label} — ${c.name}`,
    }));
  } catch {
    /* DB not ready */
  }

  return (
    <div>
      <PageHeader
        title="Add Products in Bulk"
        subtitle="Upload a price list and add many products at once instead of one by one."
      />
      <ProductImport categories={categories} />
    </div>
  );
}
