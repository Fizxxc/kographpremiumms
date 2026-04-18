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
    const {
      data: { user }
    } = await supabase.auth.getUser();

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
        created_at,
        paid_at,
        public_order_code,
        buyer_name,
        buyer_email,
        fulfillment_data,
        product_snapshot,
        products ( name, category )
      `)
      .eq("order_id", orderId)
      .limit(1);

    if (user?.id) query = query.eq("user_id", user.id);
    else if (resi) query = query.eq("public_order_code", resi);
    else {
      return NextResponse.json({ error: "Akses invoice memerlukan login atau resi pesanan." }, { status: 401 });
    }

    const { data: tx, error } = await query.maybeSingle();

    if (error || !tx) {
      return NextResponse.json({ error: "Invoice tidak ditemukan." }, { status: 404 });
    }

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

    const pdfBytes = await generateInvoicePdf({
      orderId: String((tx as any).order_id),
      resi: String((tx as any).public_order_code || "-"),
      customerName: String((tx as any).buyer_name || "Customer"),
      customerEmail: String((tx as any).buyer_email || "-"),
      productName: String(product?.name || (tx as any).product_snapshot?.product_name || "Produk"),
      variantName: String((tx as any).product_snapshot?.variant_name || ""),
      category: String(product?.category || (tx as any).product_snapshot?.category || "Layanan Digital"),
      paymentMethod: String((tx as any).payment_method || "QRIS").toUpperCase(),
      status: String((tx as any).status || "pending"),
      createdAt: String((tx as any).created_at || new Date().toISOString()),
      paidAt: (tx as any).paid_at ? String((tx as any).paid_at) : null,
      subtotal: Number((tx as any).amount || 0),
      discount: Number((tx as any).discount_amount || 0),
      total: Number((tx as any).final_amount || (tx as any).amount || 0),
      credential: deliveryFields.length > 0
        ? Object.fromEntries(deliveryFields.map((field) => [field.label, field.value]))
        : undefined
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
