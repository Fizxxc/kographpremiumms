import { createHash } from "node:crypto";

type PakasirCreateResponse = {
  payment?: {
    project?: string;
    order_id?: string;
    amount?: number;
    fee?: number;
    total_payment?: number;
    payment_method?: string;
    payment_number?: string;
    expired_at?: string;
  };
  [key: string]: any;
};

type PakasirDetailResponse = {
  transaction?: {
    amount?: number;
    order_id?: string;
    project?: string;
    status?: string;
    payment_method?: string;
    completed_at?: string;
  };
  [key: string]: any;
};

const PAKASIR_BASE_URL = process.env.PAKASIR_BASE_URL || "https://app.pakasir.com";

function getProjectSlug() {
  const value = String(process.env.PAKASIR_PROJECT_SLUG || "").trim();
  if (!value) throw new Error("PAKASIR_PROJECT_SLUG belum diisi.");
  return value;
}

function getApiKey() {
  const value = String(process.env.PAKASIR_API_KEY || "").trim();
  if (!value) throw new Error("PAKASIR_API_KEY belum diisi.");
  return value;
}

function normalizeBaseUrl(url: string) {
  return url.replace(/\/$/, "");
}

async function parseJsonSafe(response: Response) {
  const text = await response.text();
  try {
    return text ? JSON.parse(text) : null;
  } catch {
    return { raw: text };
  }
}

function getReadablePakasirError(payload: any, fallback: string) {
  return String(
    payload?.message ||
    payload?.error ||
    payload?.errors?.[0] ||
    payload?.raw ||
    fallback
  );
}

export function buildPakasirPayUrl(input: {
  amount: number;
  orderId: string;
  redirectUrl?: string | null;
  qrisOnly?: boolean;
}) {
  const base = normalizeBaseUrl(PAKASIR_BASE_URL);
  const url = new URL(`${base}/pay/${getProjectSlug()}/${Math.max(0, Math.round(Number(input.amount || 0)))}`);
  url.searchParams.set("order_id", input.orderId);
  if (input.qrisOnly !== false) url.searchParams.set("qris_only", "1");
  if (input.redirectUrl) url.searchParams.set("redirect", input.redirectUrl);
  return url.toString();
}

export async function createPakasirTransaction(input: {
  orderId: string;
  amount: number;
  method?: string;
}) {
  const method = String(input.method || "qris").trim().toLowerCase();
  const response = await fetch(`${normalizeBaseUrl(PAKASIR_BASE_URL)}/api/transactioncreate/${method}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      project: getProjectSlug(),
      order_id: input.orderId,
      amount: Math.max(0, Math.round(Number(input.amount || 0))),
      api_key: getApiKey()
    }),
    cache: "no-store"
  });

  const payload = (await parseJsonSafe(response)) as PakasirCreateResponse | null;
  if (!response.ok || !payload?.payment) {
    throw new Error(getReadablePakasirError(payload, "Gagal membuat transaksi Pakasir."));
  }

  const payment = payload.payment || {};
  return {
    payment,
    orderId: String(payment.order_id || input.orderId),
    amount: Number(payment.amount || input.amount || 0),
    fee: Number(payment.fee || 0),
    totalPayment: Number(payment.total_payment || payment.amount || input.amount || 0),
    paymentMethod: String(payment.payment_method || method || "qris"),
    paymentNumber: String(payment.payment_number || ""),
    qrString: String(payment.payment_method || method) === "qris" ? String(payment.payment_number || "") : "",
    expiresAt: payment.expired_at ? String(payment.expired_at) : null,
    raw: payload
  };
}

export async function getPakasirTransactionDetail(input: { orderId: string; amount: number }) {
  const url = new URL(`${normalizeBaseUrl(PAKASIR_BASE_URL)}/api/transactiondetail`);
  url.searchParams.set("project", getProjectSlug());
  url.searchParams.set("amount", String(Math.max(0, Math.round(Number(input.amount || 0)))));
  url.searchParams.set("order_id", input.orderId);
  url.searchParams.set("api_key", getApiKey());

  const response = await fetch(url.toString(), {
    method: "GET",
    cache: "no-store"
  });

  const payload = (await parseJsonSafe(response)) as PakasirDetailResponse | null;
  if (!response.ok || !payload?.transaction) {
    throw new Error(getReadablePakasirError(payload, "Gagal mengambil status transaksi Pakasir."));
  }

  return payload;
}

export async function cancelPakasirTransaction(input: { orderId: string; amount: number }) {
  const response = await fetch(`${normalizeBaseUrl(PAKASIR_BASE_URL)}/api/transactioncancel`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      project: getProjectSlug(),
      order_id: input.orderId,
      amount: Math.max(0, Math.round(Number(input.amount || 0))),
      api_key: getApiKey()
    }),
    cache: "no-store"
  });

  const payload = await parseJsonSafe(response);
  if (!response.ok) throw new Error(getReadablePakasirError(payload, "Gagal membatalkan transaksi Pakasir."));
  return payload;
}

export function normalizePakasirStatus(status: unknown) {
  const value = String(status || "").trim().toLowerCase();
  if (["completed", "settlement", "paid", "success"].includes(value)) return "settlement";
  if (["cancelled", "canceled", "expired", "expire", "failed", "deny"].includes(value)) return "expire";
  return "pending";
}

export function getPakasirStatusLabel(status: unknown) {
  const normalized = normalizePakasirStatus(status);
  if (normalized === "settlement") return "Sudah dibayar";
  if (normalized === "expire") return "Kedaluwarsa / batal";
  return "Menunggu pembayaran";
}

export function buildPakasirWebhookFingerprint(input: { orderId: string; amount: number; completedAt?: string | null }) {
  return createHash("sha256")
    .update(`${input.orderId}|${Math.max(0, Math.round(Number(input.amount || 0)))}|${String(input.completedAt || "")}`)
    .digest("hex");
}
