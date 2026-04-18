import { NextResponse } from "next/server";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { fulfillProductOrder, settleWalletTopup } from "@/lib/fulfillment";
import { buildPakasirWebhookFingerprint, getPakasirTransactionDetail, normalizePakasirStatus } from "@/lib/pakasir";

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const orderId = String(payload?.order_id || "").trim();
    const project = String(payload?.project || "").trim();
    const amount = Number(payload?.amount || 0);

    if (!orderId || !project || !amount) {
      return NextResponse.json({ error: "Payload webhook Pakasir tidak lengkap." }, { status: 400 });
    }

    const configuredProject = String(process.env.PAKASIR_PROJECT_SLUG || "").trim();
    if (configuredProject && project !== configuredProject) {
      return NextResponse.json({ error: "Project Pakasir tidak cocok." }, { status: 403 });
    }

    const verified = await getPakasirTransactionDetail({ orderId, amount });
    const transaction = verified.transaction;
    if (!transaction) {
      return NextResponse.json({ error: "Status transaksi Pakasir tidak dapat diverifikasi." }, { status: 502 });
    }

    if (String(transaction.order_id || "") !== orderId || Number(transaction.amount || 0) !== amount) {
      return NextResponse.json({ error: "Data webhook Pakasir tidak cocok dengan hasil verifikasi." }, { status: 409 });
    }

    const status = normalizePakasirStatus(transaction.status);
    const admin = createAdminSupabaseClient();
    const commonUpdate = {
      status,
      paid_at: transaction.completed_at || null,
      gateway_name: "pakasir",
      gateway_reference: String(transaction.order_id || orderId),
      gateway_payload: verified,
      fulfillment_data: {
        payment_provider: "pakasir",
        payment_method: String(transaction.payment_method || payload?.payment_method || "qris"),
        payment_completed_at: transaction.completed_at || null,
        webhook_fingerprint: buildPakasirWebhookFingerprint({
          orderId,
          amount,
          completedAt: transaction.completed_at || null
        })
      }
    } as any;

    const { data: tx } = await admin.from("transactions").select("id, fulfillment_data").eq("order_id", orderId).maybeSingle();
    if (tx?.id) {
      await admin
        .from("transactions")
        .update({
          ...commonUpdate,
          payment_method: String(transaction.payment_method || payload?.payment_method || "qris").toLowerCase(),
          fulfillment_data: {
            ...((tx as any).fulfillment_data || {}),
            ...((commonUpdate as any).fulfillment_data || {})
          }
        })
        .eq("id", tx.id);

      if (status === "settlement") {
        await fulfillProductOrder(orderId);
      }

      return NextResponse.json({ ok: true, type: "transaction", status });
    }

    const { data: topup } = await admin.from("wallet_topups").select("id, fulfillment_data").eq("order_id", orderId).maybeSingle();
    if (topup?.id) {
      await admin
        .from("wallet_topups")
        .update({
          ...commonUpdate,
          fulfillment_data: {
            ...((topup as any).fulfillment_data || {}),
            ...((commonUpdate as any).fulfillment_data || {})
          }
        })
        .eq("id", topup.id);

      if (status === "settlement") {
        await settleWalletTopup(orderId);
      }

      return NextResponse.json({ ok: true, type: "topup", status });
    }

    return NextResponse.json({ ok: true, status, ignored: true, reason: "order_not_found" });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Webhook Pakasir gagal diproses." }, { status: 500 });
  }
}
