import Link from "next/link";
import { AccordionItem } from "@/components/Accordion";

export const metadata = {
  title: "Serviços — rodrigo.wtf",
  description:
    "Como funciona a criação de sites funcionais e consultoria. Sem bullshit.",
};

export default function Servicos() {
  return (
    <main className="grid grid-cols-4 gap-4 md:gap-8">
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
        <h1 className="font-heading text-[clamp(3rem,7vw,9rem)] font-bold uppercase leading-[1.1] tracking-tight relative z-[1]">
          Tem{" "}
          <span className="relative inline-block mb-1 md:mb-0">
            <span className="pl-2 pr-[8px] md:pr-[16px]">muito</span>
            <span 
              className="absolute left-0 top-0 w-full h-full pl-2 pr-[8px] md:pr-[16px] bg-acid text-[#000000] animate-selection-w1" 
              aria-hidden="true"
            >
              muito
            </span>
          </span>
          <span className="inline-block">
            <span className="relative inline-block">
              <span className="px-2">texto</span>
              <span 
                className="absolute left-0 top-0 w-full h-full px-2 bg-acid text-[#000000] animate-selection-w2" 
                aria-hidden="true"
              >
                texto
              </span>
            </span>,
          </span>
          <span className="ml-[6px] md:ml-[8px]">mas é necessário**</span>
        </h1>
      </header>

      {/* ═══════════ INTRO TEXT ═══════════ */}
      <article className="col-span-4 border-3 border-border brutal-shadow bg-blue text-[#FFFFFF] p-8 md:p-12">
        <div className="font-body text-base md:text-lg leading-relaxed flex flex-col gap-6 max-w-3xl">
          <p>
            Se você está procurando uma agência para pegar um template pronto,
            mudar as cores, socar um monte de foto de banco de imagens e te
            cobrar uma fortuna, você está no lugar errado.
          </p>
          <p className="text-[#FFFFFF]">
            Aqui, eu não faço apenas &ldquo;páginas na internet&rdquo;. Eu
            resolvo gargalos do seu negócio. Seja criando um sistema do zero ou
            te dizendo na cara que você não precisa de mim.
          </p>
        </div>
        <h3 className="font-heading text-xl md:text-2xl font-bold mt-12 text-acid">
          /// Como o trabalho <em className="italic bg-acid text-[#000000] px-1">realmente</em> funciona
        </h3>
      </article>

      {/* ═══════════ ACCORDIONS ═══════════ */}
      <article className="col-span-4 border-3 border-border brutal-shadow bg-background p-6 md:p-12 flex flex-col gap-6">
        <AccordionItem index={1} title="A Consultoria Anti-Bullshit" symbol=">_">
          <p>
            Antes de criar qualquer coisa, nós vamos conversar. Qual é o seu
            objetivo? Você quer vender? Quer uma ferramenta interna para
            organizar a bagunça?
          </p>
          <p className="mt-4">
            Se a sua necessidade for um e-commerce tradicional, uma ferramenta de
            50 reais por mês já resolve o seu problema perfeitamente, e{" "}
            <strong className="font-bold">eu vou te falar a verdade</strong>.
          </p>
          <p className="mt-4">
            Eu te indico a plataforma, dou a consultoria para implementar e não
            te cobro o desenvolvimento de algo que você não precisa. Simples
            assim.
          </p>
        </AccordionItem>

        <AccordionItem index={2} title="Imersão no Seu Negócio" symbol="///">
          <p className="text-muted text-sm uppercase tracking-wide mb-4">
            ( eu vou até você )
          </p>
          <p>
            Eu não crio soluções tiradas da cartola. Se estivermos na mesma
            região, eu vou presencialmente até a sua empresa. Vou observar o seu
            fluxo, conversar com quem trabalha com você e entender como as coisas
            funcionam na prática.
          </p>
          <p className="mt-4">
            Você viu o Arbalest Digital? O meu aplicativo para supermercado que
            comecei para resolver o problema do pessoal que anotava a validade
            dos produtos num caderninho de papel?
          </p>
          <p className="mt-4 border-l-3 border-blue dark:border-acid pl-4 text-muted">
            É esse tipo de b.o jurássico que eu vou caçar e resolver com
            tecnologia. Não tem &ldquo;achismo&rdquo;, tem pesquisa e validação.
          </p>
        </AccordionItem>

        <AccordionItem index={3} title="Fim do Design Genérico" symbol="[×]">
          <p>
            Imagem com inteligência artificial? Sim, mas não daquelas sem alma ou
            as famosas fotos de banco de imagens com pessoas sorrindo de forma
            bizarra.
          </p>
          <p className="mt-4">
            Se o cliente entrar no seu site e depois for fisicamente na sua
            empresa, ele tem que reconhecer o lugar.
          </p>
          <p className="mt-4">
            Nós vamos usar a realidade da sua empresa. Então vou gerar todas as
            imagens necessárias pra você não se preocupar com esse material, mas
            vai ser moldada para refletir a <em>sua</em> identidade visual, o{" "}
            <em>seu</em> espaço, <em>seu</em> serviço e até você.
          </p>
        </AccordionItem>

        <AccordionItem
          index={4}
          title='Presença Digital Sem Virar "Blogueirinho"'
          symbol="@_"
        >
          <p>
            Você não precisa virar escravo do Instagram e postar stories todo
            santo dia se essa não for a sua praia. Nós vamos focar na eficiência.
          </p>
          <p className="mt-4">
            Vamos arrumar a casa: unificar suas informações, garantir que seu
            horário de atendimento esteja idêntico no Google, no Facebook, no
            Instagram e no site.
          </p>
          <p className="mt-4 font-bold">
            Às vezes, criar um único post foda e patrocinar direito dá dez vezes
            mais resultado do que ficar criando conteúdo inútil. É o básico, o
            eficiente feito com perfeição.
          </p>
        </AccordionItem>

        <AccordionItem
          index={5}
          title="Um Ecossistema Completo na Sua Mão"
          symbol="{ }"
        >
          <p>
            Você não vai ficar no escuro e não vai precisar contratar cinco
            pessoas diferentes.
          </p>
          <ul className="mt-4 flex flex-col gap-3">
            <li className="flex gap-3">
              <span className="font-bold text-blue dark:text-acid shrink-0">[+]</span>
              <span>
                <strong className="font-bold">Documentação Completa:</strong>{" "}
                Você vai entender exatamente o que está sendo feito, por que está
                sendo feito e como usar.
              </span>
            </li>
            <li className="flex gap-3">
              <span className="font-bold text-blue dark:text-acid shrink-0">[+]</span>
              <span>
                <strong className="font-bold">Portal do Cliente:</strong> Você
                terá um login no meu site para acompanhar seu projeto, ler
                manuais e tirar dúvidas diretamente comigo.
              </span>
            </li>
            <li className="flex gap-3">
              <span className="font-bold text-blue dark:text-acid shrink-0">[+]</span>
              <span>
                <strong className="font-bold">Precisa de mais?</strong> Falta
                uma logo? Precisa de um vídeo institucional? Eu tenho a equipe e
                os parceiros para resolver isso. Entrego o pacote completo.
              </span>
            </li>
          </ul>
        </AccordionItem>
      </article>

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
              href="https://wa.me/5500000000000?text=Oi%20Rodrigo%2C%20quero%20agendar%20uma%20an%C3%A1lise"
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
