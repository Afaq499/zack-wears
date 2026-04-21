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
    <div className="product-gallery">
      <div className="product-gallery-thumbs">
        {safeImages.slice(0, maxThumbs).map((src, i) => {
          const active = i === activeIdx;
          return (
            <button
              key={`${src}-${i}`}
              type="button"
              onClick={() => setActiveIdx(i)}
              aria-label={`View image ${i + 1} of ${productName}`}
              aria-current={active ? "true" : undefined}
              className={`product-gallery-thumb ${active ? "is-active" : ""}`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt="" className="product-gallery-thumb-img" />
            </button>
          );
        })}
      </div>

      <div className="product-gallery-main">
        {activeSrc ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={activeSrc} alt={productName} className="product-gallery-main-img" />
        ) : null}
      </div>
    </div>
  );
}

