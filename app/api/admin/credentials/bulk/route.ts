import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { requireAdminApi } from "@/app/api/admin/helpers";

type NormalizedCredential = string;

function normalizeKey(raw: string) {
  return String(raw || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "_")
    .replace(/[^a-z0-9_]/g, "");
}

function titleLine(key: string, value: string) {
  return `${normalizeKey(key)}: ${String(value || "").trim()}`;
}

function parseTxtLine(line: string) {
  const matches = [...line.matchAll(/([a-zA-Z][a-zA-Z0-9_\- ]*)\s*:\s*([^\s][^]*?)(?=\s+[a-zA-Z][a-zA-Z0-9_\- ]*\s*:|$)/g)];
  if (matches.length === 0) return null;

  const fields = matches
    .map((match) => ({ key: normalizeKey(match[1]), value: String(match[2] || "").trim() }))
    .filter((item) => item.key && item.value);

  if (fields.length === 0) return null;
  return fields.map((field) => `${field.key}: ${field.value}`).join("\n");
}

function parseCsvLine(line: string) {
  const parts = line.split(",").map((part) => part.trim()).filter(Boolean);
  if (parts.length < 2) return null;

  if (parts.length === 2) {
    return [
      titleLine("username", parts[0]),
      titleLine("password", parts[1])
    ].join("\n");
  }

  return [
    titleLine("email", parts[0]),
    titleLine("username", parts[1]),
    titleLine("password", parts.slice(2).join(","))
  ].join("\n");
}

function normalizePayload(format: string, payload: string): NormalizedCredential[] {
  const lines = String(payload || "")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  const normalized = lines
    .map((line) => {
      if (format === "csv") return parseCsvLine(line);
      return parseTxtLine(line) || parseCsvLine(line);
    })
    .filter((line): line is string => Boolean(line));

  return Array.from(new Set(normalized));
}

export async function POST(request: Request) {
  try {
    const { admin } = await requireAdminApi();
    const body = await request.json();

    const productId = String(body.productId || "").trim();
    const format = String(body.format || "txt").trim().toLowerCase();
    const payload = String(body.payload || "");

    if (!productId) {
      return NextResponse.json({ error: "Produk wajib dipilih." }, { status: 400 });
    }

    const accounts = normalizePayload(format, payload);
    if (accounts.length === 0) {
      return NextResponse.json({ error: "Tidak ada credential valid yang bisa diproses." }, { status: 400 });
    }

    const { data: product } = await admin
      .from("products")
      .select("id, service_type")
      .eq("id", productId)
      .maybeSingle();

    if (!product) {
      return NextResponse.json({ error: "Produk tidak ditemukan." }, { status: 404 });
    }

    if ((product as any).service_type === "pterodactyl") {
      return NextResponse.json({ error: "Produk panel auto tidak memakai credential manual." }, { status: 400 });
    }

    const rows = accounts.map((account) => ({
      product_id: productId,
      account_data: account,
      is_used: false
    }));

    const { error: insertError } = await admin.from("app_credentials").insert(rows);
    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    const { error: stockError } = await admin.rpc("increment_product_stock", {
      p_product_id: productId,
      p_amount: accounts.length
    });

    if (stockError) {
      return NextResponse.json({ error: stockError.message }, { status: 500 });
    }

    revalidatePath("/");
    revalidatePath("/products");
    revalidatePath("/admin");
    revalidatePath(`/products/${productId}`);

    return NextResponse.json({
      success: true,
      inserted: accounts.length,
      preview: accounts.slice(0, 3)
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Gagal upload credential.";
    if (message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Silakan login terlebih dahulu." }, { status: 401 });
    }
    if (message === "FORBIDDEN") {
      return NextResponse.json({ error: "Akses admin diperlukan." }, { status: 403 });
    }
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
