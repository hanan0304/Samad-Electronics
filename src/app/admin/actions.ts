"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import {
  requireAdmin,
  verifyCredentials,
  createSession,
  destroySession,
  hashPassword,
} from "@/lib/auth";
import {
  createSignedProductImageUpload,
  createSignedDocumentUpload,
  deleteProductImageByUrl,
  isStorageConfigured,
} from "@/lib/supabase";
import {
  MAX_UPLOAD_BYTES,
  MAX_UPLOAD_MB,
  ACCEPTED_HINT,
  isAllowedType,
  MAX_DOC_BYTES,
  MAX_DOC_MB,
  ACCEPTED_DOC_HINT,
  isAllowedDocType,
  formatMB,
} from "@/lib/upload-constants";
import {
  loginSchema,
  accountSchema,
  productSchema,
  categorySchema,
  brandSchema,
  certificateSchema,
  settingsSchema,
} from "@/lib/validations";
import { toSlug, formatPrice } from "@/lib/utils";
import { parseProductFile, parseDepartment, type ImportRow } from "@/lib/product-import";
import { getSettings } from "@/lib/settings";
import { notifyCustomer } from "@/lib/notify";
import {
  orderConfirmedSubject,
  orderConfirmedLines,
  orderConfirmedHtml,
} from "@/lib/order-messages";
import { siteConfig } from "@/config/site";
import type { Department, OrderStatus, QuotationStatus, InquiryStatus } from "@prisma/client";

type Result = { ok: true } | { ok: false; error: string };

/** Refresh the storefront caches after a catalog change. */
function revalidateStore() {
  revalidatePath("/", "layout");
}

// ---- Auth ------------------------------------------------------------------

export async function loginAction(
  _prev: unknown,
  formData: FormData
): Promise<Result> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message || "Invalid input." };
  }
  const user = await verifyCredentials(parsed.data.email, parsed.data.password);
  if (!user) return { ok: false, error: "Incorrect email or password." };
  await createSession(user);
  return { ok: true };
}

export async function logoutAction() {
  await destroySession();
  redirect("/admin/login");
}

/**
 * Change the signed-in admin's own login email, display name and password.
 *
 * The current password must always be supplied and is verified first, so an
 * unattended open session cannot be used to take over the account. The session
 * cookie is re-issued afterwards so the new email takes effect immediately.
 */
export async function updateAccountAction(
  formData: FormData
): Promise<Result> {
  const session = await requireAdmin();

  const parsed = accountSchema.safeParse({
    name: formData.get("name") || "",
    email: formData.get("email"),
    currentPassword: formData.get("currentPassword"),
    newPassword: formData.get("newPassword") || "",
    confirmPassword: formData.get("confirmPassword") || "",
  });
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message || "Please check the form.",
    };
  }
  const d = parsed.data;

  try {
    const user = await prisma.adminUser.findUnique({
      where: { id: session.userId },
    });
    if (!user) return { ok: false, error: "Account not found." };

    // Always prove you know the current password.
    const ok = await bcrypt.compare(d.currentPassword, user.passwordHash);
    if (!ok) return { ok: false, error: "Your current password is incorrect." };

    const email = d.email.toLowerCase().trim();
    if (email !== user.email) {
      const taken = await prisma.adminUser.findUnique({ where: { email } });
      if (taken) {
        return { ok: false, error: "That email is already used by another admin." };
      }
    }

    const name = d.name?.trim() || null;
    await prisma.adminUser.update({
      where: { id: user.id },
      data: {
        email,
        name,
        ...(d.newPassword
          ? { passwordHash: await hashPassword(d.newPassword) }
          : {}),
      },
    });

    // Keep the visitor signed in under the new details.
    await createSession({ userId: user.id, email, name });
    revalidatePath("/admin/settings");
    return { ok: true };
  } catch (e) {
    console.error("[updateAccount] failed:", e);
    return { ok: false, error: "Could not update your account. Please try again." };
  }
}

// ---- Image upload (signed URL — bytes go browser → Supabase directly) -------

