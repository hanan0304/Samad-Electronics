import "server-only";

/**
 * The message a customer receives when the shop confirms their order.
 *
 * Kept in one place so the WhatsApp text and the email say exactly the same
 * thing. Edit the wording here to change both at once.
 */

export type ConfirmationInput = {
  shopName: string;
  shopPhone: string;
  orderNumber: string;
  customerName: string;
  items: { name: string; quantity: number }[];
  total: string;
  address: string;
};

/** Plain-text lines — used for WhatsApp and as the email's text fallback. */
export function orderConfirmedLines(o: ConfirmationInput): string[] {
  const lines = [
    `Dear ${o.customerName},`,
    "",
    `Thank you for shopping with ${o.shopName}.`,
    `Your order ${o.orderNumber} has been confirmed.`,
    "",
    "Your items:",
    ...o.items.map((i) => `• ${i.name} × ${i.quantity}`),
    "",
    `Order total: ${o.total}`,
    `Delivery address: ${o.address}`,
    "",
    "Our team will contact you shortly to arrange the delivery.",
  ];
  if (o.shopPhone) {
    lines.push(`For any question, please call us at ${o.shopPhone}.`);
  }
  lines.push("", `Thank you for choosing ${o.shopName}.`);
  return lines;
}

export function orderConfirmedSubject(o: ConfirmationInput): string {
  return `Your order ${o.orderNumber} is confirmed — ${o.shopName}`;
}

/** Branded HTML version for the email. */
export function orderConfirmedHtml(o: ConfirmationInput): string {
  const e = escapeHtml;
  const rows = o.items
    .map(
      (i) => `<tr>
        <td style="padding:10px 0;border-bottom:1px solid #e5e3dc;color:#16211f">${e(i.name)}</td>
        <td style="padding:10px 0;border-bottom:1px solid #e5e3dc;text-align:right;color:#5c6b67;white-space:nowrap">× ${i.quantity}</td>
      </tr>`
    )
    .join("");

  return `<div style="margin:0;padding:24px;background:#f6f5f1;font-family:Arial,Helvetica,sans-serif">
  <div style="max-width:560px;margin:0 auto;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #e5e3dc">

    <div style="background:#0e5257;padding:24px 28px">
      <p style="margin:0;color:#ffffff;font-size:19px;font-weight:bold">${e(o.shopName)}</p>
      <p style="margin:4px 0 0;color:rgba(255,255,255,0.75);font-size:12px">Electric &middot; Sanitary &middot; Fancy Lights</p>
    </div>

    <div style="padding:28px">
      <div style="display:inline-block;background:#e7f0ef;color:#0e5257;font-size:12px;font-weight:bold;padding:6px 12px;border-radius:999px">ORDER CONFIRMED</div>

      <h1 style="margin:16px 0 6px;font-size:21px;color:#16211f">Thank you, ${e(o.customerName)}!</h1>
      <p style="margin:0;font-size:15px;line-height:1.6;color:#5c6b67">
        Your order <strong style="color:#16211f">${e(o.orderNumber)}</strong> has been confirmed.
        Our team will contact you shortly to arrange the delivery.
      </p>

      <table style="width:100%;border-collapse:collapse;margin:24px 0 0;font-size:14px">
        <tr>
          <td colspan="2" style="padding-bottom:8px;font-size:12px;font-weight:bold;letter-spacing:.08em;color:#5c6b67;text-transform:uppercase">Your items</td>
        </tr>
        ${rows}
        <tr>
          <td style="padding:14px 0 0;font-weight:bold;color:#16211f">Order total</td>
          <td style="padding:14px 0 0;text-align:right;font-weight:bold;font-size:18px;color:#0e5257">${e(o.total)}</td>
        </tr>
      </table>

      <div style="margin-top:24px;padding:16px;background:#f6f5f1;border-radius:12px">
        <p style="margin:0 0 4px;font-size:12px;font-weight:bold;letter-spacing:.06em;color:#5c6b67;text-transform:uppercase">Delivery address</p>
        <p style="margin:0;font-size:14px;line-height:1.6;color:#16211f">${e(o.address)}</p>
      </div>

      ${
        o.shopPhone
          ? `<p style="margin:24px 0 0;font-size:14px;color:#5c6b67">
              Any questions? Call us at
              <a href="tel:${e(o.shopPhone)}" style="color:#b45f2e;font-weight:bold;text-decoration:none">${e(o.shopPhone)}</a>.
            </p>`
          : ""
      }
    </div>

    <div style="padding:16px 28px;background:#f6f5f1;border-top:1px solid #e5e3dc">
      <p style="margin:0;font-size:12px;color:#5c6b67">Thank you for choosing ${e(o.shopName)}.</p>
    </div>
  </div>
</div>`;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
