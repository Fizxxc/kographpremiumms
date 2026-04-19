"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
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
    description: "QRIS sudah tersedia. Silakan lanjutkan pembayaran agar pesanan bisa segera diproses.",
    cardTitle: "QRIS siap digunakan",
    cardDescription: "Scan QR di bawah ini melalui aplikasi pembayaran yang mendukung QRIS."
  },
  success: {
    badge: "PEMBAYARAN BERHASIL",
    title: "Pembayaran berhasil",
    description: "Transaksi Anda telah tervalidasi dan status pesanan sedang diproses sesuai layanan yang dipilih.",
    cardTitle: "Pembayaran telah diterima",
    cardDescription: "Simpan halaman ini atau unduh invoice untuk arsip transaksi Anda."
  },
  failed: {
    badge: "TRANSAKSI TIDAK AKTIF",
    title: "Transaksi sudah berakhir",
    description: "Pembayaran ini tidak lagi aktif. Anda dapat membuat pesanan baru bila masih dibutuhkan.",
    cardTitle: "Status transaksi",
    cardDescription: "Silakan ulangi checkout agar mendapatkan QRIS baru yang masih aktif."
  }
} as const;

export default function PaymentStatusClient({ orderId, publicOrderCode, type }: PaymentStatusClientProps) {
  const [statusData, setStatusData] = useState<StatusData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStatus = useCallback(async () => {
    setIsLoading(true);
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
    }
  }, [orderId, publicOrderCode, type]);

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  useEffect(() => {
    if (statusData?.status !== "pending") return;
    const timer = window.setInterval(fetchStatus, 10000);
    return () => window.clearInterval(timer);
  }, [fetchStatus, statusData?.status]);

  const status = statusData?.status || "pending";
  const meta = statusMeta[status] || statusMeta.pending;
  const productName = statusData?.kind === "topup"
    ? "Top up saldo"
    : statusData?.productSnapshot?.product_name || "Pesanan digital";

  const qrImageSrc = useMemo(() => {
    if (statusData?.qrUrl) return statusData.qrUrl;
    if (statusData?.qrString) {
      return `https://api.qrserver.com/v1/create-qr-code/?size=360x360&data=${encodeURIComponent(statusData.qrString)}`;
    }
    return null;
  }, [statusData?.qrString, statusData?.qrUrl]);

  const invoiceHref = statusData?.publicOrderCode
    ? `/api/invoice/${encodeURIComponent(orderId)}?resi=${encodeURIComponent(statusData.publicOrderCode)}&download=1`
    : null;

  return (
    <section className="mx-auto flex w-full max-w-5xl flex-col gap-6 rounded-[32px] border border-primary/10 bg-[#031227] p-5 shadow-[0_0_0_1px_rgba(250,204,21,0.05),0_32px_120px_rgba(2,6,23,0.6)] sm:p-8 lg:grid lg:grid-cols-[minmax(0,1.15fr)_360px] lg:gap-8">
      <div className="space-y-6">
        <span className="inline-flex rounded-full border border-emerald-400/20 bg-emerald-400/10 px-5 py-2 text-xs font-black uppercase tracking-[0.35em] text-emerald-300">
          {meta.badge}
        </span>

        <div className="space-y-3">
          <h1 className="text-4xl font-black leading-tight text-white sm:text-5xl">{meta.title}</h1>
          <p className="max-w-2xl text-base leading-8 text-slate-300 sm:text-lg">
            {error || statusData?.message || meta.description}
          </p>
        </div>

        <div className="grid gap-4 rounded-[28px] border border-cyan-400/20 bg-cyan-400/10 p-5 sm:grid-cols-2">
          <div>
            <div className="text-xs font-bold uppercase tracking-[0.35em] text-slate-400">Order ID</div>
            <div className="mt-2 text-2xl font-black text-white break-words">{statusData?.orderId || orderId}</div>
          </div>
          <div>
            <div className="text-xs font-bold uppercase tracking-[0.35em] text-slate-400">Resi</div>
            <div className="mt-2 text-2xl font-black text-white break-words">{statusData?.publicOrderCode || publicOrderCode || "-"}</div>
          </div>
          <div>
            <div className="text-xs font-bold uppercase tracking-[0.35em] text-slate-400">Produk</div>
            <div className="mt-2 text-xl font-bold text-white">{productName}</div>
          </div>
          <div>
            <div className="text-xs font-bold uppercase tracking-[0.35em] text-slate-400">Total</div>
            <div className="mt-2 text-xl font-bold text-white">{formatRupiah(statusData?.amount || 0)}</div>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          {statusData?.publicOrderCode ? (
            <Link href={`/cek-pesanan?resi=${encodeURIComponent(statusData.publicOrderCode)}`} className="inline-flex h-12 items-center justify-center rounded-full bg-primary px-6 text-sm font-bold text-slate-950 transition hover:opacity-90">
              Cek pesanan dengan resi
            </Link>
          ) : null}
          {invoiceHref && status === "success" ? (
            <a href={invoiceHref} className="inline-flex h-12 items-center justify-center rounded-full border border-white/15 bg-white/5 px-6 text-sm font-semibold text-white transition hover:border-primary/40 hover:bg-primary/10">
              Download invoice PDF
            </a>
          ) : null}
          <button type="button" onClick={fetchStatus} className="inline-flex h-12 items-center justify-center rounded-full border border-white/15 bg-white/5 px-6 text-sm font-semibold text-white transition hover:border-primary/40 hover:bg-primary/10">
            Refresh status
          </button>
        </div>
      </div>

      <aside className="rounded-[30px] border border-white/10 bg-cyan-400/10 p-5 text-white shadow-[0_25px_80px_rgba(17,24,39,0.35)]">
        {isLoading && !statusData ? (
          <div className="space-y-4">
            <div className="h-5 w-36 animate-pulse rounded-full bg-white/10" />
            <div className="aspect-square animate-pulse rounded-[28px] bg-white/10" />
            <div className="h-4 w-40 animate-pulse rounded-full bg-white/10" />
          </div>
        ) : status === "pending" && qrImageSrc ? (
          <div className="space-y-5">
            <div>
              <div className="text-3xl font-black">{meta.cardTitle}</div>
              <p className="mt-2 text-sm leading-7 text-slate-300">{meta.cardDescription}</p>
            </div>
            <div className="rounded-[28px] bg-white p-4 shadow-[0_20px_60px_rgba(2,6,23,0.2)]">
              <img src={qrImageSrc} alt="QRIS pembayaran" className="mx-auto aspect-square w-full max-w-[280px] rounded-2xl object-contain" />
            </div>
            <div className="rounded-[24px] border border-white/10 bg-[#071b35] p-4 text-sm text-slate-300">
              <div className="font-bold uppercase tracking-[0.25em] text-slate-400">Informasi pembayaran</div>
              <div className="mt-3 space-y-2">
                {statusData?.paymentNumber ? <p><span className="text-slate-400">Kode bayar:</span> {statusData.paymentNumber}</p> : null}
                {statusData?.expiresAt ? <p><span className="text-slate-400">Berlaku sampai:</span> {formatDate(statusData.expiresAt)}</p> : null}
                <p><span className="text-slate-400">Status:</span> Menunggu pembayaran</p>
              </div>
            </div>
            {statusData?.paymentUrl ? (
              <a href={statusData.paymentUrl} target="_blank" rel="noreferrer" className="inline-flex h-12 w-full items-center justify-center rounded-full bg-primary px-6 text-sm font-bold text-slate-950 transition hover:opacity-90">
                Buka halaman pembayaran
              </a>
            ) : null}
          </div>
        ) : (
          <div className="space-y-5">
            <div className="grid h-44 place-items-center rounded-[28px] border border-emerald-400/20 bg-emerald-400/10 text-center">
              <div>
                <div className="text-4xl font-black">{meta.cardTitle}</div>
                <p className="mx-auto mt-3 max-w-xs text-sm leading-7 text-slate-300">{meta.cardDescription}</p>
              </div>
            </div>

            <div className="rounded-[24px] border border-white/10 bg-[#071b35] p-4 text-sm leading-7 text-slate-300">
              <p>Bot cek pesanan: <a className="font-semibold text-primary" href={`https://t.me/${SITE.botUsername.replace(/^@/, "")}`} target="_blank" rel="noreferrer">{SITE.botUsername}</a></p>
              <p>Bot auto order: <a className="font-semibold text-primary" href={`https://t.me/${SITE.autoOrderBotUsername.replace(/^@/, "")}`} target="_blank" rel="noreferrer">{SITE.autoOrderBotUsername}</a></p>
              {statusData?.updatedAt ? <p>Pembaruan terakhir: {formatDate(statusData.updatedAt)}</p> : null}
            </div>
          </div>
        )}
      </aside>
    </section>
  );
}
