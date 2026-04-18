import { NextResponse } from "next/server";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { getPakasirTransactionDetail, normalizePakasirStatus } from "@/lib/pakasir";
import { fulfillProductOrder, settleWalletTopup } from "@/lib/fulfillment";
import { buildDeliveryFields } from "@/lib/order-delivery";

async function getTransactionPayload(admin: ReturnType<typeof createAdminSupabaseClient>, orderId: string, resi: string) {
  const { data: tx } = await admin
    .from("transactions")
    .select(`
      id,
      order_id,
      user_id,
      status,
      amount,
      final_amount,
      payment_method,
      public_order_code,
      buyer_name,
      buyer_email,
      fulfillment_data,
      created_at,
      paid_at,
      products ( name )
    `)
    .eq("order_id", orderId)
    .eq("public_order_code", resi)
    .maybeSingle();

  if (!tx) return null;

  const { data: credential } = await admin
    .from("app_credentials")
    .select("account_data")
    .eq("transaction_id", (tx as any).id)
    .maybeSingle();

  const product = Array.isArray((tx as any).products) ? (tx as any).products[0] : (tx as any).products;
  const deliveryFields = buildDeliveryFields({
    fulfillmentData: (tx as any).fulfillment_data || {},
    credential
  });

  return {
    type: "transaction",
    orderId: (tx as any).order_id,
    resi: (tx as any).public_order_code,
    status: (tx as any).status,
    amount: Number((tx as any).final_amount || (tx as any).amount || 0),
    productName: String(product?.name || "Pesanan"),
    paymentMethod: (tx as any).payment_method || "qris",
    buyerName: (tx as any).buyer_name || null,
    buyerEmail: (tx as any).buyer_email || null,
    createdAt: (tx as any).created_at || null,
    paidAt: (tx as any).paid_at || null,
    fulfillmentData: (tx as any).fulfillment_data || {},
    credentialFields: deliveryFields,
    hasCredential: deliveryFields.length > 0,
    invoiceUrl: `/api/invoice/${encodeURIComponent(String((tx as any).order_id))}?resi=${encodeURIComponent(String((tx as any).public_order_code || ""))}`,
    invoiceDownloadUrl: `/api/invoice/${encodeURIComponent(String((tx as any).order_id))}?resi=${encodeURIComponent(String((tx as any).public_order_code || ""))}&download=1`
  };
}

async function getTopupPayload(admin: ReturnType<typeof createAdminSupabaseClient>, orderId: string) {
  const { data: topup } = await admin
    .from("wallet_topups")
    .select("order_id, amount, status, created_at, settled_at")
    .eq("order_id", orderId)
    .maybeSingle();

  if (!topup) return null;

  return {
    type: "topup",
    orderId: (topup as any).order_id,
    status: (topup as any).status,
    amount: Number((topup as any).amount || 0),
    paymentMethod: "qris",
    createdAt: (topup as any).created_at || null,
    paidAt: (topup as any).settled_at || null,
    productName: "Top up saldo"
  };
}

async function syncLiveStatus(admin: ReturnType<typeof createAdminSupabaseClient>, orderId: string) {
  const { data: existingTx } = await admin
    .from("transactions")
    .select("id, status, amount, final_amount")
    .eq("order_id", orderId)
    .maybeSingle();

  if (existingTx) {
    const live = await getPakasirTransactionDetail({
      orderId,
      amount: Number((existingTx as any).final_amount || (existingTx as any).amount || 0)
    }).catch(() => null);

    const liveStatus = normalizePakasirStatus((live as any)?.transaction?.status);
    if (!liveStatus) return;

    const previousStatus = normalizePakasirStatus((existingTx as any).status || "pending");
    if (previousStatus !== liveStatus) {
      await admin
        .from("transactions")
        .update({
          status: liveStatus,
          paid_at: liveStatus === "settlement" ? new Date().toISOString() : null
        })
        .eq("id", (existingTx as any).id);
    }

    if (liveStatus === "settlement") {
      await fulfillProductOrder(orderId).catch(() => null);
    }
    return;
  }

  const { data: existingTopup } = await admin
    .from("wallet_topups")
    .select("id, status, amount")
    .eq("order_id", orderId)
    .maybeSingle();

  if (!existingTopup) return;

  const live = await getPakasirTransactionDetail({
    orderId,
    amount: Number((existingTopup as any).amount || 0)
  }).catch(() => null);

  const liveStatus = normalizePakasirStatus((live as any)?.transaction?.status);
  if (!liveStatus) return;

  const previousStatus = normalizePakasirStatus((existingTopup as any).status || "pending");
  if (previousStatus !== liveStatus) {
    await admin
      .from("wallet_topups")
      .update({
        status: liveStatus,
        settled_at: liveStatus === "settlement" ? new Date().toISOString() : null
      })
      .eq("id", (existingTopup as any).id);
  }

  if (liveStatus === "settlement") {
    await settleWalletTopup(orderId).catch(() => null);
  }
}

export async function GET(request: Request, { params }: { params: { orderId: string } }) {
  try {
    const orderId = String(params.orderId || "").trim();
    const url = new URL(request.url);
    const resi = String(url.searchParams.get("resi") || "").trim();
    const explicitType = String(url.searchParams.get("type") || "").trim().toLowerCase();

    if (!orderId) {
      return NextResponse.json({ error: "Order ID wajib diisi." }, { status: 400 });
    }

    const admin = createAdminSupabaseClient();

    if (explicitType === "transaction" && !resi) {
      return NextResponse.json({ error: "Resi pesanan wajib diisi untuk cek transaksi." }, { status: 400 });
    }

    if (explicitType !== "topup") {
      await syncLiveStatus(admin, orderId).catch(() => null);
    }

    const txPayload = resi ? await getTransactionPayload(admin, orderId, resi) : null;
    if (txPayload) {
      return NextResponse.json(txPayload, { status: 200 });
    }

    const topupPayload = await getTopupPayload(admin, orderId);
    if (topupPayload) {
      return NextResponse.json(topupPayload, { status: 200 });
    }

    return NextResponse.json({ error: "Pesanan tidak ditemukan." }, { status: 404 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Gagal memuat status pesanan." },
      { status: 500 }
    );
  }
}
