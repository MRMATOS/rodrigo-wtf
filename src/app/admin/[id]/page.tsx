import { notFound } from "next/navigation";
import { createSupabaseAdmin } from "@/lib/supabase-server";
import PostEditor from "../_components/PostEditor";
import type { Post } from "@/lib/supabase";

export const metadata = { title: "Editar post — Admin" };

export default async function EditPost({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = createSupabaseAdmin();

  const { data: post } = await supabase
    .from("posts")
    .select("*")
    .eq("id", id)
    .single();

  if (!post) notFound();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-2xl md:text-3xl font-bold uppercase">
          Editar post
        </h1>
        <span
          className={`font-body text-xs font-bold uppercase px-2 py-1 ${
            post.published_at
              ? "bg-acid text-[#000000]"
              : "bg-foreground text-background opacity-40"
          }`}
        >
          {post.published_at ? "Publicado" : "Rascunho"}
        </span>
      </div>
      <PostEditor post={post as Post & { cover_image?: string }} />
    </div>
  );
}
