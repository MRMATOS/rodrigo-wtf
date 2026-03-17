export const metadata = {
  title: "Termos de Serviço — rodrigo.wtf",
  description: "Termos de uso do site rodrigo.wtf.",
};

export default function Termos() {
  return (
    <main id="main-content" className="grid grid-cols-4 gap-4 md:gap-8">
      <header className="col-span-4 border-3 border-border brutal-shadow bg-background p-8 md:p-12">
        <p className="font-body text-sm font-bold uppercase tracking-widest text-muted mb-2">
          // legal
        </p>
        <h1 className="font-heading text-[clamp(2rem,5vw,5rem)] font-bold uppercase leading-[1.1] tracking-tight">
          Termos de Serviço
        </h1>
        <p className="font-body text-sm opacity-50 mt-4">Última atualização: março de 2026</p>
      </header>

      <article className="col-span-4 border-3 border-border brutal-shadow bg-background p-8 md:p-12">
        <div className="font-body text-base md:text-lg leading-relaxed max-w-prose flex flex-col gap-8">

          <section className="flex flex-col gap-3">
            <h2 className="font-heading text-xl md:text-2xl font-bold uppercase">1. Sobre o site</h2>
            <p><strong className="font-bold text-blue dark:text-acid">rodrigo.wtf</strong> é o site pessoal de Rodrigo Matos, desenvolvedor independente. O site apresenta portfólio, serviços e conteúdo editorial (artigos e projetos).</p>
          </section>

          <section className="flex flex-col gap-3">
            <h2 className="font-heading text-xl md:text-2xl font-bold uppercase">2. Uso do conteúdo</h2>
            <p>Todo o conteúdo publicado neste site — textos, imagens e código — é de autoria de Rodrigo Matos, salvo indicação contrária. Você pode:</p>
            <ul className="flex flex-col gap-1 pl-4">
              <li className="before:content-['-'] before:mr-2">Ler, compartilhar links e referenciar o conteúdo com atribuição.</li>
              <li className="before:content-['-'] before:mr-2">Reproduzir trechos curtos para fins informativos ou educacionais, com crédito ao autor e link para a fonte.</li>
            </ul>
            <p>Não é permitida a reprodução integral de artigos ou cópias do design sem autorização prévia.</p>
          </section>

          <section className="flex flex-col gap-3">
            <h2 className="font-heading text-xl md:text-2xl font-bold uppercase">3. Comentários (em breve)</h2>
            <p>Ao comentar, você concorda que:</p>
            <ul className="flex flex-col gap-1 pl-4">
              <li className="before:content-['-'] before:mr-2">O comentário pode ser exibido publicamente associado ao seu nome de exibição do Google.</li>
              <li className="before:content-['-'] before:mr-2">Comentários ofensivos, spam ou que violem direitos de terceiros podem ser removidos sem aviso.</li>
            </ul>
          </section>

          <section className="flex flex-col gap-3">
            <h2 className="font-heading text-xl md:text-2xl font-bold uppercase">4. Isenção de responsabilidade</h2>
            <p>O conteúdo deste site tem caráter informativo e reflete opiniões pessoais do autor. Não constitui aconselhamento jurídico, financeiro ou técnico formal. Use por sua conta e risco.</p>
          </section>

          <section className="flex flex-col gap-3">
            <h2 className="font-heading text-xl md:text-2xl font-bold uppercase">5. Links externos</h2>
            <p>Este site pode conter links para sites de terceiros. Não tenho controle sobre o conteúdo externo e não me responsabilizo por ele.</p>
          </section>

          <section className="flex flex-col gap-3">
            <h2 className="font-heading text-xl md:text-2xl font-bold uppercase">6. Contato</h2>
            <p>Dúvidas sobre estes termos: <strong className="font-bold text-blue dark:text-acid">mrmimico@gmail.com</strong>.</p>
          </section>

          <section className="flex flex-col gap-3">
            <h2 className="font-heading text-xl md:text-2xl font-bold uppercase">7. Alterações</h2>
            <p>Estes termos podem ser atualizados ocasionalmente. A data no topo indica a versão mais recente. O uso continuado do site implica aceitação dos termos vigentes.</p>
          </section>

        </div>
      </article>
    </main>
  );
}
