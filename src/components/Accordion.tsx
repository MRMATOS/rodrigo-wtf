"use client";

import { useState } from "react";

interface AccordionItemProps {
  index: number;
  title: string;
  symbol: string;
  children: React.ReactNode;
}

function AccordionItem({ index, title, symbol, children }: AccordionItemProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border-3 border-border brutal-shadow">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 md:px-8 py-5 md:py-6 text-left hover:bg-acid active:bg-acid hover:text-[#000000] active:text-[#000000] focus-visible:outline-3 focus-visible:outline-acid min-h-[44px]"
        style={{
          transitionTimingFunction: "steps(1)",
          transitionDuration: "0s",
          transitionProperty: "background-color, color",
        }}
        aria-expanded={open}
      >
        <div className="flex items-center gap-3 md:gap-5">
          <span className="font-body text-sm md:text-base opacity-70 shrink-0">
            {symbol}
          </span>
          <span className="font-heading text-lg md:text-2xl font-bold uppercase leading-tight">
            {String(index).padStart(2, "0")}. {title}
          </span>
        </div>
        <span
          className="font-heading text-2xl md:text-3xl font-bold shrink-0 ml-4"
          aria-hidden="true"
        >
          {open ? "[-]" : "[+]"}
        </span>
      </button>

      <div
        className="accordion-content"
        style={{
          maxHeight: open ? "2000px" : "0px",
          opacity: open ? 1 : 0,
        }}
        role="region"
      >
        <div className="px-4 md:px-8 pb-6 md:pb-8 border-t-3 border-border">
          <div className="pt-6 font-body text-base md:text-lg leading-relaxed max-w-prose">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

export { AccordionItem };
