"use client";

import { useCallback, useEffect, useState } from "react";

const slides = [
  {
    key: "1",
    title: "STREETSCENE",
    src: "https://images.unsplash.com/photo-1523381210438-271e8be1f52b?auto=format&fit=crop&w=1600&q=80",
  },
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
  const next = useCallback(() => setI((x) => (x + 1) % slides.length), []);
  const prev = useCallback(() => setI((x) => (x - 1 + slides.length) % slides.length), []);

  useEffect(() => {
    const t = setInterval(next, 7000);
    return () => clearInterval(t);
  }, [next]);

  const s = slides[i];

  return (
    <section className="hero" aria-roledescription="carousel">
      <div className="hero-viewport">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img key={s.key} src={s.src} alt="" className="hero-img" />
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
