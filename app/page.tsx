import Link from "next/link";
import { ArrowRight, BadgeCheck, Layers3, ShieldCheck, Sparkles } from "lucide-react";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { formatRupiah } from "@/lib/format";
import { SITE } from "@/lib/constants";
import ProductCard from "@/components/product-card";

const highlights = [
  {
    title: "Checkout lebih jelas",
    body: "Nominal, metode bayar, QRIS, dan status pesanan ditata lebih rapi supaya pelanggan merasa yakin saat bertransaksi.",
    icon: ShieldCheck
  },
  {
    title: "Layanan terasa premium",
    body: "Dari tampilan katalog sampai invoice, semuanya dibuat lebih bersih agar pengalaman belanja terasa profesional.",
    icon: Sparkles
  },
  {
    title: "Order mudah dipantau",
    body: "Resi pesanan, invoice PDF, dan progres transaksi bisa dicek ulang kapan saja tanpa alur yang membingungkan.",
    icon: Layers3
  }
];

const serviceSteps = [
  "Pilih produk atau paket yang paling sesuai dengan kebutuhan Anda.",
  "Selesaikan pembayaran melalui halaman checkout yang lebih ringkas dan mudah dipahami.",
  "Status order akan diperbarui otomatis setelah pembayaran diverifikasi.",
  "Cek pesanan kembali lewat web atau bot ketika Anda membutuhkannya."
];

