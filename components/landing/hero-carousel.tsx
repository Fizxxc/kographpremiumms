"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const slides = [
  {
    tag: "Alur belanja yang jelas",
    title: "Pilih layanan yang dibutuhkan, lanjut bayar, lalu pantau status pesanan dari halaman yang sama.",
    body: "Tampilan depan dibuat untuk membantu pengunjung paham alurnya sejak awal: lihat produk, pilih paket, isi data seperlunya, selesaikan pembayaran, lalu cek progres pesanan tanpa kebingungan.",
    primary: { href: "/products", label: "Lihat semua produk" },
    secondary: { href: "/cek-pesanan", label: "Cek transaksi" }
  },
  {
    tag: "Lebih tenang saat order",
    title: "Informasi dibuat lebih rapi supaya pengguna baru langsung tahu langkah berikutnya tanpa banyak tanya.",
    body: "Kami sengaja menata ulang kata-kata dan susunan visual agar setiap tombol, badge, dan informasi harga terasa lebih masuk akal serta tidak terkesan seperti halaman yang dibuat asal cepat jadi.",
    primary: { href: "/products", label: "Mulai belanja" },
    secondary: { href: "/faq", label: "Lihat cara kerja" }
  },
  {
    tag: "Banner bisa diganti",
    title: "Area promo utama sekarang memakai banner PNG agar mudah disesuaikan dengan desain brand Anda sendiri.",
    body: "Cukup ganti file banner di folder public tanpa perlu mengubah struktur section. Bagian ini sengaja dibuat simpel supaya cocok untuk promo mingguan, best seller, atau informasi layanan terbaru.",
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
      className="relative overflow-hidden rounded-[28px] border shadow-[var(--shadow)]"
      style={{ background: "var(--card-strong)", borderColor: "var(--border)" }}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,var(--mesh-a),transparent_26%),radial-gradient(circle_at_bottom_right,var(--mesh-b),transparent_22%)]" />

      <div className="relative grid min-h-[380px] gap-8 p-6 sm:min-h-[440px] sm:p-8 xl:grid-cols-[1fr_0.92fr] xl:items-center xl:p-10">
        <div className="flex flex-col justify-center">
          <div className="inline-flex w-max rounded-full border px-4 py-2 text-[11px] font-bold uppercase tracking-[0.28em]" style={{ borderColor: "rgba(248, 201, 51, 0.22)", background: "var(--accent-soft)", color: "color-mix(in srgb, var(--foreground) 72%, var(--accent-strong))" }}>
            {slide.tag}
          </div>
          <h1 className="mt-5 max-w-3xl text-3xl font-black leading-tight sm:text-5xl" style={{ color: "var(--foreground)" }}>
            {slide.title}
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-8 sm:text-base" style={{ color: "var(--foreground-soft)" }}>
            {slide.body}
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link href={slide.primary.href} className="primary-button">
              {slide.primary.label}
            </Link>
            <Link href={slide.secondary.href} className="secondary-button">
              {slide.secondary.label}
            </Link>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-[24px] border" style={{ borderColor: "var(--border)", background: "var(--card)" }}>
          <Image
            src="/banner-home.png"
            alt="Banner promo utama Kograph Premium"
            width={1200}
            height={800}
            className="h-full min-h-[260px] w-full object-cover"
            priority
          />
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#0b0e11]/80 via-[#0b0e11]/35 to-transparent p-5">
            <div className="rounded-[18px] border px-4 py-3 backdrop-blur-sm" style={{ borderColor: "rgba(255,255,255,0.10)", background: "rgba(11,14,17,0.42)", color: "#f8fafc" }}>
              Ganti file ini dengan desain banner PNG Anda di <span className="font-bold">public/banner-home.png</span>.
            </div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-5 right-5 flex items-center gap-2">
        <button
          type="button"
          onClick={() => setActive((prev) => (prev - 1 + slides.length) % slides.length)}
          className="flex h-11 w-11 items-center justify-center rounded-full border transition hover:opacity-90"
          style={{ borderColor: "var(--border)", background: "var(--card)", color: "var(--foreground)" }}
          aria-label="Slide sebelumnya"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <button
          type="button"
          onClick={() => setActive((prev) => (prev + 1) % slides.length)}
          className="flex h-11 w-11 items-center justify-center rounded-full border transition hover:opacity-90"
          style={{ borderColor: "var(--border)", background: "var(--card)", color: "var(--foreground)" }}
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
            className="h-2.5 rounded-full transition-all"
            style={{ width: index === active ? 40 : 10, background: index === active ? "var(--accent-strong)" : "color-mix(in srgb, var(--foreground) 24%, transparent)" }}
            aria-label={`Pindah ke slide ${index + 1}`}
          />
        ))}
      </div>
    </section>
  );
}
