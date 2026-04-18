import Link from "next/link";
import { SITE } from "@/lib/constants";

const footerGroups = [
  {
    title: "Belanja",
    links: [
      { label: "Semua produk", href: "/products" },
      { label: "Cek pesanan", href: "/cek-pesanan" },
      { label: "Top up saldo", href: "/top-up" }
    ]
  },
  {
    title: "Bantuan",
    links: [
      { label: "FAQ", href: SITE.legal.faq },
      { label: "Pusat bantuan", href: `mailto:${SITE.support.email}` },
      { label: "Bot cek pesanan", href: `https://t.me/${SITE.botUsername}` }
    ]
  },
  {
    title: "Legal",
    links: [
      { label: "Terms & Conditions", href: SITE.legal.terms },
      { label: "Privacy Policy", href: SITE.legal.privacy },
      { label: "Report issue", href: SITE.legal.report }
    ]
  }
];

export function Footer() {
  return (
    <footer className="mt-20 border-t border-white/10 bg-[#020617] text-white">
      <div className="container py-14">
        <div className="grid gap-10 lg:grid-cols-[1.2fr,0.8fr]">
          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-amber-300/20 bg-white/5 text-xl font-black text-amber-300 shadow-[0_18px_40px_rgba(250,204,21,0.12)]">
                K
              </div>
              <div>
                <div className="text-3xl font-black tracking-tight">{SITE.name}</div>
                <p className="mt-2 max-w-2xl text-sm leading-8 text-slate-300">
                  Marketplace layanan digital dengan pengalaman belanja yang lebih jelas, tampilan yang rapi, dan alur transaksi yang dibuat agar tetap nyaman dari awal sampai pesanan selesai.
                </p>
              </div>
            </div>

            <div className="rounded-[30px] border border-white/10 bg-white/5 p-6 backdrop-blur">
              <div className="text-xl font-black leading-tight text-white md:text-2xl">
                Belanja lebih tenang, cek status lebih mudah, dan simpan bukti transaksi dengan rapi.
              </div>
              <p className="mt-3 text-sm leading-8 text-slate-300">
                Pembayaran tervalidasi otomatis, resi pesanan mudah dicari kembali, credential tampil lebih jelas di web, dan invoice PDF bisa diunduh kapan saja ketika dibutuhkan.
              </p>
            </div>
          </div>

          <div className="grid gap-8 sm:grid-cols-3">
            {footerGroups.map((group) => (
              <div key={group.title}>
                <div className="text-xs font-black uppercase tracking-[0.3em] text-slate-400">{group.title}</div>
                <div className="mt-5 space-y-4 text-sm text-slate-200">
                  {group.links.map((link) => (
                    <Link key={link.label} href={link.href} className="block transition hover:text-amber-300">
                      {link.label}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="container flex flex-col gap-3 py-5 text-xs text-slate-400 md:flex-row md:items-center md:justify-between">
          <div>© 2026 {SITE.name}. Semua layanan ditampilkan dengan pendekatan yang lebih rapi dan profesional.</div>
          <div className="flex flex-wrap items-center gap-4">
            <span>QRIS dinamis</span>
            <span>Invoice PDF</span>
            <span>Credential delivery</span>
            <span>Desktop & mobile ready</span>
          </div>
        </div>
      </div>
    </footer>
  );
}


export default Footer;
