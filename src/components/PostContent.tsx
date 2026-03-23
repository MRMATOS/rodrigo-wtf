"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import rehypeSanitize, { defaultSchema } from "rehype-sanitize";
import rehypeHighlight from "rehype-highlight";

const sanitizeSchema = {
  ...defaultSchema,
  attributes: {
    ...defaultSchema.attributes,
    code: [...(defaultSchema.attributes?.code ?? []), "className"],
    img: [...(defaultSchema.attributes?.img ?? []), "src", "alt", "width", "height", "style"],
    span: [...(defaultSchema.attributes?.span ?? []), "className", "style"],
  },
  tagNames: [
    ...(defaultSchema.tagNames ?? []),
    "mark",
    "sup",
    "sub",
    "details",
    "summary",
  ],
};
import "highlight.js/styles/github-dark.css";
import ImageLightbox from "./ImageLightbox";

export default function PostContent({ content }: { content: string }) {
  const [lightbox, setLightbox] = useState<{ src: string; alt: string } | null>(null);

  return (
    <>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw, [rehypeSanitize, sanitizeSchema], rehypeHighlight]}
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
          p: ({ children }) => <p className="mb-4 leading-relaxed">{children}</p>,
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
          img: ({ src, alt, width, height, style }) => (
            <img
              src={src}
              alt={alt ?? ""}
              width={width}
              height={height}
              className="border-3 border-border my-4 cursor-zoom-in"
              style={style ?? { width: width ? undefined : "100%" }}
              onClick={() => typeof src === "string" && setLightbox({ src, alt: alt ?? "" })}
            />
          ),
        }}
      >
        {content}
      </ReactMarkdown>

      {lightbox && (
        <ImageLightbox
          src={lightbox.src}
          alt={lightbox.alt}
          onClose={() => setLightbox(null)}
        />
      )}
    </>
  );
}
