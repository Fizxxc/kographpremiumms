import Link from "next/link";
import { ArrowRight, CreditCard, ShieldCheck, Wallet } from "lucide-react";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { formatRupiah } from "@/lib/format";
import ProductCard from "@/components/product-card";
import HeroCarousel from "@/components/landing/hero-carousel";
import CategoryRow from "@/components/landing/category-row";

export default async function HomePage() {
  const supabase = createServerSupabaseClient();
  const [{ data: featuredProducts }, { count: activeProductCount }] = await Promise.all([
    supabase
      .from("products")
      .select("*")
      .eq("is_active", true)
      .order("featured", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(8),
    supabase.from("products").select("id", { count: "exact", head: true }).eq("is_active", true)
  ]);

  const prices = (featuredProducts || []).map((item: any) => Number(item.price || 0)).filter((value: number) => value > 0);
  const minPrice = prices.length ? Math.min(...prices) : 0;

  const valueProps = [
    {
      icon: ShieldCheck,
      title: "Store terasa lebih trusted",
      body: "Tampilan gelap, premium, dan spacing yang lega membuat first impression lebih meyakinkan sejak pengunjung pertama kali masuk."
    },
    {
      icon: CreditCard,
      title: "Produk lebih mudah dipilih",
      body: "Kartu produk kini lebih jelas dengan badge populer, hover glow, struktur harga yang tegas, dan CTA yang tidak membingungkan."
    },
    {
      icon: Wallet,
      title: "Alur checkout tetap rapi",
      body: "Frontend dibuat lebih matang tanpa mengubah backend production, sehingga Anda bisa fokus pada visual dan pengalaman belanja."
    }
  ];

  return (
    <div className="page-section pb-20 pt-6 sm:pt-8">
      <div className="site-container space-y-10 sm:space-y-12">
        <HeroCarousel />

        <div className="grid gap-4 md:grid-cols-3 xl:grid-cols-[1.15fr_0.85fr_0.85fr]">
          <div className="stat-card border-white/10 bg-white/5">
            <div className="brand-kicker text-slate-400">Produk aktif</div>
            <div className="mt-3 text-4xl font-black text-white">{activeProductCount || 0}+</div>
            <p className="mt-2 text-sm leading-7 text-slate-400">Etalase premium siap ditata dengan visual yang lebih profesional.</p>
          </div>
          <div className="stat-card border-white/10 bg-white/5">
            <div className="brand-kicker text-slate-400">Mulai dari</div>
            <div className="mt-3 text-3xl font-black text-white">{minPrice > 0 ? formatRupiah(minPrice) : "Harga fleksibel"}</div>
            <p className="mt-2 text-sm leading-7 text-slate-400">Tipografi harga dibuat lebih menonjol agar mudah terbaca.</p>
          </div>
          <div className="stat-card border-white/10 bg-[linear-gradient(135deg,rgba(250,204,21,0.16),rgba(34,211,238,0.08))]">
            <div className="brand-kicker text-slate-300">UI direction</div>
            <div className="mt-3 text-3xl font-black text-white">Takapedia feel</div>
            <p className="mt-2 text-sm leading-7 text-slate-300">Gelap, sleek, rounded, dan lebih matang secara visual.</p>
          </div>
        </div>

        <CategoryRow />

        <section className="space-y-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="brand-kicker text-slate-400">Produk unggulan</div>
              <h2 className="mt-2 section-heading text-white">Grid produk yang lebih profesional dan enak dilihat.</h2>
              <p className="mt-3 max-w-3xl section-subtitle text-slate-400">
                Kartu produk dibuat lebih bersih dengan efek glow saat hover, badge populer atau diskon, serta struktur informasi yang cepat dipindai pengunjung.
              </p>
            </div>
            <Link href="/products" className="brand-link text-slate-200 hover:text-white">
              Buka semua produk <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {(featuredProducts || []).map((product: any, index: number) => (
              <ProductCard key={product.id} product={product} forceBadge={index % 3 === 0 ? "Diskon" : undefined} />
            ))}
          </div>
        </section>

        <section className="grid gap-5 md:grid-cols-3">
          {valueProps.map((item) => (
            <div key={item.title} className="brand-panel border-white/10 bg-white/5 backdrop-blur-sm">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-yellow-400/20 to-cyan-400/10 text-yellow-300">
                <item.icon className="h-5 w-5" />
              </div>
              <h3 className="mt-5 text-2xl font-black text-white">{item.title}</h3>
              <p className="mt-3 text-sm leading-7 text-slate-400">{item.body}</p>
            </div>
          ))}
        </section>

        <section className="brand-shell overflow-hidden border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.03))]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(250,204,21,0.12),transparent_25%),radial-gradient(circle_at_bottom_left,rgba(34,211,238,0.10),transparent_22%)]" />
          <div className="relative grid gap-8 lg:grid-cols-[1fr_0.9fr] lg:items-center">
            <div>
              <div className="brand-kicker text-slate-400">Langkah belanja</div>
              <h2 className="mt-2 text-3xl font-black text-white sm:text-4xl">Tampilan yang rapi membuat user lebih cepat paham harus mulai dari mana.</h2>
              <p className="mt-4 max-w-2xl text-sm leading-8 text-slate-400 sm:text-base">
                Fokus landing page ini adalah memperkuat kesan premium dan meningkatkan kejelasan visual, tanpa mengubah backend production yang sudah berjalan.
              </p>
              <div className="mt-7 flex flex-wrap gap-3">
                <Link href="/products" className="primary-button">Mulai jelajahi</Link>
                <Link href="/cek-pesanan" className="secondary-button border-white/10 bg-white/5 text-white hover:bg-white/10">Lacak transaksi</Link>
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {[
                "Header sticky dengan search bar yang lebih sleek.",
                "Hero promo rounded dengan carousel modern.",
                "Kategori lebih minimalis dan tidak ramai.",
                "Footer lebih informatif dan terasa matang."
              ].map((step, index) => (
                <div key={step} className="rounded-[24px] border border-white/10 bg-white/5 p-5">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-yellow-400/15 text-sm font-black text-yellow-300">
                    0{index + 1}
                  </div>
                  <p className="mt-4 text-sm leading-7 text-slate-300">{step}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
