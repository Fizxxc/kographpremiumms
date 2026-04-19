"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";

const NAV_ITEMS = [
  { href: "/", label: "Beranda" },
  { href: "/products", label: "Produk" },
  { href: "/orders", label: "Cek Pesanan" },
  { href: "/top-up", label: "Top Up" }
];

export default function HeaderNav() {
  const pathname = usePathname();

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
        <Sheet>
          <SheetTrigger asChild>
            <Button
              size="icon"
              variant="ghost"
              className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--card-subtle)] text-[color:var(--foreground)]"
            >
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[280px] border-l border-[color:var(--border)] bg-[color:var(--background-soft)]/98 text-[color:var(--foreground)]">
            <div className="mt-8 space-y-2">
              {NAV_ITEMS.map((item) => {
                const active = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
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
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
}
