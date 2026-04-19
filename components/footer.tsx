import Link from "next/link";
import Image from "next/image";
import { Globe2, Instagram, Mail, ShieldCheck, Wallet } from "lucide-react";
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
    title: "Legal",
    links: [
      { href: SITE.legal.termsUrl, label: "Syarat & ketentuan" },
      { href: SITE.legal.privacyUrl, label: "Kebijakan privasi" },
      { href: "/faq", label: "FAQ" },
      { href: "/report", label: "Laporkan kendala" }
    ]
  },
  {
    title: "Pembayaran",
    links: [
      { href: "/top-up", label: "Top up saldo" },
      { href: "/products", label: "QRIS dinamis" },
      { href: "/cek-pesanan", label: "Cek status order" },
      { href: "/login", label: "Masuk akun" }
    ]
  }
];

export default function Footer() {
  return (
    <footer className="border-t border-white/10 bg-[#090c10] pb-10 pt-16">
      <div className="site-container space-y-10">
        <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-white/5">
                <Image src="/logo.png" alt={SITE.name} width={44} height={44} className="h-10 w-10 object-contain" />
              </div>
              <div>
                <h3 className="text-3xl font-black tracking-[-0.04em] text-white">{SITE.name}</h3>
                <p className="mt-3 max-w-2xl text-base leading-8 text-slate-400">
                  Store aplikasi premium dengan tampilan yang lebih matang: dark modern, rapi, responsif, dan tetap mempertahankan backend production yang sudah berjalan.
                </p>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-[24px] border border-white/10 bg-white/5 p-5">
                <div className="flex items-center gap-2 text-sm font-semibold text-slate-200"><ShieldCheck className="h-4 w-4 text-yellow-300" /> Aman</div>
                <p className="mt-2 text-sm leading-7 text-slate-400">Tampilan dirombak, sistem production tetap aman.</p>
              </div>
              <div className="rounded-[24px] border border-white/10 bg-white/5 p-5">
                <div className="flex items-center gap-2 text-sm font-semibold text-slate-200"><Wallet className="h-4 w-4 text-yellow-300" /> Pembayaran</div>
                <p className="mt-2 text-sm leading-7 text-slate-400">Mendukung alur checkout dan tracking yang lebih jelas.</p>
              </div>
              <div className="rounded-[24px] border border-white/10 bg-white/5 p-5">
                <div className="flex items-center gap-2 text-sm font-semibold text-slate-200"><Mail className="h-4 w-4 text-yellow-300" /> Support</div>
                <p className="mt-2 text-sm leading-7 text-slate-400">Hubungi support kapan pun saat butuh bantuan.</p>
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
          <p>© 2026 {SITE.name}. Semua hak cipta dilindungi.</p>
          <div className="flex items-center gap-4 text-slate-400">
            <a href="#" className="transition hover:text-white" aria-label="Instagram"><Instagram className="h-4 w-4" /></a>
            <a href="#" className="transition hover:text-white" aria-label="Website"><Globe2 className="h-4 w-4" /></a>
            <span>{SITE.support.email}</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
