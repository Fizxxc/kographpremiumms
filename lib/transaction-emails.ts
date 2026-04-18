import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { sendMail } from "@/lib/mailer";
import { SITE } from "@/lib/constants";
import { generateInvoicePdf } from "@/lib/pdf";
import { buildDeliveryFields, buildDeliveryText } from "@/lib/order-delivery";

const APP_URL = (process.env.NEXT_PUBLIC_APP_URL || "https://kographpremiapp.vercel.app").replace(/\/$/, "");

function wrapEmail(content: string) {
  return `
    <div style="margin:0;padding:32px;background:#020617;font-family:Inter,Segoe UI,Arial,sans-serif;color:#e2e8f0;">
      <div style="max-width:680px;margin:0 auto;background:linear-gradient(180deg,#07162f 0%,#020617 100%);border:1px solid rgba(148,163,184,0.18);border-radius:28px;overflow:hidden;box-shadow:0 24px 60px rgba(2,6,23,0.45);">
        <div style="padding:28px 32px;border-bottom:1px solid rgba(148,163,184,0.14);background:rgba(15,23,42,0.72);">
          <div style="font-size:12px;letter-spacing:0.26em;text-transform:uppercase;color:#facc15;font-weight:800;">Kograph Premium</div>
          <div style="margin-top:10px;font-size:26px;line-height:1.25;font-weight:800;color:#f8fafc;">Pesanan Anda sudah siap</div>
          <div style="margin-top:8px;font-size:14px;line-height:1.7;color:#cbd5e1;">Terima kasih sudah berbelanja. Detail transaksi, invoice, dan data layanan sudah kami siapkan pada email ini agar proses Anda tetap rapi dan mudah dicek kembali kapan pun diperlukan.</div>
        </div>
        <div style="padding:32px;">${content}</div>
      </div>
    </div>
  `;
}

function infoGrid(items: Array<{ label: string; value: string }>) {
  return `
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:14px;">
      ${items
      .map(
        (item) => `
            <div style="border:1px solid rgba(148,163,184,0.16);border-radius:20px;padding:16px 18px;background:rgba(15,23,42,0.56);">
              <div style="font-size:11px;letter-spacing:0.18em;text-transform:uppercase;color:#94a3b8;font-weight:800;">${item.label}</div>
              <div style="margin-top:8px;font-size:14px;line-height:1.65;color:#f8fafc;font-weight:700;word-break:break-word;">${item.value}</div>
            </div>
          `
      )
      .join("")}
    </div>
  `;
}

