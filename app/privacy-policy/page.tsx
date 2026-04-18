const sections = [
  {
    title: "Informasi yang kami gunakan",
    body:
      "Kami dapat menggunakan data seperti nama, email, nomor kontak, detail transaksi, dan informasi teknis yang dibutuhkan untuk memproses pesanan, mengirim credential, menerbitkan invoice, serta memberikan bantuan ketika diperlukan."
  },
  {
    title: "Tujuan penggunaan data",
    body:
      "Data digunakan untuk verifikasi pembayaran, pengiriman layanan, pembaruan status pesanan, komunikasi bantuan pelanggan, serta pengembangan kualitas layanan dan keamanan sistem."
  },
  {
    title: "Penyimpanan dan keamanan",
    body:
      "Kograph Premium berupaya menjaga data pelanggan dengan sistem dan akses internal yang terbatas. Kami tidak membagikan data pribadi ke pihak yang tidak berkepentingan di luar kebutuhan operasional layanan."
  },
  {
    title: "Invoice, email, dan notifikasi",
    body:
      "Setelah transaksi berhasil, sistem dapat mengirim email otomatis berisi status pesanan, invoice PDF, dan detail layanan sesuai produk yang dibeli. Notifikasi ini dikirim untuk membantu pelanggan menyimpan bukti transaksi dengan lebih rapi."
  },
  {
    title: "Hak pelanggan",
    body:
      "Pelanggan dapat menghubungi tim support apabila ingin menanyakan penggunaan data, meminta koreksi data tertentu, atau melaporkan kendala yang berhubungan dengan layanan kami."
  }
];

export default function PrivacyPolicyPage() {
  return (
    <div className="container py-12">
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="surface-card p-8 md:p-10">
          <div className="badge-chip">Privacy Policy</div>
          <h1 className="mt-5 text-4xl font-black tracking-tight text-slate-950 dark:text-white">Kebijakan privasi</h1>
          <p className="mt-4 text-sm leading-8 text-slate-600 dark:text-slate-300">
            Halaman ini menjelaskan bagaimana informasi pelanggan digunakan untuk menjalankan transaksi, mengirim layanan digital, dan menjaga pengalaman belanja tetap aman serta profesional.
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
