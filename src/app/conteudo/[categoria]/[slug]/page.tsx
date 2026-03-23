import Link from "next/link";
import { notFound } from "next/navigation";
import { getPostBySlug, getCommentsByPost, type Category } from "@/lib/supabase";
import CoverImageLayout from "./CoverImageLayout";
import PostContent from "@/components/PostContent";
import BackButton from "@/components/BackButton";
import ShareButton from "@/components/ShareButton";
import { getServerTranslations } from "@/i18n/server";

export const dynamic = "force-dynamic";

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ categoria: string; slug: string }>;
}) {
  const { categoria, slug } = await params;
  const post = await getPostBySlug(categoria as Category, slug).catch(() => null);
  if (!post) return {};
  return {
    title: post.title,
    description: post.content.slice(0, 160).replace(/[#*`]/g, ""),
  };
}

export default async function PostPage({
  params,
}: {
  params: Promise<{ categoria: string; slug: string }>;
}) {
  const { categoria, slug } = await params;
  const { t } = await getServerTranslations();

  const category = categoria as Category;
  const categoryTitle = t.content.sections[categoria as keyof typeof t.content.sections];
  if (!categoryTitle) notFound();

  const post = await getPostBySlug(category, slug).catch(() => null);
  if (!post) notFound();

  const comments = await getCommentsByPost(post.id).catch(() => []);

  return (
    <main id="main-content" className="grid grid-cols-4 gap-4 md:gap-8">
      {/* Header */}
      <header className="col-span-4 border-3 border-border brutal-shadow bg-background p-8 md:p-12">
        <Link
          href={`/conteudo/${category}`}
          className="font-body text-xs font-bold uppercase tracking-wide opacity-60 hover:opacity-100 mb-6 inline-block"
        >
          ← {categoryTitle}
        </Link>

        {/* Tags */}
        {post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {post.tags.map((tag) => (
              <Link
                key={tag}
                href={`/conteudo/${category}?tag=${tag}`}
                className="font-body text-xs font-bold uppercase tracking-wide px-3 py-1 border-3 border-border hover:bg-acid hover:text-[#000000]"
                style={{
                  transitionTimingFunction: "steps(1)",
                  transitionDuration: "0s",
                  transitionProperty: "background-color, color",
                }}
              >
                #{tag}
              </Link>
            ))}
          </div>
        )}

        <h1 className="font-heading text-[clamp(2rem,4vw,3.5rem)] font-bold uppercase leading-tight mt-2">
          {post.title}
        </h1>
        <div className="flex items-center justify-between flex-wrap gap-4 mt-4">
          <p className="font-body text-sm opacity-60">
            {formatDate(post.published_at)}
          </p>
          <ShareButton
            title={post.title}
            url={`https://rodrigo.wtf/conteudo/${category}/${post.slug}`}
          />
        </div>
      </header>

      {/* Content — with adaptive cover image layout */}
      {post.cover_image ? (
        <CoverImageLayout coverImage={post.cover_image} title={post.title}>
          <PostContent content={post.content} />
        </CoverImageLayout>
      ) : (
        <article className="col-span-4 border-3 border-border brutal-shadow bg-background p-8 md:p-12">
          <div className="font-body text-base md:text-lg leading-relaxed max-w-prose">
            <PostContent content={post.content} />
          </div>
        </article>
      )}

      <BackButton
        shareTitle={post.title}
        shareUrl={`https://rodrigo.wtf/conteudo/${category}/${post.slug}`}
      />

      {/* Comments */}
      <section className="col-span-4 border-3 border-border brutal-shadow bg-background p-8 md:p-12">
        <h2 className="font-heading text-xl md:text-2xl font-bold uppercase mb-6">
          {t.content.comments}
          {comments.length > 0 && (
            <span className="font-body text-base font-normal normal-case opacity-60 ml-3">
              ({comments.length})
            </span>
          )}
        </h2>

        {comments.length > 0 ? (
          <div className="flex flex-col gap-4">
            {comments.map((comment) => (
              <div
                key={comment.id}
                className="border-3 border-border p-4 md:p-6"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="font-body text-sm font-bold">
                    {comment.user_name}
                  </span>
                  <span className="font-body text-xs opacity-50">
                    {formatDate(comment.created_at)}
                  </span>
                </div>
                <p className="font-body text-sm leading-relaxed">
                  {comment.content}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <div className="border-3 border-border p-6 md:p-8 font-body text-sm opacity-50 text-center">
            <p>{t.content.noComments}</p>
            <p className="mt-2 text-xs">{t.content.loginSoon}</p>
          </div>
        )}
      </section>
    </main>
  );
}
