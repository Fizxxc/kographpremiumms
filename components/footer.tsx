import Link from "next/link";
import Image from "next/image";
import { SITE } from "@/lib/constants";

const footerGroups = [
  {
    title: "Navigasi",
    links: [
      { href: "/", label: "Beranda" },
      { href: "/products", label: "Semua produk" },
      { href: "/cek-pesanan", label: "Cek transaksi" }
    ]
  },
  {
    title: "Akun & bantuan",
    links: [
      { href: "/login", label: "Masuk" },
      { href: "/register", label: "Daftar" },
      { href: "/faq", label: "FAQ" }
    ]
  },
  {
    title: "Legal",
    links: [
      { href: SITE.legal.termsUrl, label: "Syarat & ketentuan" },
      { href: SITE.legal.privacyUrl, label: "Kebijakan privasi" },
      { href: "/report", label: "Laporkan kendala" }
    ]
  }
];

export default function Footer() {
  return (
    <footer className="border-t border-[color:var(--border)] pb-10 pt-16">
      <div className="site-container">
        <div className="brand-shell mesh-backdrop">
          <div className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr]">
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-2xl border border-[color:var(--border)] bg-white shadow-[var(--shadow-soft)]">
                  <Image src="/logo.png" alt={SITE.name} width={44} height={44} className="h-10 w-10 object-contain" />
                </div>
                <div>
                  <h3 className="text-3xl font-black tracking-[-0.04em] text-[color:var(--foreground)]">{SITE.name}</h3>
                  <p className="mt-3 max-w-2xl text-base leading-8 text-[color:var(--foreground-soft)]">
                    UI baru dibuat lebih bersih seperti marketplace digital modern: navigasi jelas, kartu produk lebih rapi,
                    checkout lebih meyakinkan, dan halaman status transaksi tetap mudah dibaca di mobile maupun desktop.
                  </p>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <div className="stat-card">
                  <div className="brand-kicker">Checkout</div>
                  <div className="mt-3 text-lg font-black">QRIS dinamis</div>
                </div>
                <div className="stat-card">
                  <div className="brand-kicker">Dokumen</div>
                  <div className="mt-3 text-lg font-black">Invoice PDF</div>
                </div>
                <div className="stat-card">
                  <div className="brand-kicker">Tracking</div>
                  <div className="mt-3 text-lg font-black">Cek pesanan cepat</div>
                </div>
              </div>
            </div>

            <div className="grid gap-8 sm:grid-cols-3">
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

          <div className="mt-10 flex flex-col gap-4 border-t border-[color:var(--border)] pt-6 text-sm text-[color:var(--foreground-soft)] sm:flex-row sm:items-center sm:justify-between">
            <p>© 2026 {SITE.name}. Semua hak cipta dilindungi.</p>
            <div className="flex flex-wrap gap-4">
              <span>{SITE.support.email}</span>
              <span>{SITE.botUsername}</span>
              <span>{SITE.autoOrderBotUsername}</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
