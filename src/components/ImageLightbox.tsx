"use client";

import { useEffect, useRef, useState } from "react";

interface Props {
  src: string;
  alt: string;
  onClose: () => void;
}

export default function ImageLightbox({ src, alt, onClose }: Props) {
  const [isLandscape, setIsLandscape] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  // ESC to close
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose]);

  const handleLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    setIsLandscape(img.naturalWidth > img.naturalHeight);
  };

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/70"
      onClick={onClose}
    >
      {isLandscape ? (
        <div
          ref={scrollRef}
          className="overflow-x-auto w-[95vw] md:w-[92vw]"
          style={{ maxHeight: "75vh" }}
        >
          <img
            src={src}
            alt={alt}
            className="border-3 border-border block mx-auto"
            style={{ height: "70vh", width: "auto", maxWidth: "none" }}
            onClick={(e) => e.stopPropagation()}
            onLoad={handleLoad}
          />
        </div>
      ) : (
        <img
          src={src}
          alt={alt}
          className="max-w-[75vw] max-h-[70vh] md:max-w-[90vw] md:max-h-[85vh] border-3 border-border object-contain"
          onClick={(e) => e.stopPropagation()}
          onLoad={handleLoad}
        />
      )}
    </div>
  );
}
