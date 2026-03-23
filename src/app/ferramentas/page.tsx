"use client";

import Link from "next/link";
import { useT } from "@/contexts/LanguageContext";

export default function Ferramentas() {
  const { t } = useT();

  const tool = t.tools.tool1;
  const statusColor = "bg-acid text-[#000000]";

  return (
    <main id="main-content" className="grid grid-cols-4 gap-4 md:gap-8">
      {/* ═══════════ HERO ═══════════ */}
      <header className="col-span-4 border-3 border-border brutal-shadow bg-background relative p-8 md:p-12 lg:py-24 lg:px-12">
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
          {t.tools.heroTitle}
        </h1>
        <p className="font-body text-base md:text-lg text-muted mt-4 relative z-[1] max-w-xl">
          {t.tools.heroSubtitle}
        </p>
      </header>

      {/* ═══════════ TOOLS LIST ═══════════ */}
      <article
        className="col-span-4 border-3 border-border brutal-shadow bg-background p-6 md:p-10 flex flex-col gap-6"
      >
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-3 flex-wrap">
              <h2 className="font-heading text-2xl md:text-4xl font-bold uppercase">
                {tool.name}
              </h2>
              <span
                className={`font-body text-xs font-bold uppercase tracking-widest px-2 py-1 border-3 border-border ${statusColor}`}
              >
                {tool.status}
              </span>
            </div>
            <p className="font-body text-sm font-bold text-muted uppercase tracking-wide">
              {tool.tagline}
            </p>
          </div>
        </div>

        <p className="font-body text-base md:text-lg leading-relaxed max-w-3xl">
          {tool.description}
        </p>

        <div className="flex flex-col sm:flex-row items-start gap-4">
          <Link
            href="/ferramentas/mapa-do-sossego"
            className="brutal-btn brutal-btn-adaptive px-8 py-4 font-body text-base font-bold uppercase tracking-wide"
          >
            {t.tools.openBtn}
          </Link>
          <div className="flex gap-2 flex-wrap">
            {tool.tags.map((tag) => (
              <span
                key={tag}
                className="font-body text-xs font-bold uppercase tracking-widest px-2 py-1 border-3 border-border bg-background text-muted"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </article>
    </main>
  );
}
