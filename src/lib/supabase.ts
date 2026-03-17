import { createClient } from "@supabase/supabase-js";

function getClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

// ─── Types ────────────────────────────────────────────────────────────────────

export type Category = "analises" | "projetos";

export interface Post {
  id: string;
  title: string;
  slug: string;
  category: Category;
  content: string;
  tags: string[];
  cover_image: string | null;
  published_at: string;
  created_at: string;
}

export interface Comment {
  id: string;
  post_id: string;
  user_id: string;
  user_name: string;
  content: string;
  created_at: string;
}

// ─── Queries ──────────────────────────────────────────────────────────────────

export async function getLatestPosts(category: Category, limit = 5): Promise<Post[]> {
  const { data, error } = await getClient()
    .from("posts")
    .select("id, title, slug, category, tags, published_at")
    .eq("category", category)
    .not("published_at", "is", null)
    .order("published_at", { ascending: false })
    .limit(limit);

  if (error) throw error;
  return (data as Post[]) ?? [];
}

export async function getPostsByCategory(category: Category): Promise<Post[]> {
  const { data, error } = await getClient()
    .from("posts")
    .select("id, title, slug, category, tags, published_at")
    .eq("category", category)
    .not("published_at", "is", null)
    .order("published_at", { ascending: false });

  if (error) throw error;
  return (data as Post[]) ?? [];
}

export async function getPostBySlug(category: Category, slug: string): Promise<Post | null> {
  const { data, error } = await getClient()
    .from("posts")
    .select("*")
    .eq("category", category)
    .eq("slug", slug)
    .not("published_at", "is", null)
    .single();

  if (error) return null;
  return data as Post;
}

export async function getCommentsByPost(postId: string): Promise<Comment[]> {
  const { data, error } = await getClient()
    .from("comments")
    .select("*")
    .eq("post_id", postId)
    .order("created_at", { ascending: true });

  if (error) throw error;
  return (data as Comment[]) ?? [];
}
