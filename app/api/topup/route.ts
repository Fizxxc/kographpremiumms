import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { buildPakasirPayUrl, createPakasirTransaction } from "@/lib/pakasir";

function generateOrderId() {
  return `KGP-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
}

function generatePublicOrderCode() {
  return randomUUID().replace(/-/g, "").slice(0, 10).toUpperCase();
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const amount = Number(body.amount || 0);
    if (!Number.isFinite(amount) || amount < 1000) {
      return NextResponse.json({ error: "Minimal top up Rp 1.000." }, { status: 400 });
    }

    const supabase = createServerSupabaseClient();
    const {
      data: { user }
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Silakan login terlebih dahulu." }, { status: 401 });
    }

    const admin = createAdminSupabaseClient();
    const orderId = generateOrderId();
    const publicOrderCode = generatePublicOrderCode();
    const paymentStatusUrl = `${process.env.NEXT_PUBLIC_APP_URL || ""}/waiting-payment/${orderId}?resi=${publicOrderCode}&type=topup`;
    const qris = await createPakasirTransaction({ orderId, amount, method: "qris" });
    const paymentUrl = buildPakasirPayUrl({ amount, orderId, redirectUrl: paymentStatusUrl, qrisOnly: true });

    const { error } = await admin.from("wallet_topups").insert({
      user_id: user.id,
      order_id: orderId,
      amount,
      status: "pending",
      gateway_name: "pakasir",
      gateway_reference: orderId,
      gateway_payload: qris.raw,
      public_order_code: publicOrderCode,
      fulfillment_data: {
        payment_provider: "pakasir",
        payment_qr_string: qris.qrString || null,
        payment_total_amount: qris.totalPayment || amount,
        payment_fee: qris.fee || 0,
        payment_expires_at: qris.expiresAt || null,
        payment_fallback_url: paymentUrl,
        payment_redirect_url: paymentStatusUrl
      }
    } as any);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      ok: true,
      orderId,
      publicOrderCode,
      gateway: "pakasir",
      amount,
      qrString: qris.qrString,
      qrUrl: null,
      paymentUrl,
      expiresAt: qris.expiresAt,
      waitingPaymentUrl: `/waiting-payment/${orderId}?resi=${publicOrderCode}&type=topup`
    });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Gagal membuat top up." }, { status: 500 });
  }
}
