import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight, Boxes, Sparkles, Tag } from "lucide-react";
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

export default function ProductCard({ product, forceBadge }: { product: Product; forceBadge?: string }) {
  const stock = Number(product.stock || 0);
  const sold = Number(product.sold_count || 0);
  const badge = product.featured ? "Populer" : forceBadge || "Diskon";

  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-[28px] border border-white/10 bg-[#0f172a]/95 shadow-[0_28px_70px_-40px_rgba(0,0,0,0.82)] transition duration-300 hover:-translate-y-1.5 hover:border-yellow-400/20 hover:shadow-[0_0_0_1px_rgba(250,204,21,0.14),0_30px_70px_-38px_rgba(245,158,11,0.40)]">
      <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-br from-yellow-400/10 via-transparent to-cyan-400/10 opacity-0 transition duration-300 group-hover:opacity-100" />
      <div className="relative aspect-[16/10] overflow-hidden border-b border-white/10 bg-[linear-gradient(135deg,rgba(250,204,21,0.10),rgba(34,211,238,0.06))]">
        {product.image_url ? (
          <Image src={product.image_url} alt={product.name} fill className="object-cover transition duration-500 group-hover:scale-105" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-sm font-bold uppercase tracking-[0.28em] text-slate-500">
            {product.category || "Produk premium"}
          </div>
        )}
        <div className="absolute inset-x-0 top-0 flex items-center justify-between p-4">
          <span className="inline-flex rounded-full border border-white/10 bg-slate-950/70 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.2em] text-slate-300">
            {product.category || "Aplikasi"}
          </span>
          <div className="inline-flex items-center gap-2 rounded-full border border-yellow-400/20 bg-yellow-400/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.2em] text-yellow-300">
            <Sparkles className="h-3.5 w-3.5" /> {badge}
          </div>
        </div>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <div className="flex-1 space-y-4">
          <div>
            <h3 className="line-clamp-2 text-xl font-black text-white">{product.name}</h3>
            <p className="mt-2 line-clamp-2 text-sm leading-7 text-slate-400">
              {product.description || "Layanan premium dengan akses mudah, tampilan lebih profesional, dan alur order yang lebih jelas."}
            </p>
          </div>

          <div className="rounded-[22px] border border-white/10 bg-white/5 p-4">
            <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.24em] text-slate-500">
              <Tag className="h-3.5 w-3.5" /> Harga mulai
            </div>
            <div className="mt-3 text-2xl font-black text-white">{formatRupiah(Number(product.price || 0))}</div>
          </div>

          <div className="flex items-center justify-between rounded-[20px] border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-300">
            <div className="inline-flex items-center gap-2">
              <Boxes className="h-4 w-4 text-yellow-300" /> Stok {stock}
            </div>
            <div>Terjual {sold}</div>
          </div>
        </div>

        <Link href={`/products/${product.id}`} className="mt-5 inline-flex h-12 w-full items-center justify-between rounded-full bg-gradient-to-r from-yellow-400 via-amber-500 to-cyan-400 px-5 text-sm font-bold text-slate-950 transition hover:scale-[1.01]">
          <span>Lihat detail</span>
          <ArrowUpRight className="h-4 w-4" />
        </Link>
      </div>
    </article>
  );
}
