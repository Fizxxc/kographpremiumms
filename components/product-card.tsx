import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight, Layers3, PackageCheck } from "lucide-react";
import { formatRupiah } from "@/lib/format";

type ProductCardProps = {
  product: {
    id: string;
    name: string;
    description?: string | null;
    price: number;
    image_url?: string | null;
    category?: string | null;
    stock?: number | null;
    sold_count?: number | null;
    product_variants?: { id: string; price: number; is_active?: boolean }[];
  };
};

export default function ProductCard({ product }: ProductCardProps) {
  const variants = Array.isArray(product.product_variants)
    ? product.product_variants.filter((variant) => variant.is_active !== false)
    : [];
  const basePrice = Number(product.price || 0);
  const minVariantPrice = variants.length > 0 ? Math.min(...variants.map((variant) => Number(variant.price || basePrice))) : basePrice;
  const displayPrice = minVariantPrice > 0 ? minVariantPrice : basePrice;
  const stock = Math.max(0, Number(product.stock || 0));
  const soldCount = Math.max(0, Number(product.sold_count || 0));
  const isOutOfStock = stock <= 0;

  return (
    <Link
      href={`/products/${product.id}`}
      className="group relative overflow-hidden rounded-[32px] border border-slate-200/80 bg-white/90 shadow-[0_24px_80px_rgba(15,23,42,0.09)] transition duration-300 hover:-translate-y-1.5 hover:shadow-[0_28px_90px_rgba(15,23,42,0.15)] dark:border-white/10 dark:bg-slate-950/75"
    >
      <div className="absolute inset-x-0 top-0 h-24 bg-[linear-gradient(180deg,rgba(250,204,21,0.14),transparent)] opacity-0 transition duration-300 group-hover:opacity-100" />
      <div className="relative aspect-[16/10] overflow-hidden bg-slate-100 dark:bg-slate-900">
        {product.image_url ? (
          <Image src={product.image_url} alt={product.name} fill className="object-cover transition duration-500 group-hover:scale-105" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-sm font-semibold text-slate-400 dark:text-slate-500">Preview produk</div>
        )}
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(15,23,42,0.05)_0%,rgba(15,23,42,0.48)_100%)]" />
        <div className="absolute inset-x-0 top-0 flex items-center justify-between gap-3 p-4">
          <span className="rounded-full border border-white/15 bg-slate-950/60 px-3.5 py-1.5 text-[11px] font-black uppercase tracking-[0.28em] text-white backdrop-blur-sm">
            {product.category || "Digital"}
          </span>
          <span
            className={`rounded-full px-3.5 py-1.5 text-[11px] font-black uppercase tracking-[0.25em] shadow-sm ${
              isOutOfStock ? "bg-rose-500 text-white" : "bg-emerald-500 text-white"
            }`}
          >
            {isOutOfStock ? "Habis" : `Stok ${stock}`}
          </span>
        </div>
        <div className="absolute inset-x-0 bottom-0 p-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3.5 py-2 text-xs font-semibold text-white backdrop-blur-sm">
            <PackageCheck className="h-4 w-4 text-primary" />
            Siap diproses
          </div>
        </div>
      </div>

      <div className="relative space-y-5 p-5 sm:p-6">
        <div className="space-y-2.5">
          <h3 className="line-clamp-2 text-[1.35rem] font-black leading-tight tracking-tight text-slate-950 dark:text-white">{product.name}</h3>
          <p className="line-clamp-3 text-sm leading-7 text-slate-600 dark:text-slate-300">
            {product.description || "Produk digital dengan tampilan order yang lebih rapi, checkout yang jelas, dan status transaksi yang mudah dipantau."}
          </p>
        </div>

        <div className="flex flex-wrap gap-2.5 text-xs font-semibold text-slate-500 dark:text-slate-300">
          <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 dark:border-white/10 dark:bg-white/5">
            <Layers3 className="h-3.5 w-3.5" />
            {variants.length > 0 ? `${variants.length} varian aktif` : "Siap dipesan"}
          </span>
          <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 dark:border-white/10 dark:bg-white/5">Terjual {soldCount}</span>
        </div>

        <div className="flex items-end justify-between gap-4">
          <div>
            <div className="text-[11px] font-black uppercase tracking-[0.32em] text-slate-400">Harga mulai</div>
            <div className="mt-2 text-[1.7rem] font-black tracking-tight text-slate-950 dark:text-white">{formatRupiah(displayPrice)}</div>
          </div>
          <div className="inline-flex h-12 items-center justify-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-4 text-sm font-bold text-amber-700 transition group-hover:border-amber-300 group-hover:bg-amber-100 dark:border-amber-300/20 dark:bg-amber-300/10 dark:text-amber-300">
            Detail
            <ArrowUpRight className="h-4 w-4" />
          </div>
        </div>
      </div>
    </Link>
  );
}
