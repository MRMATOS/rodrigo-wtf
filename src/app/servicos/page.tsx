import Link from "next/link";
import { AccordionItem } from "@/components/Accordion";
import ProcessoBlock from "./_components/ProcessoBlock";

export const metadata = {
  title: "Serviços — rodrigo.wtf",
  description:
    "Como funciona a criação de sites funcionais e consultoria. Sem bullshit.",
};

export default function Servicos() {
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
          Eu faço sites funcionais,{" "}
          <span className="relative inline-block mb-1 md:mb-0">
            <span className="pl-2 pr-[8px] md:pr-[16px]">como esse aqui</span>
            <span
              className="absolute left-0 top-0 w-full h-full pl-2 pr-[8px] md:pr-[16px] bg-acid text-[#000000] animate-selection-w1"
              aria-hidden="true"
            >
              como esse aqui
            </span>
          </span>
        </h1>
        <p className="font-body text-base md:text-lg text-muted mt-4 relative z-[1] max-w-xl">
          // sites, apps e consultoria para pequenas e médias empresas
        </p>
      </header>

      {/* ═══════════ INTRO TEXT ═══════════ */}
      <article className="col-span-4 border-3 border-border brutal-shadow bg-blue text-[#FFFFFF] p-8 md:p-12">
        <div className="font-body text-base md:text-lg leading-relaxed flex flex-col gap-6 max-w-3xl">
          <p>
            Eu crio sites funcionais com base nas necessidades reais do seu negócio.
            Através de conversas, pesquisa e testes, eu monto uma plataforma que pode:
          </p>
          <ul className="flex flex-col gap-2 pl-2">
            {[
              "digitalizar serviços",
              "automatizar processos",
              "conectar empresa e cliente",
              "entre outras possibilidades",
            ].map((item) => (
              <li key={item} className="flex gap-3 items-baseline">
                <span className="font-bold text-acid shrink-0">—</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
          <p>
            Não é um site para exibir informação, é uma <strong>ferramenta de trabalho</strong> para o seu negócio.
          </p>
        </div>
        <h3 className="font-heading text-xl md:text-2xl font-bold mt-12 text-acid">
          /// Veja como funciona o processo:
        </h3>
      </article>

      {/* ═══════════ ACCORDIONS ═══════════ */}
      <article className="col-span-4 border-3 border-border brutal-shadow bg-background p-6 md:p-12 flex flex-col gap-6">
        <AccordionItem index={1} title="Como funciona o processo" symbol=">_">
          <ProcessoBlock />
        </AccordionItem>

        <AccordionItem index={2} title="Dúvidas frequentes" symbol="?_">
          <div className="flex flex-col gap-6">
            {[
              {
                q: "O meu site vai ser igual ao seu, tudo estranho?",
                a: "Não. O meu site é o meu site. O seu vai ser exatamente como precisa ser, seguindo o visual do seu negócio e fazendo parte da sua identidade. Eu gero os materiais necessários, incluindo imagens com IA, mas de forma profissional e alinhada com a sua marca.",
              },
              {
                q: "E se eu não precisar de um site?",
                a: "Sem problema. Há ferramentas prontas, gratuitas ou baratas, que resolvem 90% dos casos. Se for o seu caso, eu indico e te ajudo a implementar. Meu foco é resolver o problema, não criar soluções desnecessárias.",
              },
              {
                q: "Como funciona o acompanhamento durante o projeto?",
                a: "Você vai acompanhar cada etapa online e pode testar antes da entrega final. Tudo é documentado, conversas, decisões, concepção e entrega. Você sempre sabe o que está sendo feito e por quê.",
              },
              {
                q: "E se eu não souber explicar o que preciso?",
                a: "Esse é exatamente o ponto de partida. Você não precisa chegar com a solução pronta, só precisa me contar o que te atrapalha hoje. A partir disso, eu faço as perguntas certas e monto o diagnóstico.",
              },
            ].map(({ q, a }) => (
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
          Tem um problema? Me conta.
        </h2>
        <div className="flex flex-col gap-6">
          <p className="font-body text-lg md:text-xl font-medium max-w-3xl text-foreground">
            Manda uma mensagem explicando o que te atrapalha hoje.
            Sem compromisso, eu respondo com uma análise do que pode ser feito.
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
              // resposta em até 24h
            </span>
          </div>
        </div>
      </article>
    </main>
  );
}
