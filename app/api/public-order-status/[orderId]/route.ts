import { NextResponse } from "next/server";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getPakasirTransactionDetail, normalizePakasirStatus } from "@/lib/pakasir";

function extractPaymentPayload(...sources: any[]) {
  for (const source of sources) {
    if (!source) continue;
    const qrString = String(source?.payment_qr_string || source?.qrString || source?.qr_string || source?.payment_number || "");
    const qrUrl = String(source?.payment_qr_url || source?.qrUrl || source?.qr_url || "");
    const deeplinkUrl = String(source?.payment_deeplink_url || source?.deeplinkUrl || "");
    const paymentUrl = String(source?.payment_fallback_url || source?.paymentUrl || source?.payment_url || "");
    const expiresAt = String(source?.payment_expires_at || source?.expiresAt || source?.expired_at || "");

    if (qrString || qrUrl || deeplinkUrl || paymentUrl || expiresAt) {
      return { qrString, qrUrl, deeplinkUrl, paymentUrl, expiresAt };
    }
  }

  return { qrString: "", qrUrl: "", deeplinkUrl: "", paymentUrl: "", expiresAt: "" };
}

async function getLivePakasirStatus(orderId: string, amount: number) {
  try {
    const payload = await getPakasirTransactionDetail({ orderId, amount });
    return { payload, error: null as string | null };
  } catch (error: any) {
    return { payload: null, error: String(error?.message || "Gagal mengambil status Pakasir.") };
  }
}

