"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { SearchCheck, ShieldCheck, Ticket } from "lucide-react";
import { formatRupiah } from "@/lib/utils";

const statusBadge: Record<string, string> = {
  settlement: "bg-emerald-100 text-emerald-700",
  pending: "bg-yellow-100 text-yellow-700",
  capture: "bg-yellow-100 text-yellow-700",
  expire: "bg-rose-100 text-rose-700",
  cancel: "bg-rose-100 text-rose-700",
  deny: "bg-rose-100 text-rose-700"
};

type OrderLookupClientProps = {
  initialResi?: string;
};

export default function OrderLookupClient({ initialResi = "" }: OrderLookupClientProps) {
  const [resi, setResi] = useState(initialResi);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function lookup(currentResi: string) {
    const cleanResi = String(currentResi || "").trim().toUpperCase();
    if (!cleanResi) return;

    try {
      setLoading(true);
      const response = await fetch(`/api/public-order-lookup?resi=${encodeURIComponent(cleanResi)}`, { cache: "no-store" });
      const json = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(String(json.error || "Resi tidak ditemukan."));
      setResult(json);
      setError(null);
    } catch (error: any) {
      setResult(null);
      setError(error?.message || "Resi tidak ditemukan.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (initialResi) lookup(initialResi);
  }, [initialResi]);

  return (
    <div className="page-section">
      <div className="site-container">
        <div className="mx-auto max-w-5xl space-y-6 reveal-up">
          <div className="brand-shell mesh-backdrop overflow-hidden">
            <div className="grid gap-8 lg:grid-cols-[1fr,0.88fr] lg:items-center">
              <div className="space-y-4">
                <div className="badge-chip">Cek pesanan</div>
                <div>
                  <h1 className="text-3xl font-black tracking-tight text-[color:var(--foreground)] md:text-5xl">Masukkan resi untuk melihat status transaksi dengan cepat.</h1>
                  <p className="mt-3 max-w-2xl text-sm leading-8 text-[color:var(--foreground-soft)]">
                    Tampilan halaman lookup juga dirapikan supaya pelanggan tinggal fokus ke input resi, hasil status, dan tombol menuju detail pembayaran.
                  </p>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row">
                  <input
                    value={resi}
                    onChange={(event) => setResi(event.target.value.toUpperCase())}
                    placeholder="Contoh: RESI-AB12CD34"
                    className="h-14 flex-1 rounded-full border border-[color:var(--border)] bg-white px-5 text-sm font-medium text-[color:var(--foreground)] outline-none transition focus:border-[#f3b203] focus:ring-4 focus:ring-[#f3b203]/10"
                  />
                  <button
                    type="button"
                    onClick={() => lookup(resi)}
                    disabled={loading}
                    className="primary-button h-14 px-7"
                  >
                    {loading ? "Mencari..." : "Cek status"}
                  </button>
                </div>

                {error ? <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">{error}</div> : null}
              </div>

              <div className="brand-panel">
                <div className="brand-kicker">Langkah cepat</div>
                <div className="mt-4 space-y-3 text-sm leading-7 text-[color:var(--foreground)]">
                  <div className="brand-card flex items-start gap-3"><Ticket className="mt-0.5 h-4 w-4 text-[color:var(--accent-strong)]" /> Ambil resi dari halaman pembayaran atau email konfirmasi transaksi.</div>
                  <div className="brand-card flex items-start gap-3"><SearchCheck className="mt-0.5 h-4 w-4 text-[color:var(--accent-strong)]" /> Masukkan resi pada kolom di sebelah kiri.</div>
                  <div className="brand-card flex items-start gap-3"><ShieldCheck className="mt-0.5 h-4 w-4 text-[color:var(--accent-strong)]" /> Sistem akan menampilkan status terbaru pesanan secara otomatis.</div>
                </div>
              </div>
            </div>
          </div>

          {result ? (
            <div className="surface-card reveal-up">
              <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
                <div>
                  <div className={`inline-flex rounded-full px-4 py-2 text-xs font-black uppercase tracking-[0.24em] ${statusBadge[String(result.status || "pending")] || statusBadge.pending}`}>
                    {String(result.status || "pending")}
                  </div>
                  <h2 className="mt-4 text-2xl font-black tracking-tight text-[color:var(--foreground)]">{result.productName}</h2>
                  {result.variantName ? <p className="mt-1 text-sm text-[color:var(--foreground-soft)]">{result.variantName}</p> : null}
                </div>

                <Link
                  href={`/waiting-payment/${result.orderId}?resi=${encodeURIComponent(result.publicOrderCode)}&type=${encodeURIComponent(result.type)}`}
                  className="secondary-button"
                >
                  Buka detail pembayaran
                </Link>
              </div>

              <div className="mt-6 grid gap-4 sm:grid-cols-3">
                <div className="brand-card">
                  <div className="brand-kicker">Order ID</div>
                  <div className="mt-2 text-sm font-bold text-[color:var(--foreground)]">{result.orderId}</div>
                </div>
                <div className="brand-card">
                  <div className="brand-kicker">Resi</div>
                  <div className="mt-2 text-sm font-bold text-[color:var(--foreground)]">{result.publicOrderCode}</div>
                </div>
                <div className="brand-card">
                  <div className="brand-kicker">Total</div>
                  <div className="mt-2 text-sm font-bold text-[color:var(--foreground)]">{formatRupiah(Number(result.amount || 0))}</div>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
