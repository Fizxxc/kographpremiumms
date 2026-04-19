"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const NAV_ITEMS = [
  { href: "/", label: "Beranda" },
  { href: "/products", label: "Semua Produk" },
  { href: "/orders", label: "Pesanan" },
  { href: "/cek-pesanan", label: "Cek Transaksi" },
  { href: "/top-up", label: "Top Up" }
];

export default function HeaderNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <>
      <nav className="hidden items-center gap-1 md:flex">
        {NAV_ITEMS.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "rounded-full px-4 py-2 text-sm font-semibold transition",
                active
                  ? "bg-white/10 text-white shadow-[0_0_0_1px_rgba(250,204,21,0.12)]"
                  : "text-slate-400 hover:bg-white/5 hover:text-white"
              )}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="md:hidden">
        <Button
          size="icon"
          variant="secondary"
          className="rounded-2xl border-white/10 bg-white/5 text-white hover:bg-white/10"
          onClick={() => setOpen(true)}
          aria-label="Buka menu"
        >
          <Menu className="h-5 w-5" />
        </Button>
      </div>

      {open ? (
        <div className="fixed inset-0 z-[80] md:hidden">
          <button
            className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm"
            onClick={() => setOpen(false)}
            aria-label="Tutup menu"
          />
          <div className="absolute right-0 top-0 h-full w-[320px] border-l border-white/10 bg-[#0b0e11] p-5 shadow-2xl">
            <div className="flex items-center justify-between">
              <div>
                <div className="brand-kicker text-slate-500">Navigasi</div>
                <div className="mt-2 text-lg font-black text-white">Kograph Premium</div>
              </div>
              <Button size="icon" variant="secondary" className="rounded-2xl border-white/10 bg-white/5 text-white" onClick={() => setOpen(false)}>
                <X className="h-5 w-5" />
              </Button>
            </div>

            <div className="mt-8 space-y-2">
              {NAV_ITEMS.map((item) => {
                const active = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "block rounded-2xl px-4 py-3 text-sm font-semibold transition",
                      active
                        ? "bg-white/10 text-white"
                        : "border border-white/10 bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white"
                    )}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <Link href="/login" onClick={() => setOpen(false)} className="secondary-button h-11 border-white/10 bg-white/5 text-white">Login</Link>
              <Link href="/register" onClick={() => setOpen(false)} className="inline-flex h-11 items-center justify-center rounded-full bg-gradient-to-r from-yellow-400 via-amber-500 to-cyan-400 px-5 text-sm font-bold text-slate-950">Register</Link>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