export type CreateUploadUrlResult =
  | {
      ok: true;
      signedUrl: string;
      token: string;
      path: string;
      bucket: string;
      publicUrl: string;
    }
  | { ok: false; message: string };

/**
 * Mint a signed upload URL for one image. The browser then uploads the bytes
 * straight to Supabase Storage (see uploadImageFromBrowser), so nothing large
 * is ever POSTed to this Server Action — this is what removes the old ~4.5 MB
 * Vercel body-limit failure. Size/type are validated here as well as on the
 * client, using the shared upload constants.
 */
export async function createUploadUrlAction(
  fileName: string,
  fileType: string,
  fileSize: number
): Promise<CreateUploadUrlResult> {
  await requireAdmin();
  if (!isStorageConfigured) {
    return {
      ok: false,
      message:
        "Image storage is not set up yet. Add your Supabase keys in the environment to enable photo uploads.",
    };
  }
  if (!fileType || !isAllowedType(fileType)) {
    return {
      ok: false,
      message: `That file type isn't supported. Please use ${ACCEPTED_HINT}.`,
    };
  }
  if (!Number.isFinite(fileSize) || fileSize <= 0) {
    return { ok: false, message: "That file looks empty. Please choose a photo." };
  }
  if (fileSize > MAX_UPLOAD_BYTES) {
    return {
      ok: false,
      message: `This photo is ${formatMB(fileSize)} — the limit is ${MAX_UPLOAD_MB} MB.`,
    };
  }
  try {
    const signed = await createSignedProductImageUpload(fileName);
    return { ok: true, ...signed };
  } catch (e) {
    console.error("[createUploadUrl] failed:", e);
    const detail = e instanceof Error ? e.message : String(e);
    return { ok: false, message: `Could not start the upload: ${detail}` };
  }
}

// ---- Bulk product import ---------------------------------------------------

/** Read an uploaded spreadsheet and return rows for the admin to review. */
export async function parseImportFileAction(
  formData: FormData
): Promise<
  | { ok: true; rows: ImportRow[] }
  | { ok: false; error: string }
> {
  await requireAdmin();
  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return { ok: false, error: "Please choose a file." };
  }
  if (file.size > 8 * 1024 * 1024) {
    return { ok: false, error: "File is too large (max 8 MB)." };
  }
  const name = file.name.toLowerCase();
  if (!/\.(xlsx|xls|csv)$/.test(name)) {
    return {
      ok: false,
      error:
        "Please upload an Excel file (.xlsx) or a CSV file. PDFs cannot be read reliably — open the PDF and save it as Excel or CSV first.",
    };
  }
  try {
    const { rows, headerProblem } = await parseProductFile(file);
    if (headerProblem) return { ok: false, error: headerProblem };
    if (rows.length === 0) {
      return { ok: false, error: "No product rows found in that file." };
    }
    return { ok: true, rows };
  } catch (e) {
    console.error("[parseImportFile] failed:", e);
    return {
      ok: false,
      error: "Could not read that file. Please check it opens in Excel.",
    };
  }
}

/**
 * Create the reviewed rows as products.
 *
 * Categories must already exist (matched by name, case-insensitive) because a
 * category also needs a department. Brands are created on the fly, since a
 * brand is just a name.
 */
export async function importProductsAction(
  rows: ImportRow[],
  fallbackCategoryId: string
): Promise<
  | {
      ok: true;
      created: number;
      skipped: { row: number; reason: string }[];
      newCategories: number;
    }
  | { ok: false; error: string }
