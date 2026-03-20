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
        <h1 className="font-heading text-[clamp(3rem,6vw,12rem)] font-bold uppercase leading-[1.1] tracking-tight relative z-[1]">
          Sim, eu faço<span className="hidden md:inline"> </span>
          <br className="md:hidden" />
          <HeroRotatingText />
        </h1>
      </header>

      {/* ═══════════ QUAL É O PROBLEMA? ═══════════ */}
      <article className="col-span-4 border-3 border-border brutal-shadow bg-blue text-[#FFFFFF] p-8 md:p-12 flex flex-col gap-8">
        <h2 className="font-heading text-[clamp(2rem,4vw,4rem)] font-bold uppercase leading-tight max-w-3xl">
          Processo lento, site sem função e nem usa IA?
        </h2>
        <p className="font-heading text-[clamp(2rem,4vw,4rem)] font-bold uppercase leading-tight max-w-3xl">
          Eu sei como é.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 font-body text-base md:text-lg leading-relaxed">
          {[
            {
              text: "Já vi supermercado anotar datas de validade em caderno, e resolvi criando um aplicativo que diminuiu perdas e economizou tempo.",
            },
            {
              text: "E o que acha de um site que busca, traduz e publica notícias automaticamente? Eu criei, e ajudou uma equipe a focar em conteúdos mais elaborados.",
            },
            {
              text: "Imagine um aplicativo que te ajuda a fugir dos lugares mais barulhentos da cidade. Não precisa imaginar,",
              link: { label: "já existe.", href: "/ferramentas" },
            },
            {
              text: "É 2026 e estão imprimindo listas para cotação de produtos? Eu não aceito isso. Desenvolvi um sistema que processa as listas, organiza e auxilia na criação do pedido de compra.",
            },
          ].map(({ text, link }, i) => (
            <div key={i} className="flex gap-4 items-start">
              <span className="font-heading font-bold text-acid shrink-0 text-xl mt-0.5">[{i + 1}]</span>
              <p>
                {text}{" "}
                {link && (
                  <Link href={link.href} className="underline underline-offset-4 hover:text-acid font-bold">
                    {link.label}
                  </Link>
                )}
              </p>
            </div>
          ))}
        </div>
      </article>

      {/* ═══════════ CASO REAL ═══════════ */}
      <article className="col-span-4 border-3 border-border brutal-shadow bg-background p-8 md:p-12 flex flex-col gap-8">
        <p className="font-body text-sm font-bold uppercase tracking-widest text-muted">
          // Caso real
        </p>
        <h2 className="font-heading text-[clamp(2rem,4vw,5rem)] font-bold uppercase leading-tight max-w-4xl">
          Um designer com IA resolveu o que 10 programadores ignoraram.
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 font-body text-base md:text-lg leading-relaxed max-w-5xl">
          <p>
            Um supermercado com equipe de TI dedicada, mas setores inteiros operando com caderno e caneta. Controle de validade, pedidos do açougue, farmácia, tudo manual, tudo lento.
          </p>
          <p>
            Eu observei, construí e entreguei. Sozinho. Os repositores escaneavam código de barras no celular, o gerente via os dados em tempo real. O açougue ganhou um painel de produção. A farmácia, inteligência de uso.
          </p>
          <p>
            Dois meses depois de ser demitido por ter feito demais, a empresa tentou replicar a solução. Não conseguiu. A farmácia ligou pedindo acesso de volta.
          </p>
        </div>
        <blockquote className="font-heading text-xl md:text-2xl font-bold uppercase border-l-3 border-blue dark:border-acid pl-5 text-foreground max-w-2xl">
          "Não construí do jeito que eu gostava. Construí do jeito que resolvia."
        </blockquote>
      </article>

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
                href="/sobre"
                className="brutal-btn brutal-btn-adaptive px-6 py-3 font-body text-sm font-bold uppercase tracking-wide text-center"
              >
                Veja mais sobre mim
              </Link>
              <Link
                href="/ferramentas"
                className="brutal-btn brutal-btn-adaptive px-6 py-3 font-body text-sm font-bold uppercase tracking-wide text-center"
              >
                Veja as ferramentas
              </Link>
            </div>
          </div>
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
              href="https://wa.me/5542998703287"
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
