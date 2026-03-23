"use client";

import { useState, useRef, useTransition } from "react";
import dynamic from "next/dynamic";
import { createPost, updatePost, uploadImage } from "../actions";
import type { Post } from "@/lib/supabase";
import type { ICommand } from "@uiw/react-md-editor";

const MDEditor = dynamic(() => import("@uiw/react-md-editor"), { ssr: false });

const imageSizeCommand: ICommand = {
  name: "image-size",
  keyCommand: "image-size",
  buttonProps: { "aria-label": "Imagem 50%", title: "Reduzir imagem para 50%" },
  icon: (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
      <text x="0" y="18" fontSize="13" fontWeight="bold" fontFamily="sans-serif">½</text>
    </svg>
  ),
  execute(state, api) {
    const selected = state.selectedText;
    const match = selected.match(/!\[([^\]]*)\]\(([^)]+)\)/);
    if (match) {
      const [, alt, src] = match;
      api.replaceSelection(`<img src="${src}" alt="${alt}" style="width:50%;height:auto;" />`);
    }
  },
};

const highlightCommand: ICommand = {
  name: "highlight",
  keyCommand: "highlight",
  buttonProps: { "aria-label": "Highlight", title: "Highlight (Ctrl+H)" },
  icon: (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
      <text x="0" y="18" fontSize="18" fontWeight="bold" fontFamily="sans-serif">H</text>
    </svg>
  ),
  execute(state, api) {
    const selected = state.selectedText || "texto";
    api.replaceSelection(`<mark>${selected}</mark>`);
  },
};

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

interface PostEditorProps {
  post?: Post & { cover_image?: string };
}

