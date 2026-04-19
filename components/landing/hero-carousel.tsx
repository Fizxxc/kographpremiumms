"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const slides = [
  {
    tag: "Promo utama",
    title: "Banner promo utama ditampilkan penuh agar terasa seperti etalase store yang lebih matang.",
    body: "Ganti file banner di public/banner-home.png agar section ini langsung mengikuti desain promo yang Anda siapkan.",
    primary: { href: "/products", label: "Lihat semua produk" },
    secondary: { href: "/cek-pesanan", label: "Cek transaksi" }
  },
  {
    tag: "Alur belanja",
    title: "Pengunjung bisa mulai dari banner promo, lanjut ke produk, lalu cek status transaksi tanpa susunan halaman yang membingungkan.",
    body: "Bagian hero sekarang difokuskan menjadi banner penuh, bukan layout pecah dua, supaya lebih dekat dengan gaya store modern seperti referensi Anda.",
    primary: { href: "/products", label: "Mulai belanja" },
    secondary: { href: "/report", label: "Butuh bantuan?" }
  },
  {
    tag: "Mudah diganti",
    title: "Anda cukup menimpa satu file PNG untuk mengganti banner tanpa perlu menyentuh struktur komponen hero.",
    body: "Cocok untuk campaign mingguan, top up game, diskon aplikasi premium, atau promo khusus yang ingin langsung ditonjolkan di halaman depan.",
    primary: { href: "/products", label: "Buka katalog" },
    secondary: { href: "/orders", label: "Riwayat pesanan" }
  }
];

export default function HeroCarousel() {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActive((prev) => (prev + 1) % slides.length);
    }, 5500);
    return () => window.clearInterval(timer);
  }, []);

  const slide = slides[active];

  return (
    <section
      className="relative overflow-hidden rounded-[32px] border shadow-[var(--shadow)]"
      style={{ borderColor: "var(--border)", background: "var(--card-strong)" }}
    >
      <div className="relative h-[280px] sm:h-[360px] lg:h-[460px]">
        <Image
          src="/banner-home.png"
          alt="Banner promo utama Kograph Premium"
          fill
          priority
          className="object-cover"
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(11,14,17,0.74)_0%,rgba(11,14,17,0.32)_38%,rgba(11,14,17,0.18)_100%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(0deg,rgba(11,14,17,0.70)_0%,rgba(11,14,17,0.08)_45%,rgba(11,14,17,0.05)_100%)]" />

        <div className="absolute inset-x-0 bottom-0 p-5 sm:p-7 lg:p-9">
          <div className="max-w-2xl rounded-[24px] border px-5 py-5 backdrop-blur-md sm:px-6" style={{ borderColor: "rgba(255,255,255,0.10)", background: "rgba(11,14,17,0.42)" }}>
            <div className="inline-flex w-max rounded-full border px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.24em]" style={{ borderColor: "rgba(248, 201, 51, 0.22)", background: "rgba(248,201,51,0.14)", color: "#fde68a" }}>
              {slide.tag}
            </div>
            <h1 className="mt-4 text-2xl font-black leading-tight text-white sm:text-4xl">{slide.title}</h1>
            <p className="mt-3 max-w-xl text-sm leading-7 text-slate-200 sm:text-base">{slide.body}</p>
            <div className="mt-5 flex flex-wrap gap-3">
              <Link href={slide.primary.href} className="primary-button">
                {slide.primary.label}
              </Link>
              <Link href={slide.secondary.href} className="secondary-button border-white/15 bg-white/8 text-white hover:bg-white/12">
                {slide.secondary.label}
              </Link>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setActive((prev) => (prev - 1 + slides.length) % slides.length)}
          className="absolute left-4 top-1/2 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border text-white transition hover:opacity-90 sm:left-6"
          style={{ borderColor: "rgba(255,255,255,0.12)", background: "rgba(11,14,17,0.40)" }}
          aria-label="Slide sebelumnya"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <button
          type="button"
          onClick={() => setActive((prev) => (prev + 1) % slides.length)}
          className="absolute right-4 top-1/2 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border text-white transition hover:opacity-90 sm:right-6"
          style={{ borderColor: "rgba(255,255,255,0.12)", background: "rgba(11,14,17,0.40)" }}
          aria-label="Slide berikutnya"
        >
          <ChevronRight className="h-5 w-5" />
        </button>

        <div className="absolute bottom-5 left-1/2 flex -translate-x-1/2 gap-2">
          {slides.map((_, index) => (
            <button
              key={index}
              type="button"
              onClick={() => setActive(index)}
              className="h-2.5 rounded-full transition-all"
              style={{ width: index === active ? 34 : 10, background: index === active ? "#f3b203" : "rgba(255,255,255,0.45)" }}
              aria-label={`Pindah ke slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
