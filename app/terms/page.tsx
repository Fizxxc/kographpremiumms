const sections = [
  {
    title: "1. Gambaran layanan",
    body:
      "Kograph Premium menyediakan layanan digital seperti akun premium, panel, saldo, dan produk digital lain yang ditampilkan pada katalog. Setiap produk memiliki deskripsi, harga, serta ketentuan penggunaan masing-masing yang perlu dibaca sebelum checkout."
  },
  {
    title: "2. Proses pemesanan",
    body:
      "Pesanan dianggap diproses setelah pembayaran berhasil diverifikasi. Beberapa produk dapat dikirim otomatis, sementara produk tertentu mungkin memerlukan waktu penyiapan tambahan. Status pesanan dapat dipantau melalui resi order yang diberikan setelah checkout."
  },
  {
    title: "3. Data pembeli",
    body:
      "Pembeli bertanggung jawab memastikan data yang dimasukkan sudah benar, termasuk email, username, atau detail lain yang dibutuhkan untuk pengiriman layanan. Kesalahan input dari pihak pembeli dapat memengaruhi proses pengiriman pesanan."
  },
  {
    title: "4. Pembayaran dan refund",
    body:
      "Semua pembayaran diproses menggunakan metode yang tersedia di halaman checkout. Refund atau pengembalian dana dipertimbangkan berdasarkan jenis produk, status pesanan, serta hasil verifikasi tim support. Produk yang sudah berhasil dikirim umumnya tidak dapat direfund kecuali terjadi kendala dari pihak kami."
  },
  {
    title: "5. Penggunaan layanan",
    body:
      "Credential, akses akun, atau data panel yang diberikan hanya untuk penggunaan sah dan tidak melanggar hukum. Pembeli wajib menjaga kerahasiaan data akses yang diterima dan tidak membagikannya kepada pihak lain tanpa izin."
  },
  {
    title: "6. Perubahan kebijakan",
    body:
      "Kograph Premium dapat memperbarui ketentuan layanan sewaktu-waktu untuk menyesuaikan operasional, keamanan, dan kebutuhan layanan. Versi terbaru akan ditampilkan pada halaman ini."
  }
];

export default function TermsPage() {
  return (
    <div className="container py-12">
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="surface-card p-8 md:p-10">
          <div className="badge-chip">Terms & Conditions</div>
          <h1 className="mt-5 text-4xl font-black tracking-tight text-slate-950 dark:text-white">Syarat dan ketentuan layanan</h1>
          <p className="mt-4 text-sm leading-8 text-slate-600 dark:text-slate-300">
            Ketentuan ini menjelaskan cara layanan Kograph Premium dijalankan, mulai dari proses pemesanan, pembayaran, hingga penggunaan produk digital yang dibeli melalui website.
          </p>
        </div>

        {sections.map((section) => (
          <div key={section.title} className="surface-card p-6 md:p-8">
            <h2 className="text-xl font-black tracking-tight text-slate-950 dark:text-white">{section.title}</h2>
            <p className="mt-3 text-sm leading-8 text-slate-600 dark:text-slate-300">{section.body}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
