import { notFound } from "next/navigation";
import Image from "next/image";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { formatRupiah } from "@/lib/format";
import CheckoutCard from "@/components/checkout-card";
import LiveChatLauncher from "@/components/live-chat/launcher";

export const dynamic = "force-dynamic";

export default async function ProductDetailPage({ params }: { params: { id: string } }) {
  const supabase = getSupabaseServerClient();
  const { data: product } = await supabase
    .from("products")
    .select(
      `id, name, description, price, compare_at_price, image_url, category, stock, sold_count, featured, service_type, live_chat_enabled,
       product_variants ( id, name, price, compare_at_price, is_active, sort_order )`
    )
    .eq("id", params.id)
    .eq("is_active", true)
    .maybeSingle();

  if (!product) {
    notFound();
  }

  const variants = ((product as any).product_variants || [])
    .filter((variant: any) => variant.is_active !== false)
    .sort((a: any, b: any) => Number(a.sort_order || 0) - Number(b.sort_order || 0));

  const price = Number((product as any).price || 0);
  const compareAtPrice = Number((product as any).compare_at_price || 0);
  const stock = Math.max(0, Number((product as any).stock || 0));
  const soldCount = Math.max(0, Number((product as any).sold_count || 0));
  const outOfStock = stock <= 0;

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-10 sm:px-6 lg:px-8">
      <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr]">
        <section className="overflow-hidden rounded-[34px] border border-slate-200 bg-white shadow-[0_28px_90px_rgba(15,23,42,0.1)] dark:border-white/10 dark:bg-slate-950/80">
          <div className="relative aspect-[16/11] bg-slate-100 dark:bg-slate-900">
            {(product as any).image_url ? (
              <Image src={(product as any).image_url} alt={(product as any).name} fill className="object-cover" />
            ) : (
              <div className="flex h-full items-center justify-center text-sm font-semibold uppercase tracking-[0.28em] text-slate-400 dark:text-slate-500">Preview produk</div>
            )}
          </div>

          <div className="space-y-6 p-6 sm:p-8">
            <div className="flex flex-wrap items-center gap-3 text-[11px] font-black uppercase tracking-[0.28em]">
              {(product as any).featured ? <span className="rounded-full bg-amber-400 px-3 py-1 text-slate-950">Pilihan populer</span> : null}
              {(product as any).category ? (
                <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-slate-600 dark:border-white/10 dark:bg-white/5 dark:text-slate-300">
                  {(product as any).category}
                </span>
              ) : null}
            </div>

            <div className="space-y-4">
              <h1 className="text-3xl font-black tracking-tight text-slate-950 sm:text-4xl dark:text-white">{(product as any).name}</h1>
              <p className="text-base leading-8 text-slate-600 dark:text-slate-300">
                {(product as any).description || "Produk digital dengan alur order yang rapi, jelas, dan mudah dipantau."}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 text-sm font-semibold text-slate-600 dark:text-slate-300">
              <span className={`rounded-full px-3 py-1.5 ${outOfStock ? "border border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-400/30 dark:bg-rose-500/10 dark:text-rose-300" : "border border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-400/30 dark:bg-emerald-500/10 dark:text-emerald-300"}`}>
                {outOfStock ? "Stok sedang habis" : `Stok tersedia ${stock}`}
              </span>
              <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 dark:border-white/10 dark:bg-white/5">Terjual {soldCount}</span>
              {variants.length > 0 ? (
                <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 dark:border-white/10 dark:bg-white/5">{variants.length} pilihan varian</span>
              ) : null}
            </div>

            <div className="rounded-[28px] border border-slate-200 bg-slate-50 p-5 dark:border-white/10 dark:bg-white/[0.03]">
              <div className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-400 dark:text-slate-500">Harga dasar</div>
              <div className="mt-3 flex flex-wrap items-end gap-3">
                <div className="text-3xl font-black text-slate-950 dark:text-white">{formatRupiah(price)}</div>
                {compareAtPrice > price ? <div className="pb-1 text-sm font-semibold text-slate-400 line-through">{formatRupiah(compareAtPrice)}</div> : null}
              </div>
            </div>

            {(product as any).live_chat_enabled ? (
              <div className="rounded-[28px] border border-brand-500/20 bg-brand-500/10 p-5">
                <div className="text-sm leading-7 text-slate-700 dark:text-slate-200">
                  Butuh diskusi sebelum checkout? Gunakan live chat agar briefing, revisi kebutuhan, atau detail pengerjaan bisa disampaikan lebih rapi.
                </div>
                <div className="mt-4">
                  <LiveChatLauncher productId={(product as any).id} />
                </div>
              </div>
            ) : null}
          </div>
        </section>

        <aside className="space-y-6">
          <CheckoutCard
            product={{
              id: (product as any).id,
              name: (product as any).name,
              price,
              compare_at_price: compareAtPrice,
              image_url: (product as any).image_url,
              variants,
              service_type: (product as any).service_type,
              stock,
              sold_count: soldCount
            }}
          />

          <section className="rounded-[30px] border border-slate-200 bg-white p-6 shadow-[0_20px_70px_rgba(15,23,42,0.08)] dark:border-white/10 dark:bg-slate-950/70">
            <div className="text-[11px] font-black uppercase tracking-[0.32em] text-slate-400 dark:text-slate-500">Yang Anda dapatkan</div>
            <div className="mt-4 grid gap-3 text-sm leading-7 text-slate-600 dark:text-slate-300">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-white/[0.03]">Alur pembayaran QRIS yang jelas dan mudah diikuti.</div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-white/[0.03]">Status order dapat dicek kembali kapan pun melalui halaman pesanan.</div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-white/[0.03]">Invoice PDF dan data layanan tetap tersimpan rapi setelah pembayaran berhasil.</div>
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}
