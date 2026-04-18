"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
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

export function WaitingPaymentClient({ transaction, product, credential }: WaitingPaymentClientProps) {
  const [status, setStatus] = useState(String(transaction.status || "pending"));
  const [loading, setLoading] = useState(false);

  const fulfillmentData = (transaction.fulfillment_data || {}) as Record<string, any>;
  const qrString = String(fulfillmentData.payment_qr_string || "");
  const backupPayUrl = String(fulfillmentData.payment_fallback_url || transaction.snap_token || "");
  const waitingUrl = `/api/public-order-status/${transaction.order_id}?resi=${transaction.public_order_code}`;
  const qrImageSrc = qrString
    ? `https://api.qrserver.com/v1/create-qr-code/?size=512x512&data=${encodeURIComponent(qrString)}`
    : "";

 const panelInfoText = useMemo(() => {
  if (!fulfillmentData) return "";
  return [
    `Panel URL: ${fulfillmentData.panel_url || "-"}`,
    `Username: ${fulfillmentData.panel_username || "-"}`,
    `Email: ${fulfillmentData.panel_email || "-"}`,
    `Password: ${fulfillmentData.panel_password || "-"}`,
    `Server UUID: ${fulfillmentData.server_uuid || "-"}`
  ].join("\\n");
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
    <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
      <Card className="space-y-6">
        <div>
          <div className="text-sm uppercase tracking-[0.2em] text-slate-400">Order ID</div>
          <div className="mt-2 text-2xl font-black text-white">{transaction.order_id}</div>
          <div className="mt-3 text-sm text-slate-300">
            {product?.name || transaction.product_snapshot?.product_name || "Produk Premium"}
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <InfoBox label="Status" value={normalizeStatus(status)} />
          <InfoBox label="Total Bayar" value={formatRupiah(Number(transaction.final_amount || transaction.amount || 0))} />
          <InfoBox label="Resi Publik" value={transaction.public_order_code || "-"} />
          <InfoBox label="Gateway" value="Pakasir" />
        </div>

        {status !== "settlement" && qrImageSrc ? (
          <div className="rounded-[28px] border border-white/10 bg-white/5 p-5">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-brand-600/20 p-3 text-brand-200"><QrCode className="h-5 w-5" /></div>
              <div>
                <div className="font-semibold text-white">QRIS Dinamis</div>
                <div className="text-sm text-slate-300">Scan QRIS ini dari mobile banking atau e-wallet Anda.</div>
              </div>
            </div>
            <div className="mt-5 rounded-[28px] bg-white p-4">
              <img src={qrImageSrc} alt="QRIS Dinamis" className="mx-auto h-72 w-72 max-w-full rounded-2xl object-contain" />
            </div>
            <div className="mt-4 flex flex-wrap gap-3">
              <Button variant="secondary" onClick={() => copyText(qrString, "QR string")}>
                <Copy className="mr-2 h-4 w-4" />Copy QR String
              </Button>
              {backupPayUrl ? (
                <a href={backupPayUrl} target="_blank" rel="noreferrer">
                  <Button>
                    <ExternalLink className="mr-2 h-4 w-4" />Buka Halaman Bayar
                  </Button>
                </a>
              ) : null}
            </div>
          </div>
        ) : null}

        {status === "settlement" && (
          <div className="rounded-[28px] border border-emerald-400/20 bg-emerald-400/10 p-5">
            <div className="flex items-center gap-3 text-emerald-200">
              <CheckCircle2 className="h-5 w-5" />
              <div className="font-semibold">Pembayaran sudah terverifikasi</div>
            </div>
            <div className="mt-3 text-sm text-slate-200">
              Sistem sedang menampilkan data layanan Anda. Bila halaman belum berubah, tekan refresh status sekali lagi.
            </div>
          </div>
        )}

        {(credential?.account_data || fulfillmentData.panel_url) && (
          <div className="rounded-[28px] border border-white/10 bg-white/5 p-5">
            <div className="text-lg font-semibold text-white">Data layanan</div>
            {credential?.account_data ? (
              <div className="mt-4 whitespace-pre-wrap rounded-2xl border border-white/10 bg-slate-950/60 p-4 text-sm text-slate-200">{credential.account_data}</div>
            ) : null}
            {fulfillmentData.panel_url ? (
              <div className="mt-4 grid gap-3 md:grid-cols-2">
                <InfoBox label="Panel URL" value={fulfillmentData.panel_url || "-"} />
                <InfoBox label="Username" value={fulfillmentData.panel_username || "-"} />
                <InfoBox label="Email Login" value={fulfillmentData.panel_email || "-"} />
                <InfoBox label="Password Login" value={fulfillmentData.panel_password || "-"} />
              </div>
            ) : null}
            {fulfillmentData.panel_url ? (
              <div className="mt-4 flex flex-wrap gap-3">
                <Button variant="secondary" onClick={() => copyText(panelInfoText, "Info panel")}>
                  <Copy className="mr-2 h-4 w-4" />Copy Info Panel
                </Button>
                <a href={fulfillmentData.panel_url} target="_blank" rel="noreferrer"><Button>Buka Panel</Button></a>
              </div>
            ) : null}
          </div>
        )}
      </Card>

      <div className="space-y-6">
        <Card className="space-y-4">
          <div className="text-lg font-semibold text-white">Status Sinkronisasi</div>
          <Badge className={status === "settlement" ? "text-emerald-300" : status === "expire" ? "text-rose-300" : "text-amber-300"}>
            {normalizeStatus(status)}
          </Badge>
          <div className="text-sm text-slate-300">Cek juga via Telegram bot <span className="font-semibold text-white">@{SITE.botUsername}</span></div>
          <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-4 font-mono text-sm text-white">/status {transaction.status_token}</div>
        </Card>

        <Card className="space-y-4 border-brand-500/30 bg-gradient-to-br from-brand-600/20 to-slate-950/90">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-brand-600/20 p-3 text-brand-200"><Wallet className="h-5 w-5" /></div>
            <div>
              <div className="font-semibold text-white">Metode Pembayaran</div>
              <div className="text-sm text-slate-300">
                {transaction.payment_method === "balance"
                  ? "Order ini diproses dari saldo yang tersimpan di web"
                  : "QRIS dinamis Pakasir dengan pembaruan status otomatis"}
              </div>
            </div>
          </div>

          {status !== "settlement" && backupPayUrl ? (
            <a href={backupPayUrl} target="_blank" rel="noreferrer">
              <Button className="w-full"><ExternalLink className="mr-2 h-4 w-4" />Buka Halaman Bayar</Button>
            </a>
          ) : null}

          <Button variant="secondary" className="w-full" onClick={refreshStatus} disabled={loading}>
            {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Memuat...</> : <><RefreshCw className="mr-2 h-4 w-4" />Refresh Status</>}
          </Button>
        </Card>

        <Card>
          <div className="flex items-center gap-3">
            <MessageCircleMore className="h-5 w-5 text-brand-300" />
            <div className="font-semibold text-white">Bot & Support</div>
          </div>
          <div className="mt-4 space-y-3 text-sm text-slate-300">
            <div>Cek order cepat: <span className="font-semibold text-white">@{SITE.botUsername}</span></div>
            <div>Auto order & top up: <span className="font-semibold text-white">@{SITE.autoOrderBotUsername}</span></div>
            <div>Hubungi admin: <span className="font-semibold text-white">@{SITE.support.telegram}</span></div>
          </div>
        </Card>
      </div>
    </div>
  );
}

function InfoBox({ label, value }: { label: string; value: string }) {
  const shouldBreakAll = /(url|uuid|token|order id|email|username|password)/i.test(label);

  return (
    <div className="min-w-0 rounded-2xl border border-white/10 bg-white/5 p-4">
      <div className="text-xs uppercase tracking-[0.2em] text-slate-400">{label}</div>
      <div className={`mt-2 text-sm font-semibold text-white ${shouldBreakAll ? "break-all" : "break-words"}`}>{value}</div>
    </div>
  );
}
