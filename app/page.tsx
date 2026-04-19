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
      title: "Alur lebih mudah diikuti",
      body: "Pengunjung langsung diarahkan dari melihat produk, memilih paket, menyelesaikan pembayaran, sampai mengecek status pesanan tanpa perlu menebak-nebak langkah berikutnya."
    },
    {
      icon: CreditCard,
      title: "Informasi dibuat lebih jelas",
      body: "Harga, badge promo, keterangan stok, dan tombol aksi sekarang tampil lebih tegas agar keputusan belanja terasa lebih cepat dan lebih nyaman."
    },
    {
      icon: Wallet,
      title: "Tetap aman untuk production",
      body: "Yang dibenahi hanya sisi tampilan dan penyampaian informasi. Alur backend yang sudah berjalan tetap dibiarkan seperti sebelumnya agar lebih tenang digunakan."
    }
  ];

  return (
    <div className="page-section pb-20 pt-6 sm:pt-8">
      <div className="site-container space-y-10 sm:space-y-12">
        <HeroCarousel />

        <div className="grid gap-4 md:grid-cols-3 xl:grid-cols-[1.15fr_0.85fr_0.85fr]">
          <div className="stat-card">
            <div className="brand-kicker">Produk aktif</div>
            <div className="mt-3 text-4xl font-black" style={{ color: "var(--foreground)" }}>{activeProductCount || 0}+</div>
            <p className="mt-2 text-sm leading-7 section-subtitle">Katalog bisa langsung dipilih sesuai kebutuhan tanpa tampilan yang terasa padat.</p>
          </div>
          <div className="stat-card">
            <div className="brand-kicker">Mulai dari</div>
            <div className="mt-3 text-3xl font-black" style={{ color: "var(--foreground)" }}>{minPrice > 0 ? formatRupiah(minPrice) : "Harga fleksibel"}</div>
            <p className="mt-2 text-sm leading-7 section-subtitle">Susunan harga diperjelas supaya pengguna cepat menangkap nominalnya.</p>
          </div>
          <div className="stat-card" style={{ background: "linear-gradient(135deg, var(--accent-soft), var(--mesh-b))" }}>
            <div className="brand-kicker">Catatan utama</div>
            <div className="mt-3 text-3xl font-black" style={{ color: "var(--foreground)" }}>Tampilan lebih matang</div>
            <p className="mt-2 text-sm leading-7" style={{ color: "var(--foreground-soft)" }}>Visual diperhalus supaya toko terasa lebih rapi, lebih serius, dan lebih enak dipakai berulang kali.</p>
          </div>
        </div>

        <CategoryRow />

        <section className="space-y-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="brand-kicker">Pilihan unggulan</div>
              <h2 className="mt-2 section-heading">Produk ditata supaya user cepat paham apa yang sedang dibeli.</h2>
              <p className="mt-3 max-w-3xl section-subtitle">
                Setiap kartu produk sekarang menampilkan informasi inti yang benar-benar dibutuhkan pengguna: nama layanan, harga, badge promo, stok, dan tombol menuju detail.
              </p>
            </div>
            <Link href="/products" className="brand-link">
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
            <div key={item.title} className="brand-panel">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl" style={{ background: "var(--accent-soft)", color: "color-mix(in srgb, var(--foreground) 76%, var(--accent-strong))" }}>
                <item.icon className="h-5 w-5" />
              </div>
              <h3 className="mt-5 text-2xl font-black" style={{ color: "var(--foreground)" }}>{item.title}</h3>
              <p className="mt-3 text-sm leading-7" style={{ color: "var(--foreground-soft)" }}>{item.body}</p>
            </div>
          ))}
        </section>

        <section className="brand-shell">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,var(--mesh-a),transparent_25%),radial-gradient(circle_at_bottom_left,var(--mesh-b),transparent_22%)]" />
          <div className="relative grid gap-8 lg:grid-cols-[1fr_0.9fr] lg:items-center">
            <div>
              <div className="brand-kicker">Cara kerja</div>
              <h2 className="mt-2 text-3xl font-black sm:text-4xl" style={{ color: "var(--foreground)" }}>Pengguna cukup mengikuti langkah yang sudah dijelaskan tanpa perlu takut tersesat di tengah proses.</h2>
              <p className="mt-4 max-w-2xl text-sm leading-8 sm:text-base" style={{ color: "var(--foreground-soft)" }}>
                Mulai dari memilih layanan, melanjutkan ke pembayaran, lalu mengecek status transaksi, semuanya disusun supaya terasa runtut. Untuk bantuan, user juga bisa langsung diarahkan ke email atau bot Telegram support.
              </p>
              <div className="mt-7 flex flex-wrap gap-3">
                <Link href="/products" className="primary-button">Mulai lihat produk</Link>
                <Link href="/cek-pesanan" className="secondary-button">Lacak transaksi</Link>
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {[
                "Pilih layanan yang dibutuhkan dari katalog.",
                "Isi data seperlunya sesuai produk yang dipilih.",
                "Selesaikan pembayaran lalu simpan nomor transaksi.",
                "Pantau status order dan hubungi support bila diperlukan."
              ].map((step, index) => (
                <div key={step} className="rounded-[24px] border p-5" style={{ borderColor: "var(--border)", background: "var(--card)" }}>
                  <div className="flex h-10 w-10 items-center justify-center rounded-full text-sm font-black" style={{ background: "var(--accent-soft)", color: "color-mix(in srgb, var(--foreground) 76%, var(--accent-strong))" }}>
                    0{index + 1}
                  </div>
                  <p className="mt-4 text-sm leading-7" style={{ color: "var(--foreground-soft)" }}>{step}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
