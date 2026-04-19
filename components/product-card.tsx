import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight, Boxes, Sparkles, Tag } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatRupiah } from "@/lib/format";

type Product = {
  id: string;
  name: string;
  description?: string | null;
  category?: string | null;
  image_url?: string | null;
  price?: number | null;
  featured?: boolean | null;
  stock?: number | null;
  sold_count?: number | null;
};

export default function ProductCard({ product }: { product: Product }) {
  const stock = Number(product.stock || 0);
  const sold = Number(product.sold_count || 0);

  return (
    <article className="group surface-card flex h-full flex-col overflow-hidden p-0 transition duration-300 hover:-translate-y-1">
      <div className="relative aspect-[16/10] overflow-hidden border-b border-[color:var(--border)] bg-[linear-gradient(135deg,rgba(248,201,51,0.16),rgba(14,165,233,0.08))]">
        {product.image_url ? (
          <Image src={product.image_url} alt={product.name} fill className="object-cover transition duration-500 group-hover:scale-105" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-sm font-bold uppercase tracking-[0.28em] text-[color:var(--foreground-muted)]">
            {product.category || "Produk"}
          </div>
        )}
        <div className="absolute inset-x-0 top-0 flex items-center justify-between p-4">
          {product.category ? <Badge className="bg-white/90">{product.category}</Badge> : <span />}
          {product.featured ? (
            <div className="inline-flex items-center gap-2 rounded-full bg-slate-950/80 px-3 py-1 text-xs font-bold text-white">
              <Sparkles className="h-3.5 w-3.5 text-yellow-300" /> Populer
            </div>
          ) : null}
        </div>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <div className="flex-1 space-y-4">
          <div>
            <h3 className="line-clamp-2 text-xl font-black text-[color:var(--foreground)]">{product.name}</h3>
            <p className="mt-2 line-clamp-2 text-sm leading-7 text-[color:var(--foreground-soft)]">
              {product.description || "Layanan digital dengan tampilan baru yang lebih rapi dan langkah order yang jelas."}
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-[20px] border border-[color:var(--border)] bg-[color:var(--card-subtle)] p-4">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.22em] text-[color:var(--foreground-muted)]">
                <Tag className="h-3.5 w-3.5" /> Harga
              </div>
              <div className="mt-2 text-xl font-black text-[color:var(--foreground)]">{formatRupiah(Number(product.price || 0))}</div>
            </div>
            <div className="rounded-[20px] border border-[color:var(--border)] bg-[color:var(--card-subtle)] p-4">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.22em] text-[color:var(--foreground-muted)]">
                <Boxes className="h-3.5 w-3.5" /> Stok & jual
              </div>
              <div className="mt-2 text-sm font-semibold text-[color:var(--foreground)]">Stok {stock} · Terjual {sold}</div>
            </div>
          </div>
        </div>

        <Link href={`/products/${product.id}`} className="primary-button mt-5 w-full justify-between px-5">
          <span>Lihat detail</span>
          <ArrowUpRight className="h-4 w-4" />
        </Link>
      </div>
    </article>
  );
}
