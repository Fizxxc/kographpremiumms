import { NextResponse } from "next/server";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { getPakasirTransactionDetail } from "@/lib/pakasir";
import { syncPakasirOrderState } from "@/lib/payment-reconcile";

type StatusLookupResult = {
  kind: "transaction" | "topup";
  row: any;
};

async function findStatusRow(input: {
  orderId: string;
  publicOrderCode?: string | null;
  explicitType?: "transaction" | "topup" | null;
}) {
  const admin = createAdminSupabaseClient();
  const orderId = input.orderId.trim();
  const publicOrderCode = input.publicOrderCode?.trim() || null;

  const findTransaction = async (): Promise<StatusLookupResult | null> => {
    let query = admin
      .from("transactions")
      .select(
        "id, order_id, public_order_code, status, amount, final_amount, fulfillment_data, buyer_name, buyer_email, product_snapshot, product_id, variant_name, variant_id, updated_at"
      )
      .eq("order_id", orderId)
      .limit(1);

    if (publicOrderCode) {
      query = query.eq("public_order_code", publicOrderCode);
    }

    const { data } = await query.maybeSingle();
    return data ? { kind: "transaction", row: data } : null;
  };

  const findTopup = async (): Promise<StatusLookupResult | null> => {
    let query = admin
      .from("wallet_topups")
      .select("id, order_id, public_order_code, status, amount, fulfillment_data, user_id, updated_at")
      .eq("order_id", orderId)
      .limit(1);

    if (publicOrderCode) {
      query = query.eq("public_order_code", publicOrderCode);
    }

    const { data } = await query.maybeSingle();
    return data ? { kind: "topup", row: data } : null;
  };

  if (input.explicitType === "transaction") return findTransaction();
  if (input.explicitType === "topup") return findTopup();

  return (await findTransaction()) || (await findTopup());
}

export async function GET(request: Request, { params }: { params: { orderId: string } }) {
  try {
    const url = new URL(request.url);
    const orderId = String(params.orderId || "").trim();
    const publicOrderCode = String(url.searchParams.get("resi") || "").trim() || null;
    const explicitType = (url.searchParams.get("type") || "").trim() as "transaction" | "topup" | "";

    if (!orderId) {
      return NextResponse.json({ error: "Order ID wajib diisi." }, { status: 400 });
    }

    const found = await findStatusRow({
      orderId,
      publicOrderCode,
      explicitType: explicitType || null
    });

    if (!found) {
      return NextResponse.json(
        {
          error: publicOrderCode
            ? "Pesanan tidak ditemukan. Pastikan order ID dan resi sudah benar."
            : "Pesanan tidak ditemukan. Gunakan tautan lengkap dari checkout atau cek kembali order ID Anda.",
          code: "ORDER_NOT_FOUND"
        },
        { status: 404 }
      );
    }

    await syncPakasirOrderState(orderId).catch(() => null);

    const refreshed = await findStatusRow({
      orderId,
      publicOrderCode,
      explicitType: found.kind
    });

    const row = refreshed?.row || found.row;
    const fulfillment = (row as any).fulfillment_data || {};
    const amount = Number((row as any).final_amount || (row as any).amount || fulfillment.payment_total_amount || 0);
    let gatewayPayload = fulfillment.provider_response || fulfillment.gateway_payload || null;

    try {
      const pakasir = await getPakasirTransactionDetail({
        orderId,
        amount: amount > 0 ? amount : undefined
      });

      if (pakasir?.data) {
        gatewayPayload = pakasir.data;
      }
    } catch {
      // Tetap tampilkan data lokal bila request ke Pakasir gagal.
    }

    const paymentStatus = String(
      gatewayPayload?.payment_status || gatewayPayload?.paymentStatus || fulfillment.payment_status || (row as any).status || "pending"
    ).toLowerCase();

    const normalizedStatus = ["settlement", "paid", "success", "berhasil"].includes(paymentStatus)
      ? "success"
      : ["expire", "expired", "cancel", "cancelled", "failed"].includes(paymentStatus)
        ? "failed"
        : "pending";

    return NextResponse.json({
      ok: true,
      kind: found.kind,
      orderId,
      publicOrderCode: (row as any).public_order_code || publicOrderCode,
      status: normalizedStatus,
      rawStatus: paymentStatus,
      amount,
      buyerName: found.kind === "transaction" ? (row as any).buyer_name || null : null,
      buyerEmail: found.kind === "transaction" ? (row as any).buyer_email || null : null,
      productSnapshot: found.kind === "transaction" ? (row as any).product_snapshot || null : null,
      variantName: found.kind === "transaction" ? (row as any).variant_name || null : null,
      qrString:
        gatewayPayload?.qr_content ||
        gatewayPayload?.qr_string ||
        gatewayPayload?.qris_content ||
        fulfillment.payment_qr_string ||
        null,
      qrUrl: gatewayPayload?.qr_url || gatewayPayload?.qr_image || gatewayPayload?.qris_url || fulfillment.payment_qr_url || null,
      paymentNumber: gatewayPayload?.payment_no || gatewayPayload?.payment_number || fulfillment.payment_number || null,
      expiresAt: gatewayPayload?.expired_at || gatewayPayload?.expires_at || fulfillment.payment_expires_at || null,
      paymentUrl: fulfillment.payment_fallback_url || null,
      credentialStatus: fulfillment.delivery_status || null,
      updatedAt: (row as any).updated_at || null,
      message:
        normalizedStatus === "success"
          ? found.kind === "topup"
            ? "Pembayaran berhasil dan saldo sedang diproses ke akun Anda."
            : "Pembayaran berhasil dan pesanan Anda sedang diproses."
          : normalizedStatus === "failed"
            ? "Transaksi sudah tidak dapat diproses. Silakan buat pembayaran baru bila dibutuhkan."
            : "Pembayaran masih menunggu verifikasi."
    });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Gagal mengambil status pesanan." }, { status: 500 });
  }
}