> {
  await requireAdmin();
  if (!Array.isArray(rows) || rows.length === 0) {
    return { ok: false, error: "Nothing to import." };
  }

  try {
    const [categories, brands] = await Promise.all([
      prisma.category.findMany({
        select: { id: true, name: true, department: true },
      }),
      prisma.brand.findMany({ select: { id: true, name: true } }),
    ]);
    // name → { id, department } so we can both match and know the department.
    const catByName = new Map(
      categories.map((c) => [c.name.toLowerCase(), { id: c.id, department: c.department }])
    );
    const brandByName = new Map(brands.map((b) => [b.name.toLowerCase(), b.id]));
    const usedCatSlugs = new Set(
      (await prisma.category.findMany({ select: { slug: true } })).map((c) => c.slug)
    );

    // Department of the fallback category, used as the default when a row gives
    // a new category name but no department of its own.
    const fallbackDept =
      (fallbackCategoryId &&
        categories.find((c) => c.id === fallbackCategoryId)?.department) ||
      "ELECTRIC";

    // No categories yet is fine — they are auto-created from the sheet below.

    async function uniqueCategorySlug(base: string): Promise<string> {
      const root = toSlug(base) || "category";
      let slug = root;
      let n = 1;
      while (usedCatSlugs.has(slug)) {
        n += 1;
        slug = `${root}-${n}`;
      }
      usedCatSlugs.add(slug);
      return slug;
    }

    const skipped: { row: number; reason: string }[] = [];
    let created = 0;
    let newCategories = 0;

    for (const r of rows) {
      if (r.errors?.length) {
        skipped.push({ row: r.row, reason: r.errors.join(", ") });
        continue;
      }

      // ---- Category: match by name, else create it on the fly ----
      let categoryId: string | null = null;
      const catName = r.category?.trim();
      if (catName) {
        const existing = catByName.get(catName.toLowerCase());
        if (existing) {
          categoryId = existing.id;
        } else {
          // New category: put it under the row's department, or the fallback's.
          const dept = parseDepartment(r.department) || fallbackDept;
          const cat = await prisma.category.create({
            data: {
              name: catName,
              slug: await uniqueCategorySlug(catName),
              department: dept,
              isActive: true,
            },
          });
          catByName.set(catName.toLowerCase(), { id: cat.id, department: dept });
          categoryId = cat.id;
          newCategories += 1;
        }
      } else {
        categoryId = fallbackCategoryId || null;
      }

      if (!categoryId) {
        skipped.push({
          row: r.row,
          reason: "No category given and no default category is set",
        });
        continue;
      }

      // ---- Brand: create the first time we see it ----
      let brandId: string | null = null;
      const brandName = r.brand?.trim();
      if (brandName) {
        const key = brandName.toLowerCase();
        brandId = brandByName.get(key) ?? null;
        if (!brandId) {
          const b = await prisma.brand.create({
            data: { name: brandName, slug: toSlug(brandName) },
          });
          brandId = b.id;
          brandByName.set(key, b.id);
        }
      }

      // ---- SKU: auto-generate from the (unique) slug when not supplied ----
      const slug = await uniqueSlug(r.name);
      const sku = r.sku?.trim() || `ST-${slug}`.slice(0, 60);

      // Photo links from the sheet (Cloudinary or any direct image URL) become
      // this product's images, in the order given (first = main photo).
      const imageUrls = Array.isArray(r.images) ? r.images.slice(0, 8) : [];

      try {
        await prisma.product.create({
          data: {
            name: r.name,
            slug,
            shortDesc: r.shortDesc || null,
            price: r.price ?? 0,
            oldPrice: r.oldPrice ?? null,
            unit: r.unit || "per piece",
            sku,
            categoryId,
            brandId,
            inStock: true,
            isActive: true,
            ...(imageUrls.length
              ? {
                  images: {
                    create: imageUrls.map((url, i) => ({
                      url,
                      alt: r.name,
                      sortOrder: i,
                    })),
                  },
                }
              : {}),
          },
        });
        created += 1;
      } catch (e) {
        console.error("[importProducts] row failed:", r.row, e);
        skipped.push({
          row: r.row,
          reason: "Could not save (duplicate code?)",
        });
      }
    }

    revalidateStore();
    return { ok: true, created, skipped, newCategories };
  } catch (e) {
    console.error("[importProducts] failed:", e);
    return { ok: false, error: "Import failed. Please try again." };
  }
}

// ---- Certificates ----------------------------------------------------------

