import Link from "next/link";
import Image from "next/image";
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
      className="group overflow-hidden rounded-[30px] border border-slate-200 bg-white/95 shadow-[0_20px_60px_rgba(15,23,42,0.08)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_26px_80px_rgba(15,23,42,0.14)] dark:border-white/10 dark:bg-slate-950/80"
    >
      <div className="relative aspect-[16/10] overflow-hidden bg-slate-100 dark:bg-slate-900">
        {product.image_url ? (
          <Image src={product.image_url} alt={product.name} fill className="object-cover transition duration-500 group-hover:scale-105" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-sm font-semibold text-slate-400 dark:text-slate-500">Preview produk</div>
        )}
        <div className="absolute inset-x-0 top-0 flex items-center justify-between gap-3 p-4">
          <span className="rounded-full bg-slate-950/75 px-3 py-1 text-[11px] font-black uppercase tracking-[0.28em] text-white backdrop-blur dark:bg-white/10">
            {product.category || "Digital"}
          </span>
          <span
            className={`rounded-full px-3 py-1 text-[11px] font-black uppercase tracking-[0.25em] ${
              isOutOfStock
                ? "bg-rose-500/90 text-white"
                : "bg-emerald-500/90 text-white"
            }`}
          >
            {isOutOfStock ? "Stok habis" : `Stok ${stock}`}
          </span>
        </div>
      </div>

      <div className="space-y-4 p-5 sm:p-6">
        <div className="space-y-2">
          <h3 className="line-clamp-2 text-xl font-black tracking-tight text-slate-950 dark:text-white">{product.name}</h3>
          <p className="line-clamp-3 text-sm leading-7 text-slate-600 dark:text-slate-300">{product.description || "Produk digital dengan alur order yang lebih rapi, jelas, dan mudah dipantau."}</p>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-300">
          <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 dark:border-white/10 dark:bg-white/5">Terjual {soldCount}</span>
          <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 dark:border-white/10 dark:bg-white/5">
            {variants.length > 0 ? `${variants.length} pilihan varian` : "Siap dipesan"}
          </span>
        </div>

        <div className="flex items-end justify-between gap-4">
          <div>
            <div className="text-xs font-black uppercase tracking-[0.3em] text-slate-400 dark:text-slate-500">Harga mulai</div>
            <div className="mt-2 text-2xl font-black text-slate-950 dark:text-white">{formatRupiah(displayPrice)}</div>
          </div>
          <div className="rounded-full border border-amber-200 bg-amber-50 px-4 py-2 text-sm font-semibold text-amber-700 transition group-hover:border-amber-300 group-hover:bg-amber-100 dark:border-amber-300/20 dark:bg-amber-300/10 dark:text-amber-300">
            Lihat detail
          </div>
        </div>
      </div>
    </Link>
  );
}
