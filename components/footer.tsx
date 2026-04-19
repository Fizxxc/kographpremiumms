import Link from "next/link";
import { SITE } from "@/lib/constants";

const footerGroups = [
  {
    title: "Belanja",
    links: [
      { href: "/products", label: "Semua produk" },
      { href: "/orders", label: "Cek pesanan" },
      { href: "/top-up", label: "Top up saldo" }
    ]
  },
  {
    title: "Bantuan",
    links: [
      { href: "/faq", label: "FAQ" },
      { href: "/help", label: "Pusat bantuan" },
      { href: `https://t.me/${SITE.botUsername.replace(/^@/, "")}`, label: "Bot cek pesanan" }
    ]
  },
  {
    title: "Legal",
    links: [
      { href: SITE.legal.termsUrl, label: "Syarat & Ketentuan" },
      { href: SITE.legal.privacyUrl, label: "Kebijakan Privasi" },
      { href: SITE.legal.reportIssueUrl, label: "Laporkan kendala" }
    ]
  }
];

export default function Footer() {
  return (
    <footer className="border-t divider-soft pb-10 pt-20">
      <div className="site-container">
        <div className="brand-shell mesh-backdrop">
          <div className="grid gap-12 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-[color:var(--border)] bg-[color:var(--card)] text-xl font-black text-[color:var(--accent-strong)]">
                  K
                </div>
                <div className="space-y-2">
                  <h3 className="text-3xl font-black tracking-[-0.04em] text-[color:var(--foreground)]">{SITE.name}</h3>
                  <p className="max-w-2xl text-base leading-8 text-[color:var(--foreground-soft)]">
                    Marketplace layanan digital dengan proses yang lebih tenang, tampilan yang bersih, dan alur transaksi
                    yang dibuat agar tetap nyaman dari awal sampai pesanan selesai.
                  </p>
                </div>
              </div>

              <div className="brand-panel max-w-3xl">
                <h4 className="text-3xl font-black tracking-[-0.04em] text-[color:var(--foreground)]">
                  Belanja lebih nyaman, cek status lebih mudah, dan simpan bukti transaksi dengan rapi.
                </h4>
                <p className="mt-4 text-base leading-8 text-[color:var(--foreground-soft)]">
                  Pesanan tervalidasi otomatis, riwayat transaksi lebih mudah dicari kembali, credential tampil rapi di web,
                  dan invoice PDF bisa diunduh kapan saja saat dibutuhkan.
                </p>
              </div>
            </div>

            <div className="grid gap-8 sm:grid-cols-3 lg:grid-cols-3">
              {footerGroups.map((group) => (
                <div key={group.title} className="space-y-4">
                  <div className="brand-kicker">{group.title}</div>
                  <div className="space-y-3">
                    {group.links.map((link) => (
                      <Link
                        key={link.href}
                        href={link.href}
                        className="block text-sm font-medium text-[color:var(--foreground)] transition hover:translate-x-1 hover:text-[color:var(--accent-strong)]"
                      >
                        {link.label}
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-10 flex flex-col gap-4 border-t divider-soft pt-6 text-sm text-[color:var(--foreground-soft)] sm:flex-row sm:items-center sm:justify-between">
            <p>© 2026 {SITE.name}. Semua layanan ditampilkan dengan pendekatan yang lebih rapi dan profesional.</p>
            <div className="flex flex-wrap gap-4">
              <span>QRIS dinamis</span>
              <span>Invoice PDF</span>
              <span>Credential delivery</span>
              <span>Desktop & mobile ready</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