export default function PostEditor({ post }: PostEditorProps) {
  const [title, setTitle] = useState(post?.title ?? "");
  const [slug, setSlug] = useState(post?.slug ?? "");
  const [category, setCategory] = useState<"sites-e-aplicativos" | "analises" | "projetos">(
    (post?.category as "sites-e-aplicativos" | "analises" | "projetos") ?? "analises"
  );
  const [tags, setTags] = useState(post?.tags?.join(", ") ?? "");
  const [content, setContent] = useState(post?.content ?? "");
  const [coverImage, setCoverImage] = useState(post?.cover_image ?? "");
  const [isPublished, setIsPublished] = useState(!!post?.published_at);
  const [uploading, setUploading] = useState(false);
  const [saveMsg, setSaveMsg] = useState("");
  const [isPending, startTransition] = useTransition();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const cursorPosRef = useRef<number | null>(null);

  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (!post) setSlug(generateSlug(val));
  };

  const handleImageUpload = async (file: File): Promise<string> => {
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const url = await uploadImage(fd);
      return url;
    } finally {
      setUploading(false);
    }
  };

  const handleInlineImageInsert = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = await handleImageUpload(file);
    const imageMarkdown = `\n\n![${file.name}](${url})\n`;
    setContent((prev) => {
      const pos = cursorPosRef.current ?? prev.length;
      return prev.slice(0, pos) + imageMarkdown + prev.slice(pos);
    });
    e.target.value = "";
  };

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = await handleImageUpload(file);
    setCoverImage(url);
    e.target.value = "";
  };

  const handleSubmit = (publish: boolean) => {
    const fd = new FormData();
    if (post) fd.append("id", post.id);
    fd.append("title", title);
    fd.append("slug", slug);
    fd.append("category", category);
    fd.append("content", content);
    fd.append("tags", tags);
    fd.append("cover_image", coverImage);
    fd.append("publish", String(publish));
    if (post?.published_at) fd.append("current_published_at", post.published_at);

    startTransition(async () => {
      if (post) {
        await updatePost(fd);
        setSaveMsg("Salvo!");
        setTimeout(() => setSaveMsg(""), 2000);
      } else {
        await createPost(fd);
      }
    });
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Title */}
      <div className="flex flex-col gap-2">
        <label className="font-body text-xs font-bold uppercase tracking-wide opacity-60">
          Título
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => handleTitleChange(e.target.value)}
          placeholder="Título do post"
          className="border-3 border-border bg-background text-foreground font-body text-lg font-bold px-4 py-3 w-full focus:outline-none focus:border-acid"
        />
      </div>

      {/* Slug + Category row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex flex-col gap-2">
          <label className="font-body text-xs font-bold uppercase tracking-wide opacity-60">
            Slug
          </label>
          <input
            type="text"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            placeholder="meu-post-aqui"
            className="border-3 border-border bg-background text-foreground font-body text-sm px-4 py-3 w-full focus:outline-none focus:border-acid"
          />
        </div>
        <div className="flex flex-col gap-2">
          <label className="font-body text-xs font-bold uppercase tracking-wide opacity-60">
            Categoria
          </label>
          <select
            value={category}
            onChange={(e) =>
              setCategory(e.target.value as "sites-e-aplicativos" | "analises" | "projetos")
            }
            className="border-3 border-border bg-background text-foreground font-body text-sm px-4 py-3 w-full focus:outline-none focus:border-acid"
          >
            <option value="sites-e-aplicativos">Sites e Aplicativos</option>
            <option value="analises">Críticas e Análises</option>
            <option value="projetos">Ideias e Projetos</option>
          </select>
        </div>
      </div>

      {/* Tags */}
      <div className="flex flex-col gap-2">
        <label className="font-body text-xs font-bold uppercase tracking-wide opacity-60">
          Tags{" "}
          <span className="normal-case opacity-60">(separadas por vírgula)</span>
        </label>
        <input
          type="text"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          placeholder="nextjs, supabase, automação"
          className="border-3 border-border bg-background text-foreground font-body text-sm px-4 py-3 w-full focus:outline-none focus:border-acid"
        />
      </div>

      {/* Cover image */}
      <div className="flex flex-col gap-2">
        <label className="font-body text-xs font-bold uppercase tracking-wide opacity-60">
          Imagem de capa
        </label>
        <div className="flex gap-3 items-center">
          <input
            type="text"
            value={coverImage}
            onChange={(e) => setCoverImage(e.target.value)}
            placeholder="URL da imagem ou faça upload →"
            className="border-3 border-border bg-background text-foreground font-body text-sm px-4 py-3 flex-1 focus:outline-none focus:border-acid"
          />
          <button
            type="button"
            onClick={() => coverInputRef.current?.click()}
            disabled={uploading}
            className="brutal-btn brutal-btn-adaptive px-4 py-3 font-body text-xs font-bold uppercase tracking-wide shrink-0 disabled:opacity-50"
          >
            {uploading ? "..." : "Upload"}
          </button>
          <input
            ref={coverInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleCoverUpload}
          />
        </div>
        {coverImage && (
          <img
            src={coverImage}
            alt="Capa"
            className="w-full max-h-48 object-cover border-3 border-border"
          />
        )}
      </div>

      {/* Markdown editor */}
      <div
        className="flex flex-col gap-2"
        onDragOver={(e) => e.preventDefault()}
        onDrop={async (e) => {
          e.preventDefault();
          const file = Array.from(e.dataTransfer.files).find((f) => f.type.startsWith("image/"));
          if (!file) return;
          const textarea = document.querySelector<HTMLTextAreaElement>(".w-md-editor-text-input");
          cursorPosRef.current = textarea?.selectionStart ?? null;
          const url = await handleImageUpload(file);
          const imageMarkdown = `\n\n![${file.name}](${url})\n`;
          setContent((prev) => {
            const pos = cursorPosRef.current ?? prev.length;
            return prev.slice(0, pos) + imageMarkdown + prev.slice(pos);
          });
        }}
      >
        <div className="flex items-center justify-between">
          <label className="font-body text-xs font-bold uppercase tracking-wide opacity-60">
            Conteúdo (Markdown)
          </label>
          <button
            type="button"
            onClick={() => {
              const textarea = document.querySelector<HTMLTextAreaElement>(".w-md-editor-text-input");
              cursorPosRef.current = textarea?.selectionStart ?? null;
              fileInputRef.current?.click();
            }}
            disabled={uploading}
            className="font-body text-xs font-bold uppercase tracking-wide px-3 py-1.5 border-3 border-border hover:bg-acid hover:text-[#000000] disabled:opacity-50"
            style={{ transitionTimingFunction: "steps(1)", transitionDuration: "0s", transitionProperty: "background-color, color" }}
          >
            {uploading ? "Enviando..." : "[+] Inserir imagem"}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleInlineImageInsert}
          />
        </div>
        <div data-color-mode="light" className="border-3 border-border">
          <MDEditor
            value={content}
            onChange={(val) => setContent(val ?? "")}
            height={500}
            preview="live"
            extraCommands={[imageSizeCommand, highlightCommand]}
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 pt-2 border-t-3 border-border">
        <button
          type="button"
          onClick={() => handleSubmit(false)}
          disabled={isPending || !title || !slug}
          className="brutal-btn bg-background px-6 py-3 font-body text-sm font-bold uppercase tracking-wide hover:bg-acid hover:text-[#000000] disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ transitionTimingFunction: "steps(1)", transitionDuration: "0s", transitionProperty: "background-color, color" }}
        >
          {isPending ? "Salvando..." : "Salvar rascunho"}
        </button>
        <button
          type="button"
          onClick={() => handleSubmit(true)}
          disabled={isPending || !title || !slug}
          className="brutal-btn brutal-btn-adaptive px-6 py-3 font-body text-sm font-bold uppercase tracking-wide disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isPublished ? "Atualizar publicação" : "Publicar"}
        </button>
        {saveMsg && (
          <span className="font-body text-xs font-bold text-acid ml-2">
            {saveMsg}
          </span>
        )}
        {post && (
          <a
            href={`/conteudo/${post.category}/${post.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="font-body text-xs opacity-50 hover:opacity-100 ml-auto underline"
          >
            Ver post →
          </a>
        )}
      </div>
    </div>
  );
}
