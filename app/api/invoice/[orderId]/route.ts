import { NextResponse } from "next/server";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { generateInvoicePdf } from "@/lib/pdf";
import { buildDeliveryFields } from "@/lib/order-delivery";

export async function GET(request: Request, { params }: { params: { orderId: string } }) {
  try {
    const orderId = String(params.orderId || "").trim();
    const url = new URL(request.url);
    const resi = String(url.searchParams.get("resi") || "").trim();
    const forceDownload = ["1", "true", "yes"].includes(String(url.searchParams.get("download") || "").toLowerCase());

    if (!orderId) {
      return NextResponse.json({ error: "Order ID wajib diisi." }, { status: 400 });
    }

    const supabase = createServerSupabaseClient();
    const admin = createAdminSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    const selectFields = `
      id,
      order_id,
      user_id,
      status,
      amount,
      discount_amount,
      final_amount,
      created_at,
      public_order_code,
      buyer_name,
      buyer_email,
      fulfillment_data,
      product_snapshot,
      products ( name, category )
    `;

    let tx: any = null;

    if (user?.id) {
      const owned = await admin
        .from("transactions")
        .select(selectFields)
        .eq("order_id", orderId)
        .eq("user_id", user.id)
        .maybeSingle();
      tx = owned.data || null;
    }

    if (!tx && resi) {
      const byResi = await admin
        .from("transactions")
        .select(selectFields)
        .eq("order_id", orderId)
        .eq("public_order_code", resi)
        .maybeSingle();
      tx = byResi.data || null;
    }

    if (!tx && !user?.id && !resi) {
      return NextResponse.json({ error: "Akses invoice memerlukan login atau resi pesanan." }, { status: 401 });
    }

    if (!tx) {
      return NextResponse.json(
        { error: user?.id ? "Invoice tidak ditemukan untuk akun ini. Gunakan resi pesanan bila order dibuat sebagai guest." : "Invoice tidak ditemukan." },
        { status: 404 }
      );
    }

    const { data: credential } = await admin
      .from("app_credentials")
      .select("account_data")
      .eq("transaction_id", (tx as any).id)
      .maybeSingle();

    const product = Array.isArray((tx as any).products) ? (tx as any).products[0] : (tx as any).products;
    const deliveryFields = buildDeliveryFields({ fulfillmentData: (tx as any).fulfillment_data || {}, credential });
    const credentialText = deliveryFields.length > 0 ? deliveryFields.map((field) => `${field.label}: ${field.value}`).join("\n") : null;

    const pdfBytes = await generateInvoicePdf({

      orderId: String((tx as any).order_id),
      customerName: String((tx as any).buyer_name || "Customer"),
      productName: String(product?.name || (tx as any).product_snapshot?.product_name || "Produk"),
      amount: Number((tx as any).amount || 0),
      discountAmount: Number((tx as any).discount_amount || 0),
      finalAmount: Number((tx as any).final_amount || (tx as any).amount || 0),
      status: String((tx as any).status || "pending"),
      createdAt: String((tx as any).created_at || new Date().toISOString()),
      credential: credentialText,
      couponCode: null
    });

    const safeFilename = `${String((tx as any).order_id).replace(/[^a-zA-Z0-9-_]/g, "_")}-invoice.pdf`;

    return new NextResponse(Buffer.from(pdfBytes), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `${forceDownload ? "attachment" : "inline"}; filename="${safeFilename}"`,
        "Cache-Control": "private, no-store"
      }
    });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Gagal membuat invoice PDF." }, { status: 500 });
  }
}
