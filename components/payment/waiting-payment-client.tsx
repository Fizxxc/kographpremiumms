"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { SITE } from "@/lib/constants";
import { CheckCircle2, Copy, ExternalLink, Loader2, MessageCircleMore, QrCode, RefreshCw, Wallet } from "lucide-react";
import { toast } from "sonner";

type WaitingPaymentClientProps = {
  transaction: any;
  product: any;
  credential: any;
};

function formatRupiah(value: number) {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(value || 0);
}

function normalizeStatus(status?: string | null) {
  const value = String(status || "pending").toLowerCase();
  if (value === "settlement") return "Sudah dibayar";
  if (value === "expire") return "Kedaluwarsa / batal";
  return "Menunggu pembayaran";
}

function InfoBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="brand-card min-w-0 py-4">
      <div className="brand-kicker">{label}</div>
      <div className="mt-2 break-words text-lg font-black text-[color:var(--foreground)]">{value}</div>
    </div>
  );
}

export function WaitingPaymentClient({ transaction, product, credential }: WaitingPaymentClientProps) {
  const [status, setStatus] = useState(String(transaction.status || "pending"));
  const [loading, setLoading] = useState(false);

  const fulfillmentData = (transaction.fulfillment_data || {}) as Record<string, any>;
  const qrString = String(fulfillmentData.payment_qr_string || "");
  const backupPayUrl = String(fulfillmentData.payment_fallback_url || transaction.snap_token || "");
  const waitingUrl = `/api/public-order-status/${transaction.order_id}?resi=${transaction.public_order_code}`;
  const qrImageSrc = qrString ? `https://api.qrserver.com/v1/create-qr-code/?size=512x512&data=${encodeURIComponent(qrString)}` : "";

  const panelInfoText = useMemo(() => {
    if (!fulfillmentData) return "";
    return [
      `Panel URL: ${fulfillmentData.panel_url || "-"}`,
      `Username: ${fulfillmentData.panel_username || "-"}`,
      `Email: ${fulfillmentData.panel_email || "-"}`,
      `Password: ${fulfillmentData.panel_password || "-"}`,
      `Server UUID: ${fulfillmentData.server_uuid || "-"}`
    ].join("\n");
  }, [fulfillmentData]);

  useEffect(() => {
    if (status === "settlement") return;
    const timer = window.setInterval(async () => {
      try {
        const response = await fetch(waitingUrl, { cache: "no-store" });
        const data = await response.json().catch(() => ({}));
        if (response.ok && data?.status) {
          setStatus(String(data.status));
          if (String(data.status) === "settlement") window.location.reload();
        }
      } catch {}
    }, 10000);
    return () => window.clearInterval(timer);
  }, [status, waitingUrl]);

  async function copyText(value: string, label: string) {
    if (!value) return;
    try {
      await navigator.clipboard.writeText(value);
      toast.success(`${label} berhasil disalin.`);
    } catch {
      toast.error(`Gagal menyalin ${label.toLowerCase()}.`);
    }
  }

  async function refreshStatus() {
    setLoading(true);
    try {
      const response = await fetch(waitingUrl, { cache: "no-store" });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(String(data?.error || data?.message || "Gagal refresh status."));
      setStatus(String(data.status || "pending"));
      if (String(data.status) === "settlement") {
        toast.success("Pembayaran sudah terkonfirmasi.");
        window.location.reload();
        return;
      }
      toast.success("Status terbaru berhasil dimuat.");
    } catch (error: any) {
      toast.error(String(error?.message || "Gagal refresh status."));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page-section pt-6">
      <div className="site-container">
        <div className="brand-shell mesh-backdrop grid gap-6 xl:grid-cols-[1.12fr_0.88fr]">
          <section className="space-y-6">
            <div className="space-y-4">
              <span className="brand-pill">Menunggu pembayaran</span>
              <div>
                <h1 className="text-balance text-4xl font-black leading-[0.92] text-[color:var(--foreground)] sm:text-6xl">
                  Selesaikan pembayaran Anda
                </h1>
                <p className="mt-4 max-w-2xl text-base leading-8 text-[color:var(--foreground-soft)]">
                  QRIS sudah tersedia. Silakan selesaikan pembayaran agar pesanan dapat segera diproses. Setelah berhasil,
                  status akan diperbarui otomatis di halaman ini.
                </p>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              <InfoBox label="Order ID" value={transaction.order_id} />
              <InfoBox label="Resi" value={transaction.public_order_code || "-"} />
              <InfoBox label="Status layanan" value={normalizeStatus(status)} />
              <InfoBox label="Produk" value={product?.name || transaction.product_snapshot?.product_name || "Produk Premium"} />
              <InfoBox label="Total" value={formatRupiah(Number(transaction.final_amount || transaction.amount || 0))} />
              <InfoBox label="Gateway" value="Pakasir" />
            </div>

            <div className="flex flex-wrap gap-3">
              <Button
                variant="outline"
                onClick={refreshStatus}
                disabled={loading}
                className="h-12 rounded-full border-[color:var(--border)] bg-[color:var(--card)] px-5 text-[color:var(--foreground)]"
              >
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
                Refresh status
              </Button>
              {backupPayUrl ? (
                <a href={backupPayUrl} target="_blank" rel="noreferrer">
                  <Button className="h-12 rounded-full bg-[color:var(--accent)] px-5 font-bold text-slate-950">
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Buka halaman pembayaran
                  </Button>
                </a>
              ) : null}
            </div>

            {(credential?.account_data || fulfillmentData.panel_url) && (
              <div className="brand-panel">
                <div className="flex items-center gap-3 text-[color:var(--foreground)]">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-300">
                    <CheckCircle2 className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-xl font-black">Data layanan</h2>
                    <p className="text-sm text-[color:var(--foreground-soft)]">Detail layanan akan tampil rapi setelah pembayaran terverifikasi.</p>
                  </div>
                </div>

                {credential?.account_data ? (
                  <div className="mt-5 rounded-[24px] border border-[color:var(--border)] bg-slate-950/90 p-4 font-mono text-sm leading-7 text-slate-100">
                    {credential.account_data}
                  </div>
                ) : null}

                {fulfillmentData.panel_url ? (
                  <div className="mt-5 grid gap-4 md:grid-cols-2">
                    <InfoBox label="Panel URL" value={fulfillmentData.panel_url || "-"} />
                    <InfoBox label="Username" value={fulfillmentData.panel_username || "-"} />
                    <InfoBox label="Email login" value={fulfillmentData.panel_email || "-"} />
                    <InfoBox label="Password login" value={fulfillmentData.panel_password || "-"} />
                  </div>
                ) : null}

                {fulfillmentData.panel_url ? (
                  <div className="mt-5 flex flex-wrap gap-3">
                    <Button
                      variant="outline"
                      onClick={() => copyText(panelInfoText, "Info panel")}
                      className="h-11 rounded-full border-[color:var(--border)] bg-[color:var(--card)] text-[color:var(--foreground)]"
                    >
                      <Copy className="mr-2 h-4 w-4" />
                      Salin info panel
                    </Button>
                    <a href={fulfillmentData.panel_url} target="_blank" rel="noreferrer">
                      <Button className="h-11 rounded-full bg-[color:var(--accent)] font-bold text-slate-950">Buka panel</Button>
                    </a>
                  </div>
                ) : null}
              </div>
            )}
          </section>

          <aside className="brand-panel space-y-5 border-[rgba(245,207,83,0.24)] bg-[linear-gradient(180deg,rgba(245,207,83,0.08),transparent_26%),var(--card)]">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-[color:var(--border)] bg-[color:var(--card-strong)] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-[color:var(--foreground-soft)]">
                <QrCode className="h-3.5 w-3.5" />
                QRIS siap dipindai
              </div>
              <h2 className="mt-4 text-3xl font-black tracking-[-0.04em] text-[color:var(--foreground)]">Bayar dengan QRIS</h2>
              <p className="mt-3 text-sm leading-7 text-[color:var(--foreground-soft)]">
                Gunakan aplikasi e-wallet atau mobile banking yang mendukung QRIS untuk menyelesaikan pembayaran.
              </p>
            </div>

            {qrImageSrc ? (
              <div className="rounded-[28px] border border-[color:var(--border)] bg-white p-4 shadow-[var(--shadow-soft)]">
                <img src={qrImageSrc} alt="QRIS Dinamis" className="mx-auto aspect-square w-full max-w-[320px] rounded-[22px] object-contain" />
              </div>
            ) : (
              <div className="brand-card text-sm leading-7 text-[color:var(--foreground-soft)]">
                QRIS sedang disiapkan. Silakan refresh status beberapa saat lagi.
              </div>
            )}

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="brand-card py-4">
                <div className="brand-kicker">Nominal pembayaran</div>
                <div className="mt-2 text-2xl font-black text-[color:var(--foreground)]">
                  {formatRupiah(Number(transaction.final_amount || transaction.amount || 0))}
                </div>
              </div>
              <div className="brand-card py-4">
                <div className="brand-kicker">Berlaku sampai</div>
                <div className="mt-2 text-lg font-black text-[color:var(--foreground)]">
                  {transaction.expires_at ? new Date(transaction.expires_at).toLocaleString("id-ID") : "Mengikuti gateway"}
                </div>
              </div>
            </div>

            <div className="brand-card">
              <div className="brand-kicker">Petunjuk</div>
              <p className="mt-3 text-sm leading-7 text-[color:var(--foreground-soft)]">
                Scan QR di atas langsung dari aplikasi pembayaran Anda. Untuk cadangan, Anda juga dapat menyalin kode QRIS
                mentah atau membuka halaman pembayaran.
              </p>
            </div>

            {qrString ? (
              <div className="brand-card">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="brand-kicker">Kode QRIS cadangan</div>
                    <p className="mt-2 text-xs leading-6 text-[color:var(--foreground-soft)]">
                      Ditampilkan rapi di kotak scroll agar tetap mudah dibaca saat dibutuhkan.
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => copyText(qrString, "Kode QRIS")}
                    className="h-10 rounded-full border-[color:var(--border)] bg-[color:var(--card)] text-[color:var(--foreground)]"
                  >
                    <Copy className="mr-2 h-4 w-4" />
                    Salin
                  </Button>
                </div>
                <div className="mt-4 max-h-28 overflow-y-auto rounded-[20px] border border-[color:var(--border)] bg-slate-950/90 p-4 font-mono text-xs leading-6 text-slate-100 scrollbar-thin">
                  {qrString}
                </div>
              </div>
            ) : null}

            <div className="brand-card">
              <div className="flex items-center gap-3 text-[color:var(--foreground)]">
                <Wallet className="h-4 w-4 text-[color:var(--accent-strong)]" />
                <span className="font-semibold">Metode pembayaran</span>
              </div>
              <p className="mt-3 text-sm leading-7 text-[color:var(--foreground-soft)]">
                {transaction.payment_method === "balance"
                  ? "Order ini diproses dari saldo yang tersimpan di akun Anda."
                  : "QRIS dinamis Pakasir dengan pembaruan status otomatis setelah pembayaran berhasil."}
              </p>
            </div>

            <div className="brand-card">
              <div className="flex items-center gap-3 text-[color:var(--foreground)]">
                <MessageCircleMore className="h-4 w-4 text-[color:var(--accent-strong)]" />
                <span className="font-semibold">Bot & support</span>
              </div>
              <div className="mt-3 space-y-2 text-sm text-[color:var(--foreground-soft)]">
                <div>Cek order cepat: <span className="font-semibold text-[color:var(--foreground)]">{SITE.botUsername}</span></div>
                <div>Auto order & top up: <span className="font-semibold text-[color:var(--foreground)]">{SITE.autoOrderBotUsername}</span></div>
                <div>Hubungi admin: <span className="font-semibold text-[color:var(--foreground)]">{SITE.support.telegram}</span></div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
