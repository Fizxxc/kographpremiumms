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
    <article
      className="group relative flex h-full flex-col overflow-hidden rounded-[28px] border transition duration-300 hover:-translate-y-1.5"
      style={{ borderColor: "var(--border)", background: "var(--card-strong)", boxShadow: "var(--shadow-soft)" }}
    >
      <div className="absolute inset-x-0 top-0 h-24 opacity-0 transition duration-300 group-hover:opacity-100" style={{ background: "linear-gradient(135deg, var(--mesh-a), transparent 50%, var(--mesh-b))" }} />
      <div className="relative aspect-[16/10] overflow-hidden border-b" style={{ borderColor: "var(--border)", background: "linear-gradient(135deg, var(--accent-soft), transparent 55%, var(--mesh-b))" }}>
        {product.image_url ? (
          <Image src={product.image_url} alt={product.name} fill className="object-cover transition duration-500 group-hover:scale-105" unoptimized />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-sm font-bold uppercase tracking-[0.28em]" style={{ color: "var(--foreground-muted)" }}>
            {product.category || "Produk premium"}
          </div>
        )}
        <div className="absolute inset-x-0 top-0 flex items-center justify-between p-4">
          <span className="inline-flex rounded-full border px-3 py-1 text-[11px] font-bold uppercase tracking-[0.2em]" style={{ borderColor: "var(--border)", background: "var(--card)", color: "var(--foreground-soft)" }}>
            {product.category || "Aplikasi"}
          </span>
          <div className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[11px] font-bold uppercase tracking-[0.2em]" style={{ borderColor: "rgba(248, 201, 51, 0.18)", background: "var(--accent-soft)", color: "color-mix(in srgb, var(--foreground) 72%, var(--accent-strong))" }}>
            <Sparkles className="h-3.5 w-3.5" /> {badge}
          </div>
        </div>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <div className="flex-1 space-y-4">
          <div>
            <h3 className="line-clamp-2 text-xl font-black" style={{ color: "var(--foreground)" }}>{product.name}</h3>
            <p className="mt-2 line-clamp-2 text-sm leading-7" style={{ color: "var(--foreground-soft)" }}>
              {product.description || "Pilih paket yang sesuai kebutuhan, lanjutkan pembayaran, lalu pantau status order tanpa alur yang membingungkan."}
            </p>
          </div>

          <div className="rounded-[22px] border p-4" style={{ borderColor: "var(--border)", background: "var(--card)" }}>
            <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.24em]" style={{ color: "var(--foreground-muted)" }}>
              <Tag className="h-3.5 w-3.5" /> Harga mulai
            </div>
            <div className="mt-3 text-2xl font-black" style={{ color: "var(--foreground)" }}>{formatRupiah(Number(product.price || 0))}</div>
          </div>

          <div className="flex items-center justify-between rounded-[20px] border px-4 py-3 text-sm" style={{ borderColor: "var(--border)", background: "var(--card)", color: "var(--foreground-soft)" }}>
            <div className="inline-flex items-center gap-2">
              <Boxes className="h-4 w-4" style={{ color: "var(--accent-strong)" }} /> Stok {stock}
            </div>
            <div>Terjual {sold}</div>
          </div>
        </div>

        <Link href={`/products/${product.id}`} className="mt-5 inline-flex h-12 w-full items-center justify-between rounded-full px-5 text-sm font-bold text-slate-950 transition hover:scale-[1.01]" style={{ background: "linear-gradient(135deg, #ffd54f 0%, #f3b203 55%, #67e8f9 100%)" }}>
          <span>Lihat detail</span>
          <ArrowUpRight className="h-4 w-4" />
        </Link>
      </div>
    </article>
  );
}
