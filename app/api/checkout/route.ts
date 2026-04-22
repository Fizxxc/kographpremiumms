import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { createPakasirTransaction, buildPakasirPayUrl } from "@/lib/pakasir";

type VariantPayload = { id?: string; name?: string; price?: number; compare_at_price?: number };

function generateOrderId() {
  return `KGP-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
}

function generateStatusToken() {
  return randomUUID().replace(/-/g, "").slice(0, 12).toUpperCase();
}

function generatePublicOrderCode() {
  return randomUUID().replace(/-/g, "").slice(0, 10).toUpperCase();
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const productId = String(body.productId || "").trim();
    const buyerName = String(body.buyerName || "").trim();
    const buyerEmail = String(body.buyerEmail || "").trim();
    const buyerPhone = String(body.buyerPhone || "").trim();
    const notes = String(body.notes || body.note || "").trim();
    const couponCode = String(body.couponCode || "").trim().toUpperCase();
    const variant = (body.variant || null) as VariantPayload | null;
    const variantId = String(body.variantId || variant?.id || "").trim();

    if (!productId) return NextResponse.json({ error: "Produk wajib dipilih." }, { status: 400 });
    if (!buyerName || !buyerEmail) {
      return NextResponse.json({ error: "Nama dan email pembeli wajib diisi." }, { status: 400 });
    }

    const supabase = createServerSupabaseClient();
    const admin = createAdminSupabaseClient();
    const {
      data: { user }
    } = await supabase.auth.getUser();

    const { data: product } = await admin
      .from("products")
      .select("id, name, description, price, compare_at_price, stock, is_active, image_url, service_type")
      .eq("id", productId)
      .single();

    if (!product || !product.is_active) {
      return NextResponse.json({ error: "Produk tidak tersedia." }, { status: 404 });
    }

    if (Number(product.stock || 0) <= 0) {
      return NextResponse.json({ error: "Stok produk sedang habis." }, { status: 400 });
    }

    let amount = Number(product.price || 0);
    const selectedVariantId = variantId || variant?.id || "";
    if (selectedVariantId) {
      const { data: variantRow } = await admin
        .from("product_variants")
        .select("id, name, price, compare_at_price, is_active")
        .eq("id", selectedVariantId)
        .eq("product_id", product.id)
        .maybeSingle();

      if (!variantRow || !(variantRow as any).is_active) {
        return NextResponse.json({ error: "Varian produk tidak valid." }, { status: 400 });
      }

      amount = Number((variantRow as any).price || amount);
      body.variant = {
        id: (variantRow as any).id,
        name: (variantRow as any).name,
        price: Number((variantRow as any).price || 0),
        compare_at_price: Number((variantRow as any).compare_at_price || 0)
      };
    }

    let discountAmount = 0;
    let appliedCoupon: any = null;

    if (couponCode) {
      const { data: coupon } = await admin
        .from("coupons")
        .select("id, code, type, value, min_purchase, max_discount, quota, used_count, is_active, starts_at, ends_at")
        .eq("code", couponCode)
        .maybeSingle();

      if (coupon && (coupon as any).is_active) {
        const now = new Date();
        const startsAt = (coupon as any).starts_at ? new Date((coupon as any).starts_at) : null;
        const endsAt = (coupon as any).ends_at ? new Date((coupon as any).ends_at) : null;
        const quotaLeft = (coupon as any).quota == null || Number((coupon as any).used_count || 0) < Number((coupon as any).quota || 0);
        const timeOk = (!startsAt || startsAt <= now) && (!endsAt || endsAt >= now);
        const minPurchaseOk = Number(amount) >= Number((coupon as any).min_purchase || 0);

        if (quotaLeft && timeOk && minPurchaseOk) {
          if ((coupon as any).type === "percentage") {
            discountAmount = Math.floor((amount * Number((coupon as any).value || 0)) / 100);
            if ((coupon as any).max_discount) {
              discountAmount = Math.min(discountAmount, Number((coupon as any).max_discount || 0));
            }
          } else {
            discountAmount = Number((coupon as any).value || 0);
          }
          discountAmount = Math.max(0, Math.min(discountAmount, amount));
          appliedCoupon = coupon;
        }
      }
    }

    const finalAmount = Math.max(0, amount - discountAmount);
    if (finalAmount <= 0) {
      return NextResponse.json({ error: "Total pembayaran tidak valid." }, { status: 400 });
    }

    const orderId = generateOrderId();
    const publicOrderCode = generatePublicOrderCode();
    const statusToken = generateStatusToken();
    const paymentStatusUrl = `${process.env.NEXT_PUBLIC_APP_URL || ""}/waiting-payment/${orderId}?resi=${publicOrderCode}&type=transaction`;
    const qris = await createPakasirTransaction({ orderId, amount: finalAmount, method: "qris" });
    const paymentUrl = buildPakasirPayUrl({ amount: finalAmount, orderId, redirectUrl: paymentStatusUrl, qrisOnly: true });

    const fulfillmentData = {
      buyer_phone: buyerPhone || null,
      notes: notes || null,
      payment_provider: "pakasir",
      payment_qr_string: qris.qrString || null,
      payment_qr_url: qris.qrUrl || null,
      payment_number: qris.paymentNumber || null,
      payment_total_amount: qris.totalPayment || finalAmount,
      payment_fee: qris.fee || 0,
      payment_expires_at: qris.expiresAt || null,
      payment_redirect_url: paymentStatusUrl,
      payment_fallback_url: paymentUrl,
      payment_actions: [],
      variant_id: body.variant?.id || null,
      variant_name: body.variant?.name || null,
      provider_response: qris.raw
    };

    const { error: insertError } = await admin.from("transactions").insert({
      user_id: user?.id || null,
      product_id: product.id,
      variant_id: body.variant?.id || null,
      order_id: orderId,
      public_order_code: publicOrderCode,
      status_token: statusToken,
      status: "pending",
      amount,
      discount_amount: discountAmount,
      final_amount: finalAmount,
      payment_method: "qris",
      gateway_name: "pakasir",
      gateway_reference: orderId,
      buyer_name: buyerName,
      buyer_email: buyerEmail,
      buyer_phone: buyerPhone || null,
      notes: notes || null,
      coupon_code: appliedCoupon?.code || null,
      product_snapshot: {
        product_name: product.name,
        product_price: amount,
        product_image_url: product.image_url,
        variant_name: body.variant?.name || null,
        variant_id: body.variant?.id || null
      },
      gateway_payload: qris.raw,
      fulfillment_data: fulfillmentData
    });

    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    if (appliedCoupon?.id) {
      await admin
        .from("coupons")
        .update({ used_count: Number(appliedCoupon.used_count || 0) + 1 })
        .eq("id", appliedCoupon.id);
    }

    return NextResponse.json({
      ok: true,
      orderId,
      publicOrderCode,
      statusToken,
      paymentMethod: "qris",
      gateway: "pakasir",
      amount: finalAmount,
      qrString: qris.qrString,
      qrUrl: null,
      paymentUrl,
      expiresAt: qris.expiresAt,
      waitingPaymentUrl: `/waiting-payment/${orderId}?resi=${publicOrderCode}&type=transaction`,
      paymentStatusUrl: `/waiting-payment/${orderId}?resi=${publicOrderCode}&type=transaction`
    });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Gagal membuat transaksi pembayaran." }, { status: 500 });
  }
}