/** Upload a certificate file (image or PDF) and return its public URL. */
/**
 * Mint a signed upload URL for a certificate FILE (PDF or image). Like
 * createUploadUrlAction, the browser then uploads the bytes straight to Supabase
 * Storage, so large scanned PDFs no longer hit the ~4.5 MB Server Action limit.
 */
export async function createDocumentUploadUrlAction(
  fileName: string,
  fileType: string,
  fileSize: number
): Promise<CreateUploadUrlResult> {
  await requireAdmin();
  if (!isStorageConfigured) {
    return {
      ok: false,
      message:
        "File storage is not set up yet. Add your Supabase keys in the environment to enable uploads.",
    };
  }
  if (!fileType || !isAllowedDocType(fileType)) {
    return {
      ok: false,
      message: `That file type isn't supported. Please upload a ${ACCEPTED_DOC_HINT}.`,
    };
  }
  if (!Number.isFinite(fileSize) || fileSize <= 0) {
    return { ok: false, message: "That file looks empty. Please choose a file." };
  }
  if (fileSize > MAX_DOC_BYTES) {
    return {
      ok: false,
      message: `This file is ${formatMB(fileSize)} — the limit is ${MAX_DOC_MB} MB.`,
    };
  }
  try {
    const signed = await createSignedDocumentUpload(fileName);
    return { ok: true, ...signed };
  } catch (e) {
    console.error("[createDocumentUploadUrl] failed:", e);
    const detail = e instanceof Error ? e.message : String(e);
    return { ok: false, message: `Could not start the upload: ${detail}` };
  }
}

export async function saveCertificateAction(
  formData: FormData
): Promise<Result> {
  await requireAdmin();
  const id = (formData.get("id") as string) || "";
  const parsed = certificateSchema.safeParse({
    name: formData.get("name"),
    logoUrl: formData.get("logoUrl") || "",
    fileUrl: formData.get("fileUrl") || "",
    sortOrder: formData.get("sortOrder") || 0,
  });
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message || "Please check the form.",
    };
  }
  const d = parsed.data;
  const data = {
    name: d.name,
    logoUrl: d.logoUrl || null,
    fileUrl: d.fileUrl || null,
    sortOrder: d.sortOrder,
  };
  try {
    if (id) {
      const existing = await prisma.certificate.findUnique({
        where: { id },
        select: { logoUrl: true, fileUrl: true },
      });
      await prisma.certificate.update({ where: { id }, data });
      // Tidy up files that were replaced.
      for (const [oldUrl, newUrl] of [
        [existing?.logoUrl, data.logoUrl],
        [existing?.fileUrl, data.fileUrl],
      ] as const) {
        if (oldUrl && oldUrl !== newUrl) {
          await deleteProductImageByUrl(oldUrl).catch(() => {});
        }
      }
    } else {
      await prisma.certificate.create({ data });
    }
    revalidateStore();
    return { ok: true };
  } catch (e) {
    console.error("[saveCertificate] failed:", e);
    return { ok: false, error: "Could not save the certificate." };
  }
}

export async function deleteCertificateAction(id: string): Promise<Result> {
  await requireAdmin();
  try {
    const existing = await prisma.certificate.findUnique({
      where: { id },
      select: { logoUrl: true, fileUrl: true },
    });
    await prisma.certificate.delete({ where: { id } });
    for (const url of [existing?.logoUrl, existing?.fileUrl]) {
      if (url) await deleteProductImageByUrl(url).catch(() => {});
    }
    revalidateStore();
    return { ok: true };
  } catch (e) {
    console.error("[deleteCertificate] failed:", e);
    return { ok: false, error: "Could not delete the certificate." };
  }
}

// ---- Products --------------------------------------------------------------

function parseImages(raw: FormDataEntryValue | null): { url: string; alt: string }[] {
  if (typeof raw !== "string" || !raw) return [];
  try {
    const arr = JSON.parse(raw);
    if (!Array.isArray(arr)) return [];
    return arr
      .filter((x) => x && typeof x.url === "string")
      .map((x) => ({ url: String(x.url), alt: String(x.alt || "") }));
  } catch {
    return [];
  }
}

