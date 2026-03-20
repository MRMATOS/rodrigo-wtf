import Link from "next/link";
import { notFound } from "next/navigation";
import { getPostsByCategory, type Category, type Post } from "@/lib/supabase";
import TagFilters from "@/components/TagFilters";

const CATEGORY_LABELS: Record<Category, { title: string; back: string }> = {
  "sites-e-aplicativos": { title: "Sites e Aplicativos", back: "todos" },
  analises: { title: "Críticas e Análises", back: "todas" },
  projetos: { title: "Ideias e Projetos", back: "todos" },
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ categoria: string }>;
}) {
  const { categoria } = await params;
  const label = CATEGORY_LABELS[categoria as Category];
  if (!label) return {};
  return { title: label.title };
}

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ categoria: string }>;
  searchParams: Promise<{ tag?: string }>;
}) {
  const { categoria } = await params;
  const { tag } = await searchParams;

  if (!CATEGORY_LABELS[categoria as Category]) notFound();

  const category = categoria as Category;
  const label = CATEGORY_LABELS[category];

  const allPosts = await getPostsByCategory(category).catch(() => [] as Post[]);

  // Collect all unique tags
  const allTags = Array.from(new Set(allPosts.flatMap((p) => p.tags))).sort();

  // Filter by selected tag
  const posts = tag ? allPosts.filter((p) => p.tags.includes(tag)) : allPosts;

  return (
    <main id="main-content" className="grid grid-cols-4 gap-4 md:gap-8">
      {/* Header */}
      <header className="col-span-4 border-3 border-border brutal-shadow bg-background p-8 md:p-12">
        <Link
          href="/conteudo"
          className="font-body text-xs font-bold uppercase tracking-wide opacity-60 hover:opacity-100 mb-4 inline-block"
        >
          ← Conteúdo
        </Link>
        <h1 className="font-heading text-[clamp(2rem,5vw,4rem)] font-bold uppercase leading-none">
          {label.title}
        </h1>
        <p className="font-body text-sm opacity-60 mt-2">
          {posts.length} {posts.length === 1 ? "post" : "posts"}
          {tag && ` com #${tag}`}
        </p>
      </header>

      {/* Tag Filters */}
      {allTags.length > 0 && (
        <TagFilters
          tags={allTags}
          activeTag={tag}
          basePath={`/conteudo/${category}`}
        />
      )}

      {/* Post List */}
      <section className="col-span-4 border-3 border-border brutal-shadow bg-background">
        {posts.length > 0 ? (
          posts.map((post, i) => (
            <Link
              key={post.id}
              href={`/conteudo/${category}/${post.slug}`}
              className={`flex items-start justify-between gap-4 px-4 md:px-8 py-5 md:py-6 group hover:bg-acid hover:text-[#000000] ${
                i > 0 ? "border-t-3 border-border" : ""
              }`}
              style={{
                transitionTimingFunction: "steps(1)",
                transitionDuration: "0s",
                transitionProperty: "background-color, color",
              }}
            >
              <span className="font-body text-sm md:text-base font-bold leading-snug flex-1">
                {post.title}
              </span>
              <div className="flex items-center gap-3 shrink-0 text-right">
                {post.tags.slice(0, 3).map((t) => (
                  <span
                    key={t}
                    className="hidden md:inline font-body text-xs font-bold uppercase tracking-wide opacity-60 group-hover:opacity-100"
                  >
                    #{t}
                  </span>
                ))}
                <span className="font-body text-xs opacity-60 group-hover:opacity-100 whitespace-nowrap">
                  {formatDate(post.published_at)}
                </span>
              </div>
            </Link>
          ))
        ) : (
          <div className="px-4 md:px-8 py-12 font-body text-sm opacity-50 text-center">
            {tag
              ? `Nenhum post com #${tag}.`
              : "Nenhum post publicado ainda."}
          </div>
        )}
      </section>
    </main>
  );
}
