"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const slides = [
  {
    tag: "Promo mingguan",
    title: "Upgrade akun premium dengan tampilan store yang terasa lebih terpercaya.",
    body: "Landing page dibuat gelap, lebih modern, dan lebih rapi agar first impression pengunjung naik sejak detik pertama.",
    primary: { href: "/products", label: "Lihat semua produk" },
    secondary: { href: "/cek-pesanan", label: "Cek transaksi" },
    accent: "from-yellow-400/20 via-amber-500/10 to-cyan-400/10"
  },
  {
    tag: "Best seller",
    title: "Netflix, Canva, CapCut, ChatGPT, Spotify, dan tools kerja dalam satu etalase premium.",
    body: "Grid produk dibuat lebih profesional dengan hover glow, badge populer, dan harga yang lebih gampang dipindai.",
    primary: { href: "/products", label: "Belanja sekarang" },
    secondary: { href: "/orders", label: "Lihat pesanan" },
    accent: "from-cyan-400/20 via-sky-500/10 to-yellow-400/10"
  },
  {
    tag: "Checkout rapi",
    title: "Alur pilih produk, bayar, sampai cek status kini tampil lebih clean dan konsisten.",
    body: "Visual baru difokuskan agar user cepat paham: navigasi jelas, spacing lega, dan komponen terasa lebih matang seperti store premium modern.",
    primary: { href: "/products", label: "Mulai dari katalog" },
    secondary: { href: "/faq", label: "Pelajari alur" },
    accent: "from-fuchsia-400/20 via-violet-500/10 to-cyan-400/10"
  }
];

export default function HeroCarousel() {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActive((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => window.clearInterval(timer);
  }, []);

  const slide = slides[active];

  return (
    <section className="relative overflow-hidden rounded-[28px] border border-white/10 bg-[#0f172a] shadow-[0_35px_90px_-45px_rgba(0,0,0,0.8)]">
      <div className={`absolute inset-0 bg-gradient-to-br ${slide.accent}`} />
      <div className="absolute -right-16 top-8 h-48 w-48 rounded-full bg-yellow-400/10 blur-3xl" />
      <div className="absolute bottom-0 left-0 h-40 w-40 rounded-full bg-cyan-400/10 blur-3xl" />

      <div className="relative grid min-h-[360px] gap-8 p-6 sm:min-h-[420px] sm:p-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-end lg:p-10">
        <div className="flex flex-col justify-end">
          <div className="inline-flex w-max rounded-full border border-yellow-400/20 bg-yellow-400/10 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.28em] text-yellow-300">
            {slide.tag}
          </div>
          <h1 className="mt-5 max-w-3xl text-3xl font-black leading-tight text-white sm:text-5xl">
            {slide.title}
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-8 text-slate-300 sm:text-base">
            {slide.body}
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link href={slide.primary.href} className="primary-button">
              {slide.primary.label}
            </Link>
            <Link href={slide.secondary.href} className="secondary-button border-white/10 bg-white/5 text-white hover:bg-white/10">
              {slide.secondary.label}
            </Link>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
          <div className="rounded-[24px] border border-white/10 bg-white/5 p-5 backdrop-blur-md">
            <div className="text-[11px] font-bold uppercase tracking-[0.28em] text-slate-400">Keunggulan visual</div>
            <div className="mt-4 text-2xl font-black text-white">Dark modern UI</div>
            <p className="mt-2 text-sm leading-7 text-slate-300">Nuansa lebih premium dengan layout bersih, rounded card, dan pencahayaan lembut.</p>
          </div>
          <div className="rounded-[24px] border border-white/10 bg-white/5 p-5 backdrop-blur-md">
            <div className="text-[11px] font-bold uppercase tracking-[0.28em] text-slate-400">Fokus utama</div>
            <div className="mt-4 text-2xl font-black text-white">Konversi lebih jelas</div>
            <p className="mt-2 text-sm leading-7 text-slate-300">CTA, badge promo, kategori, dan grid produk dibuat lebih mudah dipahami pengguna baru.</p>
          </div>
        </div>
      </div>

      <div className="absolute bottom-5 right-5 flex items-center gap-2">
        <button
          type="button"
          onClick={() => setActive((prev) => (prev - 1 + slides.length) % slides.length)}
          className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-slate-950/60 text-white transition hover:bg-slate-900"
          aria-label="Slide sebelumnya"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <button
          type="button"
          onClick={() => setActive((prev) => (prev + 1) % slides.length)}
          className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-slate-950/60 text-white transition hover:bg-slate-900"
          aria-label="Slide berikutnya"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      <div className="absolute bottom-6 left-6 flex gap-2">
        {slides.map((_, index) => (
          <button
            key={index}
            type="button"
            onClick={() => setActive(index)}
            className={`h-2.5 rounded-full transition-all ${index === active ? "w-10 bg-yellow-400" : "w-2.5 bg-white/35"}`}
            aria-label={`Pindah ke slide ${index + 1}`}
          />
        ))}
      </div>
    </section>
  );
}
