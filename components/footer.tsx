import Link from "next/link";
import { SITE } from "@/lib/constants";

export default function Footer() {
  return (
    <footer className="border-t border-white/10 bg-[#020817]">
      <div className="mx-auto flex max-w-7xl flex-col gap-10 px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1.4fr)_repeat(3,minmax(0,0.7fr))]">
          <div className="space-y-5">
            <div className="flex items-center gap-4">
              <div className="grid h-14 w-14 place-items-center rounded-2xl border border-primary/30 bg-primary/10 text-2xl font-black text-primary shadow-[0_18px_50px_rgba(250,204,21,0.15)]">
                K
              </div>
              <div>
                <div className="text-4xl font-black tracking-tight text-white">{SITE.name}</div>
                <p className="mt-2 max-w-2xl text-base leading-8 text-slate-300 sm:text-lg">
                  Tempat belanja layanan digital yang dibuat rapi, terasa aman, dan mudah diikuti dari pembayaran sampai pesanan selesai.
                </p>
              </div>
            </div>

            <div className="rounded-[28px] border border-white/10 bg-white/5 p-6 text-slate-200 shadow-[0_30px_120px_rgba(2,6,23,0.5)]">
              <h3 className="text-3xl font-black leading-tight text-white sm:text-4xl">
                Belanja lebih tenang, simpan bukti transaksi lebih rapi, dan cek pesanan kapan saja.
              </h3>
              <p className="mt-4 max-w-3xl text-base leading-8 text-slate-300 sm:text-lg">
                Setelah pembayaran terverifikasi, status order dapat dipantau dari web. Invoice PDF bisa diunduh kembali,
                informasi pesanan tetap tertata, dan bantuan tim support lebih mudah dijangkau saat diperlukan.
              </p>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-bold uppercase tracking-[0.35em] text-slate-400">Belanja</h4>
            <ul className="mt-5 space-y-4 text-lg text-slate-200">
              <li><Link href="/products" className="transition hover:text-primary">Semua produk</Link></li>
              <li><Link href="/cek-pesanan" className="transition hover:text-primary">Cek pesanan</Link></li>
              <li><Link href="/profile" className="transition hover:text-primary">Isi saldo akun</Link></li>
              <li><Link href="/orders" className="transition hover:text-primary">Riwayat order</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-bold uppercase tracking-[0.35em] text-slate-400">Bantuan</h4>
            <ul className="mt-5 space-y-4 text-lg text-slate-200">
              <li><Link href={SITE.legal.faqUrl} className="transition hover:text-primary">FAQ</Link></li>
              <li><Link href="/faq" className="transition hover:text-primary">Panduan & FAQ</Link></li>
              <li><a href={`https://t.me/${SITE.botUsername.replace(/^@/, "")}`} target="_blank" rel="noreferrer" className="transition hover:text-primary">Bot cek pesanan</a></li>
              <li><a href={`https://t.me/${SITE.autoOrderBotUsername.replace(/^@/, "")}`} target="_blank" rel="noreferrer" className="transition hover:text-primary">Bot auto order</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-bold uppercase tracking-[0.35em] text-slate-400">Legal</h4>
            <ul className="mt-5 space-y-4 text-lg text-slate-200">
              <li><Link href={SITE.legal.termsUrl} className="transition hover:text-primary">Terms &amp; Conditions</Link></li>
              <li><Link href={SITE.legal.privacyUrl} className="transition hover:text-primary">Privacy Policy</Link></li>
              <li><Link href={SITE.legal.reportIssueUrl} className="transition hover:text-primary">Laporkan kendala</Link></li>
              <li><a href={`mailto:${SITE.support.email}`} className="transition hover:text-primary">{SITE.support.email}</a></li>
            </ul>
          </div>
        </div>

        <div className="flex flex-col gap-4 border-t border-white/10 pt-6 text-sm text-slate-400 md:flex-row md:items-center md:justify-between">
          <p>© 2026 {SITE.name}. Kami merapikan setiap detail agar pengalaman belanja terasa lebih nyaman dan profesional.</p>
          <p className="flex flex-wrap gap-4">
            <span>QRIS dinamis</span>
            <span>Invoice PDF</span>
            <span>Status pesanan real-time</span>
            <span>Desktop &amp; mobile friendly</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