function parseSpecs(raw: FormDataEntryValue | null): { label: string; value: string }[] {
  if (typeof raw !== "string" || !raw) return [];
  try {
    const arr = JSON.parse(raw);
    if (!Array.isArray(arr)) return [];
    return arr
      .filter((x) => x && x.label && x.value)
      .map((x) => ({ label: String(x.label), value: String(x.value) }));
  } catch {
    return [];
  }
}

async function uniqueSlug(base: string): Promise<string> {
  const root = toSlug(base) || "product";
  let slug = root;
  let n = 1;
  while (await prisma.product.findUnique({ where: { slug }, select: { id: true } })) {
    n += 1;
    slug = `${root}-${n}`;
  }
  return slug;
}

export async function saveProductAction(formData: FormData): Promise<Result> {
  await requireAdmin();

  const id = (formData.get("id") as string) || "";
  const parsed = productSchema.safeParse({
    name: formData.get("name"),
    shortDesc: formData.get("shortDesc"),
    description: formData.get("description"),
    price: formData.get("price"),
    oldPrice: formData.get("oldPrice") || undefined,
    unit: formData.get("unit") || "per piece",
    sku: formData.get("sku"),
    categoryId: formData.get("categoryId"),
    brandId: formData.get("brandId") || "",
    inStock: formData.get("inStock") === "on" || formData.get("inStock") === "true",
    featured: formData.get("featured") === "on" || formData.get("featured") === "true",
    isActive: formData.get("isActive") !== "false" && formData.get("isActive") !== null,
    specs: parseSpecs(formData.get("specs")),
  });

  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message || "Please check the form." };
  }
  const d = parsed.data;
  const images = parseImages(formData.get("images"));

  const data = {
    name: d.name,
    shortDesc: d.shortDesc || null,
    description: d.description || null,
    price: d.price,
    oldPrice: d.oldPrice ?? null,
    unit: d.unit || "per piece",
    sku: d.sku || null,
    categoryId: d.categoryId,
    brandId: d.brandId || null,
    inStock: d.inStock,
    featured: d.featured,
    isActive: d.isActive,
    specs: d.specs && d.specs.length ? d.specs : undefined,
  };

  try {
    if (id) {
      // Update: replace image set.
      const existing = await prisma.productImage.findMany({
        where: { productId: id },
        select: { url: true },
      });
      const keptUrls = new Set(images.map((i) => i.url));
      const removed = existing.filter((e) => !keptUrls.has(e.url));

      await prisma.$transaction([
        prisma.product.update({ where: { id }, data }),
        prisma.productImage.deleteMany({ where: { productId: id } }),
        prisma.productImage.createMany({
          data: images.map((img, i) => ({
            productId: id,
            url: img.url,
            alt: img.alt || d.name,
            sortOrder: i,
          })),
        }),
      ]);

      // Best-effort cleanup of removed files.
      await Promise.allSettled(removed.map((r) => deleteProductImageByUrl(r.url)));
    } else {
      const slug = await uniqueSlug(d.name);
      await prisma.product.create({
        data: {
          ...data,
          slug,
          images: {
            create: images.map((img, i) => ({
              url: img.url,
              alt: img.alt || d.name,
              sortOrder: i,
            })),
          },
        },
      });
    }
    revalidateStore();
    return { ok: true };
  } catch (e) {
    console.error("[saveProduct] failed:", e);
    return { ok: false, error: "Could not save the product. Please try again." };
  }
}

export async function deleteProductAction(id: string): Promise<Result> {
  await requireAdmin();
  try {
    const images = await prisma.productImage.findMany({
      where: { productId: id },
      select: { url: true },
    });
    await prisma.product.delete({ where: { id } });
    await Promise.allSettled(images.map((i) => deleteProductImageByUrl(i.url)));
    revalidateStore();
    return { ok: true };
  } catch (e) {
    console.error("[deleteProduct] failed:", e);
    return { ok: false, error: "Could not delete the product." };
  }
}

