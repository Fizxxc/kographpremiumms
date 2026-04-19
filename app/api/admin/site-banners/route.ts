import { NextResponse } from "next/server";
import { requireAdminApi } from "@/app/api/admin/helpers";

export async function POST(request: Request) {
  try {
    const { admin } = await requireAdminApi();
    const body = await request.json();
    const payload = {
      title: String(body.title || "").trim() || null,
      image_url: String(body.image_url || "").trim(),
      button_href: String(body.button_href || "").trim() || null,
      sort_order: Number(body.sort_order || 0),
      is_active: Boolean(body.is_active)
    };

    if (!payload.image_url) return NextResponse.json({ error: "Link banner wajib diisi." }, { status: 400 });

    const { data, error } = await admin.from("site_banners").insert(payload).select("*").single();
    if (error) throw new Error(error.message);
    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    const status = error?.message === "UNAUTHORIZED" ? 401 : error?.message === "FORBIDDEN" ? 403 : 500;
    return NextResponse.json({ error: error?.message || "Gagal menyimpan banner." }, { status });
  }
}

export async function PUT(request: Request) {
  try {
    const { admin } = await requireAdminApi();
    const body = await request.json();
    const id = String(body.id || "").trim();
    if (!id) return NextResponse.json({ error: "ID banner wajib diisi." }, { status: 400 });

    const payload = {
      title: body.title !== undefined ? String(body.title || "").trim() || null : undefined,
      image_url: body.image_url !== undefined ? String(body.image_url || "").trim() : undefined,
      button_href: body.button_href !== undefined ? String(body.button_href || "").trim() || null : undefined,
      sort_order: body.sort_order !== undefined ? Number(body.sort_order || 0) : undefined,
      is_active: body.is_active !== undefined ? Boolean(body.is_active) : undefined
    };

    if (payload.image_url !== undefined && !payload.image_url) {
      return NextResponse.json({ error: "Link banner wajib diisi." }, { status: 400 });
    }

    const { data, error } = await admin.from("site_banners").update(payload).eq("id", id).select("*").single();
    if (error) throw new Error(error.message);
    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    const status = error?.message === "UNAUTHORIZED" ? 401 : error?.message === "FORBIDDEN" ? 403 : 500;
    return NextResponse.json({ error: error?.message || "Gagal mengubah banner." }, { status });
  }
}

export async function DELETE(request: Request) {
  try {
    const { admin } = await requireAdminApi();
    const url = new URL(request.url);
    const id = String(url.searchParams.get("id") || "").trim();
    if (!id) return NextResponse.json({ error: "ID banner wajib diisi." }, { status: 400 });

    const { error } = await admin.from("site_banners").delete().eq("id", id);
    if (error) throw new Error(error.message);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    const status = error?.message === "UNAUTHORIZED" ? 401 : error?.message === "FORBIDDEN" ? 403 : 500;
    return NextResponse.json({ error: error?.message || "Gagal menghapus banner." }, { status });
  }
}
