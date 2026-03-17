export const metadata = {
  title: "Política de Privacidade — rodrigo.wtf",
  description: "Como os dados são coletados e usados no rodrigo.wtf.",
};

export default function Privacidade() {
  return (
    <main id="main-content" className="grid grid-cols-4 gap-4 md:gap-8">
      <header className="col-span-4 border-3 border-border brutal-shadow bg-background p-8 md:p-12">
        <p className="font-body text-sm font-bold uppercase tracking-widest text-muted mb-2">
          // legal
        </p>
        <h1 className="font-heading text-[clamp(2rem,5vw,5rem)] font-bold uppercase leading-[1.1] tracking-tight">
          Política de Privacidade
        </h1>
        <p className="font-body text-sm opacity-50 mt-4">Última atualização: março de 2026</p>
      </header>

      <article className="col-span-4 border-3 border-border brutal-shadow bg-background p-8 md:p-12">
        <div className="font-body text-base md:text-lg leading-relaxed max-w-prose flex flex-col gap-8">

          <section className="flex flex-col gap-3">
            <h2 className="font-heading text-xl md:text-2xl font-bold uppercase">1. Quem sou eu</h2>
            <p>Este site é operado por <strong className="font-bold text-blue dark:text-acid">Rodrigo Matos</strong>, desenvolvedor independente. Para contato: <strong className="font-bold text-blue dark:text-acid">mrmimico@gmail.com</strong>.</p>
          </section>

          <section className="flex flex-col gap-3">
            <h2 className="font-heading text-xl md:text-2xl font-bold uppercase">2. Dados coletados</h2>
            <p>Este site coleta apenas o mínimo necessário para funcionar:</p>
            <ul className="flex flex-col gap-1 pl-4">
              <li className="before:content-['-'] before:mr-2"><strong className="font-bold text-blue dark:text-acid">Autenticação Google (área admin):</strong> nome e e-mail da conta Google, usados exclusivamente para identificar o administrador do site. Nenhum terceiro tem acesso a esses dados.</li>
              <li className="before:content-['-'] before:mr-2"><strong className="font-bold text-blue dark:text-acid">Comentários (em breve):</strong> quando a funcionalidade estiver ativa, nome de exibição e conteúdo do comentário serão armazenados associados ao post.</li>
              <li className="before:content-['-'] before:mr-2"><strong className="font-bold text-blue dark:text-acid">Logs de acesso:</strong> dados padrão de servidor (IP, navegador, horário) registrados automaticamente pela infraestrutura de hospedagem (Vercel).</li>
            </ul>
          </section>

          <section className="flex flex-col gap-3">
            <h2 className="font-heading text-xl md:text-2xl font-bold uppercase">3. Como os dados são usados</h2>
            <ul className="flex flex-col gap-1 pl-4">
              <li className="before:content-['-'] before:mr-2">Verificar se o usuário tem permissão de acesso à área administrativa.</li>
              <li className="before:content-['-'] before:mr-2">Exibir comentários publicamente na página do post correspondente.</li>
              <li className="before:content-['-'] before:mr-2">Nenhum dado é vendido, alugado ou compartilhado com terceiros para fins de publicidade.</li>
            </ul>
          </section>

          <section className="flex flex-col gap-3">
            <h2 className="font-heading text-xl md:text-2xl font-bold uppercase">4. Armazenamento</h2>
            <p>Os dados são armazenados no <strong className="font-bold text-blue dark:text-acid">Supabase</strong> (infraestrutura na AWS us-east-1). A política de privacidade do Supabase está disponível em supabase.com/privacy.</p>
          </section>

          <section className="flex flex-col gap-3">
            <h2 className="font-heading text-xl md:text-2xl font-bold uppercase">5. Cookies e sessões</h2>
            <p>O site utiliza cookies de sessão apenas para manter o estado de autenticação do administrador. Não há cookies de rastreamento, analytics ou publicidade.</p>
          </section>

          <section className="flex flex-col gap-3">
            <h2 className="font-heading text-xl md:text-2xl font-bold uppercase">6. Seus direitos</h2>
            <p>Você pode solicitar a exclusão dos seus dados a qualquer momento enviando um e-mail para <strong className="font-bold text-blue dark:text-acid">mrmimico@gmail.com</strong>.</p>
          </section>

          <section className="flex flex-col gap-3">
            <h2 className="font-heading text-xl md:text-2xl font-bold uppercase">7. Alterações</h2>
            <p>Esta política pode ser atualizada ocasionalmente. A data no topo indica a versão mais recente.</p>
          </section>

        </div>
      </article>
    </main>
  );
}
