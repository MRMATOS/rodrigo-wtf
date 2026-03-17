import Link from "next/link";
import { AccordionItem } from "@/components/Accordion";

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
        <h1 className="font-heading text-[clamp(3rem,7vw,9rem)] font-bold uppercase leading-[1.1] tracking-tight relative z-[1]">
          Tem muito texto, mas é{" "}
          <span className="relative inline-block mb-1 md:mb-0">
            <span className="pl-2 pr-[8px] md:pr-[16px]">necessário**</span>
            <span
              className="absolute left-0 top-0 w-full h-full pl-2 pr-[8px] md:pr-[16px] bg-acid text-[#000000] animate-selection-w1"
              aria-hidden="true"
            >
              necessário**
            </span>
          </span>
        </h1>
      </header>

      {/* ═══════════ INTRO TEXT ═══════════ */}
      <article className="col-span-4 border-3 border-border brutal-shadow bg-blue text-[#FFFFFF] p-8 md:p-12">
        <div className="font-body text-base md:text-lg leading-relaxed flex flex-col gap-6 max-w-3xl">
          <p>
            Basicamente, eu busco encontrar prolemas ou maneiras de melhorar um processo, seja digital ou manual.
            Questiono os motivos, penso em alternativas e vou moldando uma <strong>solução aos poucos</strong>.
          </p>
          <p>
            Talvez precise de um site, talvez um aplicativo, um sistema mais completo ou simplesmente usar o <strong>WhatsApp</strong>.
            A questão é <strong>identificar um problema e resolver</strong>.
          </p>
          <p>
            <strong>Eu não vou criar nada desnecessário</strong>.
            <strong> A solução pode ser mais simples do que você imagina.</strong>
          </p>
        </div>
        <h3 className="font-heading text-xl md:text-2xl font-bold mt-12 text-acid">
          /// Como o trabalho <em className="italic bg-acid text-[#000000] px-1">realmente</em> funciona:
        </h3>
      </article>

      {/* ═══════════ ACCORDIONS ═══════════ */}
      <article className="col-span-4 border-3 border-border brutal-shadow bg-background p-6 md:p-12 flex flex-col gap-6">
        <AccordionItem index={1} title="Me fala o que acontece" symbol=">_">
          <p>
            Qual problema te atrapalha hoje? O que você queria estar fazendo, mas não consegue sozinho?
            Quer parar de usar papel e caneta?
          </p>
          <p className="mt-4">
            Se você chegou até aqui, sabe que precisa melhorar, mas não sabe como.
            Não tem tempo, não tem conhecimento técnico ou não sabe por onde começar.
          </p>
          <p className="mt-4">
            Por isso, eu preciso conversar para entender exatamente o que pode ser feito.
            Me conte tudo, não esconda nada.
          </p>
          <p className="mt-4">
            E se a sua solução for algo que já existe e é barato, eu vou te falar.
            Não vou te vender algo que você não precisa.
          </p>
        </AccordionItem>

        <AccordionItem index={2} title="Imersão no Seu Negócio" symbol="///">
          <p className="text-muted text-sm uppercase tracking-wide mb-4">
            ( eu vou até você )
          </p>
          <p>
            O único jeito de te ajudar, é compreender o fluxo de trabalho.
          </p>
          <p className="mt-4">
            Eu faço questão de dedicar o tempo necessário para visitar, acompanhar processos
            até entender completamente como funciona. É dessa forma que eu posso criar uma
            solução que se integre ao seu negócio de forma natural.
          </p>
          <p className="mt-4">
            Eu não faço um aplicativo do jeito que eu gosto, mas sim do melhor jeito que
            resolve o seu problema.
          </p>
          <p className="mt-4">
            Leia o caso do supermercado que anotava as datas de validade com papel e caneta e
            eu desenvolvi o Arbalest Digital para facilitar esse e outros processos.
          </p>
          <p className="mt-4 border-l-3 border-blue dark:border-acid pl-4 text-muted">
            É esse tipo de b.o jurássico que eu vou caçar e resolver com
            tecnologia. Não tem achismo, tem pesquisa e validação.
          </p>
        </AccordionItem>

        <AccordionItem index={3} title="Mas e esse design ai?" symbol="[×]">
          <p>
            "Mas o meu site vai ser assim igual o seu? Tudo estranho?"
          </p>
          <p className="mt-4">
            Não né carai.
          </p>
          <p className="mt-4">
            O meu site é o meu site. O seu vai ser exatamente como precisa ser.
            Seguindo o seu estilo, o visual do seu negócio para fazer parte
            da identidade visual da sua empresa.
          </p>
          <p className="mt-4">
            E não precisa se preocupar com fotos e essas coisas. Eu gero os materiais necessários.
            Sim, com inteligência artificial, mas não aquelas imagens sem almas genéricas.
            É absolutemente profissional.
          </p>
          <p className="mt-4">
            No fim, você vai ter uma ferramenta funcional, site ou aplicativo, que está alinhada com todo o resto.
          </p>
        </AccordionItem>

        <AccordionItem
          index={4}
          title='Então, talvez, não precise de site?'
          symbol="@_"
        >
          <p>
            Exatamente. Há soluções simples para resolver problemas em fluxos de trabalho.
          </p>
          <p className="mt-4">
            Também há ferramentas prontas, gratuitas ou baratas que resolvem 90% dos problemas.
            E eu vou te indicar a melhor solução para o seu caso. Te ajudo a implementar e usar.
          </p>
          <p className="mt-4">
            Muitas vezes é só um problema de comunicação ou uma mania herdada que hoje não faz mais sentido.
            O ponto é que eu foco em resolver problemas, não em criar soluções desnecessárias.
          </p>
          <p className="mt-4">
            Então pense como uma consultoria da desburocratização.
          </p>
        </AccordionItem>

        <AccordionItem
          index={5}
          title="O que você ganha"
          symbol="{ }"
        >
          <p>
            Seja para um site, serviço ou consultoria, você sempre vai ter todas as informações
            para entender o que está sendo feito.
          </p>
          <ul className="mt-4 flex flex-col gap-3">
            <li className="flex gap-3">
              <span className="font-bold text-blue dark:text-acid shrink-0">[+]</span>
              <span>
                <strong className="font-bold">Documentação Completa:</strong>{" "}
                Desde as conversas, visitas, concepções até a entrega serão registrados.
                Você terá acesso aos arquivos para garantir que os dados estejam corretos e
                até para saber exatamente como seu negócio está.
              </span>
            </li>
            <li className="flex gap-3">
              <span className="font-bold text-blue dark:text-acid shrink-0">[+]</span>
              <span>
                <strong className="font-bold">Online e atualizado:</strong> Você
                vai acompanhar as etapas da construção do seu site ou aplicativo, podendo testar e, principalmente,
                saber que o trabalho está acontecendo.
              </span>
            </li>
            <li className="flex gap-3">
              <span className="font-bold text-blue dark:text-acid shrink-0">[+]</span>
              <span>
                <strong className="font-bold">Sinceridade:</strong> Eu não vou tentar te agradar te obedecendo, mas resolvendo um problema.
                Se você acha que deve ser de um jeito, precisa provar, pois é assim que eu faço.
              </span>
            </li>
          </ul>
          <p className="mt-4">
            Eu só quero trabalhar certinho, sérião mesmo
          </p>
        </AccordionItem>
      </article>

      {/* ═══════════ CTA FINAL ═══════════ */}
      <article className="col-span-4 border-3 border-border brutal-shadow bg-background p-8 md:p-12">
        <h2 className="font-heading text-[clamp(2rem,5vw,4rem)] font-bold uppercase leading-tight mb-6 text-foreground">
          Não fique enrolando, vamos resolver
        </h2>
        <div className="flex flex-col gap-6">
          <p className="font-body text-lg md:text-xl font-medium max-w-3xl text-foreground">
            É sério, o tempo passa e você vai continuar com os mesmos problemas.
            Veja outros projetos aqui no site e entenda como posso te ajudar.
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
