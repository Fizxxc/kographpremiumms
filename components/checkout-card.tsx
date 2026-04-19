"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { CircleDollarSign, PackageCheck, ShoppingCart } from "lucide-react";
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
    if (!buyerName.trim()) return toast.error("Nama pembeli wajib diisi.");
    if (!buyerEmail.trim()) return toast.error("Email pembeli wajib diisi.");
    if (isOutOfStock) return toast.error("Stok produk sedang habis.");

    try {
      setSubmitting(true);
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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
      if (!response.ok) throw new Error(result?.error || "Gagal membuat order.");

      toast.success("Order berhasil dibuat. Silakan lanjutkan pembayaran.");
      router.push(result.waitingPaymentUrl || result.paymentStatusUrl);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Gagal membuat order.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="surface-card">
      <div className="rounded-[24px] border border-[#f4c73f] bg-[linear-gradient(135deg,#fff6cc_0%,#fffdf4_100%)] p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="brand-kicker">Mulai order</div>
            <div className="mt-2 text-3xl font-black text-[color:var(--foreground)]">{formatRupiah(displayPrice)}</div>
            {comparePrice > displayPrice ? <div className="mt-1 text-sm text-[color:var(--foreground-muted)] line-through">{formatRupiah(comparePrice)}</div> : null}
            {savings > 0 ? <div className="mt-1 text-sm font-semibold text-emerald-600">Hemat {formatRupiah(savings)}</div> : null}
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white shadow-sm">
            <CircleDollarSign className="h-5 w-5 text-[color:var(--accent-strong)]" />
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2 text-xs font-semibold">
          <span className={`rounded-full px-3 py-1.5 ${isOutOfStock ? "border border-rose-200 bg-rose-50 text-rose-700" : "border border-emerald-200 bg-emerald-50 text-emerald-700"}`}>
            {isOutOfStock ? "Stok habis" : `Stok tersedia ${stock}`}
          </span>
          <span className="rounded-full border border-[color:var(--border)] bg-white px-3 py-1.5 text-[color:var(--foreground)]">Terjual {soldCount}</span>
        </div>
      </div>

      <div className="mt-6 space-y-5">
        {hasVariants ? (
          <div className="space-y-2">
            <Label htmlFor="variant">Pilih varian</Label>
            <select
              id="variant"
              value={selectedVariantId}
              onChange={(event) => setSelectedVariantId(event.target.value)}
              className="w-full rounded-2xl border border-[color:var(--border)] bg-white px-4 py-3 text-sm font-medium text-[color:var(--foreground)] outline-none transition focus:border-[#f3b203] focus:ring-4 focus:ring-[#f3b203]/10 dark:bg-[color:var(--card-subtle)]"
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

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="brand-card flex items-start gap-3">
            <ShoppingCart className="mt-0.5 h-4 w-4 text-[color:var(--accent-strong)]" />
            <p className="text-xs leading-6 text-[color:var(--foreground)]">Form checkout sekarang lebih sederhana dan fokus ke data penting.</p>
          </div>
          <div className="brand-card flex items-start gap-3">
            <PackageCheck className="mt-0.5 h-4 w-4 text-[color:var(--accent-strong)]" />
            <p className="text-xs leading-6 text-[color:var(--foreground)]">Setelah dibuat, Anda langsung diarahkan ke halaman QRIS dan status pembayaran.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
