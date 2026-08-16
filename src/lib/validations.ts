import { z } from "zod";

/** A Pakistani phone number: fairly permissive, digits/spaces/+/- allowed. */
const phone = z
  .string()
  .trim()
  .min(7, "Please enter a valid phone number")
  .max(20, "Phone number is too long")
  .regex(/^[0-9+\-()\s]+$/, "Please enter a valid phone number");

const optionalEmail = z
  .string()
  .trim()
  .email("Please enter a valid email")
  .optional()
  .or(z.literal(""));

/** One line item as it arrives from the cart. */
export const cartItemSchema = z.object({
  productId: z.string().min(1),
  name: z.string().min(1),
  price: z.number().nonnegative(),
  quantity: z.number().int().min(1).max(9999),
});
export type CartItemInput = z.infer<typeof cartItemSchema>;

// ---- Customer-facing forms -------------------------------------------------

export const placeOrderSchema = z.object({
  customerName: z.string().trim().min(2, "Please enter your name").max(120),
  phone,
  email: optionalEmail,
  address: z.string().trim().min(5, "Please enter your delivery address").max(400),
  city: z.string().trim().min(2).max(80).default("Lahore"),
  notes: z.string().trim().max(1000).optional().or(z.literal("")),
  items: z.array(cartItemSchema).min(1, "Your cart is empty"),
});
export type PlaceOrderInput = z.infer<typeof placeOrderSchema>;

export const quotationSchema = z.object({
  customerName: z.string().trim().min(2, "Please enter your name").max(120),
  phone,
  email: optionalEmail,
  message: z.string().trim().max(1000).optional().or(z.literal("")),
  items: z
    .array(
      z.object({
        productId: z.string().min(1),
        name: z.string().min(1),
        quantity: z.number().int().min(1).max(9999),
      })
    )
    .min(1, "Please add at least one item to request a quotation"),
});
export type QuotationInput = z.infer<typeof quotationSchema>;

export const contactSchema = z.object({
  name: z.string().trim().min(2, "Please enter your name").max(120),
  phone,
  email: optionalEmail,
  subject: z.string().trim().max(150).optional().or(z.literal("")),
  message: z.string().trim().min(5, "Please enter a message").max(2000),
});
export type ContactInput = z.infer<typeof contactSchema>;

// ---- Admin forms -----------------------------------------------------------

export const loginSchema = z.object({
  email: z.string().trim().email("Enter a valid email"),
  password: z.string().min(1, "Enter your password"),
});
export type LoginInput = z.infer<typeof loginSchema>;

/**
 * Changing the admin's own login details.
 *
 * The current password is always required — even to change only the email —
 * so that someone who finds an open session cannot lock the owner out.
 * Leave the new password blank to keep the existing one.
 */
export const accountSchema = z
  .object({
    name: z.string().trim().max(120).optional().or(z.literal("")),
    email: z.string().trim().email("Enter a valid email"),
    currentPassword: z.string().min(1, "Enter your current password"),
    newPassword: z
      .string()
      .min(8, "New password must be at least 8 characters")
      .max(200)
      .optional()
      .or(z.literal("")),
    confirmPassword: z.string().optional().or(z.literal("")),
  })
  .refine((d) => !d.newPassword || d.newPassword === d.confirmPassword, {
    message: "The two new passwords do not match",
    path: ["confirmPassword"],
  });
export type AccountInput = z.infer<typeof accountSchema>;

export const specSchema = z.object({
  label: z.string().trim().min(1).max(60),
  value: z.string().trim().min(1).max(120),
});

export const productSchema = z.object({
  name: z.string().trim().min(2, "Product name is required").max(200),
  shortDesc: z.string().trim().max(200).optional().or(z.literal("")),
  description: z.string().trim().max(5000).optional().or(z.literal("")),
  price: z.coerce.number().nonnegative("Price must be 0 or more"),
  oldPrice: z.coerce.number().nonnegative().optional(),
  unit: z.string().trim().max(40).default("per piece"),
  sku: z.string().trim().max(60).optional().or(z.literal("")),
  categoryId: z.string().min(1, "Please choose a category"),
  brandId: z.string().optional().or(z.literal("")),
  inStock: z.boolean().default(true),
  featured: z.boolean().default(false),
  isActive: z.boolean().default(true),
  specs: z.array(specSchema).optional(),
});
export type ProductInput = z.infer<typeof productSchema>;

export const categorySchema = z.object({
  name: z.string().trim().min(2, "Category name is required").max(120),
  department: z.enum(["ELECTRIC", "SANITARY", "FANCY_LIGHTS"]),
  description: z.string().trim().max(2000).optional().or(z.literal("")),
  sortOrder: z.coerce.number().int().default(0),
  isActive: z.boolean().default(true),
});
export type CategoryInput = z.infer<typeof categorySchema>;

export const brandSchema = z.object({
  name: z.string().trim().min(1, "Brand name is required").max(120),
  /** Public URL of the brand logo (uploaded to Supabase Storage). */
  logoUrl: z.string().trim().max(1000).optional().or(z.literal("")),
  /** Percentage off this brand's list prices in the instant quotation. */
  discountPercent: z.coerce
    .number()
    .min(0, "Discount cannot be negative")
    .max(90, "Discount cannot be more than 90%")
    .default(0),
});
export type BrandInput = z.infer<typeof brandSchema>;

export const settingsSchema = z.object({
  shopName: z.string().trim().max(120).optional().or(z.literal("")),
  phone: z.string().trim().max(40).optional().or(z.literal("")),
  phone2: z.string().trim().max(40).optional().or(z.literal("")),
  whatsapp: z.string().trim().max(40).optional().or(z.literal("")),
  whatsappLink: z.string().trim().max(300).optional().or(z.literal("")),
  email: z.string().trim().max(120).optional().or(z.literal("")),
  address: z.string().trim().max(400).optional().or(z.literal("")),
  mapEmbedUrl: z.string().trim().max(1000).optional().or(z.literal("")),
  mapLink: z.string().trim().max(1000).optional().or(z.literal("")),
  facebook: z.string().trim().max(300).optional().or(z.literal("")),
  instagram: z.string().trim().max(300).optional().or(z.literal("")),
});
export type SettingsInput = z.infer<typeof settingsSchema>;

/** An official brand/company certificate shown on the About page. */
export const certificateSchema = z.object({
  name: z.string().trim().min(1, "Company name is required").max(120),
  logoUrl: z.string().trim().max(1000).optional().or(z.literal("")),
  fileUrl: z.string().trim().max(1000).optional().or(z.literal("")),
  sortOrder: z.coerce.number().int().min(0).max(999).default(0),
});
export type CertificateInput = z.infer<typeof certificateSchema>;