export async function GET(request: Request, { params }: { params: { orderId: string } }) {
  const orderId = String(params.orderId || "").trim();
  const url = new URL(request.url);
  const resi = String(url.searchParams.get("resi") || "").trim();
  const type = String(url.searchParams.get("type") || "transaction").trim();

  if (!orderId) return NextResponse.json({ error: "Order ID wajib diisi." }, { status: 400 });

  const supabase = createServerSupabaseClient();
  const admin = createAdminSupabaseClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (type === "topup") {
    let query = admin
      .from("wallet_topups")
      .select("id, order_id, user_id, amount, status, public_order_code, gateway_payload, fulfillment_data, paid_at, created_at")
      .eq("order_id", orderId)
      .limit(1);

    if (user) query = query.eq("user_id", user.id);
    else query = query.eq("public_order_code", resi);

    const { data } = await query.maybeSingle();
    if (!data) return NextResponse.json({ error: "Transaksi top up tidak ditemukan." }, { status: 404 });

    const liveTopup = String((data as any)?.status || "") === "pending"
      ? await getLivePakasirStatus(orderId, Number((data as any)?.amount || 0))
      : { payload: null, error: null as string | null };

    const topupStatus = liveTopup.payload?.transaction
      ? normalizePakasirStatus(liveTopup.payload.transaction.status)
      : String((data as any)?.status || "pending");

    if (liveTopup.payload?.transaction) {
      await admin
        .from("wallet_topups")
        .update({
          status: topupStatus,
          paid_at: liveTopup.payload.transaction.completed_at || null,
          gateway_name: "pakasir",
          gateway_reference: String(liveTopup.payload.transaction.order_id || orderId),
          gateway_payload: liveTopup.payload
        })
        .eq("id", (data as any).id);
    }

    const topupPayment = extractPaymentPayload((data as any)?.fulfillment_data, (data as any)?.gateway_payload);

    if (topupStatus === "pending" && !topupPayment.qrString && !topupPayment.qrUrl) {
      return NextResponse.json({
        code: liveTopup.error ? "PAKASIR_STATUS_ERROR" : "QRIS_NOT_ACTIVE",
        error: liveTopup.error ? "Status pembayaran Pakasir belum bisa dimuat." : "QRIS Belum Aktif",
        message: liveTopup.error
          ? `${liveTopup.error} Silakan cek konfigurasi PAKASIR_PROJECT_SLUG dan PAKASIR_API_KEY.`
          : "Sistem belum menerima QRIS dinamis dari Pakasir untuk transaksi ini.",
        orderId,
        status: topupStatus
      }, { status: liveTopup.error ? 502 : 424 });
    }

    return NextResponse.json({
      type: "topup",
      gateway: "pakasir",
      orderId: (data as any)?.order_id,
      status: topupStatus,
      amount: Number((data as any)?.amount || 0),
      publicOrderCode: (data as any)?.public_order_code,
      qrUrl: topupPayment.qrUrl,
      qrString: topupPayment.qrString,
      deeplinkUrl: topupPayment.deeplinkUrl,
      paymentUrl: topupPayment.paymentUrl,
      expiresAt: topupPayment.expiresAt,
      raw: liveTopup.payload || data
    });
  }

  let query = admin
    .from("transactions")
    .select(`
      id,
      order_id,
      user_id,
      status,
      amount,
      discount_amount,
      final_amount,
      payment_method,
      public_order_code,
      fulfillment_data,
      gateway_payload,
      paid_at,
      created_at,
      buyer_name,
      buyer_email,
      product_snapshot,
      products ( id, name, image_url, category )
    `)
    .eq("order_id", orderId)
    .limit(1);

  if (user) query = query.eq("user_id", user.id);
  else query = query.eq("public_order_code", resi);

  const { data } = await query.maybeSingle();
  if (!data) return NextResponse.json({ error: "Pesanan tidak ditemukan." }, { status: 404 });

  const liveTransaction = String((data as any)?.status || "") === "pending"
    ? await getLivePakasirStatus(orderId, Number((data as any)?.final_amount || (data as any)?.amount || 0))
    : { payload: null, error: null as string | null };

  const effectiveStatus = liveTransaction.payload?.transaction
    ? normalizePakasirStatus(liveTransaction.payload.transaction.status)
    : String((data as any)?.status || "pending");

  if (liveTransaction.payload?.transaction) {
    await admin
      .from("transactions")
      .update({
        status: effectiveStatus,
        payment_method: String(liveTransaction.payload.transaction.payment_method || "qris").toLowerCase(),
        paid_at: liveTransaction.payload.transaction.completed_at || null,
        gateway_name: "pakasir",
        gateway_reference: String(liveTransaction.payload.transaction.order_id || orderId),
        gateway_payload: liveTransaction.payload
      })
      .eq("id", (data as any)?.id);
  }

  const product = Array.isArray((data as any)?.products) ? (data as any)?.products[0] : (data as any)?.products;
  const payment = extractPaymentPayload((data as any)?.fulfillment_data, (data as any)?.gateway_payload);

  if (effectiveStatus === "pending" && !payment.qrString && !payment.qrUrl) {
    return NextResponse.json({
      code: liveTransaction.error ? "PAKASIR_STATUS_ERROR" : "QRIS_NOT_ACTIVE",
      error: liveTransaction.error ? "Status pembayaran Pakasir belum bisa dimuat." : "QRIS Belum Aktif",
      message: liveTransaction.error
        ? `${liveTransaction.error} Silakan cek konfigurasi PAKASIR_PROJECT_SLUG dan PAKASIR_API_KEY.`
        : "Sistem belum menerima QRIS dinamis dari Pakasir untuk transaksi ini.",
      orderId,
      status: effectiveStatus
    }, { status: liveTransaction.error ? 502 : 424 });
  }

  return NextResponse.json({
    type: "transaction",
    gateway: "pakasir",
    orderId: (data as any)?.order_id,
    status: effectiveStatus,
    amount: Number((data as any)?.final_amount || (data as any)?.amount || 0),
    publicOrderCode: (data as any)?.public_order_code,
    qrUrl: payment.qrUrl,
    qrString: payment.qrString,
    deeplinkUrl: payment.deeplinkUrl,
    paymentUrl: payment.paymentUrl,
    expiresAt: payment.expiresAt,
    productName: String(product?.name || (data as any)?.product_snapshot?.product_name || "Produk"),
    productImage: String(product?.image_url || (data as any)?.product_snapshot?.product_image_url || ""),
    variantName: String((data as any)?.product_snapshot?.variant_name || ""),
    fulfillmentData: {
      ...((data as any)?.fulfillment_data || {}),
      payment_qr_url: payment.qrUrl || null,
      payment_qr_string: payment.qrString || null,
      payment_deeplink_url: payment.deeplinkUrl || null,
      payment_fallback_url: payment.paymentUrl || null,
      payment_expires_at: payment.expiresAt || null
    },
    raw: liveTransaction.payload || data
  });
}
