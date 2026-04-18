import Link from "next/link";

export function HeroBanner() {
  return (
    <section className="relative overflow-hidden pt-12 md:pt-16">
      <div className="absolute inset-x-0 top-10 h-72 bg-[radial-gradient(circle_at_top_left,rgba(250,204,21,0.2),transparent_38%),radial-gradient(circle_at_top_right,rgba(34,197,94,0.18),transparent_34%)]" />
      <div className="container relative z-10">
        <div className="surface-card grid gap-10 p-8 md:grid-cols-[1.2fr,0.8fr] md:p-10 xl:p-12">
          <div className="reveal-up space-y-6">
            <div className="badge-chip">Marketplace digital terpercaya</div>
            <div className="space-y-5">
              <h1 className="text-4xl font-black leading-[0.98] tracking-tight text-slate-950 md:text-6xl xl:text-7xl dark:text-white">
                Tempat belanja layanan digital yang lebih rapi, cepat, dan nyaman.
              </h1>
              <p className="max-w-2xl text-base leading-8 text-slate-600 md:text-lg dark:text-slate-300">
                Kograph Premium menghadirkan pembelian akun premium, panel, dan kebutuhan digital lain dengan tampilan yang jelas, proses pembayaran yang aman, serta detail pesanan yang mudah ditinjau kembali kapan pun diperlukan.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link href="/products" className="primary-button">
                Lihat semua produk
              </Link>
              <Link href="/cek-pesanan" className="secondary-button">
                Cek status pesanan
              </Link>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              {[
                {
                  title: "Pilihan yang tertata",
                  text: "Produk ditampilkan lebih ringkas agar mudah dibandingkan sebelum checkout."
                },
                {
                  title: "Pembayaran terverifikasi",
                  text: "Status transaksi dipantau otomatis sehingga proses order terasa lebih tenang."
                },
                {
                  title: "Akses detail pesanan",
                  text: "Resi, invoice, dan credential bisa dicek ulang langsung dari web."
                }
              ].map((item) => (
                <div key={item.title} className="rounded-[28px] border border-white/10 bg-white/5 p-5 backdrop-blur">
                  <div className="text-lg font-bold text-white">{item.title}</div>
                  <p className="mt-2 text-sm leading-7 text-slate-300">{item.text}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="reveal-up space-y-4 [animation-delay:180ms]">
            <div className="rounded-[32px] border border-amber-300/20 bg-gradient-to-br from-amber-200 via-amber-300 to-amber-100 p-7 text-slate-950 shadow-2xl shadow-amber-400/20">
              <div className="text-xs font-black uppercase tracking-[0.28em] text-slate-700">Alur belanja</div>
              <ol className="mt-4 space-y-4 text-sm leading-8 text-slate-900/90">
                <li>1. Pilih produk atau paket yang paling sesuai dengan kebutuhan Anda.</li>
                <li>2. Lanjutkan pembayaran melalui QRIS dinamis yang tersedia.</li>
                <li>3. Setelah transaksi tervalidasi, sistem memperbarui status order secara otomatis.</li>
                <li>4. Resi, invoice, dan detail layanan dapat dicek ulang langsung dari website.</li>
              </ol>
            </div>
            <div className="surface-card p-6">
              <div className="text-xs font-black uppercase tracking-[0.28em] text-slate-400 dark:text-slate-500">Nilai utama</div>
              <div className="mt-4 space-y-3">
                {[
                  [
                    "Tampilan profesional",
                    "Susunan halaman dibuat bersih dan terstruktur agar proses checkout terasa lebih meyakinkan."
                  ],
                  [
                    "Nyaman di desktop dan mobile",
                    "Semua elemen penting tetap mudah dibaca dan diakses di berbagai perangkat."
                  ]
                ].map(([title, text]) => (
                  <div key={title} className="rounded-[24px] border border-slate-200/70 bg-slate-50/80 p-5 dark:border-white/10 dark:bg-white/5">
                    <div className="text-base font-bold text-slate-950 dark:text-white">{title}</div>
                    <p className="mt-2 text-sm leading-7 text-slate-600 dark:text-slate-300">{text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
