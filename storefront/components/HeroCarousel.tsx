"use client";

import { useCallback, useEffect, useState } from "react";

const fallbackSvg = encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 700">
    <defs>
      <linearGradient id="g" x1="0" x2="1" y1="0" y2="1">
        <stop offset="0" stop-color="#111"/>
        <stop offset="1" stop-color="#333"/>
      </linearGradient>
    </defs>
    <rect width="1600" height="700" fill="url(#g)"/>
  </svg>`
);
const fallbackSrc = `data:image/svg+xml;charset=utf-8,${fallbackSvg}`;

const slides = [
  {
    key: "2",
    title: "NEW SEASON",
    src: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1600&q=80",
  },
  {
    key: "3",
    title: "ESSENTIALS",
    src: "https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&fit=crop&w=1600&q=80",
  },
];

export default function HeroCarousel() {
  const [i, setI] = useState(0);
  const [broken, setBroken] = useState<Record<string, boolean>>({});
  const next = useCallback(() => setI((x) => (x + 1) % slides.length), []);
  const prev = useCallback(() => setI((x) => (x - 1 + slides.length) % slides.length), []);

  useEffect(() => {
    const t = setInterval(next, 7000);
    return () => clearInterval(t);
  }, [next]);

  const s = slides[i];
  const src = broken[s.key] ? fallbackSrc : s.src;

  return (
    <section className="hero" aria-roledescription="carousel">
      <div className="hero-viewport">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          key={s.key}
          src={src}
          alt=""
          className="hero-img"
          loading={i === 0 ? "eager" : "lazy"}
          onError={() => setBroken((m) => (m[s.key] ? m : { ...m, [s.key]: true }))}
        />
        <div className="hero-scrim" />
        <h2 className="hero-title">{s.title}</h2>
        <button type="button" className="hero-nav hero-nav--prev" onClick={prev} aria-label="Previous slide">
          ‹
        </button>
        <button type="button" className="hero-nav hero-nav--next" onClick={next} aria-label="Next slide">
          ›
        </button>
      </div>
    </section>
  );
}
