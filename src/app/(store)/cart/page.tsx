import type { Metadata } from "next";
import { CartView } from "@/components/cart/cart-view";
import { Breadcrumbs } from "@/components/catalog/breadcrumbs";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Your Cart",
  description: "Review the items in your cart and place an order or request a quotation.",
  path: "/cart",
  noindex: true,
});

export default function CartPage() {
  return (
    <div className="container-page py-6">
      <Breadcrumbs items={[{ name: "Home", path: "/" }, { name: "Cart", path: "/cart" }]} />
      <h1 className="mt-4 mb-6 text-2xl font-extrabold text-brand-dark">Your Cart</h1>
      <CartView />
    </div>
  );
}
