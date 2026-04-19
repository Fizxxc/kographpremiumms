"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";

const NAV_ITEMS = [
  { href: "/", label: "Beranda" },
  { href: "/products", label: "Produk" },
  { href: "/orders", label: "Cek Pesanan" },
  { href: "/top-up", label: "Top Up" }
];

export default function HeaderNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <>
      <nav className="hidden items-center gap-1 rounded-full border border-[color:var(--border)] bg-[color:var(--card-subtle)] px-2 py-1 shadow-[var(--shadow-soft)] md:flex">
        {NAV_ITEMS.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "rounded-full px-4 py-2 text-sm font-medium transition",
                active
                  ? "bg-[color:var(--accent)] text-slate-950 shadow-sm"
                  : "text-[color:var(--foreground-soft)] hover:bg-[color:var(--card-strong)] hover:text-[color:var(--foreground)]"
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
          variant="ghost"
          className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--card-subtle)] text-[color:var(--foreground)]"
          onClick={() => setOpen(true)}
          aria-label="Buka menu"
        >
          <Menu className="h-5 w-5" />
        </Button>
      </div>

      {open ? (
        <div className="fixed inset-0 z-[70] md:hidden">
          <button
            className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm"
            onClick={() => setOpen(false)}
            aria-label="Tutup menu"
          />
          <div className="absolute right-0 top-0 h-full w-[280px] border-l border-[color:var(--border)] bg-[color:var(--background-soft)]/98 p-5 text-[color:var(--foreground)] shadow-2xl">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs font-semibold uppercase tracking-[0.28em] text-[color:var(--foreground-muted)]">
                  Navigasi
                </div>
                <div className="mt-2 text-lg font-bold text-[color:var(--foreground)]">Kograph Premium</div>
              </div>
              <Button
                size="icon"
                variant="ghost"
                className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--card-subtle)]"
                onClick={() => setOpen(false)}
                aria-label="Tutup menu"
              >
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
                      "block rounded-2xl px-4 py-3 text-sm font-medium transition",
                      active
                        ? "bg-[color:var(--accent)] text-slate-950"
                        : "bg-[color:var(--card)] text-[color:var(--foreground)] hover:bg-[color:var(--card-strong)]"
                    )}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}