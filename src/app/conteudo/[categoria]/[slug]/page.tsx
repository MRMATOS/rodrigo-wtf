import Link from "next/link";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import rehypeHighlight from "rehype-highlight";
import "highlight.js/styles/github-dark.css";
import { getPostBySlug, getCommentsByPost, type Category } from "@/lib/supabase";
import CoverImageLayout from "./CoverImageLayout";

function MarkdownContent({ content }: { content: string }) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      rehypePlugins={[rehypeRaw, rehypeHighlight]}
      components={{
        h2: ({ children }) => (
          <h2 className="font-heading text-2xl md:text-3xl font-bold uppercase mt-10 mb-4">
            {children}
          </h2>
        ),
        h3: ({ children }) => (
          <h3 className="font-heading text-xl font-bold uppercase mt-8 mb-3">
            {children}
          </h3>
        ),
        p: ({ children }) => (
          <p className="mb-4 leading-relaxed">{children}</p>
        ),
        ul: ({ children }) => (
          <ul className="mb-4 flex flex-col gap-1 pl-4">{children}</ul>
        ),
        li: ({ children }) => (
          <li className="before:content-['-'] before:mr-2">{children}</li>
        ),
        strong: ({ children }) => (
          <strong className="font-bold text-blue dark:text-acid">{children}</strong>
        ),
        code: ({ className, children, ...props }) => {
          const isBlock = className?.startsWith("language-");
          if (isBlock) {
            return (
              <code className={`${className} block text-sm font-body rounded-none`} {...props}>
                {children}
              </code>
            );
          }
          return (
            <code className="bg-foreground text-background px-1.5 py-0.5 text-sm font-body" {...props}>
              {children}
            </code>
          );
        },
        pre: ({ children }) => (
          <pre className="border-3 border-border bg-[#0d1117] p-4 md:p-6 overflow-x-auto my-4 text-sm">
            {children}
          </pre>
        ),
        blockquote: ({ children }) => (
          <blockquote className="border-l-3 border-blue dark:border-acid pl-4 opacity-80 my-4">
            {children}
          </blockquote>
        ),
        hr: () => <hr className="border-t-3 border-border my-8" />,
        img: ({ src, alt, width, height }) => (
          <img
            src={src}
            alt={alt ?? ""}
            width={width}
            height={height}
            className="border-3 border-border my-4"
            style={{ width: width ? undefined : "100%" }}
          />
        ),
      }}
    >
      {content}
    </ReactMarkdown>
  );
}

const CATEGORY_LABELS: Record<Category, string> = {
  "sites-e-aplicativos": "Sites e Aplicativos",
  analises: "Críticas e Análises",
  projetos: "Ideias e Projetos",
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
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

  if (!CATEGORY_LABELS[categoria as Category]) notFound();

  const category = categoria as Category;
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
          ← {CATEGORY_LABELS[category]}
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
        <p className="font-body text-sm opacity-60 mt-4">
          {formatDate(post.published_at)}
        </p>
      </header>

      {/* Content — with adaptive cover image layout */}
      {post.cover_image ? (
        <CoverImageLayout coverImage={post.cover_image} title={post.title}>
          <MarkdownContent content={post.content} />
        </CoverImageLayout>
      ) : (
        <article className="col-span-4 border-3 border-border brutal-shadow bg-background p-8 md:p-12">
          <div className="font-body text-base md:text-lg leading-relaxed max-w-prose">
            <MarkdownContent content={post.content} />
          </div>
        </article>
      )}

      {/* Comments */}
      <section className="col-span-4 border-3 border-border brutal-shadow bg-background p-8 md:p-12">
        <h2 className="font-heading text-xl md:text-2xl font-bold uppercase mb-6">
          Comentários
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
            <p>Nenhum comentário ainda.</p>
            <p className="mt-2 text-xs">Login com Google em breve.</p>
          </div>
        )}
      </section>
    </main>
  );
}
