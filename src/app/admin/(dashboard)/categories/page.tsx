import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/admin/page-header";
import { CategoryManager, type CategoryRow } from "@/components/admin/category-manager";

export default async function AdminCategoriesPage() {
  let categories: CategoryRow[] = [];
  try {
    const rows = await prisma.category.findMany({
      orderBy: [{ department: "asc" }, { sortOrder: "asc" }],
      include: { _count: { select: { products: true } } },
    });
    categories = rows.map((c) => ({
      id: c.id,
      name: c.name,
      department: c.department,
      description: c.description,
      sortOrder: c.sortOrder,
      isActive: c.isActive,
      productCount: c._count.products,
    }));
  } catch {
    /* DB not ready */
  }

  return (
    <div>
      <PageHeader title="Categories" subtitle="Organize your products into categories for browsing and SEO." />
      <CategoryManager categories={categories} />
    </div>
  );
}
