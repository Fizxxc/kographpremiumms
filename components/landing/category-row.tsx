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
        <h2 className="mt-2 section-heading text-white">Temukan layanan premium berdasarkan kebutuhan.</h2>
      </div>
      <div className="hide-scrollbar overflow-x-auto">
        <div className="flex min-w-max gap-3 pb-2">
          {items.map((item) => (
            <Link
              key={item.label}
              href="/products"
              className="group flex min-w-[132px] items-center gap-3 rounded-[22px] border border-white/10 bg-white/5 px-4 py-4 text-sm font-semibold text-slate-200 transition duration-300 hover:-translate-y-1 hover:border-yellow-400/25 hover:bg-white/8 hover:text-white hover:shadow-[0_0_0_1px_rgba(250,204,21,0.18),0_16px_40px_-24px_rgba(245,158,11,0.45)]"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-yellow-400/20 to-cyan-400/10 text-yellow-300 transition group-hover:from-yellow-400/30 group-hover:to-cyan-400/20">
                <item.icon className="h-5 w-5" />
              </div>
              <span>{item.label}</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
