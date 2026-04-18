"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { formatRupiah } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type CheckoutCardProps = {
  product: {
    id: string;
    name: string;
    price: number;
    compare_at_price?: number | null;
    image_url?: string | null;
    variants?: { id: string; name: string; price: number; compare_at_price?: number | null }[];
    service_type?: string | null;
    stock?: number | null;
    sold_count?: number | null;
  };
};

export default function CheckoutCard({ product }: CheckoutCardProps) {
  const router = useRouter();
  const [buyerName, setBuyerName] = useState("");
  const [buyerEmail, setBuyerEmail] = useState("");
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [selectedVariantId, setSelectedVariantId] = useState<string>(product.variants?.[0]?.id || "");

  const variants = product.variants || [];
  const hasVariants = variants.length > 0;
  const selectedVariant = hasVariants ? variants.find((variant) => variant.id === selectedVariantId) || variants[0] : null;
  const displayPrice = Number(selectedVariant?.price || product.price || 0);
  const comparePrice = Number(selectedVariant?.compare_at_price || product.compare_at_price || 0);
  const stock = Math.max(0, Number(product.stock || 0));
  const soldCount = Math.max(0, Number(product.sold_count || 0));
  const isOutOfStock = stock <= 0;

  const savings = useMemo(() => {
    if (comparePrice <= displayPrice) return 0;
    return comparePrice - displayPrice;
  }, [comparePrice, displayPrice]);

  async function handleCheckout() {
    if (!buyerName.trim()) {
      toast.error("Nama pembeli wajib diisi.");
      return;
    }
    if (!buyerEmail.trim()) {
      toast.error("Email pembeli wajib diisi.");
      return;
    }
    if (isOutOfStock) {
      toast.error("Stok produk sedang habis.");
      return;
    }

    try {
      setSubmitting(true);
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          productId: product.id,
          buyerName,
          buyerEmail,
          note,
          variantId: selectedVariantId || null,
          variant: selectedVariant
            ? {
                id: selectedVariant.id,
                name: selectedVariant.name,
                price: Number(selectedVariant.price || 0),
                compare_at_price: Number(selectedVariant.compare_at_price || 0)
              }
            : null,
          paymentMethod: "qris"
        })
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result?.error || "Gagal membuat order.");
      }

      toast.success("Order berhasil dibuat. Silakan lanjutkan pembayaran.");
      router.push(result.waitingPaymentUrl || result.paymentStatusUrl);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Gagal membuat order.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-[0_22px_80px_rgba(15,23,42,0.1)] dark:border-white/10 dark:bg-slate-950/70 sm:p-7">
      <div className="space-y-2">
        <div className="text-sm font-semibold uppercase tracking-[0.28em] text-slate-400 dark:text-slate-500">Mulai order</div>
        <div className="text-2xl font-black text-slate-950 dark:text-white">{formatRupiah(displayPrice)}</div>
        {comparePrice > displayPrice ? <div className="text-sm text-slate-400 line-through">{formatRupiah(comparePrice)}</div> : null}
        {savings > 0 ? <div className="text-sm font-semibold text-emerald-600 dark:text-emerald-300">Hemat {formatRupiah(savings)}</div> : null}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-300">
        <span className={`rounded-full px-3 py-1.5 ${isOutOfStock ? "border border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-400/30 dark:bg-rose-500/10 dark:text-rose-300" : "border border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-400/30 dark:bg-emerald-500/10 dark:text-emerald-300"}`}>
          {isOutOfStock ? "Stok habis" : `Stok tersedia ${stock}`}
        </span>
        <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 dark:border-white/10 dark:bg-white/5">Terjual {soldCount}</span>
      </div>

      <div className="mt-6 space-y-5">
        {hasVariants ? (
          <div className="space-y-2">
            <Label htmlFor="variant">Pilih varian</Label>
            <select
              id="variant"
              value={selectedVariantId}
              onChange={(event) => setSelectedVariantId(event.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 outline-none transition focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 dark:border-white/10 dark:bg-white/[0.03] dark:text-slate-100"
            >
              {variants.map((variant) => (
                <option key={variant.id} value={variant.id}>
                  {variant.name} — {formatRupiah(Number(variant.price || 0))}
                </option>
              ))}
            </select>
          </div>
        ) : null}

        <div className="space-y-2">
          <Label htmlFor="buyer-name">Nama pembeli</Label>
          <Input id="buyer-name" value={buyerName} onChange={(event) => setBuyerName(event.target.value)} placeholder="Nama lengkap" />
        </div>

        <div className="space-y-2">
          <Label htmlFor="buyer-email">Email aktif</Label>
          <Input id="buyer-email" type="email" value={buyerEmail} onChange={(event) => setBuyerEmail(event.target.value)} placeholder="nama@email.com" />
        </div>

        <div className="space-y-2">
          <Label htmlFor="order-note">Catatan tambahan</Label>
          <Textarea
            id="order-note"
            value={note}
            onChange={(event) => setNote(event.target.value)}
            placeholder="Tulis catatan singkat bila ada instruksi tambahan"
            rows={4}
          />
        </div>

        <Button onClick={handleCheckout} disabled={submitting || isOutOfStock} className="w-full">
          {isOutOfStock ? "Stok sedang habis" : submitting ? "Memproses..." : "Lanjut bayar QRIS"}
        </Button>

        <p className="text-xs leading-6 text-slate-500 dark:text-slate-400">
          Setelah checkout dibuat, Anda akan diarahkan ke halaman pembayaran untuk scan QRIS, memantau status order, dan mengunduh invoice bila diperlukan.
        </p>
      </div>
    </section>
  );
}
