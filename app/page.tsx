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

  return (
    <div className="mx-auto max-w-7xl space-y-14 px-4 py-10 sm:px-6 lg:px-8">
      <section className="grid gap-8 rounded-[32px] border border-primary/10 bg-[#031227] p-6 shadow-[0_0_0_1px_rgba(250,204,21,0.04),0_30px_120px_rgba(2,6,23,0.55)] lg:grid-cols-[minmax(0,1.2fr)_420px] lg:p-10">
        <div className="space-y-8">
          <span className="inline-flex rounded-full border border-primary/30 bg-primary/10 px-5 py-2 text-xs font-bold uppercase tracking-[0.35em] text-primary">
            Layanan digital terpercaya
          </span>

          <div className="space-y-5">
            <h1 className="max-w-4xl text-4xl font-black leading-[0.95] tracking-tight text-white sm:text-6xl lg:text-7xl">
              Belanja layanan digital yang terasa lebih <span className="text-primary">tenang</span>, lebih <span className="text-primary">jelas</span>, dan lebih <span className="text-primary">nyaman</span> dari awal sampai selesai.
            </h1>
            <p className="max-w-3xl text-lg leading-9 text-slate-300 sm:text-[1.2rem]">
              {SITE.name} hadir untuk memudahkan Anda memilih layanan digital, menyelesaikan pembayaran dengan nyaman, lalu memantau pesanan tanpa perlu repot mencari informasi penting di banyak tempat.
            </p>
          </div>

          <div className="flex flex-wrap gap-4">
            <Link href="/products" className="inline-flex h-14 items-center justify-center rounded-full bg-primary px-7 text-base font-bold text-slate-950 transition hover:opacity-90">
              Lihat semua produk
            </Link>
            <Link href="/cek-pesanan" className="inline-flex h-14 items-center justify-center rounded-full border border-white/15 bg-white/5 px-7 text-base font-semibold text-white transition hover:border-primary/40 hover:bg-primary/10">
              Cek pesanan tanpa login
            </Link>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {[
              {
                title: "Pilihan yang tertata",
                body: "Setiap produk disusun lebih ringkas agar Anda lebih mudah membandingkan pilihan dan menemukan yang paling cocok."
              },
              {
                title: "Pembayaran lebih jelas",
                body: "Nominal, QRIS, dan status pembayaran ditampilkan jelas agar proses transaksi terasa aman dan tidak membingungkan."
              },
              {
                title: "Pesanan mudah dipantau",
                body: "Resi, invoice, dan status transaksi dapat diakses kembali kapan saja saat Anda membutuhkannya."
              }
            ].map((item) => (
              <div key={item.title} className="rounded-[28px] border border-white/10 bg-white/5 p-5 text-slate-300">
                <h3 className="text-xl font-extrabold text-white">{item.title}</h3>
                <p className="mt-3 text-sm leading-7">{item.body}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-5">
          <div className="rounded-[30px] bg-primary p-7 text-slate-950 shadow-[0_25px_80px_rgba(250,204,21,0.25)]">
            <div className="text-xs font-bold uppercase tracking-[0.35em] text-slate-800">Cara belanja</div>
            <ol className="mt-5 space-y-5 text-lg font-medium leading-8">
              <li>1. Temukan produk atau paket yang paling sesuai dengan kebutuhan Anda.</li>
              <li>2. Lanjutkan pembayaran melalui QRIS dinamis yang langsung tampil di halaman pembayaran.</li>
              <li>3. Setelah pembayaran berhasil, status transaksi diperbarui otomatis oleh sistem.</li>
              <li>4. Simpan resi pesanan untuk memantau progres layanan kapan saja Anda perlukan.</li>
            </ol>
          </div>

          <div className="rounded-[30px] border border-white/10 bg-white/5 p-6">
            <div className="text-xs font-bold uppercase tracking-[0.35em] text-slate-500">Kenapa pelanggan merasa lebih nyaman</div>
            <div className="mt-5 space-y-4">
              {[
                {
                  title: "Tampilan yang nyaman dibaca",
                  body: "Setiap halaman dirancang agar informasi penting mudah ditemukan tanpa membuat Anda perlu menebak-nebak langkah berikutnya."
                },
                {
                  title: "Checkout yang lebih meyakinkan",
                  body: "Pembayaran dibuat lebih rapi dan transparan agar Anda bisa bertransaksi dengan rasa aman dan lebih yakin."
                },
                {
                  title: "Bantuan tetap dekat",
                  body: `Butuh cek pesanan atau order lewat Telegram? Kami juga menyiapkan akses cepat lewat ${SITE.botUsername} dan ${SITE.autoOrderBotUsername}.`
                }
              ].map((item) => (
                <div key={item.title} className="rounded-[24px] border border-white/10 bg-white/5 p-5">
                  <h3 className="text-xl font-extrabold text-white">{item.title}</h3>
                  <p className="mt-2 text-sm leading-7 text-slate-300">{item.body}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="text-xs font-bold uppercase tracking-[0.35em] text-primary">Pilihan populer</div>
            <h2 className="mt-2 text-3xl font-black text-white sm:text-5xl">Produk yang paling sering dicari</h2>
            <p className="mt-3 max-w-3xl text-base leading-8 text-slate-300">
              Temukan layanan digital yang tersusun lebih rapi, mudah dibandingkan, dan nyaman dibeli dari desktop maupun mobile.
            </p>
          </div>
          <Link href="/products" className="text-sm font-semibold text-primary underline-offset-4 hover:underline">
            Lihat katalog lengkap
          </Link>
        </div>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {(featuredProducts || []).map((product: any) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      <section className="grid gap-6 rounded-[30px] border border-white/10 bg-white/5 p-6 md:grid-cols-3">
        <div>
          <div className="text-xs font-bold uppercase tracking-[0.35em] text-slate-400">Katalog aktif</div>
          <div className="mt-3 text-4xl font-black text-white">{activeProductCount || featuredProducts?.length || 0}+</div>
          <p className="mt-3 text-sm leading-7 text-slate-300">Pilihan produk yang ditampilkan rapi dan siap dibeli langsung.</p>
        </div>
        <div>
          <div className="text-xs font-bold uppercase tracking-[0.35em] text-slate-400">Kategori pilihan</div>
          <div className="mt-3 text-4xl font-black text-white">{categoryCount || 1}</div>
          <p className="mt-3 text-sm leading-7 text-slate-300">Beragam kebutuhan digital yang dikelompokkan agar lebih mudah ditelusuri.</p>
        </div>
        <div>
          <div className="text-xs font-bold uppercase tracking-[0.35em] text-slate-400">Mulai belanja</div>
          <div className="mt-3 text-2xl font-black text-white">Dari {formatRupiah(minPrice)}</div>
          <p className="mt-3 text-sm leading-7 text-slate-300">Nominal tampil terbuka sejak awal supaya Anda bisa memilih layanan yang paling pas.</p>
        </div>
      </section>
    </div>
  );
}