export async function sendTransactionPaidEmail(orderId: string) {
  const admin = createAdminSupabaseClient();

  const { data: tx, error } = await admin
    .from("transactions")
    .select(`
      id,
      order_id,
      status,
      amount,
      discount_amount,
      final_amount,
      payment_method,
      created_at,
      paid_at,
      public_order_code,
      buyer_name,
      buyer_email,
      email_sent_at,
      fulfillment_data,
      product_snapshot,
      products ( name, category )
    `)
    .eq("order_id", orderId)
    .maybeSingle();

  if (error || !tx) throw new Error(error?.message || "Transaksi tidak ditemukan untuk email.");
  if ((tx as any).email_sent_at) return { skipped: true, reason: "already_sent" };

  const buyerEmail = String((tx as any).buyer_email || "").trim();
  if (!buyerEmail) return { skipped: true, reason: "missing_email" };

  const { data: credential } = await admin
    .from("app_credentials")
    .select("account_data")
    .eq("transaction_id", (tx as any).id)
    .maybeSingle();

  const product = Array.isArray((tx as any).products) ? (tx as any).products[0] : (tx as any).products;
  const productName = String(product?.name || (tx as any).product_snapshot?.product_name || "Produk Kograph");
  const variantName = String((tx as any).product_snapshot?.variant_name || "").trim();
  const category = String(product?.category || (tx as any).product_snapshot?.category || "Layanan Digital");
  const displayName = String((tx as any).buyer_name || "Kak").trim();
  const publicOrderCode = String((tx as any).public_order_code || "");
  const paymentMethod = String((tx as any).payment_method || "QRIS").toUpperCase();
  const total = Number((tx as any).final_amount || (tx as any).amount || 0);
  const deliveryFields = buildDeliveryFields({
    fulfillmentData: (tx as any).fulfillment_data || {},
    credential
  });

  const detailBlocks = [
    { label: "Order ID", value: String((tx as any).order_id) },
    { label: "Resi", value: publicOrderCode || "-" },
    { label: "Produk", value: variantName ? `${productName} • ${variantName}` : productName },
    { label: "Pembayaran", value: paymentMethod },
    { label: "Total", value: new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(total) },
    { label: "Status", value: String((tx as any).status || "settlement").toUpperCase() }
  ];

  const deliverySection = deliveryFields.length > 0
    ? `
      <div style="margin-top:24px;">
        <div style="font-size:12px;letter-spacing:0.22em;text-transform:uppercase;color:#facc15;font-weight:800;">Data layanan</div>
        <div style="margin-top:10px;font-size:14px;line-height:1.75;color:#cbd5e1;">Berikut data akses yang sudah siap dipakai. Simpan baik-baik dan jangan dibagikan ke pihak lain.</div>
        <div style="margin-top:16px;">${infoGrid(deliveryFields)}</div>
      </div>
    `
    : `
      <div style="margin-top:24px;border:1px solid rgba(148,163,184,0.16);border-radius:20px;padding:18px 20px;background:rgba(15,23,42,0.56);">
        <div style="font-size:12px;letter-spacing:0.22em;text-transform:uppercase;color:#facc15;font-weight:800;">Status layanan</div>
        <div style="margin-top:10px;font-size:14px;line-height:1.75;color:#cbd5e1;">Pembayaran sudah tervalidasi. Silakan gunakan resi untuk memantau perkembangan pesanan di website kapan saja.</div>
      </div>
    `;

  const manageUrl = `${APP_URL}/waiting-payment/${encodeURIComponent(String((tx as any).order_id))}?resi=${encodeURIComponent(publicOrderCode)}&type=transaction`;
  const invoiceUrl = `${APP_URL}/api/invoice/${encodeURIComponent(String((tx as any).order_id))}?resi=${encodeURIComponent(publicOrderCode)}&download=1`;

  const credentialText =
    deliveryFields.length > 0
      ? deliveryFields.map((field) => `${field.label}: ${field.value}`).join("\n")
      : null;

  const pdfBytes = await generateInvoicePdf({
    orderId: String((tx as any).order_id),
    customerName: displayName,
    productName: variantName ? `${productName} • ${variantName}` : productName,
    amount: Number((tx as any).amount || 0),
    discountAmount: Number((tx as any).discount_amount || 0),
    finalAmount: total,
    status: String((tx as any).status || "settlement"),
    createdAt: String((tx as any).created_at || new Date().toISOString()),
    credential: credentialText,
    couponCode: null
  });
  
  const html = wrapEmail(`
    <div style="font-size:15px;line-height:1.8;color:#e2e8f0;">
      Halo ${displayName}, pesanan Anda telah kami catat dengan baik dan saat ini sudah siap digunakan.
    </div>
    <div style="margin-top:22px;">${infoGrid(detailBlocks)}</div>
    ${deliverySection}
    <div style="margin-top:28px;display:flex;flex-wrap:wrap;gap:12px;">
      <a href="${manageUrl}" style="display:inline-flex;align-items:center;justify-content:center;padding:14px 18px;border-radius:999px;background:#facc15;color:#111827;font-size:14px;font-weight:800;text-decoration:none;">Buka detail pesanan</a>
      <a href="${invoiceUrl}" style="display:inline-flex;align-items:center;justify-content:center;padding:14px 18px;border-radius:999px;border:1px solid rgba(148,163,184,0.22);color:#f8fafc;font-size:14px;font-weight:700;text-decoration:none;">Unduh invoice</a>
    </div>
    <div style="margin-top:26px;border-top:1px solid rgba(148,163,184,0.14);padding-top:20px;font-size:13px;line-height:1.8;color:#94a3b8;">
      Bantuan: ${SITE.support.email} • Telegram cek order: @${SITE.botUsername} • Auto order: @${SITE.autoOrderBotUsername}
    </div>
  `);

  const text = [
    `Halo ${displayName},`,
    "",
    "Pesanan Anda sudah siap.",
    `Order ID: ${(tx as any).order_id}`,
    `Resi: ${publicOrderCode || "-"}`,
    `Produk: ${variantName ? `${productName} - ${variantName}` : productName}`,
    `Pembayaran: ${paymentMethod}`,
    `Total: ${new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(total)}`,
    "",
    deliveryFields.length > 0 ? buildDeliveryText(deliveryFields) : "Silakan cek detail pesanan melalui tautan web untuk melihat perkembangan order terbaru.",
    "",
    `Detail pesanan: ${manageUrl}`,
    `Invoice: ${invoiceUrl}`,
  ].join("\n");

  await sendMail({
    to: buyerEmail,
    subject: `Pesanan siap • ${productName}`,
    html,
    text,
    attachments: [
      {
        filename: `${String((tx as any).order_id).replace(/[^a-zA-Z0-9-_]/g, "_")}-invoice.pdf`,
        content: Buffer.from(pdfBytes),
        contentType: "application/pdf"
      }
    ]
  });

  await admin.from("transactions").update({ email_sent_at: new Date().toISOString() }).eq("id", (tx as any).id);

  return { sent: true, to: buyerEmail, hasCredential: deliveryFields.length > 0 };
}

export async function sendTopupPaidEmail(orderId: string) {
  const admin = createAdminSupabaseClient();
  const { data: topup } = await admin
    .from("wallet_topups")
    .select("id, order_id, amount, status, user_id, email_sent_at")
    .eq("order_id", orderId)
    .maybeSingle();

  if (!topup || (topup as any).email_sent_at) return { skipped: true };

  const { data: profile } = await admin
    .from("profiles")
    .select("email, full_name")
    .eq("id", (topup as any).user_id)
    .maybeSingle();

  const targetEmail = String((profile as any)?.email || "").trim();
  if (!targetEmail) return { skipped: true, reason: "missing_email" };

  const amount = Number((topup as any).amount || 0);

  await sendMail({
    to: targetEmail,
    subject: `Top up saldo berhasil • ${new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(amount)}`,
    text: `Top up saldo berhasil. Order ID: ${(topup as any).order_id}. Nominal: ${amount}.`,
    html: wrapEmail(`
      <div style="font-size:15px;line-height:1.8;color:#e2e8f0;">
        Halo ${String((profile as any)?.full_name || "Kak")}, top up saldo Anda sudah berhasil diproses.
      </div>
      <div style="margin-top:22px;">${infoGrid([
      { label: "Order ID", value: String((topup as any).order_id) },
      { label: "Nominal", value: new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(amount) },
      { label: "Status", value: String((topup as any).status || "settlement").toUpperCase() }
    ])}</div>
    `)
  });

  await admin.from("wallet_topups").update({ email_sent_at: new Date().toISOString() }).eq("id", (topup as any).id);
  return { sent: true };
}
