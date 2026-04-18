"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  CheckCircle2,
  Copy,
  Download,
  ExternalLink,
  FileText,
  Loader2,
  MessageCircleMore,
  RefreshCw,
  ShieldCheck,
  Wallet,
} from "lucide-react";
import { SITE } from "@/lib/constants";
import { formatRupiah } from "@/lib/utils";

type PaymentStatusClientProps = {
  orderId: string;
  resi: string;
  type: string;
};

type CredentialField = {
  label: string;
  value: string;
};

const statusConfig: Record<string, { badge: string; icon: typeof Loader2; title: string; description: string }> = {
  settlement: {
    badge: "bg-emerald-100 text-emerald-700 dark:bg-emerald-400/15 dark:text-emerald-300",
    icon: CheckCircle2,
    title: "Pembayaran berhasil",
    description: "Transaksi telah tervalidasi dan detail layanan sudah disiapkan sesuai pesanan Anda."
  },
  pending: {
    badge: "bg-yellow-100 text-yellow-700 dark:bg-yellow-400/15 dark:text-yellow-300",
    icon: Loader2,
    title: "Menunggu pembayaran",
    description: "Silakan selesaikan pembayaran terlebih dahulu. Status akan diperbarui otomatis setelah transaksi berhasil."
  },
  expire: {
    badge: "bg-rose-100 text-rose-700 dark:bg-rose-400/15 dark:text-rose-300",
    icon: RefreshCw,
    title: "Pembayaran kedaluwarsa",
    description: "Sesi pembayaran sudah berakhir. Anda bisa membuat pesanan baru bila masih ingin melanjutkan transaksi."
  },
  cancel: {
    badge: "bg-rose-100 text-rose-700 dark:bg-rose-400/15 dark:text-rose-300",
    icon: RefreshCw,
    title: "Pembayaran dibatalkan",
    description: "Transaksi tidak dilanjutkan. Anda dapat melakukan order ulang kapan saja."
  },
  deny: {
    badge: "bg-rose-100 text-rose-700 dark:bg-rose-400/15 dark:text-rose-300",
    icon: RefreshCw,
    title: "Pembayaran ditolak",
    description: "Metode pembayaran belum berhasil diverifikasi. Silakan cek kembali atau gunakan pembayaran baru."
  }
};

function copyText(text: string, onDone: () => void) {
  if (!text) return;
  navigator.clipboard.writeText(text).then(onDone).catch(() => undefined);
}