/** Delete many products at once (bulk delete from the products list). */
export async function deleteProductsAction(
  ids: string[]
): Promise<{ ok: true; deleted: number } | { ok: false; error: string }> {
  await requireAdmin();
  if (!Array.isArray(ids) || ids.length === 0) {
    return { ok: false, error: "No products selected." };
  }
  try {
    const images = await prisma.productImage.findMany({
      where: { productId: { in: ids } },
      select: { url: true },
    });
    const result = await prisma.product.deleteMany({ where: { id: { in: ids } } });
    await Promise.allSettled(images.map((i) => deleteProductImageByUrl(i.url)));
    revalidateStore();
    return { ok: true, deleted: result.count };
  } catch (e) {
    console.error("[deleteProducts] failed:", e);
    return { ok: false, error: "Could not delete the selected products." };
  }
}

// ---- Categories ------------------------------------------------------------

export async function saveCategoryAction(formData: FormData): Promise<Result> {
  await requireAdmin();
  const id = (formData.get("id") as string) || "";
  const parsed = categorySchema.safeParse({
    name: formData.get("name"),
    department: formData.get("department"),
    description: formData.get("description"),
    sortOrder: formData.get("sortOrder") || 0,
    isActive: formData.get("isActive") !== "false" && formData.get("isActive") !== null,
  });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message || "Please check the form." };
  }
  const d = parsed.data;
  const data = {
    name: d.name,
    department: d.department as Department,
    description: d.description || null,
    sortOrder: d.sortOrder,
    isActive: d.isActive,
  };
  try {
    if (id) {
      await prisma.category.update({ where: { id }, data });
    } else {
      let slug = toSlug(d.name);
      let n = 1;
      while (await prisma.category.findUnique({ where: { slug }, select: { id: true } })) {
        n += 1;
        slug = `${toSlug(d.name)}-${n}`;
      }
      await prisma.category.create({ data: { ...data, slug } });
    }
    revalidateStore();
    return { ok: true };
  } catch (e) {
    console.error("[saveCategory] failed:", e);
    return { ok: false, error: "Could not save the category." };
  }
}

export async function deleteCategoryAction(id: string): Promise<Result> {
  await requireAdmin();
  try {
    const count = await prisma.product.count({ where: { categoryId: id } });
    if (count > 0) {
      return {
        ok: false,
        error: `This category has ${count} product(s). Move or delete them first.`,
      };
    }
    await prisma.category.delete({ where: { id } });
    revalidateStore();
    return { ok: true };
  } catch (e) {
    console.error("[deleteCategory] failed:", e);
    return { ok: false, error: "Could not delete the category." };
  }
}

// ---- Brands ----------------------------------------------------------------

export async function saveBrandAction(formData: FormData): Promise<Result> {
  await requireAdmin();
  const id = (formData.get("id") as string) || "";
  const parsed = brandSchema.safeParse({
    name: formData.get("name"),
    logoUrl: formData.get("logoUrl") || "",
    discountPercent: formData.get("discountPercent") || 0,
  });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message || "Please enter a brand name." };
  }
  const logoUrl = parsed.data.logoUrl || null;
  const discountPercent = parsed.data.discountPercent;
  try {
    if (id) {
      const existing = await prisma.brand.findUnique({
        where: { id },
        select: { logoUrl: true },
      });
      await prisma.brand.update({
        where: { id },
        data: {
          name: parsed.data.name,
          slug: toSlug(parsed.data.name),
          logoUrl,
          discountPercent,
        },
      });
      // Clean up the old file if the logo was replaced or removed.
      if (existing?.logoUrl && existing.logoUrl !== logoUrl) {
        await deleteProductImageByUrl(existing.logoUrl).catch(() => {});
      }
    } else {
      await prisma.brand.create({
        data: {
          name: parsed.data.name,
          slug: toSlug(parsed.data.name),
          logoUrl,
          discountPercent,
        },
      });
    }
    revalidateStore();
    return { ok: true };
  } catch (e) {
    console.error("[saveBrand] failed:", e);
    return { ok: false, error: "Could not save the brand (it may already exist)." };
  }
}

