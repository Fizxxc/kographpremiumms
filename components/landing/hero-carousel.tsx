"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export type HeroBannerItem = {
  id?: string;
  image_url: string;
  title?: string | null;
  button_href?: string | null;
};

export default function HeroCarousel({ slides = [] }: { slides?: HeroBannerItem[] }) {
  const fallbackSlides = useMemo<HeroBannerItem[]>(() => [{ image_url: "/banner-home.png", title: "Banner utama" }], []);
  const preparedSlides = slides.length > 0 ? slides.filter((item) => Boolean(item.image_url)) : fallbackSlides;
  const [active, setActive] = useState(0);
  const enableNavigation = preparedSlides.length > 1;

  useEffect(() => {
    if (!enableNavigation) return;
    const timer = window.setInterval(() => {
      setActive((prev) => (prev + 1) % preparedSlides.length);
    }, 5500);
    return () => window.clearInterval(timer);
  }, [enableNavigation, preparedSlides.length]);

  useEffect(() => {
    if (active >= preparedSlides.length) setActive(0);
  }, [active, preparedSlides.length]);

  const current = preparedSlides[active] || fallbackSlides[0];

  return (
    <section
      className="relative overflow-hidden rounded-[32px] border shadow-[var(--shadow)]"
      style={{ borderColor: "var(--border)", background: "var(--card-strong)" }}
    >
      <div className="relative h-[230px] sm:h-[320px] lg:h-[430px]">
        <Image
          src={current.image_url}
          alt={current.title || "Banner promo utama Kograph Premium"}
          fill
          priority
          className="object-cover"
          unoptimized
        />

        {current.button_href ? (
          <a
            href={current.button_href}
            className="absolute inset-0 z-10"
            aria-label={current.title || "Buka banner promo"}
          />
        ) : null}

        {enableNavigation ? (
          <>
            <button
              type="button"
              onClick={() => setActive((prev) => (prev - 1 + preparedSlides.length) % preparedSlides.length)}
              className="absolute left-4 top-1/2 z-20 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border text-white transition hover:opacity-90 sm:left-6"
              style={{ borderColor: "rgba(255,255,255,0.16)", background: "rgba(11,14,17,0.28)" }}
              aria-label="Slide sebelumnya"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={() => setActive((prev) => (prev + 1) % preparedSlides.length)}
              className="absolute right-4 top-1/2 z-20 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border text-white transition hover:opacity-90 sm:right-6"
              style={{ borderColor: "rgba(255,255,255,0.16)", background: "rgba(11,14,17,0.28)" }}
              aria-label="Slide berikutnya"
            >
              <ChevronRight className="h-5 w-5" />
            </button>

            <div className="absolute bottom-5 left-1/2 z-20 flex -translate-x-1/2 gap-2">
              {preparedSlides.map((_, index) => (
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
          </>
        ) : null}
      </div>
    </section>
  );
}
