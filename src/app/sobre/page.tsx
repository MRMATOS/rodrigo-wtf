"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useT } from "@/contexts/LanguageContext";

function CopyEmail() {
  const [copied, setCopied] = useState(false);
  function handleCopy() {
    navigator.clipboard.writeText("oi@rodrigo.wtf");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }
  return (
    <button
      onClick={handleCopy}
      className="font-body text-xs font-bold lowercase tracking-widest opacity-60 hover:opacity-100 hover:text-blue dark:hover:text-acid text-left"
      style={{ transitionTimingFunction: "steps(1)", transitionDuration: "0s", transitionProperty: "opacity, color" }}
    >
      // {copied ? "copiado!" : "oi@rodrigo.wtf"}
    </button>
  );
}

function ToggleButton({
  summarized,
  onToggle,
  t,
}: {
  summarized: boolean;
  onToggle: () => void;
  t: { btnSummarize: string; btnExpand: string };
}) {
  return (
    <button
      onClick={onToggle}
      className="brutal-btn brutal-btn-adaptive self-start px-4 py-2 font-body text-xs font-bold uppercase tracking-widest"
      style={{ transitionTimingFunction: "steps(1)", transitionDuration: "0s", transitionProperty: "background-color, color, border-color" }}
    >
      {summarized ? t.btnExpand : t.btnSummarize}
    </button>
  );
}

export default function Sobre() {
  const [summarized, setSummarized] = useState(false);
  const articleRef = useRef<HTMLElement>(null);
  const { t } = useT();

  const FULL_CONTENT = t.about.sections as readonly { quote: string; body: string; bullets?: readonly string[] }[];
  const SUMMARY_LINES = t.about.summaryLines as readonly string[];

  function handleToggle(scrollUp: boolean) {
    setSummarized((s) => !s);
    if (scrollUp) {
      setTimeout(() => {
        if (!articleRef.current) return;
        const y = articleRef.current.getBoundingClientRect().top + window.scrollY - 96;
        window.scrollTo({ top: y, behavior: "smooth" });
      }, 50);
    }
  }

  return (
    <main id="main-content" className="grid grid-cols-4 gap-4 md:gap-8">

      {/* Hero */}
      <header className="col-span-4 border-3 border-border brutal-shadow bg-background p-8 md:p-12 lg:py-24 lg:px-12">
        <h1 className="font-heading text-[clamp(3rem,6vw,12rem)] font-bold uppercase leading-[1.1] tracking-tight">
          {t.about.heroTitle}
        </h1>
        <p className="font-body text-base md:text-lg text-muted mt-4 relative z-[1] max-w-xl">
          {t.about.heroSubtitle}
        </p>
      </header>

      {/* Photo — mobile: full width; desktop: sidebar */}
      <aside className="col-span-4 md:col-span-1 border-3 border-border brutal-shadow bg-background flex flex-col">
        <div className="relative w-full aspect-square md:aspect-auto md:flex-1 min-h-[280px] overflow-hidden">
          <Image
            src="/About-Image.JPG"
            alt="Foto de Rodrigo Matos"
            fill
            sizes="(max-width: 768px) 100vw, 25vw"
            quality={90}
            className="object-cover object-[center_50%] md:object-top"
          />
        </div>
        <div className="border-t-3 border-border p-4 flex flex-col gap-1">
          {[
            { label: "whatsapp", href: "https://wa.me/5542998703287" },
            { label: "linkedin", href: "https://www.linkedin.com/in/rodrigomatosco/" },
            { label: "facebook", href: "https://www.facebook.com/rodrigomatos.wtf" },
            { label: "youtube", href: "https://www.youtube.com/@matos.rodrigo" },
          ].map(({ label, href }) => (
            <a
              key={label}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="font-body text-xs font-bold lowercase tracking-widest opacity-60 hover:opacity-100 hover:text-blue dark:hover:text-acid"
              style={{ transitionTimingFunction: "steps(1)", transitionDuration: "0s", transitionProperty: "opacity, color" }}
            >
              // {label}
            </a>
          ))}
          <CopyEmail />
        </div>
      </aside>

      {/* Content */}
      <article ref={articleRef} className="col-span-4 md:col-span-3 border-3 border-border brutal-shadow bg-background p-8 md:p-12 flex flex-col gap-8">

        <ToggleButton summarized={summarized} onToggle={() => handleToggle(false)} t={t.about} />

        <div className="font-body text-base md:text-lg leading-relaxed">
          {summarized ? (
            <ul className="flex flex-col gap-3">
              {SUMMARY_LINES.map((line, i) => (
                <li key={i} className="flex gap-3 items-baseline">
                  <span className="font-bold text-blue dark:text-acid shrink-0 text-sm">&gt;</span>
                  <span>{line}</span>
                </li>
              ))}
            </ul>
          ) : (
            <div className="flex flex-col gap-10">
              {FULL_CONTENT.map((section) => (
                <section key={section.quote} className="flex flex-col gap-4">
                  <blockquote className="font-heading text-xl md:text-2xl font-bold uppercase border-l-3 border-blue dark:border-acid pl-4">
                    &ldquo;{section.quote}&rdquo;
                  </blockquote>
                  {section.body.split("\n\n").map((para, i) => (
                    <p key={i} className="opacity-80">{para}</p>
                  ))}
                  {section.bullets && (
                    <ul className="flex flex-col gap-2 mt-1">
                      {section.bullets.map((b, i) => (
                        <li key={i} className="flex gap-3 items-baseline">
                          <span className="font-bold text-blue dark:text-acid shrink-0">—</span>
                          <span className="opacity-80">{b}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </section>
              ))}
            </div>
          )}
        </div>

        <ToggleButton summarized={summarized} onToggle={() => handleToggle(!summarized)} t={t.about} />

      </article>

      {/* CTA Final */}
      <article className="col-span-4 border-3 border-border brutal-shadow bg-background p-8 md:p-12">
        <h2 className="font-heading text-[clamp(2rem,5vw,4rem)] font-bold uppercase leading-tight mb-6 text-foreground">
          {t.about.ctaTitle}
        </h2>
        <div className="flex flex-col gap-6">
          <p className="font-body text-lg md:text-xl font-medium max-w-3xl text-foreground">
            {t.about.ctaText}
          </p>
          <div className="flex flex-col gap-3 items-start">
            <Link
              href="https://wa.me/5542998703287"
              target="_blank"
              rel="noopener noreferrer"
              className="brutal-btn brutal-btn-adaptive px-8 md:px-12 py-4 md:py-5 font-body text-lg md:text-xl font-bold uppercase tracking-wide text-center"
            >
              {t.about.ctaBtn}
            </Link>
            <span className="font-body text-sm font-bold text-foreground opacity-70">
              {t.about.ctaNote}
            </span>
          </div>
        </div>
      </article>

    </main>
  );
}
