import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/admin/page-header";
import { ProductsTable, type AdminProductRow } from "@/components/admin/products-table";

export default async function AdminProductsPage() {
  let products: AdminProductRow[] = [];
  try {
    const rows = await prisma.product.findMany({
      orderBy: { updatedAt: "desc" },
      include: {
        category: { select: { name: true } },
        brand: { select: { name: true } },
        images: { take: 1, orderBy: { sortOrder: "asc" }, select: { url: true } },
      },
    });
    products = rows.map((p) => ({
      id: p.id,
      name: p.name,
      slug: p.slug,
      price: Number(p.price),
      inStock: p.inStock,
      featured: p.featured,
      isActive: p.isActive,
      categoryName: p.category.name,
      brandName: p.brand?.name ?? null,
      image: p.images[0]?.url ?? null,
    }));
  } catch {
    /* DB not ready */
  }

  return (
    <div>
      <PageHeader
        title="Products"
        subtitle={`${products.length} product(s). Update prices and photos here anytime.`}
        actionLabel="Add Product"
        actionHref="/admin/products/new"
        secondaryLabel="Add Products in Bulk"
        secondaryHref="/admin/products/import"
      />

      {products.length === 0 ? (
        <div className="rounded-xl border border-dashed border-brand/20 bg-white p-10 text-center text-muted">
          No products yet. Click <strong>Add Product</strong> to create your first one.
        </div>
      ) : (
        <ProductsTable products={products} />
      )}
    </div>
  );
}
