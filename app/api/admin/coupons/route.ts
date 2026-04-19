import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";

async function parseCouponPayload(request: Request) {
  const contentType = request.headers.get("content-type") || "";

  if (contentType.includes("application/json")) {
    const body = await request.json();
    return {
      code: String(body.code ?? "").trim().toUpperCase(),
      type: String(body.type ?? "percentage") as "fixed" | "percentage",
      value: Number(body.value ?? 0),
      min_purchase: Number(body.min_purchase ?? body.minOrder ?? 0),
      max_discount: body.max_discount ?? body.maxDiscount ?? null,
      quota: body.quota ?? null,
      is_active: Boolean(body.is_active ?? body.active ?? false)
    };
  }

  const formData = await request.formData();
  return {
    code: String(formData.get("code") ?? "").trim().toUpperCase(),
    type: String(formData.get("type") ?? "percentage") as "fixed" | "percentage",
    value: Number(formData.get("value") ?? 0),
    min_purchase: Number(formData.get("min_purchase") ?? formData.get("minOrder") ?? 0),
    max_discount: formData.get("max_discount") ?? formData.get("maxDiscount") ?? null,
    quota: formData.get("quota") ?? null,
    is_active: formData.get("is_active") != null || formData.get("active") != null
  };
}

export async function POST(request: Request) {
  try {
    const supabase = createServerSupabaseClient();
    const admin = createAdminSupabaseClient();

    const {
      data: { user }
    } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { data: profile } = await admin.from("profiles").select("role").eq("id", user.id).single();
    if (profile?.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const payload = await parseCouponPayload(request);
    const maxDiscountValue = payload.max_discount == null || payload.max_discount === "" ? null : Number(payload.max_discount);
    const quotaValue = payload.quota == null || payload.quota === "" ? null : Number(payload.quota);

    if (!payload.code || !["fixed", "percentage"].includes(payload.type) || payload.value <= 0) {
      return NextResponse.json({ error: "Data kupon tidak valid" }, { status: 400 });
    }

    const insertPayload = {
      code: payload.code,
      type: payload.type,
      value: payload.value,
      min_purchase: Number(payload.min_purchase || 0),
      max_discount: Number.isFinite(maxDiscountValue as number) ? maxDiscountValue : null,
      quota: Number.isFinite(quotaValue as number) ? quotaValue : null,
      is_active: payload.is_active
    };

    const { data: coupon, error: insertError } = await admin.from("coupons").insert(insertPayload).select("*").single();

    if (insertError) return NextResponse.json({ error: insertError.message }, { status: 500 });
    return NextResponse.json({ success: true, coupon });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Gagal membuat kupon" },
      { status: 500 }
    );
  }
}
