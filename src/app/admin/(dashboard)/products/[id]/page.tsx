import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { DEPARTMENT_META } from "@/lib/departments";
import { PageHeader } from "@/components/admin/page-header";
import { ProductForm, type ProductFormInitial } from "@/components/admin/product-form";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [product, categories, brands] = await Promise.all([
    prisma.product.findUnique({
      where: { id },
      include: { images: { orderBy: { sortOrder: "asc" } } },
    }),
    prisma.category.findMany({ orderBy: [{ department: "asc" }, { sortOrder: "asc" }] }),
    prisma.brand.findMany({ orderBy: { name: "asc" } }),
  ]);

  if (!product) notFound();

  const specs = Array.isArray(product.specs)
    ? (product.specs as unknown as { label: string; value: string }[])
    : [];

  const initial: ProductFormInitial = {
    id: product.id,
    name: product.name,
    shortDesc: product.shortDesc || "",
    description: product.description || "",
    price: String(Number(product.price)),
    oldPrice: product.oldPrice ? String(Number(product.oldPrice)) : "",
    unit: product.unit,
    sku: product.sku || "",
    categoryId: product.categoryId,
    brandId: product.brandId || "",
    inStock: product.inStock,
    featured: product.featured,
    isActive: product.isActive,
    specs,
    images: product.images.map((i) => ({ url: i.url, alt: i.alt || "" })),
  };

  return (
    <div>
      <PageHeader title="Edit Product" subtitle={product.name} />
      <ProductForm
        initial={initial}
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
