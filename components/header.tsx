import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";
import HeaderNav from "@/components/header-nav";
import { SITE } from "@/lib/constants";

export default function Header() {
  return (
    <header className="sticky top-0 z-40 border-b divider-soft bg-[color:var(--card)]/85 backdrop-blur-xl">
      <div className="site-container flex h-20 items-center justify-between gap-4">
        <Link href="/" className="group flex min-w-0 items-center gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-[color:var(--border)] bg-[color:var(--card-strong)] text-lg font-black text-[color:var(--accent-strong)] shadow-[var(--shadow-soft)] transition duration-300 group-hover:-translate-y-0.5">
            K
          </span>
          <div className="min-w-0">
            <div className="truncate text-[17px] font-extrabold tracking-[-0.03em] text-[color:var(--foreground)]">
              {SITE.name}
            </div>
            <p className="truncate text-xs text-[color:var(--foreground-soft)]">Belanja digital yang rapi, cepat, dan terasa lebih meyakinkan.</p>
          </div>
        </Link>

        <div className="hidden items-center gap-3 lg:flex">
          <ThemeToggle />
          <HeaderNav />
        </div>

        <div className="flex items-center gap-2 lg:hidden">
          <ThemeToggle />
          <HeaderNav />
        </div>
      </div>
    </header>
  );
}
