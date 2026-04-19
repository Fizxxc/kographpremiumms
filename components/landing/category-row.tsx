import Link from "next/link";
import { BriefcaseBusiness, Clapperboard, Gamepad2, Music4, ShieldEllipsis, Sparkles, Tv, WandSparkles } from "lucide-react";

const items = [
  { label: "Streaming", icon: Tv },
  { label: "Game", icon: Gamepad2 },
  { label: "Work", icon: BriefcaseBusiness },
  { label: "Editing", icon: Clapperboard },
  { label: "Music", icon: Music4 },
  { label: "AI Tools", icon: WandSparkles },
  { label: "Keamanan", icon: ShieldEllipsis },
  { label: "Lainnya", icon: Sparkles }
];

export default function CategoryRow() {
  return (
    <section className="space-y-5">
      <div>
        <div className="brand-kicker">Kategori pilihan</div>
        <h2 className="mt-2 section-heading">Cari layanan berdasarkan kebutuhan, bukan sekadar nama produk.</h2>
      </div>
      <div className="hide-scrollbar overflow-x-auto">
        <div className="flex min-w-max gap-3 pb-2">
          {items.map((item) => (
            <Link
              key={item.label}
              href="/products"
              className="group flex min-w-[132px] items-center gap-3 rounded-[22px] border px-4 py-4 text-sm font-semibold transition duration-300 hover:-translate-y-1"
              style={{ borderColor: "var(--border)", background: "var(--card)", color: "var(--foreground-soft)", boxShadow: "var(--shadow-soft)" }}
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl" style={{ background: "var(--accent-soft)", color: "color-mix(in srgb, var(--foreground) 75%, var(--accent-strong))" }}>
                <item.icon className="h-5 w-5" />
              </div>
              <span style={{ color: "var(--foreground)" }}>{item.label}</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
