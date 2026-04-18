const faqs = [
  {
    q: "Bagaimana cara mengecek status pesanan?",
    a: "Gunakan halaman cek pesanan dengan resi order yang Anda terima setelah checkout. Anda juga bisa memakai bot Telegram @KographcekBot untuk pengecekan cepat."
  },
  {
    q: "Apakah invoice tersedia setelah pembayaran berhasil?",
    a: "Ya. Invoice PDF disiapkan otomatis setelah transaksi tervalidasi dan bisa diunduh kembali dari halaman detail pesanan."
  },
  {
    q: "Apakah credential dikirim otomatis?",
    a: "Untuk produk yang mendukung pengiriman otomatis, credential akan tampil di web dan dikirim juga ke email pelanggan secara otomatis setelah pesanan siap."
  },
  {
    q: "Bagaimana jika saya salah memasukkan email atau data akun?",
    a: "Segera hubungi support agar tim kami dapat membantu pengecekan. Semakin cepat dilaporkan, semakin mudah penyesuaiannya."
  },
  {
    q: "Apakah saya harus login untuk memantau pesanan?",
    a: "Tidak selalu. Beberapa status pesanan dapat dipantau cukup dengan order ID dan resi, sehingga pengecekan tetap praktis meski tanpa login."
  }
];

export default function FaqPage() {
  return (
    <div className="container py-12">
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="surface-card p-8 md:p-10">
          <div className="badge-chip">FAQ</div>
          <h1 className="mt-5 text-4xl font-black tracking-tight text-slate-950 dark:text-white">Pertanyaan yang sering diajukan</h1>
          <p className="mt-4 text-sm leading-8 text-slate-600 dark:text-slate-300">
            Ringkasan jawaban cepat untuk hal-hal yang paling sering ditanyakan pelanggan sebelum atau sesudah melakukan order.
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((item) => (
            <div key={item.q} className="surface-card p-6 md:p-8">
              <h2 className="text-lg font-black tracking-tight text-slate-950 dark:text-white">{item.q}</h2>
              <p className="mt-3 text-sm leading-8 text-slate-600 dark:text-slate-300">{item.a}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