export default async function HomePage() {
  const supabase = createServerSupabaseClient();
  const [{ data: featuredProducts }, { data: categories }, { count: activeProductCount }] = await Promise.all([
    supabase
      .from("products")
      .select("*")
      .eq("is_active", true)
      .order("featured", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(6),
    supabase.from("products").select("category").eq("is_active", true).limit(100),
    supabase.from("products").select("id", { count: "exact", head: true }).eq("is_active", true)
  ]);

  const categoryCount = new Set((categories || []).map((item: any) => item.category).filter(Boolean)).size;
  const prices = (featuredProducts || []).map((item: any) => Number(item.price || 0)).filter((value: number) => value > 0);
  const minPrice = prices.length ? Math.min(...prices) : 0;

  return (
    <div className="mx-auto max-w-7xl space-y-16 px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
      <section className="relative overflow-hidden rounded-[36px] border border-white/10 bg-[linear-gradient(135deg,#07111f_0%,#0d1a2d_42%,#101a29_100%)] px-6 py-8 shadow-[0_32px_120px_rgba(2,6,23,0.45)] sm:px-8 lg:px-10 lg:py-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(250,204,21,0.22),transparent_28%),radial-gradient(circle_at_85%_15%,rgba(59,130,246,0.18),transparent_24%),radial-gradient(circle_at_bottom_right,rgba(255,255,255,0.08),transparent_20%)]" />
        <div className="relative grid gap-8 lg:grid-cols-[minmax(0,1.15fr)_430px] lg:items-stretch">
          <div className="space-y-8">
            <div className="flex flex-wrap items-center gap-3 text-white/90">
              <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-2 text-[11px] font-extrabold uppercase tracking-[0.34em] text-primary">
                <BadgeCheck className="h-4 w-4" />
                Digital storefront
              </span>
              <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold text-slate-200">
                Professional look · Mobile ready
              </span>
            </div>

            <div className="max-w-4xl space-y-5">
              <h1 className="text-4xl font-black leading-[0.95] tracking-[-0.04em] text-white sm:text-6xl lg:text-7xl">
                Belanja layanan digital dengan tampilan yang lebih <span className="text-primary">elegan</span>, proses yang lebih <span className="text-primary">jelas</span>, dan pengalaman yang lebih <span className="text-primary">meyakinkan</span>.
              </h1>
              <p className="max-w-3xl text-base leading-8 text-slate-300 sm:text-lg">
                {SITE.name} menghadirkan alur order yang terasa rapi sejak awal: katalog nyaman dilihat, checkout tidak membingungkan,
                status pesanan mudah dipantau, dan setiap transaksi terlihat lebih profesional di desktop maupun mobile.
              </p>
            </div>

            <div className="flex flex-wrap gap-4">
              <Link
                href="/products"
                className="inline-flex h-14 items-center justify-center gap-2 rounded-full bg-primary px-7 text-base font-black text-slate-950 shadow-[0_18px_50px_rgba(250,204,21,0.28)] transition hover:-translate-y-0.5 hover:shadow-[0_22px_60px_rgba(250,204,21,0.34)]"
              >
                Mulai belanja
                <ArrowRight className="h-5 w-5" />
              </Link>
              <Link
                href="/cek-pesanan"
                className="inline-flex h-14 items-center justify-center rounded-full border border-white/15 bg-white/5 px-7 text-base font-semibold text-white transition hover:border-primary/40 hover:bg-white/10"
              >
                Cek pesanan tanpa login
              </Link>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              {highlights.map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.title} className="rounded-[28px] border border-white/10 bg-white/5 p-5 backdrop-blur-sm">
                    <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/10 text-primary shadow-[0_12px_30px_rgba(250,204,21,0.12)]">
                      <Icon className="h-5 w-5" />
                    </div>
                    <h3 className="mt-4 text-xl font-black tracking-tight text-white">{item.title}</h3>
                    <p className="mt-3 text-sm leading-7 text-slate-300">{item.body}</p>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="grid gap-5 lg:grid-rows-[auto_1fr]">
            <div className="rounded-[30px] border border-white/10 bg-white/95 p-6 text-slate-950 shadow-[0_24px_80px_rgba(15,23,42,0.22)]">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-xs font-black uppercase tracking-[0.34em] text-slate-400">Checkout preview</div>
                  <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-950">Tampilan order yang terlihat lebih premium</h2>
                </div>
                <div className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-600">Online</div>
              </div>

              <div className="mt-6 space-y-4">
                <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-4">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <div className="text-sm font-semibold text-slate-500">Produk pilihan</div>
                      <div className="mt-1 text-lg font-black text-slate-950">Layanan digital premium</div>
                    </div>
                    <div className="rounded-full bg-slate-950 px-3 py-1 text-xs font-bold uppercase tracking-[0.25em] text-white">QRIS</div>
                  </div>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-[22px] border border-slate-200 p-4">
                    <div className="text-xs font-bold uppercase tracking-[0.3em] text-slate-400">Harga mulai</div>
                    <div className="mt-2 text-2xl font-black text-slate-950">{formatRupiah(minPrice)}</div>
                  </div>
                  <div className="rounded-[22px] border border-slate-200 p-4">
                    <div className="text-xs font-bold uppercase tracking-[0.3em] text-slate-400">Katalog aktif</div>
                    <div className="mt-2 text-2xl font-black text-slate-950">{activeProductCount || featuredProducts?.length || 0}+</div>
                  </div>
                </div>
                <div className="rounded-[24px] border border-slate-200 p-4">
                  <div className="text-xs font-black uppercase tracking-[0.32em] text-slate-400">Keunggulan pengalaman</div>
                  <div className="mt-4 space-y-3">
                    {[
                      "QR pembayaran tampil langsung tanpa layar yang membingungkan.",
                      "Invoice PDF dan status order dapat diakses kembali kapan saja.",
                      `Pemantauan order juga bisa dibantu lewat ${SITE.botUsername}.`
                    ].map((item) => (
                      <div key={item} className="flex items-start gap-3 rounded-2xl bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700">
                        <span className="mt-1 h-2.5 w-2.5 rounded-full bg-primary" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-[30px] border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
              <div className="text-xs font-black uppercase tracking-[0.34em] text-slate-400">Alur belanja</div>
              <div className="mt-5 space-y-4">
                {serviceSteps.map((step, index) => (
                  <div key={step} className="flex gap-4 rounded-[24px] border border-white/10 bg-white/5 p-4">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary font-black text-slate-950 shadow-[0_12px_30px_rgba(250,204,21,0.18)]">
                      0{index + 1}
                    </div>
                    <p className="pt-1 text-sm leading-7 text-slate-200">{step}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-5 rounded-[32px] border border-slate-200/70 bg-white/80 p-6 shadow-[0_24px_70px_rgba(15,23,42,0.08)] backdrop-blur md:grid-cols-3 dark:border-white/10 dark:bg-white/5 dark:shadow-[0_28px_90px_rgba(0,0,0,0.28)]">
        {[
          {
            label: "Katalog aktif",
            value: `${activeProductCount || featuredProducts?.length || 0}+`,
            body: "Pilihan produk aktif dengan tampilan yang sudah dirapikan agar lebih enak dijelajahi."
          },
          {
            label: "Kategori tersedia",
            value: String(categoryCount || 1),
            body: "Setiap kategori disusun lebih ringkas supaya pencarian produk terasa lebih cepat."
          },
          {
            label: "Mulai dari",
            value: formatRupiah(minPrice),
            body: "Harga dasar dapat terlihat sejak awal agar pelanggan lebih mudah membandingkan dan memutuskan."
          }
        ].map((item) => (
          <div key={item.label} className="rounded-[28px] border border-slate-200/80 bg-white p-5 dark:border-white/10 dark:bg-slate-950/40">
            <div className="text-xs font-black uppercase tracking-[0.3em] text-slate-400">{item.label}</div>
            <div className="mt-3 text-3xl font-black tracking-tight text-slate-950 dark:text-white">{item.value}</div>
            <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">{item.body}</p>
          </div>
        ))}
      </section>

      <section className="space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="text-xs font-black uppercase tracking-[0.35em] text-primary">Pilihan unggulan</div>
            <h2 className="mt-2 text-3xl font-black tracking-tight text-slate-950 dark:text-white sm:text-5xl">
              Produk populer yang tampil lebih rapi dan lebih menarik dilihat
            </h2>
            <p className="mt-3 max-w-3xl text-base leading-8 text-slate-600 dark:text-slate-300">
              Katalog dibuat lebih bersih agar pelanggan lebih mudah memahami produk, membandingkan pilihan, dan langsung melanjutkan ke checkout.
            </p>
          </div>
          <Link href="/products" className="inline-flex items-center gap-2 text-sm font-bold text-primary transition hover:gap-3">
            Buka katalog lengkap
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {(featuredProducts || []).map((product: any) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      <section className="grid gap-6 rounded-[34px] border border-white/10 bg-[linear-gradient(135deg,#081321_0%,#0f1f34_100%)] p-6 text-white shadow-[0_28px_100px_rgba(2,6,23,0.42)] lg:grid-cols-[minmax(0,1fr)_360px] lg:p-8">
        <div>
          <div className="text-xs font-black uppercase tracking-[0.34em] text-primary">Siap dipakai pelanggan</div>
          <h2 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">
            Tampilan storefront yang lebih meyakinkan untuk meningkatkan rasa percaya saat order.
          </h2>
          <p className="mt-4 max-w-3xl text-base leading-8 text-slate-300">
            Fokus utamanya bukan sekadar menampilkan fitur, tetapi membuat pelanggan merasa nyaman saat melihat katalog, memahami checkout,
            dan mengikuti status transaksi tanpa kesan berantakan.
          </p>
        </div>
        <div className="rounded-[28px] border border-white/10 bg-white/5 p-5 backdrop-blur-sm">
          <div className="text-xs font-black uppercase tracking-[0.3em] text-slate-400">Bantuan cepat</div>
          <div className="mt-4 space-y-3 text-sm leading-7 text-slate-200">
            <p>Bot cek pesanan: <span className="font-bold text-white">{SITE.botUsername}</span></p>
            <p>Bot auto order: <span className="font-bold text-white">{SITE.autoOrderBotUsername}</span></p>
            <p>Invoice PDF, status order, dan detail transaksi bisa diakses kembali saat dibutuhkan.</p>
          </div>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link href="/cek-pesanan" className="inline-flex h-11 items-center justify-center rounded-full bg-primary px-5 text-sm font-black text-slate-950 transition hover:opacity-90">
              Cek pesanan
            </Link>
            <Link href="/faq" className="inline-flex h-11 items-center justify-center rounded-full border border-white/15 px-5 text-sm font-semibold text-white transition hover:bg-white/10">
              Lihat panduan
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
