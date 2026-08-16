import type { Metadata } from "next";
import { OrderForm } from "@/components/forms/order-form";
import { Breadcrumbs } from "@/components/catalog/breadcrumbs";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Checkout — Place Your Order",
  description: "Enter your details to place your order. We'll confirm by phone or WhatsApp.",
  path: "/checkout",
  noindex: true,
});

export default function CheckoutPage() {
  return (
    <div className="container-page py-6">
      <Breadcrumbs
        items={[
          { name: "Home", path: "/" },
          { name: "Cart", path: "/cart" },
          { name: "Checkout", path: "/checkout" },
        ]}
      />
      <h1 className="mt-4 mb-6 text-2xl font-extrabold text-brand-dark">
        Place Your Order
      </h1>
      <OrderForm />
    </div>
  );
}
