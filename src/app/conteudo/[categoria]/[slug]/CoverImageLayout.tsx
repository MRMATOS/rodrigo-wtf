"use client";

import { useEffect, useState } from "react";

interface Props {
  coverImage: string;
  title: string;
  children: React.ReactNode;
}

// Threshold: ratio > 1.3 = landscape (16:9 ≈ 1.78, 3:2 ≈ 1.5)
//             ratio ≤ 1.3 = portrait/square (4:3 ≈ 1.33, 1:1 = 1.0, 9:16 ≈ 0.56)
const LANDSCAPE_THRESHOLD = 1.3;

export default function CoverImageLayout({ coverImage, title, children }: Props) {
  const [isPortrait, setIsPortrait] = useState<boolean | null>(null);

  useEffect(() => {
    const img = new window.Image();
    img.onload = () => {
      setIsPortrait(img.naturalWidth / img.naturalHeight <= LANDSCAPE_THRESHOLD);
    };
    img.src = coverImage;
  }, [coverImage]);

  const detected = isPortrait !== null;

  return (
    <>
      {/* Mobile: always full width above article */}
      <div className="md:hidden col-span-4 border-3 border-border brutal-shadow overflow-hidden">
        <img
          src={coverImage}
          alt={`Capa — ${title}`}
          className="w-full max-h-[400px] object-cover"
        />
      </div>

      {/* Desktop landscape: full width above article */}
      {isPortrait === false && (
        <div className="hidden md:block col-span-4 border-3 border-border brutal-shadow overflow-hidden">
          <img
            src={coverImage}
            alt={`Capa — ${title}`}
            className="w-full max-h-[480px] object-cover"
          />
        </div>
      )}

      <article
        className={`col-span-4 border-3 border-border brutal-shadow bg-background p-8 md:p-12 transition-opacity duration-300 ${
          detected ? "opacity-100" : "opacity-0"
        }`}
      >
        {isPortrait ? (
          /* Portrait/square: children left, image right (desktop only — image is above on mobile) */
          <div className="md:grid md:grid-cols-[1fr_auto] md:gap-8 md:items-start">
            <div className="font-body text-base md:text-lg leading-relaxed">
              {children}
            </div>
            <div className="hidden md:block border-3 border-border overflow-hidden w-[280px] xl:w-[340px] shrink-0">
              <img
                src={coverImage}
                alt={`Capa — ${title}`}
                className="w-full object-cover"
              />
            </div>
          </div>
        ) : (
          /* Landscape or still detecting: plain content, image already above */
          <div className="font-body text-base md:text-lg leading-relaxed max-w-prose">
            {children}
          </div>
        )}
      </article>
    </>
  );
}
