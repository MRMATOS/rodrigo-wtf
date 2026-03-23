import { ImageResponse } from "next/og";
import { getPostBySlug, type Category } from "@/lib/supabase";

export const runtime = "edge";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OgImage({
  params,
}: {
  params: Promise<{ categoria: string; slug: string }>;
}) {
  const { categoria, slug } = await params;

  const post = await getPostBySlug(categoria as Category, slug).catch(() => null);
  const title = post?.title ?? "rodrigo.wtf";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          backgroundColor: "#0a0a0a",
          padding: "64px",
          fontFamily: "monospace",
          border: "3px solid #CCFF00",
        }}
      >
        {/* Top label */}
        <div style={{ display: "flex", color: "#CCFF00", fontSize: 18, letterSpacing: 4, textTransform: "uppercase" }}>
          // rodrigo.wtf
        </div>

        {/* Title */}
        <div
          style={{
            color: "#F4F4F0",
            fontSize: title.length > 60 ? 48 : title.length > 40 ? 56 : 68,
            fontWeight: 700,
            textTransform: "uppercase",
            lineHeight: 1.1,
            letterSpacing: -1,
            maxWidth: "90%",
          }}
        >
          {title}
        </div>

        {/* Bottom bar */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
          <div style={{ color: "#666", fontSize: 16, letterSpacing: 2, textTransform: "uppercase" }}>
            rodrigo matos · A.I Builder
          </div>
          <div
            style={{
              backgroundColor: "#CCFF00",
              color: "#000",
              fontSize: 14,
              fontWeight: 700,
              letterSpacing: 3,
              textTransform: "uppercase",
              padding: "8px 16px",
            }}
          >
            conteúdo
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
