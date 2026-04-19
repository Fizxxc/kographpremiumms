"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const slides = [
  "/banner-home.png",
  "/banner-home.png",
  "/banner-home.png"
];

export default function HeroCarousel() {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActive((prev) => (prev + 1) % slides.length);
    }, 5500);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <section
      className="relative overflow-hidden rounded-[32px] border shadow-[var(--shadow)]"
      style={{ borderColor: "var(--border)", background: "var(--card-strong)" }}
    >
      <div className="relative h-[230px] sm:h-[320px] lg:h-[430px]">
        <Image
          src={slides[active]}
          alt="Banner promo utama Kograph Premium"
          fill
          priority
          className="object-cover"
        />

        <button
          type="button"
          onClick={() => setActive((prev) => (prev - 1 + slides.length) % slides.length)}
          className="absolute left-4 top-1/2 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border text-white transition hover:opacity-90 sm:left-6"
          style={{ borderColor: "rgba(255,255,255,0.16)", background: "rgba(11,14,17,0.28)" }}
          aria-label="Slide sebelumnya"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <button
          type="button"
          onClick={() => setActive((prev) => (prev + 1) % slides.length)}
          className="absolute right-4 top-1/2 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border text-white transition hover:opacity-90 sm:right-6"
          style={{ borderColor: "rgba(255,255,255,0.16)", background: "rgba(11,14,17,0.28)" }}
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
              style={{ width: index === active ? 34 : 10, background: index === active ? "#f3b203" : "rgba(255,255,255,0.55)" }}
              aria-label={`Pindah ke slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
