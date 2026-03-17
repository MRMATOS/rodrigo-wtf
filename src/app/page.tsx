"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import HeroRotatingText from "@/components/HeroRotatingText";

export default function Home() {
  const [isImageVisible, setIsImageVisible] = useState(false);
  const imageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsImageVisible(entry.isIntersecting);
      },
      {
        root: null,
        rootMargin: "0px",
        threshold: 0.5, // Trigger when 50% of the image is visible
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
        <h1 className="font-heading text-[clamp(3rem,5vw,10rem)] font-bold uppercase leading-[1.1] tracking-tight relative z-[1]">
          Sim, eu faço<span className="hidden md:inline"> </span>
          <br className="md:hidden" />
          <HeroRotatingText />
        </h1>
      </header>

      {/* ═══════════ EU QUEM? ═══════════ */}
      <article
        id="about"
        className="col-span-4 border-3 border-border brutal-shadow bg-background p-6 md:p-12 flex flex-col gap-8"
      >
        <h2 className="font-heading text-[clamp(2.5rem,5vw,4rem)] font-bold uppercase leading-none">
          Eu quem?
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-[300px_1fr] gap-8 md:gap-12">
          {/* Image */}
          <div
            ref={imageRef}
            className="border-3 border-border bg-foreground min-h-[300px] md:min-h-[400px] overflow-hidden relative"
          >
            <Image
              src="/eu.png"
              alt="Foto do Rodrigo"
              fill
              sizes="(max-width: 768px) 100vw, 300px"
              className={`object-cover transition-none md:hover:grayscale-0 md:hover:contrast-[1.1] ${isImageVisible ? "grayscale-0 contrast-[1.1]" : "grayscale contrast-[1.2]"}`}
              priority
            />
          </div>

          {/* Content */}
          <div className="flex flex-col justify-center gap-6">
            <div className="border-3 border-border bg-background text-foreground p-6 md:p-8 font-body text-base md:text-lg leading-relaxed flex flex-col gap-4">
              <p>
                <span className="text-blue dark:text-acid font-bold">&gt;</span> Rodrigo Matos. Aquele cara chato que reclama de processos
                lentos, sistemas burocráticos e pergunta: &ldquo;por que não
                estão usando inteligência artificial?&rdquo;.
              </p>
              <p>
                <span className="text-blue dark:text-acid font-bold">&gt;</span> Eu crio sites funcionais, ferramentas que te ajudam no
                trabalho ou melhoram a interação com seu cliente.
              </p>
              <p><span className="text-blue dark:text-acid font-bold">&gt;</span> Quer um exemplo? Você já está em um.</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="#about"
                className="brutal-btn brutal-btn-adaptive px-6 py-3 font-body text-sm font-bold uppercase tracking-wide text-center"
              >
                Veja mais sobre mim
              </Link>
              <button
                className="brutal-btn bg-background px-6 py-3 font-body text-sm font-bold uppercase tracking-wide text-center opacity-50 cursor-not-allowed"
                disabled
              >
                Veja as ferramentas
              </button>
            </div>
          </div>
        </div>
      </article>

      {/* ═══════════ SITE FUNCIONAL? ═══════════ */}
      <article className="col-span-4 border-3 border-border brutal-shadow bg-background p-6 md:p-12 grid grid-cols-1 md:grid-cols-[1fr_400px] gap-8 md:gap-12">
        {/* Text */}
        <div className="flex flex-col justify-center gap-6">
          <h2 className="font-heading text-[clamp(2.5rem,5vw,4rem)] font-bold uppercase leading-none">
            Site funcional?
          </h2>
          <div className="border-3 border-border bg-background text-foreground p-6 md:p-8 font-body text-base md:text-lg leading-relaxed flex flex-col gap-4">
            <p>
              <span className="text-blue dark:text-acid font-bold">&gt;</span> Você quer um site comum que só exibe informação? Eu posso
              fazer, sem problemas.
            </p>
            <p>
              <span className="text-blue dark:text-acid font-bold">&gt;</span> Mas você pode ter um site com login, opções, facilitadores,
              ferramentas que te ajudam de alguma forma no seu trabalho ou na sua
              comunicação com o cliente.
            </p>
            <p>
              <span className="text-blue dark:text-acid font-bold">&gt;</span> Desde a venda de produtos, como uso interno para sua
              mecânica, mercado, clínica ou outro serviço.
            </p>
            <p><span className="text-blue dark:text-acid font-bold">&gt;</span> Vou te explicar os detalhes, sem pressa.</p>
          </div>
          <Link
            href="/servicos"
            className="brutal-btn brutal-btn-adaptive px-6 py-3 font-body text-sm font-bold uppercase tracking-wide text-center self-start"
          >
            Veja mais sobre sites
          </Link>
        </div>

        {/* Video placeholder */}
        <div
          className="border-3 border-border min-h-[300px] md:min-h-[400px] flex items-center justify-center font-heading text-xl font-bold text-center p-8"
          style={{
            backgroundImage:
              "repeating-linear-gradient(45deg, #000 0, #000 10px, #fff 10px, #fff 20px)",
          }}
        >
          <span className="bg-background px-4 py-2 border-3 border-border">
            [ VISUAL / VIDEO ]
          </span>
        </div>
      </article>

      {/* ═══════════ TERMINAL — CONSULTORIA ═══════════ */}
      <Link
        href="/servicos"
        className="col-span-4 border-3 border-border brutal-shadow bg-blue text-[#FFFFFF] font-body text-base md:text-lg py-5 md:py-6 px-6 md:px-8 flex items-center gap-3 hover:bg-acid hover:text-[#000000] active:bg-acid active:text-[#000000]"
        style={{
          transitionTimingFunction: "steps(1)",
          transitionDuration: "0s",
          transitionProperty: "background-color, color",
        }}
      >
        <span className="font-bold text-xl">&gt;_</span>
        <span className="uppercase tracking-wide">
          SYSTEM.EXEC / CONSULTORIA:{" "}
          <span className="opacity-80">
            Não precisa de código? Veja como otimizar seu fluxo.
          </span>
        </span>
        <span className="animate-blink ml-2">█</span>
      </Link>

      {/* ═══════════ CTA FINAL ═══════════ */}
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
              href="https://wa.me/5542998703287?text=Oi%20Rodrigo%2C%20quero%20agendar%20uma%20an%C3%A1lise"
              target="_blank"
              rel="noopener noreferrer"
              className="brutal-btn brutal-btn-adaptive px-8 md:px-12 py-4 md:py-5 font-body text-lg md:text-xl font-bold uppercase tracking-wide text-center"
            >
              Quero agendar uma análise do meu negócio
            </Link>
            <span className="font-body text-sm font-bold text-foreground opacity-70">
              // isso vai abrir o WhatsApp, mas só coloquei um texto tipo
              profissional
            </span>
          </div>
        </div>
      </article>
    </main>
  );
}
