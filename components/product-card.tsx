import Link from "next/link";
import { ArrowUpRight, Package2, Sparkles } from "lucide-react";
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
    <article className="group brand-panel flex h-full flex-col overflow-hidden p-0 transition duration-300 hover:-translate-y-1">
      <div className="relative overflow-hidden rounded-[28px] border-b border-[color:var(--border)] p-5"
        style={{ background: "linear-gradient(135deg, rgba(245,207,83,0.12), transparent 35%), linear-gradient(180deg, var(--card), transparent)" }}>
        <div className="absolute inset-0 opacity-0 transition duration-500 group-hover:opacity-100" style={{ background: "radial-gradient(circle at top right, rgba(245,207,83,0.16), transparent 38%)" }} />
        <div className="relative flex flex-wrap items-start justify-between gap-3">
          <div className="space-y-3">
            {product.category ? <Badge className="rounded-full bg-[color:var(--card-strong)] text-[color:var(--foreground)]">{product.category}</Badge> : null}
            {product.featured ? (
              <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-semibold text-emerald-600 dark:text-emerald-300">
                <Sparkles className="h-3.5 w-3.5" />
                Paling diminati
              </div>
            ) : null}
          </div>

          <div className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--card-strong)] p-2 text-[color:var(--foreground)] transition group-hover:-rotate-6">
            <ArrowUpRight className="h-4 w-4" />
          </div>
        </div>

        <div className="relative mt-14 space-y-2">
          <h3 className="text-2xl font-black tracking-[-0.04em] text-[color:var(--foreground)]">{product.name}</h3>
          <p className="line-clamp-2 text-sm leading-7 text-[color:var(--foreground-soft)]">
            {product.description || "Layanan digital dengan proses pemesanan yang lebih rapi dan mudah diikuti."}
          </p>
        </div>
      </div>

      <div className="flex flex-1 flex-col justify-between gap-5 p-5">
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="brand-card py-3">
            <div className="brand-kicker">Harga mulai</div>
            <div className="mt-2 text-2xl font-black text-[color:var(--foreground)]">{formatRupiah(Number(product.price || 0))}</div>
          </div>
          <div className="brand-card py-3">
            <div className="brand-kicker">Ketersediaan</div>
            <div className="mt-2 flex items-center gap-3 text-sm font-semibold text-[color:var(--foreground)]">
              <span className="inline-flex items-center gap-1"><Package2 className="h-4 w-4" /> Stok {stock}</span>
              <span className="text-[color:var(--foreground-soft)]">Terjual {sold}</span>
            </div>
          </div>
        </div>

        <Link
          href={`/products/${product.id}`}
          className="inline-flex h-12 items-center justify-center rounded-full bg-[color:var(--accent)] px-5 text-sm font-bold text-slate-950 transition hover:-translate-y-0.5"
        >
          Lihat detail
        </Link>
      </div>
    </article>
  );
}
