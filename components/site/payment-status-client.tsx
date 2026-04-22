"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import Script from "next/script";
import {
  CheckCircle2,
  Clock3,
  Copy,
  Download,
  ExternalLink,
  QrCode,
  Receipt,
  RefreshCw,
  ShieldCheck,
  Wallet
} from "lucide-react";
import { formatDate, formatRupiah } from "@/lib/utils";
import { SITE } from "@/lib/constants";

type StatusData = {
  ok?: boolean;
  kind?: "transaction" | "topup";
  orderId?: string;
  publicOrderCode?: string | null;
  status?: "pending" | "success" | "failed";
  rawStatus?: string;
  amount?: number;
  message?: string;
  productSnapshot?: {
    product_name?: string;
    variant_name?: string | null;
  } | null;
  qrString?: string | null;
  qrUrl?: string | null;
  paymentNumber?: string | null;
  expiresAt?: string | null;
  paymentUrl?: string | null;
  updatedAt?: string | null;
  credentialFields?: Array<{ label: string; value: string }>;
};

type PaymentStatusClientProps = {
  orderId: string;
  publicOrderCode?: string;
  type?: string;
};

const statusMeta = {
  pending: {
    badge: "MENUNGGU PEMBAYARAN",
    title: "Selesaikan pembayaran Anda",
    description: "QRIS sudah siap digunakan. Selesaikan pembayaran agar pesanan bisa segera kami teruskan ke proses berikutnya.",
    cardTitle: "QRIS siap dipindai",
    cardDescription: "Gunakan aplikasi e-wallet atau mobile banking yang mendukung QRIS untuk menyelesaikan pembayaran."
  },
  success: {
    badge: "PEMBAYARAN BERHASIL",
    title: "Pembayaran berhasil diterima",
    description: "Transaksi Anda telah tervalidasi. Pesanan sedang diproses dan seluruh detail transaksi tetap bisa Anda akses dari halaman ini.",
    cardTitle: "Transaksi telah dikonfirmasi",
    cardDescription: "Simpan resi atau unduh invoice PDF kapan saja untuk kebutuhan arsip Anda."
  },
  failed: {
    badge: "TRANSAKSI TIDAK AKTIF",
    title: "Transaksi ini sudah tidak aktif",
    description: "Masa pembayaran telah berakhir atau transaksi tidak lagi dapat digunakan. Silakan lakukan checkout ulang untuk mendapatkan QRIS baru.",
    cardTitle: "Pembayaran sudah berakhir",
    cardDescription: "Jika Anda masih membutuhkan produk ini, silakan buat pesanan baru agar sistem menyiapkan pembayaran yang masih aktif."
  }
} as const;

function safeCopy(value: string, onSuccess: () => void) {
  if (!value) return;
  if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
    navigator.clipboard.writeText(value).then(onSuccess).catch(() => undefined);
    return;
  }

  if (typeof document !== "undefined") {
    const textarea = document.createElement("textarea");
    textarea.value = value;
    textarea.style.position = "fixed";
    textarea.style.left = "-9999px";
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();
    try {
      document.execCommand("copy");
      onSuccess();
    } finally {
      document.body.removeChild(textarea);
    }
  }
}

