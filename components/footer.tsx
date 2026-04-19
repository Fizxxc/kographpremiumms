import Link from "next/link";
import { ArrowUpRight, BadgeCheck, Mail, ShieldCheck } from "lucide-react";
import { SITE } from "@/lib/constants";

export default function Footer() {
  return (
    <footer className="relative overflow-hidden border-t border-white/10 bg-[#040b16] text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(250,204,21,0.16),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(59,130,246,0.14),transparent_24%)]" />
      <div className="relative mx-auto flex max-w-7xl flex-col gap-10 px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-8 rounded-[34px] border border-white/10 bg-white/5 p-6 backdrop-blur-sm lg:grid-cols-[minmax(0,1.2fr)_360px] lg:p-8">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-4 py-2 text-[11px] font-black uppercase tracking-[0.34em] text-primary">
              <BadgeCheck className="h-4 w-4" />
              Trusted digital store
            </div>
            <h2 className="mt-4 max-w-3xl text-3xl font-black leading-tight tracking-tight text-white sm:text-4xl">
              Tampilan storefront yang lebih modern untuk menghadirkan pengalaman belanja digital yang terasa profesional.
            </h2>
            <p className="mt-4 max-w-3xl text-base leading-8 text-slate-300">
              {SITE.name} menyatukan katalog yang nyaman dibaca, checkout yang lebih jelas, invoice yang rapi, dan halaman pemantauan order yang mudah diakses kembali.
            </p>
          </div>

          <div className="rounded-[28px] border border-white/10 bg-slate-950/40 p-5 shadow-[0_24px_70px_rgba(0,0,0,0.24)]">
            <div className="text-xs font-black uppercase tracking-[0.32em] text-slate-400">Support & access</div>
            <div className="mt-5 space-y-3 text-sm leading-7 text-slate-200">
              <div className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                <ShieldCheck className="mt-0.5 h-4 w-4 text-primary" />
                <span>Invoice PDF, status transaksi, dan data order ditata lebih rapi agar mudah dicek kembali.</span>
              </div>
              <div className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                <Mail className="mt-0.5 h-4 w-4 text-primary" />
                <span>{SITE.support.email}</span>
              </div>
            </div>
            <div className="mt-5 flex flex-wrap gap-3">
              <a
                href={`https://t.me/${SITE.botUsername.replace(/^@/, "")}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-11 items-center justify-center rounded-full bg-primary px-5 text-sm font-black text-slate-950 transition hover:opacity-90"
              >
                Cek via bot
              </a>
              <Link href="/cek-pesanan" className="inline-flex h-11 items-center justify-center rounded-full border border-white/15 px-5 text-sm font-semibold text-white transition hover:bg-white/10">
                Lacak pesanan
              </Link>
            </div>
          </div>
        </div>

        <div className="grid gap-10 lg:grid-cols-[minmax(0,1.1fr)_repeat(3,minmax(0,0.72fr))]">
          <div className="space-y-5">
            <Link href="/" className="flex items-center gap-4">
              <div className="grid h-14 w-14 place-items-center rounded-2xl border border-primary/30 bg-primary/10 text-2xl font-black text-primary shadow-[0_18px_50px_rgba(250,204,21,0.15)]">
                K
              </div>
              <div>
                <div className="text-3xl font-black tracking-tight text-white">{SITE.name}</div>
                <p className="mt-1 max-w-xl text-sm leading-7 text-slate-300">
                  Belanja layanan digital dengan tampilan yang lebih rapi, proses yang lebih jelas, dan hasil akhir yang terasa lebih premium.
                </p>
              </div>
            </Link>
          </div>

          <div>
            <h4 className="text-sm font-black uppercase tracking-[0.34em] text-slate-400">Navigasi</h4>
            <ul className="mt-5 space-y-4 text-base text-slate-200">
              <li><Link href="/products" className="transition hover:text-primary">Semua produk</Link></li>
              <li><Link href="/cek-pesanan" className="transition hover:text-primary">Cek pesanan</Link></li>
              <li><Link href="/orders" className="transition hover:text-primary">Riwayat transaksi</Link></li>
              <li><Link href="/profile" className="transition hover:text-primary">Akun saya</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-black uppercase tracking-[0.34em] text-slate-400">Bantuan</h4>
            <ul className="mt-5 space-y-4 text-base text-slate-200">
              <li><Link href="/faq" className="transition hover:text-primary">FAQ & panduan</Link></li>
              <li><a href={`https://t.me/${SITE.botUsername.replace(/^@/, "")}`} target="_blank" rel="noreferrer" className="transition hover:text-primary">Bot cek pesanan</a></li>
              <li><a href={`https://t.me/${SITE.autoOrderBotUsername.replace(/^@/, "")}`} target="_blank" rel="noreferrer" className="transition hover:text-primary">Bot auto order</a></li>
              <li><a href={`mailto:${SITE.support.email}`} className="transition hover:text-primary">Email support</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-black uppercase tracking-[0.34em] text-slate-400">Legal</h4>
            <ul className="mt-5 space-y-4 text-base text-slate-200">
              <li><Link href={SITE.legal.termsUrl} className="transition hover:text-primary">Terms & Conditions</Link></li>
              <li><Link href={SITE.legal.privacyUrl} className="transition hover:text-primary">Privacy Policy</Link></li>
              <li><Link href={SITE.legal.reportIssueUrl} className="transition hover:text-primary">Laporkan kendala</Link></li>
            </ul>
          </div>
        </div>

        <div className="flex flex-col gap-4 border-t border-white/10 pt-6 text-sm text-slate-400 md:flex-row md:items-center md:justify-between">
          <p>© 2026 {SITE.name}. Dibuat agar tampilan storefront terlihat lebih rapi, modern, dan meyakinkan untuk pelanggan.</p>
          <div className="flex flex-wrap items-center gap-4 text-slate-300">
            <span className="inline-flex items-center gap-2"><ArrowUpRight className="h-4 w-4 text-primary" /> QRIS ready</span>
            <span className="inline-flex items-center gap-2"><ArrowUpRight className="h-4 w-4 text-primary" /> Invoice PDF</span>
            <span className="inline-flex items-center gap-2"><ArrowUpRight className="h-4 w-4 text-primary" /> Order tracking</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
