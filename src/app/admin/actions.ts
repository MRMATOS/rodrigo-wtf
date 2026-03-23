"use server";

import { createSupabaseAdmin, createSupabaseServer } from "@/lib/supabase-server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const VALID_CATEGORIES = ["analises", "projetos", "sites-e-aplicativos"];

async function requireAdmin() {
  const supabase = await createSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.email !== process.env.ADMIN_EMAIL) {
    throw new Error("Unauthorized");
  }
  return user;
}

export async function createPost(formData: FormData) {
  await requireAdmin();
  const supabase = createSupabaseAdmin();

  const title = formData.get("title") as string;
  const slug = formData.get("slug") as string;
  const category = formData.get("category") as string;

  if (!title || !slug || !category) throw new Error("Missing required fields");
  if (!SLUG_RE.test(slug)) throw new Error("Invalid slug format");
  if (!VALID_CATEGORIES.includes(category)) throw new Error("Invalid category");
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
  await requireAdmin();
  const supabase = createSupabaseAdmin();

  const id = formData.get("id") as string;
  const title = formData.get("title") as string;
  const slug = formData.get("slug") as string;
  const category = formData.get("category") as string;

  if (!id || !UUID_RE.test(id)) throw new Error("Invalid post ID");
  if (!title || !slug || !category) throw new Error("Missing required fields");
  if (!SLUG_RE.test(slug)) throw new Error("Invalid slug format");
  if (!VALID_CATEGORIES.includes(category)) throw new Error("Invalid category");
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
  await requireAdmin();
  const supabase = createSupabaseAdmin();
  const id = formData.get("id") as string;

  if (!id || !UUID_RE.test(id)) throw new Error("Invalid post ID");

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

const ALLOWED_EXTS = ["jpg", "jpeg", "png", "webp", "avif", "gif"];
const ALLOWED_MIMES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
  "image/gif",
];
const MAX_UPLOAD_SIZE = 5 * 1024 * 1024; // 5 MB

const MAGIC_BYTES: Record<string, number[][]> = {
  "image/jpeg": [[0xff, 0xd8, 0xff]],
  "image/png": [[0x89, 0x50, 0x4e, 0x47]],
  "image/webp": [[0x52, 0x49, 0x46, 0x46]], // RIFF
  "image/gif": [
    [0x47, 0x49, 0x46, 0x38, 0x37, 0x61], // GIF87a
    [0x47, 0x49, 0x46, 0x38, 0x39, 0x61], // GIF89a
  ],
  "image/avif": [], // AVIF uses ftyp box — validated by MIME + ext
};

function matchesMagicBytes(buffer: Uint8Array, mime: string): boolean {
  const signatures = MAGIC_BYTES[mime];
  if (!signatures || signatures.length === 0) return true; // no signature to check
  return signatures.some((sig) =>
    sig.every((byte, i) => buffer[i] === byte)
  );
}

export async function uploadImage(formData: FormData): Promise<string> {
  await requireAdmin();
  const supabase = createSupabaseAdmin();
  const file = formData.get("file") as File;

  if (!file || file.size === 0) throw new Error("No file provided");
  if (file.size > MAX_UPLOAD_SIZE) throw new Error("File too large");

  const ext = file.name.split(".").pop()?.toLowerCase();
  if (!ext || !ALLOWED_EXTS.includes(ext)) {
    throw new Error("File type not allowed");
  }
  if (!ALLOWED_MIMES.includes(file.type)) {
    throw new Error("MIME type not allowed");
  }

  const buffer = new Uint8Array(await file.arrayBuffer());
  if (!matchesMagicBytes(buffer, file.type)) {
    throw new Error("File content does not match declared type");
  }

  const filename = `${crypto.randomUUID()}.${ext}`;

  const { error } = await supabase.storage
    .from("post-images")
    .upload(filename, buffer, { contentType: file.type, upsert: false });

  if (error) throw new Error(error.message);

  const { data } = supabase.storage
    .from("post-images")
    .getPublicUrl(filename);

  return data.publicUrl;
}
