import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "rodrigo.wtf — Eu faço sites funcionais";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "#000000",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          justifyContent: "center",
          padding: "80px",
          fontFamily: "monospace",
        }}
      >
        <div
          style={{
            color: "#CCFF00",
            fontSize: 22,
            letterSpacing: "0.25em",
            marginBottom: 32,
            textTransform: "uppercase",
          }}
        >
          RODRIGO.WTF
        </div>
        <div
          style={{
            color: "#FFFFFF",
            fontSize: 80,
            fontWeight: 700,
            lineHeight: 1.05,
            textTransform: "uppercase",
            marginBottom: 32,
          }}
        >
          EU FAÇO SITES FUNCIONAIS
        </div>
        <div
          style={{
            color: "#A0A0A0",
            fontSize: 28,
          }}
        >
          Sites, ferramentas e consultoria. Sem enrolação.
        </div>
      </div>
    ),
    { ...size }
  );
}
