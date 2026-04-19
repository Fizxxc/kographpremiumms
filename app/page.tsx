import Link from "next/link";
import { ArrowRight, BadgeCheck, Boxes, Clock3, CreditCard, ShieldCheck, Sparkles } from "lucide-react";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { formatRupiah } from "@/lib/format";
import { NAV_CATEGORIES, SITE } from "@/lib/constants";
import ProductCard from "@/components/product-card";

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

  const highlights = [
    {
      icon: ShieldCheck,
      title: "Transaksi lebih meyakinkan",
      body: "Informasi harga, status, dan langkah pembayaran sekarang lebih jelas seperti marketplace top up modern."
    },
    {
      icon: CreditCard,
      title: "Checkout lebih rapi",
      body: "QRIS, nominal, dan detail order dipisah dengan layout yang lebih enak dibaca di desktop maupun mobile."
    },
    {
      icon: Clock3,
      title: "Tracking lebih cepat",
      body: "Resi, order ID, status pembayaran, dan invoice lebih gampang ditemukan saat pelanggan butuh cek ulang."
    }
  ];

  const trustPoints = [
    "Tampilan kategori dan kartu produk lebih ringkas",
    "CTA utama lebih jelas agar user langsung tahu langkah berikutnya",
    `Support order tetap dekat lewat ${SITE.botUsername} dan ${SITE.autoOrderBotUsername}`
  ];

  return (
    <div className="page-section">
      <div className="site-container space-y-14">
        <section className="brand-shell mesh-backdrop grid gap-8 lg:grid-cols-[minmax(0,1.08fr)_380px]">
          <div className="space-y-8">
            <span className="brand-pill">UI baru ala marketplace digital modern</span>

            <div className="space-y-5">
              <h1 className="brand-title text-balance">
                Belanja layanan digital yang <span className="text-gradient">lebih rapih, lebih jelas, dan lebih enak dipakai</span> dari awal sampai selesai.
              </h1>
              <p className="brand-subtitle">
                {SITE.name} kini tampil dengan gaya yang lebih clean seperti platform top up modern: navigasi ringan, kartu
                produk lebih rapi, detail checkout lebih terstruktur, dan halaman tracking pesanan lebih mudah dipahami.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link href="/products" className="primary-button">
                Lihat semua produk
              </Link>
              <Link href="/cek-pesanan" className="secondary-button">
                Cek transaksi
              </Link>
            </div>

            <div className="flex flex-wrap gap-2">
              {NAV_CATEGORIES.slice(0, 8).map((item) => (
                <span key={item} className="inline-flex rounded-full border border-[color:var(--border)] bg-white px-4 py-2 text-sm font-semibold text-[color:var(--foreground)]">
                  {item}
                </span>
              ))}
            </div>
          </div>

          <div className="space-y-5">
            <div className="rounded-[28px] border border-[#f4c73f] bg-[linear-gradient(135deg,#fff4bf_0%,#ffd54f_100%)] p-6 text-slate-950 shadow-[0_26px_60px_-34px_rgba(243,178,3,0.55)]">
              <div className="text-xs font-black uppercase tracking-[0.34em] text-slate-700/75">Ringkasan cepat</div>
              <div className="mt-5 space-y-4">
                <div>
                  <div className="text-4xl font-black">{activeProductCount || 0}+</div>
                  <p className="mt-1 text-sm font-semibold text-slate-700">produk aktif di katalog</p>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-[22px] bg-white/70 p-4">
                    <div className="text-xs font-bold uppercase tracking-[0.24em] text-slate-500">Kategori</div>
                    <div className="mt-2 text-2xl font-black">{categoryCount}</div>
                  </div>
                  <div className="rounded-[22px] bg-white/70 p-4">
                    <div className="text-xs font-bold uppercase tracking-[0.24em] text-slate-500">Mulai dari</div>
                    <div className="mt-2 text-xl font-black">{minPrice > 0 ? formatRupiah(minPrice) : "Harga fleksibel"}</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="brand-panel">
              <div className="brand-kicker">Kenapa UI baru ini lebih enak</div>
              <div className="mt-4 space-y-3">
                {trustPoints.map((item) => (
                  <div key={item} className="flex items-start gap-3 rounded-[20px] border border-[color:var(--border)] bg-[color:var(--card-subtle)] p-4">
                    <BadgeCheck className="mt-0.5 h-5 w-5 text-[color:var(--accent-strong)]" />
                    <p className="text-sm leading-7 text-[color:var(--foreground)]">{item}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-5 md:grid-cols-3">
          {highlights.map((item) => (
            <div key={item.title} className="brand-panel">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[color:var(--accent-soft)] text-[color:var(--accent-strong)]">
                <item.icon className="h-5 w-5" />
              </div>
              <h2 className="mt-5 text-2xl font-black">{item.title}</h2>
              <p className="mt-3 text-sm leading-7">{item.body}</p>
            </div>
          ))}
        </section>

        <section className="space-y-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="brand-kicker">Populer sekarang</div>
              <h2 className="mt-2 section-heading">Produk yang paling sering dicari</h2>
              <p className="mt-3 max-w-3xl section-subtitle">
                Gaya kartu produk baru dibuat lebih clean dan mirip pola marketplace top up: cepat dipindai, gampang
                dibandingkan, dan langsung ada tombol aksi yang jelas.
              </p>
            </div>
            <Link href="/products" className="brand-link">
              Lihat katalog lengkap <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {(featuredProducts || []).map((product: any) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>

        <section className="brand-shell grid gap-5 lg:grid-cols-[1fr_0.9fr]">
          <div>
            <div className="brand-kicker">Alur belanja</div>
            <h2 className="mt-2 section-heading">Pilih produk, checkout QRIS, lalu pantau statusnya tanpa bingung.</h2>
            <p className="mt-3 section-subtitle max-w-2xl">
              Fokus utama redesign ini adalah membuat setiap langkah terasa familiar seperti situs top up yang sudah matang:
              pilih layanan, lihat harga, bayar, lalu cek status dalam tampilan yang konsisten.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              "Pilih produk atau varian yang sesuai kebutuhan.",
              "Isi data pembeli dengan form yang lebih bersih.",
              "Bayar menggunakan QRIS dinamis yang tampil jelas.",
              "Cek status, invoice, dan detail order kapan saja."
            ].map((step, index) => (
              <div key={step} className="brand-card">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[color:var(--accent-soft)] text-sm font-black text-[color:var(--accent-strong)]">
                  0{index + 1}
                </div>
                <p className="mt-4 text-sm leading-7 text-[color:var(--foreground)]">{step}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
