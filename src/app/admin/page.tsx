import Link from "next/link";
import { createSupabaseAdmin } from "@/lib/supabase-server";
import DeleteButton from "./_components/DeleteButton";
import type { Post } from "@/lib/supabase";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

const CATEGORY_LABEL: Record<string, string> = {
  analises: "Análises",
  projetos: "Projetos",
};

export default async function AdminPage() {
  const supabase = createSupabaseAdmin();
  const { data: posts } = await supabase
    .from("posts")
    .select("id, title, slug, category, tags, published_at, created_at")
    .order("created_at", { ascending: false });

  const all = (posts ?? []) as Post[];
  const published = all.filter((p) => p.published_at);
  const drafts = all.filter((p) => !p.published_at);

  return (
    <div className="flex flex-col gap-8">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Total", value: all.length },
          { label: "Publicados", value: published.length },
          { label: "Rascunhos", value: drafts.length },
        ].map((s) => (
          <div
            key={s.label}
            className="border-3 border-border brutal-shadow p-4 md:p-6 text-center"
          >
            <p className="font-heading text-3xl md:text-4xl font-bold">
              {s.value}
            </p>
            <p className="font-body text-xs uppercase tracking-wide opacity-60 mt-1">
              {s.label}
            </p>
          </div>
        ))}
      </div>

      {/* Post list */}
      <div className="border-3 border-border brutal-shadow">
        <div className="px-4 md:px-6 py-4 border-b-3 border-border flex items-center justify-between">
          <h2 className="font-heading text-lg font-bold uppercase">Posts</h2>
          <Link
            href="/admin/novo"
            className="brutal-btn brutal-btn-adaptive px-3 py-1.5 font-body text-xs font-bold uppercase tracking-wide"
          >
            [+] Novo
          </Link>
        </div>

        {all.length === 0 ? (
          <div className="px-6 py-10 text-center font-body text-sm opacity-50">
            Nenhum post ainda.
          </div>
        ) : (
          all.map((post, i) => (
            <div
              key={post.id}
              className={`flex items-center justify-between gap-3 px-4 md:px-6 py-4 ${
                i > 0 ? "border-t-3 border-border" : ""
              }`}
            >
              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="font-body text-sm font-bold truncate">
                  {post.title}
                </p>
                <div className="flex items-center gap-3 mt-1">
                  <span className="font-body text-xs opacity-50">
                    {CATEGORY_LABEL[post.category]}
                  </span>
                  <span
                    className={`font-body text-xs font-bold uppercase px-1.5 py-0.5 ${
                      post.published_at
                        ? "bg-acid text-[#000000]"
                        : "bg-foreground text-background opacity-40"
                    }`}
                  >
                    {post.published_at ? "Publicado" : "Rascunho"}
                  </span>
                  {post.published_at && (
                    <span className="font-body text-xs opacity-40">
                      {formatDate(post.published_at)}
                    </span>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 shrink-0">
                <Link
                  href={`/admin/${post.id}`}
                  className="brutal-btn bg-background px-3 py-1.5 font-body text-xs font-bold uppercase tracking-wide hover:bg-acid hover:text-[#000000]"
                  style={{ transitionTimingFunction: "steps(1)", transitionDuration: "0s", transitionProperty: "background-color, color" }}
                >
                  Editar
                </Link>
                <DeleteButton id={post.id} title={post.title} />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
