import Link from "next/link";
import Image from "next/image";
import { MessageCircleQuestion, ShieldCheck, TicketPercent } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import HeaderNav from "@/components/header-nav";
import { SITE } from "@/lib/constants";

export default function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-[color:var(--border)] bg-white/88 backdrop-blur-xl dark:bg-[color:var(--card-strong)]/92">
      <div className="border-b border-[color:var(--border)] bg-[color:var(--card-subtle)]">
        <div className="site-container flex h-11 items-center justify-between gap-4 text-xs font-semibold text-[color:var(--foreground-soft)]">
          <div className="flex items-center gap-5 overflow-x-auto whitespace-nowrap scrollbar-thin">
            <span className="inline-flex items-center gap-2"><ShieldCheck className="h-3.5 w-3.5 text-[color:var(--accent-strong)]" /> Aman & rapi untuk transaksi digital</span>
            <span className="hidden sm:inline-flex items-center gap-2"><TicketPercent className="h-3.5 w-3.5 text-[color:var(--accent-strong)]" /> Tampilan katalog baru lebih mudah dipilih</span>
          </div>
          <Link href="/faq" className="hidden items-center gap-2 transition hover:text-[color:var(--foreground)] sm:inline-flex">
            <MessageCircleQuestion className="h-3.5 w-3.5" /> Bantuan
          </Link>
        </div>
      </div>

      <div className="site-container flex h-20 items-center justify-between gap-4">
        <Link href="/" className="group flex min-w-0 items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-2xl border border-[color:var(--border)] bg-white shadow-[var(--shadow-soft)]">
            <Image src="/logo.png" alt={SITE.name} width={40} height={40} className="h-9 w-9 object-contain" />
          </div>
          <div className="min-w-0">
            <div className="truncate text-[18px] font-black tracking-[-0.03em] text-[color:var(--foreground)]">{SITE.name}</div>
            <p className="truncate text-xs text-[color:var(--foreground-soft)]">Marketplace digital modern, rapih, dan cepat.</p>
          </div>
        </Link>

        <div className="hidden items-center gap-3 lg:flex">
          <HeaderNav />
          <ThemeToggle />
          <Link href="/login" className="secondary-button h-11 px-5">Masuk</Link>
        </div>

        <div className="flex items-center gap-2 lg:hidden">
          <ThemeToggle />
          <HeaderNav />
        </div>
      </div>
    </header>
  );
}
