"use client";

import Link from "next/link";
import { AccordionItem } from "@/components/Accordion";
import ProcessoBlock from "./_components/ProcessoBlock";
import { useT } from "@/contexts/LanguageContext";

export default function Servicos() {
  const { t } = useT();
  return (
    <main id="main-content" className="grid grid-cols-4 gap-4 md:gap-8">
      {/* ═══════════ HERO ═══════════ */}
      <header className="col-span-4 border-3 border-border brutal-shadow bg-background relative p-8 md:p-12 lg:py-24 lg:px-12">
        {/* Noise overlay */}
        <div
          className="absolute inset-0 pointer-events-none z-0 opacity-[0.06]"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.08'/%3E%3C/svg%3E\")",
            backgroundRepeat: "repeat",
            backgroundSize: "200px 200px",
          }}
        />
        <h1 className="font-heading text-[clamp(3rem,6vw,10rem)] font-bold uppercase leading-[1.1] tracking-tight relative z-[1]">
          {t.services.heroTitle}{" "}
          <span className="relative inline-block mb-1 md:mb-0">
            <span className="pl-2 pr-[8px] md:pr-[16px]">{t.services.heroHighlight}</span>
            <span
              className="absolute left-0 top-0 w-full h-full pl-2 pr-[8px] md:pr-[16px] bg-acid text-[#000000] animate-selection-w1"
              aria-hidden="true"
            >
              {t.services.heroHighlight}
            </span>
          </span>
        </h1>
        <p className="font-body text-base md:text-lg text-muted mt-4 relative z-[1] max-w-xl">
          {t.services.heroSubtitle}
        </p>
      </header>

      {/* ═══════════ INTRO TEXT ═══════════ */}
      <article className="col-span-4 border-3 border-border brutal-shadow bg-blue text-[#FFFFFF] p-8 md:p-12">
        <div className="font-body text-base md:text-lg leading-relaxed flex flex-col gap-6 max-w-3xl">
          <p>{t.services.introText}</p>
          <ul className="flex flex-col gap-2 pl-2">
            {t.services.capabilities.map((item) => (
              <li key={item} className="flex gap-3 items-baseline">
                <span className="font-bold text-acid shrink-0">—</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
          <p>
            {t.services.introEmphasis}
          </p>
        </div>
        <h3 className="font-heading text-xl md:text-2xl font-bold mt-12 text-acid">
          {t.services.introTransition}
        </h3>
      </article>

      {/* ═══════════ ACCORDIONS ═══════════ */}
      <article className="col-span-4 border-3 border-border brutal-shadow bg-background p-6 md:p-12 flex flex-col gap-6">
        <AccordionItem index={1} title={t.services.accordionProcess} symbol=">_">
          <ProcessoBlock />
        </AccordionItem>

        <AccordionItem index={2} title={t.services.accordionFaq} symbol="?_">
          <div className="flex flex-col gap-6">
            {t.services.faq.map(({ q, a }) => (
              <div key={q} className="flex flex-col gap-2">
                <p className="font-body font-bold text-base md:text-lg">{q}</p>
                <p className="font-body text-base md:text-lg text-muted leading-relaxed">{a}</p>
              </div>
            ))}
          </div>
        </AccordionItem>
      </article>

      {/* ═══════════ CTA FINAL ═══════════ */}
      <article className="col-span-4 border-3 border-border brutal-shadow bg-background p-8 md:p-12">
        <h2 className="font-heading text-[clamp(2rem,5vw,4rem)] font-bold uppercase leading-tight mb-6 text-foreground">
          {t.services.ctaTitle}
        </h2>
        <div className="flex flex-col gap-6">
          <p className="font-body text-lg md:text-xl font-medium max-w-3xl text-foreground">
            {t.services.ctaText}
          </p>
          <div className="flex flex-col gap-3 items-start">
            <Link
              href="https://wa.me/5542998703287"
              target="_blank"
              rel="noopener noreferrer"
              className="brutal-btn brutal-btn-adaptive px-8 md:px-12 py-4 md:py-5 font-body text-lg md:text-xl font-bold uppercase tracking-wide text-center"
            >
              {t.services.ctaBtn}
            </Link>
            <span className="font-body text-sm font-bold text-foreground opacity-70">
              {t.services.ctaNote}
            </span>
          </div>
        </div>
      </article>
    </main>
  );
}
