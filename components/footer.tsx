import Link from "next/link";
import Image from "next/image";
import { Globe2, Instagram, Mail, MessageCircle, ShieldCheck, Wallet } from "lucide-react";
import { SITE } from "@/lib/constants";

const footerGroups = [
  {
    title: "Navigasi",
    links: [
      { href: "/", label: "Beranda" },
      { href: "/products", label: "Semua produk" },
      { href: "/cek-pesanan", label: "Cek transaksi" },
      { href: "/orders", label: "Riwayat pesanan" }
    ]
  },
  {
    title: "Informasi",
    links: [
      { href: SITE.legal.termsUrl, label: "Syarat & ketentuan" },
      { href: SITE.legal.privacyUrl, label: "Kebijakan privasi" },
      { href: "/faq", label: "Cara kerja & FAQ" },
      { href: "/report", label: "Laporkan kendala" }
    ]
  },
  {
    title: "Bantuan",
    links: [
      { href: `mailto:${SITE.support.email}`, label: SITE.support.email },
      { href: `https://t.me/${SITE.support.telegram.replace("@", "")}`, label: SITE.support.telegram },
      { href: "/cek-pesanan", label: "Lacak status pesanan" },
      { href: "/login", label: "Masuk ke akun" }
    ]
  }
];

export default function Footer() {
  return (
    <footer className="border-t border-white/10 bg-[#090c10] pb-10 pt-16">
      <div className="site-container space-y-10">
        <div className="grid gap-10 lg:grid-cols-[1.08fr_0.92fr]">
          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-white/5">
                <Image src="/logo.png" alt={SITE.name} width={44} height={44} className="h-10 w-10 object-contain" />
              </div>
              <div>
                <h3 className="text-3xl font-black tracking-[-0.04em] text-white">{SITE.name}</h3>
                <p className="mt-3 max-w-2xl text-base leading-8 text-slate-400">
                  Tempat untuk mencari layanan premium dengan alur yang lebih jelas. Pengguna bisa mulai dari memilih produk, menyelesaikan pembayaran, lalu memantau status pesanan tanpa harus bingung mencari langkah berikutnya.
                </p>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-[24px] border border-white/10 bg-white/5 p-5">
                <div className="flex items-center gap-2 text-sm font-semibold text-slate-100"><ShieldCheck className="h-4 w-4 text-yellow-300" /> Alur lebih tertata</div>
                <p className="mt-2 text-sm leading-7 text-slate-400">Informasi diprioritaskan agar user paham proses order dari awal sampai selesai.</p>
              </div>
              <div className="rounded-[24px] border border-white/10 bg-white/5 p-5">
                <div className="flex items-center gap-2 text-sm font-semibold text-slate-100"><Wallet className="h-4 w-4 text-yellow-300" /> Pembayaran lebih jelas</div>
                <p className="mt-2 text-sm leading-7 text-slate-400">Nominal, status, dan arah setelah pembayaran dibuat lebih mudah diikuti.</p>
              </div>
              <div className="rounded-[24px] border border-white/10 bg-white/5 p-5">
                <div className="flex items-center gap-2 text-sm font-semibold text-slate-100"><MessageCircle className="h-4 w-4 text-yellow-300" /> Support mudah dihubungi</div>
                <p className="mt-2 text-sm leading-7 text-slate-400">Bila ada kendala, user bisa langsung menghubungi email atau bot Telegram support.</p>
              </div>
            </div>
          </div>

          <div className="grid gap-8 sm:grid-cols-3">
            {footerGroups.map((group) => (
              <div key={group.title} className="space-y-4">
                <div className="text-sm font-black uppercase tracking-[0.22em] text-slate-500">{group.title}</div>
                <div className="space-y-3">
                  {group.links.map((link) => (
                    <Link key={link.href} href={link.href} className="block text-sm font-medium text-slate-300 transition hover:translate-x-1 hover:text-white">
                      {link.label}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-4 border-t border-white/10 pt-6 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 {SITE.name}. Dirancang agar pengguna lebih mudah memahami alur pemesanan.</p>
          <div className="flex flex-wrap items-center gap-4 text-slate-400">
            <a href="#" className="transition hover:text-white" aria-label="Instagram"><Instagram className="h-4 w-4" /></a>
            <a href={SITE.url} className="transition hover:text-white" aria-label="Website"><Globe2 className="h-4 w-4" /></a>
            <a href={`mailto:${SITE.support.email}`} className="inline-flex items-center gap-2 transition hover:text-white"><Mail className="h-4 w-4" /> {SITE.support.email}</a>
            <a href={`https://t.me/${SITE.support.telegram.replace("@", "")}`} className="inline-flex items-center gap-2 transition hover:text-white"><MessageCircle className="h-4 w-4" /> {SITE.support.telegram}</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
