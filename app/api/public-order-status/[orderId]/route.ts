import { NextRequest, NextResponse } from "next/server";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { getPakasirTransactionDetail, normalizePakasirStatus } from "@/lib/pakasir";
import { syncPakasirOrderState } from "@/lib/payment-reconcile";
import { buildDeliveryFields } from "@/lib/order-delivery";

type LookupResult =
  | { kind: "transaction"; row: any }
  | { kind: "topup"; row: any }
  | null;

async function findTransaction(admin: ReturnType<typeof createAdminSupabaseClient>, orderId: string, publicOrderCode?: string) {
  const base = admin
    .from("transactions")
    .select("id, order_id, public_order_code, status, amount, final_amount, buyer_name, buyer_email, product_snapshot, fulfillment_data, updated_at")
    .eq("order_id", orderId)
    .limit(1);

  if (publicOrderCode) {
    const withCode = await base.eq("public_order_code", publicOrderCode).maybeSingle();
    if (withCode.data) return withCode.data;
  }

  const fallback = await admin
    .from("transactions")
    .select("id, order_id, public_order_code, status, amount, final_amount, buyer_name, buyer_email, product_snapshot, fulfillment_data, updated_at")
    .eq("order_id", orderId)
    .maybeSingle();

  return fallback.data || null;
}

async function findTopup(admin: ReturnType<typeof createAdminSupabaseClient>, orderId: string, publicOrderCode?: string) {
  const base = admin
    .from("wallet_topups")
    .select("id, order_id, public_order_code, status, amount, fulfillment_data, updated_at")
    .eq("order_id", orderId)
    .limit(1);

  if (publicOrderCode) {
    const withCode = await base.eq("public_order_code", publicOrderCode).maybeSingle();
    if (withCode.data) return withCode.data;
  }

  const fallback = await admin
    .from("wallet_topups")
    .select("id, order_id, public_order_code, status, amount, fulfillment_data, updated_at")
    .eq("order_id", orderId)
    .maybeSingle();

  return fallback.data || null;
}

async function findStatusRow(input: {
  orderId: string;
  publicOrderCode?: string;
  explicitType?: string | null;
}): Promise<LookupResult> {
  const admin = createAdminSupabaseClient();
  const orderId = String(input.orderId || "").trim();
  const publicOrderCode = String(input.publicOrderCode || "").trim() || undefined;
  const explicitType = String(input.explicitType || "").trim().toLowerCase();

  if (explicitType === "topup") {
    const topup = await findTopup(admin, orderId, publicOrderCode);
    return topup ? { kind: "topup", row: topup } : null;
  }

  if (explicitType === "transaction") {
    const transaction = await findTransaction(admin, orderId, publicOrderCode);
    return transaction ? { kind: "transaction", row: transaction } : null;
  }

  const transaction = await findTransaction(admin, orderId, publicOrderCode);
  if (transaction) return { kind: "transaction", row: transaction };

  const topup = await findTopup(admin, orderId, publicOrderCode);
  if (topup) return { kind: "topup", row: topup };

  return null;
}

export async function GET(request: NextRequest, { params }: { params: { orderId: string } }) {
  try {
    const orderId = String(params.orderId || "").trim();
    const publicOrderCode = String(request.nextUrl.searchParams.get("resi") || "").trim();
    const explicitType = String(request.nextUrl.searchParams.get("type") || "").trim().toLowerCase();

    if (!orderId) {
      return NextResponse.json({ error: "Order ID wajib diisi." }, { status: 400 });
    }

    const found = await findStatusRow({ orderId, publicOrderCode, explicitType: explicitType || null });
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

    const refreshed = await findStatusRow({ orderId, publicOrderCode, explicitType: found.kind });
    const kind = refreshed?.kind || found.kind;
    const row = refreshed?.row || found.row;
    const fulfillment = (row as any).fulfillment_data || {};
    const amount = Number((row as any).final_amount || (row as any).amount || fulfillment.payment_total_amount || 0);

    let credentialFields: Array<{ label: string; value: string }> = [];
    if (kind === "transaction") {
      const admin = createAdminSupabaseClient();
      const { data: credential } = await admin
        .from("app_credentials")
        .select("account_data")
        .eq("transaction_id", (row as any).id)
        .maybeSingle();

      if (credential?.account_data) {
        credentialFields = buildDeliveryFields(credential.account_data);
      }
    }

    let gatewayPayload = fulfillment.provider_response || fulfillment.gateway_payload || (row as any).gateway_payload || null;

    try {
      if (amount > 0) {
        const pakasir = await getPakasirTransactionDetail({ orderId, amount });
        if (pakasir) gatewayPayload = pakasir;
      }
    } catch {
      // pakai data lokal jika Pakasir sedang gagal diakses
    }

    const rawStatus = String(
      gatewayPayload?.transaction?.status ||
      gatewayPayload?.payment_status ||
      gatewayPayload?.paymentStatus ||
      fulfillment.payment_status ||
      (row as any).status ||
      "pending"
    ).toLowerCase();

    const normalizedGatewayStatus = normalizePakasirStatus(rawStatus);
    const normalizedStatus = normalizedGatewayStatus === "settlement"
      ? "success"
      : normalizedGatewayStatus === "expire"
      ? "failed"
      : "pending";

    return NextResponse.json({
      ok: true,
      kind,
      orderId,
      publicOrderCode: (row as any).public_order_code || publicOrderCode || null,
      status: normalizedStatus,
      rawStatus,
      amount,
      buyerName: kind === "transaction" ? (row as any).buyer_name || null : null,
      buyerEmail: kind === "transaction" ? (row as any).buyer_email || null : null,
      productSnapshot: kind === "transaction" ? (row as any).product_snapshot || null : null,
      qrString:
        gatewayPayload?.payment?.payment_number ||
        gatewayPayload?.qr_content ||
        gatewayPayload?.qr_string ||
        gatewayPayload?.qris_content ||
        fulfillment.qr_string ||
        null,
      qrImage:
        gatewayPayload?.payment?.qr_url ||
        gatewayPayload?.payment?.qr_image ||
        gatewayPayload?.qr_url ||
        gatewayPayload?.qr_image ||
        gatewayPayload?.actions?.find?.((item: any) => typeof item?.url === "string" && String(item.url).includes("qr"))?.url ||
        fulfillment.qr_image ||
        null,
      statusLabel:
        normalizedStatus === "success"
          ? "Pembayaran berhasil diterima"
          : normalizedStatus === "failed"
          ? "Pembayaran tidak berhasil"
          : "Menunggu pembayaran",
      statusMessage:
        normalizedStatus === "success"
          ? kind === "topup"
            ? "Top up berhasil diproses dan saldo akan segera masuk ke akun Anda."
            : "Pembayaran berhasil. Pesanan Anda sedang diproses dan detailnya bisa dicek kembali dari halaman ini."
          : normalizedStatus === "failed"
          ? "Pembayaran tidak dapat diselesaikan. Silakan buat pesanan baru atau hubungi admin bila diperlukan."
          : "Lakukan pembayaran terlebih dahulu. Status akan diperbarui otomatis setelah sistem menerima konfirmasi.",
      credentialStatus: fulfillment.delivery_status || null,
      credentialFields,
      updatedAt: (row as any).updated_at || null,
    });
  } catch (error) {
    console.error("public-order-status error", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Gagal mengambil status pesanan.",
        code: "PUBLIC_STATUS_ERROR"
      },
      { status: 500 }
    );
  }
}