export function PaymentStatusClient({ orderId, resi, type }: PaymentStatusClientProps) {
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const query = useMemo(() => {
    const params = new URLSearchParams();
    if (resi) params.set("resi", resi);
    if (type) params.set("type", type);
    return params.toString();
  }, [resi, type]);

  async function loadStatus() {
    try {
      setLoading(true);
      const response = await fetch(`/api/public-order-status/${encodeURIComponent(orderId)}?${query}`, {
        cache: "no-store"
      });
      const json = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(json.error || "Pesanan tidak ditemukan.");
      setData(json);
      setError(null);
    } catch (error: any) {
      setError(error?.message || "Pesanan tidak ditemukan.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadStatus();
    const interval = window.setInterval(() => {
      loadStatus();
    }, 10000);
    return () => window.clearInterval(interval);
  }, [orderId, query]);

  useEffect(() => {
    if (!data?.invoiceDownloadUrl || String(data?.status || "") !== "settlement") return;
    const key = `invoice-auto-${orderId}`;
    if (window.sessionStorage.getItem(key)) return;

    const timeout = window.setTimeout(() => {
      const link = document.createElement("a");
      link.href = data.invoiceDownloadUrl;
      link.target = "_blank";
      link.rel = "noreferrer";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.sessionStorage.setItem(key, "1");
    }, 1400);

    return () => window.clearTimeout(timeout);
  }, [data?.invoiceDownloadUrl, data?.status, orderId]);

  useEffect(() => {
    if (!copiedKey) return;
    const timeout = window.setTimeout(() => setCopiedKey(null), 1600);
    return () => window.clearTimeout(timeout);
  }, [copiedKey]);

  if (loading && !data) {
    return (
      <div className="container py-10">
        <div className="surface-card mx-auto flex max-w-3xl items-center gap-3 p-6 text-sm text-slate-600 dark:text-slate-300">
          <Loader2 className="h-5 w-5 animate-spin" /> Memuat status pembayaran...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container py-10">
        <div className="surface-card mx-auto max-w-3xl p-6 text-sm text-rose-600 dark:text-rose-300">{error}</div>
      </div>
    );
  }

  const config = statusConfig[String(data?.status || "pending")] || statusConfig.pending;
  const StatusIcon = config.icon;
  const credentialFields = Array.isArray(data?.credentialFields) ? (data.credentialFields as CredentialField[]) : [];
  const hasCredential = credentialFields.length > 0;
  const isSettlement = String(data?.status || "") === "settlement";

  return (
    <div className="container py-10">
      <div className="mx-auto max-w-6xl space-y-6 reveal-up">
        <div className="surface-card overflow-hidden p-6 sm:p-8">
          <div className="grid gap-6 xl:grid-cols-[1.2fr,0.8fr]">
            <div className="space-y-5">
              <div className={`inline-flex rounded-full px-4 py-2 text-xs font-black uppercase tracking-[0.24em] ${config.badge}`}>
                {config.title}
              </div>
              <div>
                <h1 className="text-3xl font-black tracking-tight text-slate-950 md:text-5xl dark:text-white">{config.title}</h1>
                <p className="mt-3 max-w-2xl text-sm leading-8 text-slate-600 dark:text-slate-300">{config.description}</p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-[26px] border border-slate-200/80 bg-slate-50/90 p-5 dark:border-white/10 dark:bg-white/5">
                  <div className="text-xs font-black uppercase tracking-[0.24em] text-slate-400 dark:text-slate-500">Order ID</div>
                  <div className="mt-2 break-words text-base font-black text-slate-950 dark:text-white">{data.orderId}</div>
                </div>
                <div className="rounded-[26px] border border-slate-200/80 bg-slate-50/90 p-5 dark:border-white/10 dark:bg-white/5">
                  <div className="text-xs font-black uppercase tracking-[0.24em] text-slate-400 dark:text-slate-500">Resi</div>
                  <div className="mt-2 text-base font-black text-slate-950 dark:text-white">{data.resi || "-"}</div>
                </div>
                <div className="rounded-[26px] border border-slate-200/80 bg-slate-50/90 p-5 dark:border-white/10 dark:bg-white/5">
                  <div className="text-xs font-black uppercase tracking-[0.24em] text-slate-400 dark:text-slate-500">Produk</div>
                  <div className="mt-2 text-base font-black text-slate-950 dark:text-white">{data.productName}</div>
                </div>
                <div className="rounded-[26px] border border-slate-200/80 bg-slate-50/90 p-5 dark:border-white/10 dark:bg-white/5">
                  <div className="text-xs font-black uppercase tracking-[0.24em] text-slate-400 dark:text-slate-500">Total</div>
                  <div className="mt-2 text-base font-black text-slate-950 dark:text-white">{formatRupiah(Number(data.amount || 0))}</div>
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={loadStatus}
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-200/80 bg-white/80 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-amber-300 hover:bg-amber-50 dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:border-amber-300/30 dark:hover:bg-white/10"
                >
                  <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} /> Refresh status
                </button>
                {data?.resi ? (
                  <Link
                    href={`/cek-pesanan?resi=${encodeURIComponent(String(data.resi))}`}
                    className="inline-flex items-center justify-center gap-2 rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 dark:bg-amber-300 dark:text-slate-950 dark:hover:bg-amber-200"
                  >
                    <ExternalLink className="h-4 w-4" /> Cek pesanan dengan resi
                  </Link>
                ) : null}
              </div>
            </div>

            <div className="rounded-[32px] border border-slate-200/80 bg-gradient-to-br from-emerald-50 via-white to-emerald-100/60 p-6 shadow-sm dark:border-emerald-300/15 dark:from-emerald-400/10 dark:via-emerald-400/5 dark:to-emerald-400/10">
              <div className="flex h-full flex-col justify-between gap-5">
                <div>
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-400/15 dark:text-emerald-300">
                    <StatusIcon className={`h-8 w-8 ${String(data?.status || "") === "pending" ? "animate-spin" : ""}`} />
                  </div>
                  <h2 className="mt-5 text-2xl font-black tracking-tight text-slate-950 dark:text-white">
                    {isSettlement ? "Transaksi telah diterima" : config.title}
                  </h2>
                  <p className="mt-3 text-sm leading-8 text-slate-600 dark:text-slate-300">
                    {hasCredential
                      ? "Data layanan sudah tersedia di halaman ini, juga dikirim otomatis ke email Anda bersama invoice PDF."
                      : isSettlement
                        ? "Pembayaran sudah masuk. Bila layanan memerlukan proses lanjutan, status pesanan akan terus diperbarui secara otomatis."
                        : "Silakan selesaikan pembayaran. Setelah berhasil, sistem akan memperbarui status dan menampilkan detail pesanan terbaru."}
                  </p>
                </div>

                <div className="space-y-3 rounded-[24px] border border-slate-200/80 bg-white/80 p-4 dark:border-white/10 dark:bg-slate-950/30">
                  <div className="text-xs font-black uppercase tracking-[0.24em] text-slate-400 dark:text-slate-500">Informasi bantuan</div>
                  <p className="text-sm leading-7 text-slate-600 dark:text-slate-300">
                    Butuh cek manual? Gunakan bot cek order <span className="font-semibold text-slate-900 dark:text-white">@{SITE.botUsername}</span> atau auto order <span className="font-semibold text-slate-900 dark:text-white">@{SITE.autoOrderBotUsername}</span>.
                  </p>
                  <div className="flex flex-wrap gap-3">
                    <a
                      href={`https://t.me/${SITE.botUsername}`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 rounded-full border border-slate-200/80 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-amber-300 hover:bg-amber-50 dark:border-white/10 dark:text-white dark:hover:border-amber-300/30 dark:hover:bg-white/10"
                    >
                      <MessageCircleMore className="h-4 w-4" /> Bot cek pesanan
                    </a>
                    <a
                      href={`mailto:${SITE.support.email}`}
                      className="inline-flex items-center gap-2 rounded-full border border-slate-200/80 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-amber-300 hover:bg-amber-50 dark:border-white/10 dark:text-white dark:hover:border-amber-300/30 dark:hover:bg-white/10"
                    >
                      <ShieldCheck className="h-4 w-4" /> Hubungi support
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {isSettlement ? (
          <div className="grid gap-6 xl:grid-cols-[1.1fr,0.9fr]">
            <div className="surface-card p-6 sm:p-8 reveal-up">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <div className="inline-flex rounded-full border border-emerald-200 bg-emerald-50/90 px-4 py-2 text-xs font-black uppercase tracking-[0.24em] text-emerald-700 dark:border-emerald-300/20 dark:bg-emerald-300/10 dark:text-emerald-300">
                    Detail layanan
                  </div>
                  <h2 className="mt-4 text-2xl font-black tracking-tight text-slate-950 dark:text-white">
                    {hasCredential ? "Credential sudah siap digunakan" : "Pesanan sedang disiapkan"}
                  </h2>
                  <p className="mt-2 text-sm leading-8 text-slate-600 dark:text-slate-300">
                    {hasCredential
                      ? "Simpan data berikut dengan baik. Informasi yang sama juga telah dikirim ke email Anda secara otomatis."
                      : "Begitu data layanan tersedia, halaman ini akan menampilkan detail terbaru secara otomatis tanpa perlu login."}
                  </p>
                </div>
                <div className="flex flex-wrap gap-3">
                  {data?.invoiceDownloadUrl ? (
                    <a
                      href={data.invoiceDownloadUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center justify-center gap-2 rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 dark:bg-amber-300 dark:text-slate-950 dark:hover:bg-amber-200"
                    >
                      <Download className="h-4 w-4" /> Download invoice
                    </a>
                  ) : null}
                  {data?.invoiceUrl ? (
                    <a
                      href={data.invoiceUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-200/80 bg-white/80 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-amber-300 hover:bg-amber-50 dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:border-amber-300/30 dark:hover:bg-white/10"
                    >
                      <FileText className="h-4 w-4" /> Lihat invoice
                    </a>
                  ) : null}
                </div>
              </div>

              {hasCredential ? (
                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  {credentialFields.map((field) => (
                    <div key={`${field.label}-${field.value}`} className="rounded-[24px] border border-slate-200/80 bg-slate-50/90 p-5 dark:border-white/10 dark:bg-white/5">
                      <div className="text-xs font-black uppercase tracking-[0.24em] text-slate-400 dark:text-slate-500">{field.label}</div>
                      <div className="mt-2 break-words text-sm font-bold leading-7 text-slate-950 dark:text-white">{field.value}</div>
                      <button
                        type="button"
                        onClick={() => copyText(field.value, () => setCopiedKey(field.label))}
                        className="mt-4 inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.18em] text-amber-600 transition hover:text-amber-500 dark:text-amber-300"
                      >
                        <Copy className="h-3.5 w-3.5" /> {copiedKey === field.label ? "Tersalin" : "Salin"}
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="mt-6 rounded-[28px] border border-slate-200/80 bg-slate-50/90 p-5 text-sm leading-8 text-slate-600 dark:border-white/10 dark:bg-white/5 dark:text-slate-300">
                  Pembayaran Anda sudah valid. Untuk layanan yang diproses manual atau bertahap, admin akan memperbarui detail pesanan secepatnya. Simpan resi pesanan agar lebih mudah saat melakukan pengecekan berikutnya.
                </div>
              )}
            </div>

            <div className="surface-card p-6 sm:p-8 reveal-up">
              <div className="inline-flex rounded-full border border-slate-200/80 bg-white/80 px-4 py-2 text-xs font-black uppercase tracking-[0.24em] text-slate-500 dark:border-white/10 dark:bg-white/5 dark:text-slate-400">
                Ringkasan akses
              </div>
              <div className="mt-5 space-y-4 text-sm leading-8 text-slate-600 dark:text-slate-300">
                <p>
                  Invoice PDF diunduh otomatis saat pembayaran berhasil agar bukti transaksi langsung tersimpan. Anda juga tetap bisa mengunduh ulang secara manual dari tombol di samping.
                </p>
                <p>
                  Untuk pengecekan cepat, gunakan resi pesanan ini: <span className="font-bold text-slate-950 dark:text-white">{data?.resi || "-"}</span>.
                </p>
              </div>

              <div className="mt-6 space-y-3 rounded-[28px] border border-slate-200/80 bg-slate-50/90 p-5 dark:border-white/10 dark:bg-white/5">
                <div className="flex items-center gap-3 text-slate-950 dark:text-white">
                  <Wallet className="h-5 w-5 text-amber-500" />
                  <div className="text-sm font-black">Ringkasan transaksi</div>
                </div>
                <div className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
                  <div className="flex items-center justify-between gap-3"><span>Metode bayar</span><span className="font-semibold text-slate-900 dark:text-white">{String(data?.paymentMethod || "QRIS").toUpperCase()}</span></div>
                  <div className="flex items-center justify-between gap-3"><span>Total</span><span className="font-semibold text-slate-900 dark:text-white">{formatRupiah(Number(data?.amount || 0))}</span></div>
                  <div className="flex items-center justify-between gap-3"><span>Status</span><span className="font-semibold text-slate-900 dark:text-white">{String(data?.status || "pending").toUpperCase()}</span></div>
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
