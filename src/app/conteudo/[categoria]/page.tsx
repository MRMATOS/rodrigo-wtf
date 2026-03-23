import Link from "next/link";
import { notFound } from "next/navigation";
import { getPostsByCategory, type Category, type Post } from "@/lib/supabase";
import TagFilters from "@/components/TagFilters";
import { getServerTranslations } from "@/i18n/server";
import NewsletterButton from "@/components/NewsletterButton";

export const dynamic = "force-dynamic";

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
  const { t } = await getServerTranslations();
  const title = t.content.sections[categoria as keyof typeof t.content.sections];
  if (!title) return {};
  return { title };
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

  const { t, lang } = await getServerTranslations();
  const category = categoria as Category;
  const title = t.content.sections[categoria as keyof typeof t.content.sections];
  if (!title) notFound();

  const allPosts = await getPostsByCategory(category).catch(() => [] as Post[]);

  // Collect all unique tags
  const allTags = Array.from(new Set(allPosts.flatMap((p) => p.tags))).sort();

  // Filter by selected tag
  const posts = tag ? allPosts.filter((p) => p.tags.includes(tag)) : allPosts;

  const postCount = t.content.post(posts.length);
  const withTagText = tag ? ` ${t.content.withTag} #${tag}` : "";
  const noPostsText = tag ? `${t.content.noPostsTag} #${tag}.` : t.content.noPosts;

  return (
    <main id="main-content" className="grid grid-cols-4 gap-4 md:gap-8">
      {/* Header */}
      <header className="col-span-4 border-3 border-border brutal-shadow bg-background p-8 md:p-12">
        <Link
          href="/conteudo"
          className="font-body text-xs font-bold uppercase tracking-wide opacity-60 hover:opacity-100 mb-4 inline-block"
        >
          {t.content.back}
        </Link>
        <h1 className="font-heading text-[clamp(2rem,5vw,4rem)] font-bold uppercase leading-none">
          {title}
        </h1>
        <div className="flex items-center justify-between gap-4 mt-2">
          <p className="font-body text-sm opacity-60">
            {postCount}{withTagText}
          </p>
          <NewsletterButton lang={lang} />
        </div>
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
                {post.tags.slice(0, 3).map((postTag) => (
                  <span
                    key={postTag}
                    className="hidden md:inline font-body text-xs font-bold uppercase tracking-wide opacity-60 group-hover:opacity-100"
                  >
                    #{postTag}
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
            {noPostsText}
          </div>
        )}
      </section>
    </main>
  );
}
