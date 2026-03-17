"use server";

import { createSupabaseAdmin } from "@/lib/supabase-server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function createPost(formData: FormData) {
  const supabase = createSupabaseAdmin();

  const title = formData.get("title") as string;
  const slug = formData.get("slug") as string;
  const category = formData.get("category") as string;
  const content = formData.get("content") as string;
  const tagsRaw = formData.get("tags") as string;
  const coverImage = formData.get("cover_image") as string;
  const publish = formData.get("publish") === "true";

  const tags = tagsRaw
    .split(",")
    .map((t) => t.trim().toLowerCase())
    .filter(Boolean);

  const { data, error } = await supabase
    .from("posts")
    .insert({
      title,
      slug,
      category,
      content,
      tags,
      cover_image: coverImage || null,
      published_at: publish ? new Date().toISOString() : null,
    })
    .select("id")
    .single();

  if (error) throw new Error(error.message);

  revalidatePath("/conteudo");
  revalidatePath(`/conteudo/${category}`);
  redirect(`/admin/${data.id}`);
}

export async function updatePost(formData: FormData) {
  const supabase = createSupabaseAdmin();

  const id = formData.get("id") as string;
  const title = formData.get("title") as string;
  const slug = formData.get("slug") as string;
  const category = formData.get("category") as string;
  const content = formData.get("content") as string;
  const tagsRaw = formData.get("tags") as string;
  const coverImage = formData.get("cover_image") as string;
  const publish = formData.get("publish") === "true";
  const currentPublishedAt = formData.get("current_published_at") as string;

  const tags = tagsRaw
    .split(",")
    .map((t) => t.trim().toLowerCase())
    .filter(Boolean);

  const { error } = await supabase
    .from("posts")
    .update({
      title,
      slug,
      category,
      content,
      tags,
      cover_image: coverImage || null,
      published_at: publish
        ? currentPublishedAt || new Date().toISOString()
        : null,
    })
    .eq("id", id);

  if (error) throw new Error(error.message);

  revalidatePath("/conteudo");
  revalidatePath(`/conteudo/${category}`);
  revalidatePath(`/conteudo/${category}/${slug}`);
  revalidatePath("/admin");
}

export async function deletePost(formData: FormData) {
  const supabase = createSupabaseAdmin();
  const id = formData.get("id") as string;

  const { data: post } = await supabase
    .from("posts")
    .select("category, slug")
    .eq("id", id)
    .single();

  await supabase.from("posts").delete().eq("id", id);

  if (post) {
    revalidatePath("/conteudo");
    revalidatePath(`/conteudo/${post.category}`);
    revalidatePath(`/conteudo/${post.category}/${post.slug}`);
  }

  revalidatePath("/admin");
  redirect("/admin");
}

export async function uploadImage(formData: FormData): Promise<string> {
  const supabase = createSupabaseAdmin();
  const file = formData.get("file") as File;

  const ext = file.name.split(".").pop();
  const filename = `${crypto.randomUUID()}.${ext}`;

  const { error } = await supabase.storage
    .from("post-images")
    .upload(filename, file, { contentType: file.type, upsert: false });

  if (error) throw new Error(error.message);

  const { data } = supabase.storage
    .from("post-images")
    .getPublicUrl(filename);

  return data.publicUrl;
}
