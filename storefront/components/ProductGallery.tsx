"use client";

import * as React from "react";

type Props = {
  images: string[];
  productName: string;
  maxThumbs?: number;
};

export default function ProductGallery({ images, productName, maxThumbs = 4 }: Props) {
  const safeImages = Array.isArray(images) ? images.filter(Boolean) : [];
  const [activeIdx, setActiveIdx] = React.useState(0);

  const activeSrc = safeImages[activeIdx] ?? safeImages[0] ?? "";

  return (
    <div style={{ display: "grid", gridTemplateColumns: "92px 1fr", gap: "0.75rem", alignItems: "start" }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {safeImages.slice(0, maxThumbs).map((src, i) => {
          const active = i === activeIdx;
          return (
            <button
              key={`${src}-${i}`}
              type="button"
              onClick={() => setActiveIdx(i)}
              aria-label={`View image ${i + 1} of ${productName}`}
              aria-current={active ? "true" : undefined}
              style={{
                padding: 0,
                border: active ? "2px solid var(--text)" : "1px solid var(--border)",
                background: "transparent",
                borderRadius: 2,
                cursor: "pointer",
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={src}
                alt=""
                style={{
                  width: "100%",
                  aspectRatio: "1 / 1",
                  objectFit: "cover",
                  display: "block",
                }}
              />
            </button>
          );
        })}
      </div>

      <div style={{ aspectRatio: "4 / 5", background: "#f4f4f4", border: "1px solid var(--border)" }}>
        {activeSrc ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={activeSrc}
            alt={productName}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        ) : null}
      </div>
    </div>
  );
}

