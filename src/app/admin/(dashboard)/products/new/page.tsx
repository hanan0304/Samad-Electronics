import { prisma } from "@/lib/prisma";
import { DEPARTMENT_META } from "@/lib/departments";
import { PageHeader } from "@/components/admin/page-header";
import { ProductForm } from "@/components/admin/product-form";

export default async function NewProductPage() {
  // Degrade like the rest of the admin instead of throwing a raw error page.
  let categories: Awaited<ReturnType<typeof prisma.category.findMany>> = [];
  let brands: Awaited<ReturnType<typeof prisma.brand.findMany>> = [];
  try {
    [categories, brands] = await Promise.all([
      prisma.category.findMany({ orderBy: [{ department: "asc" }, { sortOrder: "asc" }] }),
      prisma.brand.findMany({ orderBy: { name: "asc" } }),
    ]);
  } catch {
    /* DB not ready */
  }

  return (
    <div>
      <PageHeader title="Add Product" subtitle="Create a new product for your store." />
      <ProductForm
        categories={categories.map((c) => ({
          id: c.id,
          name: `${DEPARTMENT_META[c.department].label} — ${c.name}`,
          department: c.department,
        }))}
        brands={brands.map((b) => ({ id: b.id, name: b.name }))}
      />
    </div>
  );
}
