import Link from "next/link";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { formatRupiah } from "@/lib/format";
import { SITE } from "@/lib/constants";
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
      title: "Pilihan lebih tertata",
      body: "Produk ditampilkan lebih rapi agar proses memilih terasa cepat, jelas, dan tetap nyaman dilihat dari awal."
    },
    {
      title: "Pembayaran lebih meyakinkan",
      body: "Nominal, QRIS, dan status transaksi ditampilkan dengan alur yang lebih jelas supaya checkout terasa lebih tenang."
    },
    {
      title: "Riwayat lebih mudah dicari",
      body: "Resi, invoice, dan credential dapat dilihat kembali kapan saja saat Anda perlu mengecek pesanan."
    }
  ];

  const serviceFlow = [
    "Pilih produk atau paket yang paling sesuai dengan kebutuhan Anda.",
    "Lanjutkan pembayaran melalui QRIS dinamis yang langsung tampil di halaman pembayaran.",
    "Setelah pembayaran terverifikasi, sistem akan memperbarui status transaksi secara otomatis.",
    "Simpan resi pesanan untuk memantau progres layanan kapan pun dibutuhkan."
  ];

  const trustPoints = [
    {
      title: "Informasi enak dibaca",
      body: "Halaman dibuat lebih ringan dilihat, sehingga detail penting mudah ditemukan tanpa perlu menebak langkah berikutnya."
    },
    {
      title: "Checkout yang terasa rapi",
      body: "Detail pembayaran disusun lebih bersih agar proses transaksi terasa aman, profesional, dan tidak membingungkan."
    },
    {
      title: "Bantuan tetap dekat",
      body: `Cek status atau order lewat Telegram juga tersedia melalui ${SITE.botUsername} dan ${SITE.autoOrderBotUsername}.`
    }
  ];

  return (
    <div className="page-section">
      <div className="site-container space-y-14">
        <section className="brand-shell mesh-backdrop grid gap-8 lg:grid-cols-[minmax(0,1.15fr)_430px]">
          <div className="space-y-8">
            <span className="brand-pill">Layanan digital terpercaya</span>

            <div className="space-y-5">
              <h1 className="brand-title text-balance">
                Belanja layanan digital yang terasa lebih tenang, lebih jelas, dan lebih nyaman dari awal sampai selesai.
              </h1>
              <p className="brand-subtitle">
                {SITE.name} hadir untuk membantu Anda memilih layanan digital dengan lebih yakin, menyelesaikan pembayaran
                dengan alur yang rapi, lalu memantau pesanan tanpa perlu repot mencari informasi penting di banyak tempat.
              </p>
            </div>

            <div className="flex flex-wrap gap-4">
              <Link
                href="/products"
                className="inline-flex h-14 items-center justify-center rounded-full bg-[color:var(--accent)] px-7 text-base font-bold text-slate-950 transition hover:-translate-y-0.5"
              >
                Lihat semua produk
              </Link>
              <Link
                href="/orders"
                className="inline-flex h-14 items-center justify-center rounded-full border border-[color:var(--border)] bg-[color:var(--card)] px-7 text-base font-semibold text-[color:var(--foreground)] transition hover:-translate-y-0.5"
              >
                Cek pesanan tanpa login
              </Link>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              {highlights.map((item) => (
                <div key={item.title} className="brand-card">
                  <h3 className="text-xl font-black text-[color:var(--foreground)]">{item.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-[color:var(--foreground-soft)]">{item.body}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-5">
            <div className="rounded-[30px] border border-[rgba(245,207,83,0.24)] bg-[color:var(--accent)] p-7 text-slate-950 shadow-[0_30px_80px_rgba(245,207,83,0.24)]">
              <div className="text-xs font-black uppercase tracking-[0.34em] text-slate-800/80">Alur layanan</div>
              <ol className="mt-5 space-y-5 text-lg font-semibold leading-8">
                {serviceFlow.map((item, index) => (
                  <li key={item}>{index + 1}. {item}</li>
                ))}
              </ol>
            </div>

            <div className="brand-panel">
              <div className="brand-kicker">Kenapa pelanggan merasa lebih nyaman</div>
              <div className="mt-5 space-y-4">
                {trustPoints.map((item) => (
                  <div key={item.title} className="brand-card">
                    <h3 className="text-xl font-black text-[color:var(--foreground)]">{item.title}</h3>
                    <p className="mt-2 text-sm leading-7 text-[color:var(--foreground-soft)]">{item.body}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="space-y-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="brand-kicker">Pilihan populer</div>
              <h2 className="mt-2 text-3xl font-black text-[color:var(--foreground)] sm:text-5xl">Produk yang paling sering dicari</h2>
              <p className="mt-3 max-w-3xl text-base leading-8 text-[color:var(--foreground-soft)]">
                Temukan layanan digital yang ditampilkan lebih ringkas, mudah dibandingkan, dan tetap nyaman dibeli dari
                desktop maupun mobile.
              </p>
            </div>
            <Link href="/products" className="brand-link text-sm">
              Lihat katalog lengkap
            </Link>
          </div>

          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {(featuredProducts || []).map((product: any) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>

        <section className="grid gap-5 lg:grid-cols-3">
          <div className="brand-panel">
            <div className="brand-kicker">Katalog aktif</div>
            <div className="mt-4 text-4xl font-black text-[color:var(--foreground)]">{activeProductCount || 0}+</div>
            <p className="mt-3 text-sm leading-7 text-[color:var(--foreground-soft)]">
              Pilihan produk yang ditampilkan siap dipilih langsung.
            </p>
          </div>
          <div className="brand-panel">
            <div className="brand-kicker">Kategori pilihan</div>
            <div className="mt-4 text-4xl font-black text-[color:var(--foreground)]">{categoryCount}</div>
            <p className="mt-3 text-sm leading-7 text-[color:var(--foreground-soft)]">
              Kategori disusun agar proses memilih tetap terasa cepat dan fokus.
            </p>
          </div>
          <div className="brand-panel">
            <div className="brand-kicker">Mulai belanja</div>
            <div className="mt-4 text-4xl font-black text-[color:var(--foreground)]">
              {minPrice > 0 ? `Dari ${formatRupiah(minPrice)}` : "Harga fleksibel"}
            </div>
            <p className="mt-3 text-sm leading-7 text-[color:var(--foreground-soft)]">
              Mulai dari pilihan yang ringan, lalu lanjut ke paket terbaik sesuai kebutuhan Anda.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