export async function deleteBrandAction(id: string): Promise<Result> {
  await requireAdmin();
  try {
    const existing = await prisma.brand.findUnique({
      where: { id },
      select: { logoUrl: true },
    });
    await prisma.product.updateMany({ where: { brandId: id }, data: { brandId: null } });
    await prisma.brand.delete({ where: { id } });
    if (existing?.logoUrl) {
      await deleteProductImageByUrl(existing.logoUrl).catch(() => {});
    }
    revalidateStore();
    return { ok: true };
  } catch (e) {
    console.error("[deleteBrand] failed:", e);
    return { ok: false, error: "Could not delete the brand." };
  }
}

// ---- Status updates --------------------------------------------------------

export async function updateOrderStatusAction(
  id: string,
  status: OrderStatus
): Promise<Result> {
  await requireAdmin();
  try {
    const before = await prisma.order.findUnique({
      where: { id },
      select: { status: true },
    });
    const order = await prisma.order.update({
      where: { id },
      data: { status },
      include: { items: true },
    });
    revalidatePath("/admin/orders");

    // Tell the customer once, the moment their order becomes CONFIRMED.
    if (status === "CONFIRMED" && before?.status !== "CONFIRMED") {
      const settings = await getSettings().catch(() => null);
      const payload = {
        shopName: settings?.shopName || siteConfig.name,
        shopPhone: settings?.phone || siteConfig.contact.phone,
        orderNumber: order.orderNumber,
        customerName: order.customerName,
        items: order.items.map((i) => ({
          name: i.productName,
          quantity: i.quantity,
        })),
        total: formatPrice(Number(order.total)),
        address: [order.address, order.city].filter(Boolean).join(", "),
      };
      // Best-effort: never let a messaging problem fail the confirmation.
      await notifyCustomer({
        toPhone: order.phone,
        toEmail: order.email,
        subject: orderConfirmedSubject(payload),
        lines: orderConfirmedLines(payload),
        html: orderConfirmedHtml(payload),
      }).catch((e) => console.error("[order confirm] notify failed:", e));
    }

    return { ok: true };
  } catch (e) {
    console.error("[updateOrderStatus] failed:", e);
    return { ok: false, error: "Could not update the order." };
  }
}

export async function updateQuotationStatusAction(
  id: string,
  status: QuotationStatus
): Promise<Result> {
  await requireAdmin();
  try {
    await prisma.quotation.update({ where: { id }, data: { status } });
    revalidatePath("/admin/quotations");
    return { ok: true };
  } catch {
    return { ok: false, error: "Could not update the quotation." };
  }
}

export async function updateInquiryStatusAction(
  id: string,
  status: InquiryStatus
): Promise<Result> {
  await requireAdmin();
  try {
    await prisma.contactInquiry.update({ where: { id }, data: { status } });
    revalidatePath("/admin/inquiries");
    return { ok: true };
  } catch {
    return { ok: false, error: "Could not update the inquiry." };
  }
}

// ---- Settings --------------------------------------------------------------

export async function saveSettingsAction(formData: FormData): Promise<Result> {
  await requireAdmin();
  const parsed = settingsSchema.safeParse({
    shopName: formData.get("shopName"),
    phone: formData.get("phone"),
    phone2: formData.get("phone2"),
    whatsapp: formData.get("whatsapp"),
    whatsappLink: formData.get("whatsappLink"),
    email: formData.get("email"),
    address: formData.get("address"),
    mapEmbedUrl: formData.get("mapEmbedUrl"),
    mapLink: formData.get("mapLink"),
    facebook: formData.get("facebook"),
    instagram: formData.get("instagram"),
  });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message || "Please check the form." };
  }
  const d = parsed.data;
  try {
    await prisma.setting.upsert({
      where: { id: "main" },
      update: { ...d },
      create: { id: "main", ...d },
    });
    revalidateStore();
    return { ok: true };
  } catch (e) {
    console.error("[saveSettings] failed:", e);
    return { ok: false, error: "Could not save settings." };
  }
}