function PaymentOverlay({ mode }: { mode: "pending" | "success" }) {
  const palette = mode === "pending"
    ? "from-[#ffd54a]/95 via-[#ffdf6a]/90 to-[#facc15]/85"
    : "from-emerald-500/95 via-emerald-400/90 to-lime-300/80";
  const title = mode === "pending" ? "Menyiapkan pembayaran" : "Pembayaran berhasil";
  const description = mode === "pending"
    ? "Mohon tunggu sebentar, kami sedang menampilkan detail pembayaran Anda."
    : "Verifikasi berhasil. Status pesanan telah diperbarui secara otomatis.";

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-950/65 px-4 backdrop-blur-xl">
      <div className={`w-full max-w-md rounded-[34px] border border-white/20 bg-gradient-to-br ${palette} p-6 shadow-[0_45px_120px_rgba(15,23,42,0.45)] sm:p-8`}>
        <div className="rounded-[28px] border border-slate-950/10 bg-slate-950/12 p-6 text-slate-950 backdrop-blur">
          <div className="mx-auto grid h-28 w-28 place-items-center rounded-full border border-slate-950/10 bg-white/35 shadow-inner shadow-white/30">
            <div
              dangerouslySetInnerHTML={{
                __html:
                  mode === "pending"
                    ? '<lord-icon src="https://cdn.lordicon.com/akqsdstj.json" trigger="loop" delay="250" colors="primary:#0f172a,secondary:#0f172a" style="width:84px;height:84px"></lord-icon>'
                    : '<lord-icon src="https://cdn.lordicon.com/oqdmuxru.json" trigger="loop" delay="250" colors="primary:#064e3b,secondary:#064e3b" style="width:84px;height:84px"></lord-icon>'
              }}
            />
          </div>
          <div className="mt-6 text-center">
            <div className="text-xs font-black uppercase tracking-[0.38em] text-slate-900/70">
              {mode === "pending" ? "Mohon tunggu" : "Selesai"}
            </div>
            <h2 className="mt-3 text-3xl font-black leading-tight text-slate-950">{title}</h2>
            <p className="mt-3 text-sm leading-7 text-slate-900/80">{description}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PaymentStatusClient({ orderId, publicOrderCode, type }: PaymentStatusClientProps) {
  const [statusData, setStatusData] = useState<StatusData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [showIntroOverlay, setShowIntroOverlay] = useState(true);
  const [showSuccessOverlay, setShowSuccessOverlay] = useState(false);

  const successOverlayShownRef = useRef(false);
  const introTimerRef = useRef<number | null>(null);
  const successHideTimerRef = useRef<number | null>(null);

  const fetchStatus = useCallback(async (manual = false) => {
    if (manual) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }

    setError(null);

    try {
      const params = new URLSearchParams();
      if (publicOrderCode) params.set("resi", publicOrderCode);
      if (type) params.set("type", type);
      const query = params.toString();

      const response = await fetch(`/api/public-order-status/${encodeURIComponent(orderId)}${query ? `?${query}` : ""}`, {
        cache: "no-store"
      });
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload?.error || "Gagal mengambil status pesanan.");
      }

      setStatusData(payload);
    } catch (err: any) {
      setStatusData(null);
      setError(err?.message || "Gagal mengambil status pesanan.");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [orderId, publicOrderCode, type]);

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  useEffect(() => {
    introTimerRef.current = window.setTimeout(() => {
      setShowIntroOverlay(false);
    }, 1500);

    return () => {
      if (introTimerRef.current) window.clearTimeout(introTimerRef.current);
      if (successHideTimerRef.current) window.clearTimeout(successHideTimerRef.current);
    };
  }, []);

  useEffect(() => {
    if (statusData?.status !== "pending") return;
    const timer = window.setInterval(() => fetchStatus(), 10000);
    return () => window.clearInterval(timer);
  }, [fetchStatus, statusData?.status]);

  useEffect(() => {
    if (statusData?.status !== "success" || successOverlayShownRef.current) return;

    const showOverlay = () => {
      setShowSuccessOverlay(true);
      successHideTimerRef.current = window.setTimeout(() => {
        setShowSuccessOverlay(false);
      }, 2000);
    };

    successOverlayShownRef.current = true;

    if (showIntroOverlay) {
      const delayed = window.setTimeout(showOverlay, 700);
      return () => window.clearTimeout(delayed);
    }

    showOverlay();
  }, [showIntroOverlay, statusData?.status]);

  useEffect(() => {
    if (!copiedKey) return;
    const timer = window.setTimeout(() => setCopiedKey(null), 1800);
    return () => window.clearTimeout(timer);
  }, [copiedKey]);

  const status = statusData?.status || (error ? "failed" : "pending");
  const meta = statusMeta[status] || statusMeta.pending;
  const productName = statusData?.kind === "topup"
    ? "Top up saldo"
    : statusData?.productSnapshot?.product_name || "Pesanan digital";
  const variantName = statusData?.productSnapshot?.variant_name || null;

  const qrImageSrc = useMemo(() => {
    if (statusData?.qrUrl) return statusData.qrUrl;
    if (statusData?.qrString) {
      return `https://api.qrserver.com/v1/create-qr-code/?size=520x520&data=${encodeURIComponent(statusData.qrString)}`;
    }
    return null;
  }, [statusData?.qrString, statusData?.qrUrl]);

  const paymentReference = useMemo(() => {
    const raw = String(statusData?.paymentNumber || "").trim();
    if (!raw) return null;
    if (statusData?.qrString && raw === statusData.qrString) return null;
    if (raw.length > 42) return null;
    return raw;
  }, [statusData?.paymentNumber, statusData?.qrString]);

  const invoiceHref = statusData?.publicOrderCode
    ? `/api/invoice/${encodeURIComponent(orderId)}?resi=${encodeURIComponent(statusData.publicOrderCode)}&download=1`
    : null;
  const credentialFields = Array.isArray(statusData?.credentialFields) ? statusData.credentialFields : [];

  const handleCopy = (key: string, value?: string | null) => {
    if (!value) return;
    safeCopy(value, () => setCopiedKey(key));
  };

  return (
    <>
      <Script src="https://cdn.lordicon.com/lordicon.js" strategy="afterInteractive" />

      {showIntroOverlay ? <PaymentOverlay mode="pending" /> : null}
      {showSuccessOverlay ? <PaymentOverlay mode="success" /> : null}

      <section className="mx-auto w-full max-w-7xl">
        <div className="surface-card overflow-hidden rounded-[34px] border border-white/10 p-0 shadow-[0_35px_140px_rgba(2,6,23,0.55)]">
          <div className="grid gap-0 lg:grid-cols-[minmax(0,1.08fr)_420px]">
            <div className="relative overflow-hidden p-6 sm:p-8 lg:p-10">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(250,204,21,0.14),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(34,197,94,0.12),transparent_26%)]" />
              <div className="relative space-y-7">
                <span className={`inline-flex rounded-full border px-5 py-2 text-xs font-black uppercase tracking-[0.35em] ${
                  status === "success"
                    ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-300"
                    : status === "failed"
                      ? "border-rose-400/20 bg-rose-400/10 text-rose-300"
                      : "border-primary/30 bg-primary/10 text-primary"
                }`}>
                  {meta.badge}
                </span>

                <div className="max-w-3xl space-y-4">
                  <h1 className="text-4xl font-black leading-[0.95] tracking-tight text-white sm:text-5xl lg:text-6xl">
                    {meta.title}
                  </h1>
                  <p className="text-base leading-8 text-slate-300 sm:text-lg">
                    {error || statusData?.message || meta.description}
                  </p>
                </div>

                <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_280px]">
                  <div className="grid gap-4 rounded-[30px] border border-cyan-400/18 bg-cyan-400/10 p-5 sm:grid-cols-2">
                    {[
                      { label: "Order ID", value: statusData?.orderId || orderId },
                      { label: "Resi", value: statusData?.publicOrderCode || publicOrderCode || "-" },
                      { label: "Produk", value: productName },
                      { label: "Total", value: formatRupiah(statusData?.amount || 0) }
                    ].map((item) => (
                      <div key={item.label} className="rounded-[24px] border border-white/10 bg-[#071b35]/80 p-4">
                        <div className="text-[11px] font-black uppercase tracking-[0.35em] text-slate-500">{item.label}</div>
                        <div className="mt-3 break-words text-xl font-black text-white sm:text-2xl">{item.value}</div>
                      </div>
                    ))}
                  </div>

                  <div className="rounded-[30px] border border-white/10 bg-white/5 p-5">
                    <div className="flex items-center gap-3 text-primary">
                      {status === "success" ? <ShieldCheck className="h-5 w-5" /> : status === "failed" ? <Receipt className="h-5 w-5" /> : <Clock3 className="h-5 w-5" />}
                      <span className="text-xs font-black uppercase tracking-[0.35em]">Status layanan</span>
                    </div>
                    <div className="mt-4 text-2xl font-black text-white">
                      {status === "success" ? "Terverifikasi" : status === "failed" ? "Tidak aktif" : "Menunggu pembayaran"}
                    </div>
                    <p className="mt-3 text-sm leading-7 text-slate-300">
                      {status === "success"
                        ? "Pembayaran sudah diterima. Simpan detail transaksi ini untuk referensi Anda."
                        : status === "failed"
                          ? "Transaksi ini tidak dapat dipakai lagi. Anda dapat mengulangi checkout untuk mendapat QRIS baru."
                          : "Setelah pembayaran berhasil, status pesanan akan diperbarui otomatis tanpa perlu keluar dari halaman ini."}
                    </p>
                    {statusData?.updatedAt ? (
                      <p className="mt-4 text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">
                        Diperbarui {formatDate(statusData.updatedAt)}
                      </p>
                    ) : null}
                  </div>
                </div>

                {credentialFields.length && status === "success" ? (
                  <section className="rounded-[30px] border border-emerald-400/25 bg-emerald-400/10 p-5 sm:p-6">
                    <div className="max-w-3xl">
                      <p className="text-[11px] font-black uppercase tracking-[0.35em] text-emerald-200/80">
                        Credential pembelian
                      </p>
                      <h2 className="mt-3 text-2xl font-black text-white sm:text-3xl">
                        Data akun sudah tersedia
                      </h2>
                      <p className="mt-3 text-sm leading-7 text-slate-200/85">
                        Simpan data ini baik-baik dan jangan dibagikan ke orang lain. Semua detail yang sama juga ikut masuk ke invoice PDF saat sudah tersedia.
                      </p>
                    </div>
                    <div className="mt-5 grid gap-4 sm:grid-cols-2">
                      {credentialFields.map((field) => (
                        <div key={`${field.label}-${field.value}`} className="rounded-[24px] border border-white/10 bg-[#071b35]/85 p-4">
                          <div className="text-[11px] font-black uppercase tracking-[0.32em] text-slate-400">{field.label}</div>
                          <div className="mt-3 break-words text-base font-semibold text-white sm:text-lg">{field.value}</div>
                        </div>
                      ))}
                    </div>
                  </section>
                ) : null}

                <div className="flex flex-wrap gap-3">
                  {statusData?.publicOrderCode ? (
                    <Link
                      href={`/cek-pesanan?resi=${encodeURIComponent(statusData.publicOrderCode)}`}
                      className="inline-flex h-12 items-center justify-center rounded-full bg-primary px-6 text-sm font-bold text-slate-950 transition hover:opacity-90"
                    >
                      Cek pesanan dengan resi
                    </Link>
                  ) : null}

                  {invoiceHref && status === "success" ? (
                    <a
                      href={invoiceHref}
                      className="inline-flex h-12 items-center justify-center gap-2 rounded-full border border-white/15 bg-white/5 px-6 text-sm font-semibold text-white transition hover:border-primary/40 hover:bg-primary/10"
                    >
                      <Download className="h-4 w-4" />
                      Unduh invoice PDF
                    </a>
                  ) : null}

                  <button
                    type="button"
                    onClick={() => fetchStatus(true)}
                    className="inline-flex h-12 items-center justify-center gap-2 rounded-full border border-white/15 bg-white/5 px-6 text-sm font-semibold text-white transition hover:border-primary/40 hover:bg-primary/10"
                  >
                    <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
                    Refresh status
                  </button>
                </div>
              </div>
            </div>

            <aside className="border-t border-white/10 bg-white/5 p-6 lg:border-l lg:border-t-0 lg:p-8">
              {isLoading && !statusData ? (
                <div className="space-y-5">
                  <div className="rounded-[28px] border border-white/10 bg-white/5 p-5">
                    <div className="h-5 w-44 animate-pulse rounded-full bg-white/10" />
                    <div className="mt-4 aspect-square animate-pulse rounded-[28px] bg-white/10" />
                    <div className="mt-4 h-4 w-full animate-pulse rounded-full bg-white/10" />
                    <div className="mt-2 h-4 w-2/3 animate-pulse rounded-full bg-white/10" />
                  </div>
                </div>
              ) : status === "pending" ? (
                <div className="space-y-5">
                  <div className="rounded-[30px] border border-cyan-400/18 bg-cyan-400/10 p-5 shadow-[0_22px_80px_rgba(8,15,36,0.24)]">
                    <div className="flex items-center gap-3 text-primary">
                      <QrCode className="h-5 w-5" />
                      <span className="text-xs font-black uppercase tracking-[0.35em]">{meta.cardTitle}</span>
                    </div>
                    <h2 className="mt-4 text-3xl font-black text-white">Bayar dengan QRIS</h2>
                    <p className="mt-3 text-sm leading-7 text-slate-300">{meta.cardDescription}</p>

                    <div className="mt-5 rounded-[28px] bg-white p-4 shadow-[0_25px_70px_rgba(2,6,23,0.18)]">
                      {qrImageSrc ? (
                        <img
                          src={qrImageSrc}
                          alt="QRIS pembayaran"
                          className="mx-auto aspect-square w-full max-w-[320px] rounded-[24px] object-contain"
                        />
                      ) : (
                        <div className="grid aspect-square place-items-center rounded-[24px] bg-slate-100 text-center text-slate-500">
                          <div>
                            <Wallet className="mx-auto h-10 w-10 animate-pulse" />
                            <p className="mt-3 text-sm font-semibold">QRIS sedang disiapkan</p>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="mt-5 grid gap-3 text-sm text-slate-300">
                      <div className="rounded-[22px] border border-white/10 bg-[#071b35]/85 p-4">
                        <div className="text-[11px] font-black uppercase tracking-[0.35em] text-slate-500">Nominal pembayaran</div>
                        <div className="mt-2 text-2xl font-black text-white">{formatRupiah(statusData?.amount || 0)}</div>
                      </div>

                      {statusData?.expiresAt ? (
                        <div className="rounded-[22px] border border-white/10 bg-[#071b35]/85 p-4">
                          <div className="text-[11px] font-black uppercase tracking-[0.35em] text-slate-500">Berlaku sampai</div>
                          <div className="mt-2 text-base font-bold text-white">{formatDate(statusData.expiresAt)}</div>
                        </div>
                      ) : null}

                      {paymentReference ? (
                        <div className="rounded-[22px] border border-white/10 bg-[#071b35]/85 p-4">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <div className="text-[11px] font-black uppercase tracking-[0.35em] text-slate-500">Kode referensi</div>
                              <div className="mt-2 break-all text-base font-bold text-white">{paymentReference}</div>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleCopy("payment", paymentReference)}
                              className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white transition hover:border-primary/40 hover:bg-primary/10"
                              aria-label="Salin kode referensi"
                            >
                              <Copy className="h-4 w-4" />
                            </button>
                          </div>
                          {copiedKey === "payment" ? <p className="mt-2 text-xs font-semibold text-emerald-300">Kode referensi berhasil disalin.</p> : null}
                        </div>
                      ) : null}

                      {statusData?.qrString ? (
                        <div className="rounded-[22px] border border-white/10 bg-[#071b35]/85 p-4">
                          <div className="text-[11px] font-black uppercase tracking-[0.35em] text-slate-500">Petunjuk</div>
                          <p className="mt-2 leading-7 text-slate-300">
                            Scan QR di atas langsung dari aplikasi pembayaran Anda. Tidak perlu menyalin kode QRIS secara manual.
                          </p>
                          <button
                            type="button"
                            onClick={() => handleCopy("qr", statusData.qrString)}
                            className="mt-3 inline-flex h-11 items-center justify-center gap-2 rounded-full border border-white/10 bg-white/5 px-5 text-sm font-semibold text-white transition hover:border-primary/40 hover:bg-primary/10"
                          >
                            <Copy className="h-4 w-4" />
                            Salin data QR cadangan
                          </button>
                          {copiedKey === "qr" ? <p className="mt-2 text-xs font-semibold text-emerald-300">Data QR cadangan berhasil disalin.</p> : null}
                        </div>
                      ) : null}
                    </div>

                    {statusData?.paymentUrl ? (
                      <a
                        href={statusData.paymentUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-5 inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-primary px-6 text-sm font-bold text-slate-950 transition hover:opacity-90"
                      >
                        <ExternalLink className="h-4 w-4" />
                        Buka halaman pembayaran
                      </a>
                    ) : null}
                  </div>
                </div>
              ) : (
                <div className="space-y-5">
                  <div className={`rounded-[30px] border p-5 ${
                    status === "success"
                      ? "border-emerald-400/20 bg-emerald-400/10"
                      : "border-rose-400/20 bg-rose-400/10"
                  }`}>
                    <div className="grid h-44 place-items-center rounded-[24px] border border-white/10 bg-[#06172e]/65 text-center">
                      <div className="px-5">
                        {status === "success" ? (
                          <CheckCircle2 className="mx-auto h-14 w-14 text-emerald-300" />
                        ) : (
                          <Receipt className="mx-auto h-14 w-14 text-rose-300" />
                        )}
                        <div className="mt-4 text-3xl font-black text-white">{meta.cardTitle}</div>
                        <p className="mx-auto mt-3 max-w-xs text-sm leading-7 text-slate-300">{meta.cardDescription}</p>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-[28px] border border-white/10 bg-[#071b35]/85 p-5 text-sm leading-7 text-slate-300">
                    <div className="text-[11px] font-black uppercase tracking-[0.35em] text-slate-500">Informasi tambahan</div>
                    <div className="mt-4 space-y-2">
                      {variantName ? <p><span className="text-slate-400">Paket:</span> {variantName}</p> : null}
                      <p>
                        <span className="text-slate-400">Bot cek pesanan:</span>{" "}
                        <a className="font-semibold text-primary" href={`https://t.me/${SITE.botUsername.replace(/^@/, "")}`} target="_blank" rel="noreferrer">
                          {SITE.botUsername}
                        </a>
                      </p>
                      <p>
                        <span className="text-slate-400">Bot auto order:</span>{" "}
                        <a className="font-semibold text-primary" href={`https://t.me/${SITE.autoOrderBotUsername.replace(/^@/, "")}`} target="_blank" rel="noreferrer">
                          {SITE.autoOrderBotUsername}
                        </a>
                      </p>
                      {statusData?.updatedAt ? <p><span className="text-slate-400">Pembaruan terakhir:</span> {formatDate(statusData.updatedAt)}</p> : null}
                    </div>
                  </div>
                </div>
              )}
            </aside>
          </div>
        </div>
      </section>
    </>
  );
}
