export const metadata = {
  title: "Versões — rodrigo.wtf",
  description: "Histórico de versões e mudanças do site.",
};

const versoes = [
  {
    version: "2.2",
    date: "Mar 2026",
    changes: [
      "Mapa do Sossego: modo trajeto com gravação GPS e snap-to-road",
      "Mapa do Sossego: autenticação Google para gravação de trajetos",
      "Mapa do Sossego: mapa de calor com duas camadas independentes (barulhento/sossegado)",
      "Mapa do Sossego: status atualizado para Beta Aberto",
      "Padronização das heroes de todas as páginas internas",
      "Página Conteúdo: hero aumentada e tagline adicionada",
      "Segurança: middleware protegendo rotas /admin com verificação de email",
      "Segurança: headers CSP e HSTS adicionados",
      "Segurança: token do Mapbox restrito ao domínio",
      "Links do WhatsApp sem mensagem pré-preenchida",
    ],
  },
  {
    version: "2.1",
    date: "Mar 2026",
    changes: [
      "Página Sobre com bio completa e modo resumido",
      "Easter egg no botão de tema (modo caos)",
      "Som no botão de alternância de tema",
      "Páginas de Política de Privacidade e Termos de Serviço",
      "Open Graph image estática",
      "Correções de build e variáveis de ambiente no Vercel",
    ],
  },
  {
    version: "2.0",
    date: "Mar 2026",
    changes: [
      "Redesign completo com identidade brutalista",
      "Página de serviços com accordions",
      "Tema claro/escuro",
      "Efeito de highlight animado na hero",
      "Navegação mobile com menu hambúrguer",
      "SEO, Open Graph e melhorias de acessibilidade",
      "Sistema de conteúdo/blog com Supabase",
      "Admin panel com autenticação Google",
      "Editor de posts em Markdown com upload de imagens",
      "Layout adaptativo de imagem de capa por proporção",
      "Filtros de tags por categoria com colapso mobile",
    ],
  },
  {
    version: "1.0",
    date: "2025",
    changes: [
      "Versão inicial do site",
      "Apresentação básica de serviços",
    ],
  },
];

export default function Versoes() {
  return (
    <main id="main-content" className="grid grid-cols-4 gap-4 md:gap-8">
      <header className="col-span-4 border-3 border-border brutal-shadow bg-background p-8 md:p-12">
        <p className="font-body text-sm font-bold uppercase tracking-widest text-muted mb-2">
          // changelog
        </p>
        <h1 className="font-heading text-[clamp(3rem,7vw,7rem)] font-bold uppercase leading-[1.1] tracking-tight">
          Versões
        </h1>
      </header>

      <article className="col-span-4 border-3 border-border brutal-shadow bg-background p-8 md:p-12 flex flex-col gap-10">
        {versoes.map((v) => (
          <div key={v.version} className="flex flex-col gap-4">
            <div className="flex items-baseline gap-4">
              <span className="font-heading text-4xl md:text-5xl font-bold text-blue dark:text-acid">
                v{v.version}
              </span>
              <span className="font-body text-sm font-bold uppercase tracking-widest text-muted">
                {v.date}
              </span>
            </div>
            <ul className="flex flex-col gap-2">
              {v.changes.map((change, i) => (
                <li key={i} className="flex gap-3 font-body text-base md:text-lg">
                  <span className="font-bold text-blue dark:text-acid shrink-0">[+]</span>
                  <span>{change}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </article>
    </main>
  );
}
