import Link from "next/link";
import Image from "next/image";
import { Search, ShieldCheck, UserCircle2 } from "lucide-react";
import HeaderNav from "@/components/header-nav";
import { LogoutButton } from "@/components/logout-button";
import { SITE } from "@/lib/constants";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export default async function Header() {
  const supabase = createServerSupabaseClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  const { data: profile } = user
    ? await supabase.from("profiles").select("role, full_name").eq("id", user.id).maybeSingle()
    : { data: null };

  const isLoggedIn = Boolean(user);
  const isAdmin = profile?.role === "admin";
  const accountLabel = profile?.full_name?.trim() || user?.email?.split("@")[0] || "Akun saya";

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-[#0b0e11]/88 backdrop-blur-xl">
      <div className="site-container py-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:gap-5">
          <div className="flex items-center justify-between gap-4 lg:min-w-[250px]">
            <Link href="/" className="group flex min-w-0 items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-white/5 shadow-[0_20px_50px_-35px_rgba(0,0,0,0.75)]">
                <Image src="/logo.png" alt={SITE.name} width={40} height={40} className="h-9 w-9 object-contain" />
              </div>
              <div className="min-w-0">
                <div className="truncate text-[18px] font-black tracking-[-0.03em] text-white">{SITE.name}</div>
                <p className="truncate text-xs text-slate-400">Store aplikasi premium modern</p>
              </div>
            </Link>

            <div className="lg:hidden">
              <HeaderNav isLoggedIn={isLoggedIn} isAdmin={isAdmin} accountLabel={accountLabel} />
            </div>
          </div>

          <form action="/products" className="relative flex-1 lg:max-w-2xl">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
            <input
              type="search"
              name="q"
              placeholder="Cari Netflix, Canva, ChatGPT, Spotify, CapCut..."
              className="h-12 w-full rounded-full border border-white/10 bg-white/5 pl-11 pr-4 text-sm text-white placeholder:text-slate-500 outline-none transition focus:border-yellow-400/30 focus:bg-white/8"
            />
          </form>

          <div className="hidden items-center gap-3 lg:flex">
            {isLoggedIn ? (
              <>
                {isAdmin ? (
                  <Link href="/admin" className="secondary-button h-11 border-white/10 bg-white/5 px-5 text-white hover:bg-white/10">
                    Dashboard admin
                  </Link>
                ) : null}
                <Link href="/profile" className="secondary-button inline-flex h-11 items-center gap-2 border-white/10 bg-white/5 px-5 text-white hover:bg-white/10">
                  <UserCircle2 className="h-4 w-4 text-yellow-300" />
                  <span className="max-w-[140px] truncate">{accountLabel}</span>
                </Link>
                <LogoutButton label="Keluar" variant="outline" className="h-11 border-white/10 bg-transparent px-5 text-white hover:bg-white/5" />
              </>
            ) : (
              <>
                <Link href="/login" className="secondary-button h-11 border-white/10 bg-white/5 px-5 text-white hover:bg-white/10">Login</Link>
                <Link href="/register" className="inline-flex h-11 items-center justify-center rounded-full bg-gradient-to-r from-yellow-400 via-amber-500 to-cyan-400 px-5 text-sm font-bold text-slate-950 shadow-[0_18px_40px_-24px_rgba(245,158,11,0.65)] transition hover:-translate-y-0.5">Register</Link>
              </>
            )}
          </div>
        </div>

        <div className="mt-4 hidden items-center justify-between gap-4 border-t border-white/10 pt-4 lg:flex">
          <HeaderNav isLoggedIn={isLoggedIn} isAdmin={isAdmin} accountLabel={accountLabel} />
          <div className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400">
            <ShieldCheck className="h-3.5 w-3.5 text-yellow-300" />
            Checkout production tetap aman, yang dirombak hanya tampilannya.
          </div>
        </div>
      </div>
    </header>
  );
}
