"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";

const FULL_CONTENT = [
  {
    quote: "Eu cansei de arrastar botão",
    body: `Por muito tempo, fui o cara do UX/UI que dominava variáveis e interações complexas no Figma. Quase montei um curso sobre isso. Mas a verdade é que, depois que a Inteligência Artificial chegou, ficar travado desenhando cada pixel de um botão antes de ver o código rodar virou perda de tempo.

Hoje, meu fluxo é AI First. O Figma virou meu rascunho, meu "canvas" básico para ajustes rápidos. Eu não quero passar horas e dias em um protótipo bonitinho que não funciona; eu quero entregar a solução na mão do usuário e ver o que acontece.`,
  },
  {
    quote: "Detector de Burocracia",
    body: `Minha cabeça funciona como um radar para processos lentos. Se eu vejo alguém anotando informação em papel, imprimindo só por costume ou simplesmente ignorando soluções simples, eu começo a questionar e logo quero resolver.

Eu não sou o programador tradicional, nunca fiz um curso ou faculdade da área, mas eu sei resolver e entregar, muitas vezes melhor do que alguém formado.`,
    bullets: [
      "Eu saio da cadeira: Vou até o usuário, gravo áudio, observo o caos e entendo o fluxo real.",
      "Uso a IA como alavanca: Traduzo a dor do usuário em lógica e uso a tecnologia para construir rápido.",
      "Resolvo de fato: Posso entregar um app provisório, um estudo de caso real ou uma ferramenta completa. O que importa é que o problema pare de existir.",
    ],
  },
  {
    quote: "Visão Panorâmica",
    body: `Com background em Publicidade e mídia, eu não olho só para o código. Olho para o negócio. Entendo que empresas grandes precisam de arquiteturas complexas, mas sei que pequenas e médias empresas precisam de agilidade e soluções que resolvam o "agora".

Eu uso IA para aprender, desenvolver, aplicar e solucionar. Simples assim.`,
  },
];

const SUMMARY_LINES = [
  "Desenvolvedor não-tradicional.",
  "Uso inteligência artificial para aprender, criar e aplicar soluções.",
  "Detector de Burocracia.",
  "Ansioso por resolver problemas.",
  "Formado em Publicidade há 9 anos.",
  "Músico, escritor e fotógrafo.",
];

function ToggleButton({
  summarized,
  onToggle,
}: {
  summarized: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      onClick={onToggle}
      className="brutal-btn brutal-btn-adaptive self-start px-4 py-2 font-body text-xs font-bold uppercase tracking-widest"
      style={{ transitionTimingFunction: "steps(1)", transitionDuration: "0s", transitionProperty: "background-color, color, border-color" }}
    >
      {summarized ? "[+] Desresumir" : "[–] Resumir"}
    </button>
  );
}

export default function Sobre() {
  const [summarized, setSummarized] = useState(false);

  return (
    <main id="main-content" className="grid grid-cols-4 gap-4 md:gap-8">

      {/* Hero */}
      <header className="col-span-4 border-3 border-border brutal-shadow bg-background p-8 md:p-12 lg:py-24 lg:px-12">
        <h1 className="font-heading text-[clamp(3rem,6vw,12rem)] font-bold uppercase leading-[1.1] tracking-tight">
          WTF, Rodrigo?
        </h1>
        <p className="font-body text-base md:text-lg text-muted mt-4 relative z-[1] max-w-xl">
          // Tempo
        </p>
      </header>

      {/* Photo — mobile: full width; desktop: sidebar */}
      <aside className="col-span-4 md:col-span-1 border-3 border-border brutal-shadow bg-background flex flex-col">
        <div className="relative w-full aspect-square md:aspect-auto md:flex-1 min-h-[280px] overflow-hidden">
          <Image
            src="/eu2.png"
            alt="Foto de Rodrigo Matos"
            fill
            sizes="(max-width: 768px) 100vw, 25vw"
            className="object-cover object-[center_50%] md:object-top"
          />
        </div>
        <div className="border-t-3 border-border p-4 flex flex-col gap-1">
          {[
            { label: "whatsapp", href: "https://wa.me/5542998703287" },
            { label: "linkedin", href: "https://www.linkedin.com/in/rodrigomatosco/" },
            { label: "facebook", href: "https://www.facebook.com/rodrigomatos.wtf" },
            { label: "instagram", href: "https://instagram.com/rodrigomatos.wtf" },
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
        </div>
      </aside>

      {/* Content */}
      <article className="col-span-4 md:col-span-3 border-3 border-border brutal-shadow bg-background p-8 md:p-12 flex flex-col gap-8">

        <ToggleButton summarized={summarized} onToggle={() => setSummarized((s) => !s)} />

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
                    "{section.quote}"
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

        <ToggleButton summarized={summarized} onToggle={() => setSummarized((s) => !s)} />

      </article>

      {/* CTA Final */}
      <article className="col-span-4 border-3 border-border brutal-shadow bg-background p-8 md:p-12">
        <h2 className="font-heading text-[clamp(2rem,5vw,4rem)] font-bold uppercase leading-tight mb-6 text-foreground">
          Vamos descobrir o que você realmente precisa?
        </h2>
        <div className="flex flex-col gap-6">
          <p className="font-body text-lg md:text-xl font-medium max-w-3xl text-foreground">
            Não tem essa de &ldquo;valor inbox&rdquo;. O projeto custa o que for
            necessário para resolver o seu problema específico. Vamos marcar uma
            conversa e analisar o seu cenário.
          </p>
          <div className="flex flex-col gap-3 items-start">
            <Link
              href="https://wa.me/5542998703287"
              target="_blank"
              rel="noopener noreferrer"
              className="brutal-btn brutal-btn-adaptive px-8 md:px-12 py-4 md:py-5 font-body text-lg md:text-xl font-bold uppercase tracking-wide text-center"
            >
              Quero agendar uma análise do meu negócio
            </Link>
            <span className="font-body text-sm font-bold text-foreground opacity-70">
              // isso vai abrir o WhatsApp, mas só coloquei um texto tipo profissional
            </span>
          </div>
        </div>
      </article>

    </main>
  );
}
