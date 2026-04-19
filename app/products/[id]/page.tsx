import { notFound } from "next/navigation";
import Image from "next/image";
import { BadgeCheck, Boxes, PackageOpen, ShieldCheck } from "lucide-react";
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

  if (!product) notFound();

  const variants = ((product as any).product_variants || [])
    .filter((variant: any) => variant.is_active !== false)
    .sort((a: any, b: any) => Number(a.sort_order || 0) - Number(b.sort_order || 0));

  const price = Number((product as any).price || 0);
  const compareAtPrice = Number((product as any).compare_at_price || 0);
  const stock = Math.max(0, Number((product as any).stock || 0));
  const soldCount = Math.max(0, Number((product as any).sold_count || 0));
  const outOfStock = stock <= 0;

  return (
    <div className="page-section">
      <div className="site-container flex flex-col gap-8">
        <div className="grid gap-8 lg:grid-cols-[1.12fr_0.88fr]">
          <section className="surface-card overflow-hidden p-0">
            <div className="relative aspect-[16/10] bg-[linear-gradient(135deg,rgba(248,201,51,0.12),rgba(14,165,233,0.08))]">
              {(product as any).image_url ? (
                <Image src={(product as any).image_url} alt={(product as any).name} fill className="object-cover" unoptimized />
              ) : (
                <div className="flex h-full items-center justify-center text-sm font-semibold uppercase tracking-[0.28em] text-[color:var(--foreground-muted)]">
                  Preview produk
                </div>
              )}
            </div>

            <div className="space-y-6 p-6 sm:p-8">
              <div className="flex flex-wrap items-center gap-3 text-[11px] font-black uppercase tracking-[0.28em]">
                {(product as any).featured ? <span className="rounded-full bg-[linear-gradient(135deg,#ffd95c_0%,#f3b203_100%)] px-3 py-1 text-slate-950">Pilihan populer</span> : null}
                {(product as any).category ? <span className="rounded-full border border-[color:var(--border)] bg-[color:var(--card-subtle)] px-3 py-1 text-[color:var(--foreground-soft)]">{(product as any).category}</span> : null}
              </div>

              <div className="space-y-4">
                <h1 className="text-3xl font-black tracking-tight text-[color:var(--foreground)] sm:text-4xl">{(product as any).name}</h1>
                <p className="text-base leading-8 text-[color:var(--foreground-soft)]">
                  {(product as any).description || "Produk digital dengan alur order yang rapi, jelas, dan mudah dipantau."}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3 text-sm font-semibold text-[color:var(--foreground)]">
                <span className={`rounded-full px-3 py-1.5 ${outOfStock ? "border border-rose-200 bg-rose-50 text-rose-700" : "border border-emerald-200 bg-emerald-50 text-emerald-700"}`}>
                  {outOfStock ? "Stok sedang habis" : `Stok tersedia ${stock}`}
                </span>
                <span className="rounded-full border border-[color:var(--border)] bg-[color:var(--card-subtle)] px-3 py-1.5">Terjual {soldCount}</span>
                {variants.length > 0 ? <span className="rounded-full border border-[color:var(--border)] bg-[color:var(--card-subtle)] px-3 py-1.5">{variants.length} pilihan varian</span> : null}
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div className="brand-card md:col-span-1">
                  <div className="brand-kicker">Harga dasar</div>
                  <div className="mt-2 text-3xl font-black">{formatRupiah(price)}</div>
                  {compareAtPrice > price ? <div className="mt-1 text-sm font-semibold text-[color:var(--foreground-muted)] line-through">{formatRupiah(compareAtPrice)}</div> : null}
                </div>
                <div className="brand-card">
                  <div className="flex items-center gap-2 text-sm font-black text-[color:var(--foreground)]"><Boxes className="h-4 w-4 text-[color:var(--accent-strong)]" /> Detail cepat</div>
                  <p className="mt-2 text-sm leading-7">Kartu info, pilihan varian, dan harga kini dibuat lebih mudah dipindai sebelum checkout.</p>
                </div>
                <div className="brand-card">
                  <div className="flex items-center gap-2 text-sm font-black text-[color:var(--foreground)]"><ShieldCheck className="h-4 w-4 text-[color:var(--accent-strong)]" /> Tampilan lebih yakin</div>
                  <p className="mt-2 text-sm leading-7">Struktur baru membantu user memahami apa yang dibeli tanpa tampilan berlebihan.</p>
                </div>
              </div>

              {(product as any).live_chat_enabled ? (
                <div className="rounded-[28px] border border-[#f4c73f] bg-[linear-gradient(135deg,rgba(255,240,178,0.85),rgba(255,255,255,0.95))] p-5">
                  <div className="text-sm leading-7 text-slate-800">
                    Perlu diskusi dulu sebelum checkout? Gunakan live chat agar briefing, revisi kebutuhan, atau detail pengerjaan bisa disampaikan lebih rapi.
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

            <section className="surface-card">
              <div className="brand-kicker">Yang Anda dapatkan</div>
              <div className="mt-4 grid gap-3 text-sm leading-7">
                <div className="brand-card flex items-start gap-3"><BadgeCheck className="mt-0.5 h-4 w-4 text-[color:var(--accent-strong)]" /> Alur pembayaran QRIS yang jelas dan mudah diikuti.</div>
                <div className="brand-card flex items-start gap-3"><PackageOpen className="mt-0.5 h-4 w-4 text-[color:var(--accent-strong)]" /> Status order dapat dicek kembali kapan pun melalui halaman pesanan.</div>
                <div className="brand-card flex items-start gap-3"><ShieldCheck className="mt-0.5 h-4 w-4 text-[color:var(--accent-strong)]" /> Invoice PDF dan data layanan tetap tersimpan rapi setelah pembayaran berhasil.</div>
              </div>
            </section>
          </aside>
        </div>
      </div>
    </div>
  );
}
