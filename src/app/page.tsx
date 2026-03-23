"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import HeroRotatingText from "@/components/HeroRotatingText";
import { useT } from "@/contexts/LanguageContext";

export default function Home() {
  const [isImageVisible, setIsImageVisible] = useState(false);
  const imageRef = useRef<HTMLDivElement>(null);
  const { t } = useT();

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsImageVisible(entry.isIntersecting);
      },
      {
        root: null,
        rootMargin: "0px",
        threshold: 0.5,
      }
    );

    if (imageRef.current) {
      observer.observe(imageRef.current);
    }

    return () => {
      if (imageRef.current) {
        observer.unobserve(imageRef.current);
      }
    };
  }, []);

  const exampleLinks = [
    undefined,
    { label: "tibia.today", href: "https://tibia.today", external: true },
    { label: t.home.examples[2].linkLabel!, href: "/ferramentas" },
    { label: t.home.examples[3].linkLabel!, href: "/conteudo/sites-e-aplicativos/meu-primeiro-app-funcional" },
  ];

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
        <h1 className="font-heading text-[clamp(3rem,6vw,12rem)] font-bold uppercase leading-[1.1] tracking-tight relative z-[1]">
          {t.home.heroMain}<span className="hidden md:inline"> </span>
          <br className="md:hidden" />
          <HeroRotatingText />
        </h1>
      </header>

      {/* ═══════════ QUAL É O PROBLEMA? ═══════════ */}
      <article className="col-span-4 border-3 border-border brutal-shadow bg-background text-foreground p-8 md:p-12 flex flex-col gap-8">
        <span className="font-body text-blue dark:text-acid tracking-widest text-sm uppercase">{t.home.problemsLabel}</span>

        <div className="flex flex-col gap-4">
          <h2 className="font-heading text-[clamp(2rem,4vw,5rem)] font-bold uppercase leading-tight max-w-5xl">
            {t.home.problemsTitle}
          </h2>
          <p className="font-heading text-[clamp(2rem,4vw,5rem)] font-bold uppercase leading-tight text-blue dark:text-acid">
            {t.home.problemsEmpathy}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 font-body text-base md:text-lg leading-relaxed">
          {t.home.examples.map((example, i) => (
            <div key={i} className="border-l-4 border-blue dark:border-acid pl-6">
              <span className="text-blue dark:text-acid font-bold mr-2">[{i + 1}]</span>
              {example.text}{" "}
              {exampleLinks[i] && (
                <Link
                  href={exampleLinks[i]!.href}
                  {...("external" in exampleLinks[i]! && exampleLinks[i]!.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                  className="underline underline-offset-4 hover:text-blue dark:hover:text-acid font-bold"
                >
                  {exampleLinks[i]!.label}
                </Link>
              )}
              {"suffix" in example && example.suffix && <>{" "}{example.suffix}</>}
            </div>
          ))}
        </div>
      </article>

      {/* ═══════════ CASO REAL ═══════════ */}
      <article className="col-span-4 border-3 border-border brutal-shadow bg-background p-8 md:p-12 flex flex-col gap-8">
        <p className="font-body text-sm font-bold uppercase tracking-widest text-muted">
          {t.home.caseLabel}
        </p>
        <h2 className="font-heading text-[clamp(2rem,4vw,5rem)] font-bold uppercase leading-tight max-w-4xl">
          {t.home.caseTitle}
        </h2>
        <p className="font-body text-base md:text-lg leading-relaxed max-w-3xl">
          {t.home.caseText}
        </p>
        <blockquote className="font-heading text-xl md:text-2xl font-bold uppercase border-l-3 border-blue dark:border-acid pl-5 text-foreground max-w-2xl">
          &ldquo;{t.home.caseQuote}&rdquo;
        </blockquote>
        <Link
          href="/conteudo/sites-e-aplicativos/arbalest-digital"
          className="brutal-btn brutal-btn-adaptive px-6 py-3 font-body text-sm font-bold uppercase tracking-wide self-start"
        >
          {t.home.caseCta}
        </Link>
      </article>

      {/* ═══════════ EU QUEM? ═══════════ */}
      <article
        id="about"
        className="col-span-4 border-3 border-border brutal-shadow bg-background p-6 md:p-12 flex flex-col gap-8"
      >
        <h2 className="font-heading text-[clamp(2.5rem,5vw,4rem)] font-bold uppercase leading-none">
          {t.home.aboutTitle}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-[300px_1fr] gap-8 md:gap-12">
          {/* Image */}
          <div
            ref={imageRef}
            className="border-3 border-border bg-foreground min-h-[300px] md:min-h-[400px] overflow-hidden relative"
          >
            <Image
              src="/Home-Image.png"
              alt="Foto do Rodrigo"
              fill
              sizes="(max-width: 768px) 100vw, 300px"
              quality={90}
              className={`object-cover transition-none md:hover:grayscale-0 md:hover:contrast-[1.1] ${isImageVisible ? "grayscale-0 contrast-[1.1]" : "grayscale contrast-[1.2]"}`}
              priority
            />
          </div>

          {/* Content */}
          <div className="flex flex-col justify-center gap-6">
            <div className="border-3 border-border bg-background text-foreground p-6 md:p-8 font-body text-base md:text-lg leading-relaxed flex flex-col gap-4">
              <p>
                <span className="text-blue dark:text-acid font-bold">&gt;</span> {t.home.aboutLine1}
              </p>
              <p>
                <span className="text-blue dark:text-acid font-bold">&gt;</span> {t.home.aboutLine2}
              </p>
              <p><span className="text-blue dark:text-acid font-bold">&gt;</span> {t.home.aboutLine3}</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/sobre"
                className="brutal-btn brutal-btn-adaptive px-6 py-3 font-body text-sm font-bold uppercase tracking-wide text-center"
              >
                {t.home.aboutBtnAbout}
              </Link>
              <Link
                href="/ferramentas"
                className="brutal-btn brutal-btn-adaptive px-6 py-3 font-body text-sm font-bold uppercase tracking-wide text-center"
              >
                {t.home.aboutBtnTools}
              </Link>
            </div>
          </div>
        </div>
      </article>



{/* ═══════════ CTA FINAL ═══════════ */}
      <article className="col-span-4 border-3 border-border brutal-shadow bg-background p-8 md:p-12">
        <h2 className="font-heading text-[clamp(2rem,5vw,4rem)] font-bold uppercase leading-tight mb-6 text-foreground">
          {t.home.ctaTitle}
        </h2>
        <div className="flex flex-col gap-6">
          <p className="font-body text-lg md:text-xl font-medium max-w-3xl text-foreground">
            {t.home.ctaText}
          </p>
          <div className="flex flex-col gap-3 items-start">
            <Link
              href="https://wa.me/5542998703287"
              target="_blank"
              rel="noopener noreferrer"
              className="brutal-btn brutal-btn-adaptive px-8 md:px-12 py-4 md:py-5 font-body text-lg md:text-xl font-bold uppercase tracking-wide text-center"
            >
              {t.home.ctaBtn}
            </Link>
            <span className="font-body text-sm font-bold text-foreground opacity-70">
              {t.home.ctaNote}
            </span>
          </div>
        </div>
      </article>
    </main>
  );
}
