"use client";

import { useRef, useState } from "react";
import { useT } from "@/contexts/LanguageContext";

export default function ProcessoBlock() {
  const [exampleIndex, setExampleIndex] = useState<number | null>(null);
  const topRef = useRef<HTMLDivElement>(null);
  const { t } = useT();

  const STEPS = t.services.processSteps as readonly string[];
  const EXAMPLES = t.services.processExamples as readonly { label: string; steps: readonly string[] }[];

  function handleNext() {
    setExampleIndex((prev) =>
      prev === null ? 0 : (prev + 1) % EXAMPLES.length
    );
    setTimeout(() => {
      if (!topRef.current) return;
      const y = topRef.current.getBoundingClientRect().top + window.scrollY - 220;
      window.scrollTo({ top: y, behavior: "smooth" });
    }, 50);
  }

  const current = exampleIndex !== null ? EXAMPLES[exampleIndex] : null;

  return (
    <div className="flex flex-col gap-6">
      {/* Steps */}
      <div ref={topRef} className="flex flex-col gap-4">
        {STEPS.map((step, i) => (
          <div key={i} className="flex gap-4 items-start">
            <span className="font-heading text-2xl md:text-3xl font-bold text-blue dark:text-acid shrink-0 leading-tight">
              {String(i + 1).padStart(2, "0")}
            </span>
            <div className="flex flex-col gap-1 pt-1">
              <p className="font-body text-base md:text-lg font-bold leading-snug">
                {step}
              </p>
              {current && (
                <p className="font-body text-sm md:text-base text-muted leading-relaxed border-l-3 border-blue dark:border-acid pl-3 mt-1">
                  {current.steps[i]}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Button */}
      <div className="flex items-center gap-4 mt-2">
        <button
          onClick={handleNext}
          className="brutal-btn brutal-btn-adaptive px-6 py-3 font-body text-sm font-bold uppercase tracking-wide"
        >
          {current ? t.services.processBtnNext : t.services.processBtnSee}
        </button>
        {current && (
          <span className="font-body text-sm font-bold uppercase tracking-widest text-muted">
            // {current.label}
          </span>
        )}
      </div>
    </div>
  );
}
