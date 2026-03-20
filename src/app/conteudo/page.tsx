import Link from "next/link";
import { getLatestPosts, type Post } from "@/lib/supabase";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function PostRow({ post, category }: { post: Post; category: string }) {
  return (
    <Link
      href={`/conteudo/${category}/${post.slug}`}
      className="flex items-start justify-between gap-4 px-4 md:px-8 py-4 md:py-5 border-t-3 border-border hover:bg-acid hover:text-[#000000] group"
      style={{
        transitionTimingFunction: "steps(1)",
        transitionDuration: "0s",
        transitionProperty: "background-color, color",
      }}
    >
      <span className="font-body text-sm md:text-base font-bold leading-snug flex-1 min-w-0 truncate">
        {post.title}
      </span>
      <div className="flex items-center gap-3 shrink-0 text-right">
        {post.tags.slice(0, 2).map((tag) => (
          <span
            key={tag}
            className="hidden sm:inline font-body text-xs font-bold uppercase tracking-wide opacity-60 group-hover:opacity-100"
          >
            #{tag}
          </span>
        ))}
        <span className="font-body text-xs opacity-60 group-hover:opacity-100 whitespace-nowrap">
          {formatDate(post.published_at)}
        </span>
      </div>
    </Link>
  );
}

function SectionBlock({
  title,
  category,
  href,
  posts,
}: {
  title: string;
  category: string;
  href: string;
  posts: Post[];
}) {
  return (
    <section className="col-span-4 border-3 border-border brutal-shadow bg-background">
      {/* Header */}
      <div className="flex items-center justify-between px-4 md:px-8 py-4 md:py-5 border-b-3 border-border">
        <h2 className="font-heading text-xl md:text-2xl font-bold uppercase tracking-tight bg-acid text-[#000000] px-2 py-0.5">
          {title}
        </h2>
        <Link
          href={href}
          className="brutal-btn brutal-btn-adaptive px-3 py-1.5 font-body text-xs font-bold uppercase tracking-wide"
        >
          [+] Ver tudo
        </Link>
      </div>

      {/* Posts */}
      {posts.length > 0 ? (
        posts.map((post) => (
          <PostRow key={post.id} post={post} category={category} />
        ))
      ) : (
        <div className="px-4 md:px-8 py-8 border-t-3 border-border font-body text-sm opacity-50">
          Nenhum post publicado ainda.
        </div>
      )}
    </section>
  );
}

export const metadata = {
  title: "Conteúdo",
  description:
    "Análises, críticas e projetos. O que eu estou fazendo, testando e pensando.",
};

export default async function Conteudo() {
  const [sites, analises, projetos] = await Promise.all([
    getLatestPosts("sites-e-aplicativos", 5).catch(() => [] as Post[]),
    getLatestPosts("analises", 5).catch(() => [] as Post[]),
    getLatestPosts("projetos", 5).catch(() => [] as Post[]),
  ]);

  return (
    <main id="main-content" className="grid grid-cols-4 gap-4 md:gap-8">
      {/* Hero */}
      <header className="col-span-4 border-3 border-border brutal-shadow bg-background p-8 md:p-12 lg:py-24 lg:px-12">
        <h1 className="font-heading text-[clamp(3rem,6vw,12rem)] font-bold uppercase leading-[1.1] tracking-tight relative z-[1]">
          Conteúdo
        </h1>
        <p className="font-body text-base md:text-lg text-muted mt-4 relative z-[1] max-w-xl">
          // O que eu estou fazendo, testando e pensando. Sem filtro.
        </p>
      </header>

      {/* Sites e Aplicativos */}
      <SectionBlock
        title="Sites e Aplicativos"
        category="sites-e-aplicativos"
        href="/conteudo/sites-e-aplicativos"
        posts={sites}
      />

      {/* Análises */}
      <SectionBlock
        title="Críticas e Análises"
        category="analises"
        href="/conteudo/analises"
        posts={analises}
      />

      {/* Projetos */}
      <SectionBlock
        title="Ideias e Projetos"
        category="projetos"
        href="/conteudo/projetos"
        posts={projetos}
      />
    </main>
  );
}
