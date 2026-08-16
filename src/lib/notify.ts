import "server-only";

/**
 * Best-effort notifications for new orders, quotations and inquiries.
 *
 * Both channels are OPTIONAL. If the relevant environment variables are not
 * set, the function quietly does nothing — the site keeps working and the
 * submission is always saved to the database / visible in the admin panel.
 * Notifications never throw; failures are logged but do not break checkout.
 */

type NotifyInput = {
  subject: string;
  /** Plain-text lines that make up the message body. */
  lines: string[];
};

export async function notifyOwner(input: NotifyInput): Promise<void> {
  await Promise.allSettled([sendEmail(input), sendWhatsApp(input)]);
}

// ---- Customer notifications ------------------------------------------------

type CustomerNotifyInput = {
  /** The customer's phone as they typed it, e.g. "03044488012". */
  toPhone?: string | null;
  toEmail?: string | null;
  subject: string;
  /** Plain-text lines — used for WhatsApp and as the email fallback. */
  lines: string[];
  /** Optional branded HTML body for the email. */
  html?: string;
};

/**
 * Message the CUSTOMER (not the shop) — used when an order is confirmed.
 *
 * Like notifyOwner this is best-effort: if the channel is not configured, or
 * the customer left no email, that channel is quietly skipped. It never throws,
 * so confirming an order in the admin panel can never fail because of a
 * messaging problem.
 */
export async function notifyCustomer(input: CustomerNotifyInput): Promise<void> {
  await Promise.allSettled([
    sendCustomerEmail(input),
    sendCustomerWhatsApp(input),
  ]);
}

/**
 * Turn a locally written Pakistani number into the international form
 * WhatsApp needs: "0304 448 8012" → "923044488012".
 */
export function toInternationalNumber(phone: string): string {
  const digits = phone.replace(/[^\d]/g, "");
  if (!digits) return "";
  if (digits.startsWith("92")) return digits;
  if (digits.startsWith("0")) return `92${digits.slice(1)}`;
  if (digits.length === 10) return `92${digits}`;
  return digits;
}

async function sendCustomerEmail({
  toEmail,
  subject,
  lines,
  html,
}: CustomerNotifyInput): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.NOTIFY_EMAIL_FROM;
  if (!apiKey || !from || !toEmail) return;

  try {
    const { Resend } = await import("resend");
    const resend = new Resend(apiKey);
    await resend.emails.send({
      from,
      to: [toEmail.trim()],
      subject,
      text: lines.join("\n"),
      html:
        html ||
        `<div style="font-family:Arial,sans-serif;font-size:15px;line-height:1.6">
          ${lines.map((l) => `<p style="margin:2px 0">${escapeHtml(l)}</p>`).join("")}
        </div>`,
    });
  } catch (err) {
    console.error("[notify] customer email failed:", err);
  }
}

async function sendCustomerWhatsApp({
  toPhone,
  subject,
  lines,
}: CustomerNotifyInput): Promise<void> {
  const provider = process.env.WHATSAPP_PROVIDER;
  if (!provider || !toPhone) return;

  const to = toInternationalNumber(toPhone);
  if (!to) return;

  const body = `*${subject}*\n${lines.join("\n")}`;
  try {
    if (provider === "meta") {
      await sendWhatsAppMeta(to, body);
    } else if (provider === "twilio") {
      await sendWhatsAppTwilio(to, body);
    }
  } catch (err) {
    console.error("[notify] customer whatsapp failed:", err);
  }
}

// ---- Email (Resend) --------------------------------------------------------

async function sendEmail({ subject, lines }: NotifyInput): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.NOTIFY_EMAIL_FROM;
  const to = process.env.NOTIFY_EMAIL_TO;
  if (!apiKey || !from || !to) return;

  try {
    const { Resend } = await import("resend");
    const resend = new Resend(apiKey);
    const html = `<div style="font-family:Arial,sans-serif;font-size:15px;line-height:1.6">
      <h2 style="margin:0 0 12px">${escapeHtml(subject)}</h2>
      ${lines.map((l) => `<p style="margin:2px 0">${escapeHtml(l)}</p>`).join("")}
    </div>`;
    await resend.emails.send({
      from,
      to: to.split(",").map((s) => s.trim()),
      subject,
      text: lines.join("\n"),
      html,
    });
  } catch (err) {
    console.error("[notify] email failed:", err);
  }
}

// ---- WhatsApp (Meta Cloud API or Twilio) -----------------------------------

async function sendWhatsApp({ subject, lines }: NotifyInput): Promise<void> {
  const provider = process.env.WHATSAPP_PROVIDER;
  const to = process.env.WHATSAPP_TO;
  if (!provider || !to) return;

  const body = `*${subject}*\n${lines.join("\n")}`;

  try {
    if (provider === "meta") {
      await sendWhatsAppMeta(to, body);
    } else if (provider === "twilio") {
      await sendWhatsAppTwilio(to, body);
    }
  } catch (err) {
    console.error("[notify] whatsapp failed:", err);
  }
}

async function sendWhatsAppMeta(to: string, body: string): Promise<void> {
  const token = process.env.META_WHATSAPP_TOKEN;
  const phoneId = process.env.META_WHATSAPP_PHONE_ID;
  if (!token || !phoneId) return;

  await fetch(`https://graph.facebook.com/v21.0/${phoneId}/messages`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      to: to.replace(/[^\d]/g, ""),
      type: "text",
      text: { body },
    }),
  });
}

async function sendWhatsAppTwilio(to: string, body: string): Promise<void> {
  const sid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const from = process.env.TWILIO_WHATSAPP_FROM;
  if (!sid || !authToken || !from) return;

  const params = new URLSearchParams({
    From: from,
    To: `whatsapp:${to}`,
    Body: body,
  });

  await fetch(`https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(`${sid}:${authToken}`).toString("base64")}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: params.toString(),
  });
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
