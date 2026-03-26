"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import Link from "next/link";
import { QRCodeCanvas } from "qrcode.react";
import { useT } from "@/contexts/LanguageContext";

// ─── Constants ────────────────────────────────────────────────────────────────

const EXPORT_SCALE   = 3;
const PREVIEW_HEIGHT = 280; // fixed px — all templates same height in preview

const COLORS = [
  { label: "Azul",    value: "#4D7FFF" },
  { label: "Verde",   value: "#16A34A" },
  { label: "Roxo",    value: "#7C3AED" },
  { label: "Laranja", value: "#EA580C" },
  { label: "Preto",   value: "#111111" },
];

type TemplateId = "qr-only" | "ticket" | "card";

const TEMPLATES: { id: TemplateId; label: string }[] = [
  { id: "qr-only", label: "Padrão" },
  { id: "ticket",  label: "Ticket" },
  { id: "card",    label: "A4"     },
];

const DIMS: Record<TemplateId, { w: number; h: number }> = {
  "qr-only": { w: 480, h: 480 },
  ticket:    { w: 900, h: 300 },
  card:      { w: 800, h: 500 },
};

// ─── Template props ───────────────────────────────────────────────────────────

interface TplProps {
  url:      string;
  info:     string;
  caption:  string;
  color:    string;
  noBorder?: boolean;
  s?:       number; // scale multiplier
}

// ─── Template 1: Só o QR ─────────────────────────────────────────────────────

function TplQrOnly({ url, caption, color, noBorder, s = 1 }: TplProps) {
  const { w, h } = DIMS["qr-only"];
  const qrSize   = Math.round((noBorder ? 400 : 320) * s);

  return (
    <div style={{
      width: w * s, height: h * s,
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      backgroundColor: noBorder ? "#ffffff" : color,
      borderRadius: 20 * s,
      gap: 14 * s,
      fontFamily: "Arial, Helvetica, sans-serif",
    }}>
      {noBorder ? (
        <QRCodeCanvas value={url} size={qrSize} bgColor="#ffffff" fgColor="#000000" level="M" />
      ) : (
        <div style={{
          backgroundColor: "#ffffff",
          padding: 12 * s,
          borderRadius: 12 * s,
        }}>
          <QRCodeCanvas value={url} size={qrSize} bgColor="#ffffff" fgColor="#000000" level="M" />
        </div>
      )}
      {caption && (
        <span style={{
          fontSize: 22 * s,
          color: noBorder ? "#111111" : "#ffffff",
          opacity: noBorder ? 1 : 0.85,
          textAlign: "center",
          paddingInline: 24 * s,
        }}>
          {caption}
        </span>
      )}
    </div>
  );
}

// ─── Template 2: Ticket ───────────────────────────────────────────────────────

function TplTicket({ url, info, caption, color, noBorder, s = 1 }: TplProps) {
  const { w, h } = DIMS.ticket;
  const qrSize   = Math.round(160 * s);

  return (
    <div style={{
      width: w * s, height: h * s,
      display: "flex", flexDirection: "row",
      alignItems: "stretch",
      backgroundColor: "#ffffff",
      borderRadius: 24 * s,
      overflow: "hidden",
      fontFamily: "Arial, Helvetica, sans-serif",
    }}>
      <div style={{ flex: 1, display: "flex", alignItems: "center", padding: `${40 * s}px ${48 * s}px` }}>
        <span style={{
          fontSize: (info.length > 30 ? 42 : 54) * s,
          fontWeight: 900, color,
          lineHeight: 1.1, wordBreak: "break-word",
        }}>
          {info || "Seu texto aqui."}
        </span>
      </div>

      <div style={{
        width: 256 * s,
        backgroundColor: noBorder ? "#ffffff" : color,
        borderRadius: `0 ${24 * s}px ${24 * s}px 0`,
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        padding: `${24 * s}px ${24 * s}px ${16 * s}px`,
        gap: 10 * s, flexShrink: 0,
      }}>
        {noBorder ? (
          <QRCodeCanvas value={url} size={qrSize} bgColor="#ffffff" fgColor="#000000" level="M" />
        ) : (
          <div style={{ backgroundColor: "#ffffff", padding: 8 * s, borderRadius: 8 * s }}>
            <QRCodeCanvas value={url} size={qrSize} bgColor="#ffffff" fgColor="#000000" level="M" />
          </div>
        )}
        {caption && (
          <span style={{
            fontSize: 13 * s,
            color: noBorder ? color : "#ffffff",
            opacity: 0.85,
            textAlign: "center",
          }}>
            {caption}
          </span>
        )}
      </div>
    </div>
  );
}

// ─── Template 3: Quadrado ─────────────────────────────────────────────────────

function TplCard({ url, info, caption, color, noBorder, s = 1 }: TplProps) {
  const { w, h } = DIMS.card;
  const qrSize   = Math.round(200 * s);

  return (
    <div style={{
      width: w * s, height: h * s,
      display: "flex", flexDirection: "row",
      alignItems: "center",
      backgroundColor: "#ffffff",
      borderRadius: 20 * s,
      border: noBorder ? "none" : `${4 * s}px solid ${color}`,
      overflow: "hidden",
      fontFamily: "Arial, Helvetica, sans-serif",
      boxSizing: "border-box",
    }}>
      {/* Text */}
      <div style={{ flex: 1, padding: `${48 * s}px ${52 * s}px` }}>
        <span style={{
          fontSize: (info.length > 40 ? 38 : info.length > 20 ? 46 : 56) * s,
          fontWeight: 900, color,
          lineHeight: 1.15, wordBreak: "break-word",
          display: "block",
        }}>
          {info || "Seu texto aqui."}
        </span>
      </div>

      {/* QR + caption */}
      <div style={{
        display: "flex", flexDirection: "column",
        alignItems: "center", gap: 14 * s,
        padding: `${40 * s}px ${48 * s}px`,
        flexShrink: 0,
      }}>
        {noBorder ? (
          <QRCodeCanvas value={url} size={qrSize} bgColor="#ffffff" fgColor="#000000" level="M" />
        ) : (
          <div style={{
            backgroundColor: color,
            padding: 16 * s,
            borderRadius: 16 * s,
          }}>
            <div style={{ backgroundColor: "#ffffff", padding: 8 * s, borderRadius: 8 * s }}>
              <QRCodeCanvas value={url} size={qrSize} bgColor="#ffffff" fgColor="#000000" level="M" />
            </div>
          </div>
        )}
        {caption && (
          <span style={{
            fontSize: 20 * s, color: "#555555",
            textAlign: "center", maxWidth: (qrSize + 48) * s,
          }}>
            {caption}
          </span>
        )}
      </div>
    </div>
  );
}

// ─── Render template by id ────────────────────────────────────────────────────

function RenderTemplate(props: TplProps & { template: TemplateId }) {
  const { template, ...rest } = props;
  if (template === "qr-only") return <TplQrOnly {...rest} />;
  if (template === "ticket")  return <TplTicket {...rest} />;
  return <TplCard {...rest} />;
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function GeradorQRCode() {
  const { t }  = useT();
  const tr     = t.tools.qrGenerator;

  const [mode,     setMode]     = useState<"link" | "wifi">("link");
  const [url,      setUrl]      = useState("");
  const [ssid,       setSsid]       = useState("");
  const [wifiPass,   setWifiPass]   = useState("");
  const [wifiHidden, setWifiHidden] = useState(false);
  const [info,     setInfo]     = useState("");
  const [caption,  setCaption]  = useState("Use a câmera do celular.");
  const [color,    setColor]    = useState(COLORS[0].value);
  const [template, setTemplate] = useState<TemplateId>("ticket");
  const [error,    setError]    = useState("");
  const [downloading, setDownloading] = useState(false);
  const [noBorder,    setNoBorder]    = useState(false);
  const [previewScale, setPreviewScale] = useState(1);
  const [qrCount, setQrCount] = useState<number | null>(null);

  const templateRef        = useRef<HTMLDivElement>(null);
  const previewContainerRef = useRef<HTMLDivElement>(null);

  const dims = DIMS[template];

  useEffect(() => {
    fetch("/api/qr-stats")
      .then((r) => r.json())
      .then((d) => setQrCount(d.count))
      .catch(() => {});
  }, []);

  useEffect(() => {
    const el = previewContainerRef.current;
    if (!el) return;
    const observer = new ResizeObserver(([entry]) => {
      const scaleByWidth  = entry.contentRect.width / dims.w;
      const scaleByHeight = PREVIEW_HEIGHT / dims.h;
      setPreviewScale(Math.min(scaleByWidth, scaleByHeight));
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, [dims.w, dims.h]);

  // Derived QR value
  // Se começar com @, trata como perfil do Instagram
  // Se for só dígitos, trata como número de WhatsApp
  const trimmed = url.trim();
  const resolvedUrl = trimmed.startsWith("@")
    ? `https://www.instagram.com/${trimmed.slice(1)}`
    : /^[\d\s\-()]+$/.test(trimmed) && trimmed.length >= 8
    ? `https://wa.me/55${trimmed.replace(/\D/g, "")}`
    : url;

  const qrValue = mode === "wifi"
    ? `WIFI:T:WPA;S:${ssid};P:${wifiPass};H:${wifiHidden};;`
    : resolvedUrl;

  const hasContent = mode === "wifi" ? ssid.trim().length > 0 : url.trim().length > 0;

  const handleDownload = useCallback(async () => {
    if (!hasContent) { setError(mode === "wifi" ? "Informe o nome da rede Wi-Fi." : tr.errorEmpty); return; }
    setError("");
    setDownloading(true);
    try {
      const html2canvas = (await import("html2canvas")).default;
      const canvas = await html2canvas(templateRef.current!, {
        scale: 1, useCORS: true, backgroundColor: null,
      });
      const link = document.createElement("a");
      link.download = `qrcode-${template}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();

      // Increment counter (fire-and-forget)
      fetch("/api/qr-stats", { method: "POST" })
        .then((r) => r.json())
        .then((d) => setQrCount(d.count))
        .catch(() => {});
    } finally {
      setDownloading(false);
    }
  }, [hasContent, mode, tr.errorEmpty, template]);

  const previewUrl = qrValue || "https://rodrigo.wtf";
  const tplProps: TplProps = { url: previewUrl, info, caption, color, noBorder };

  return (
    <main id="main-content" className="grid grid-cols-4 gap-4 md:gap-8">
      {/* ═══════════ HERO ═══════════ */}
      <header className="col-span-4 border-3 border-border brutal-shadow bg-background relative p-8 md:p-12 lg:py-16 lg:px-12">
        <div className="absolute inset-0 pointer-events-none z-0 opacity-[0.06]" style={{
          backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.08'/%3E%3C/svg%3E\")",
          backgroundRepeat: "repeat", backgroundSize: "200px 200px",
        }} />
        <Link href="/ferramentas" className="font-body text-sm font-bold uppercase tracking-wide text-muted hover:text-foreground transition-colors relative z-[1] block mb-6">
          {t.back}
        </Link>
        <h1 className="font-heading text-[clamp(2.5rem,5vw,8rem)] font-bold uppercase leading-[1.1] tracking-tight relative z-[1]">
          {tr.heroTitle}
        </h1>
        <p className="font-body text-base md:text-lg text-muted mt-4 relative z-[1]">
          {tr.heroSubtitle}
        </p>
      </header>

      {/* ═══════════ INPUTS ═══════════ */}
      <section className="col-span-4 md:col-span-2 border-3 border-border brutal-shadow bg-background p-6 md:p-10 flex flex-col gap-6">

        {/* Mode selector */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex gap-2">
            {(["link", "wifi"] as const).map((m) => (
              <button
                key={m}
                onClick={() => { setMode(m); setError(""); }}
                className={`font-body text-xs font-bold uppercase tracking-widest px-4 py-2 border-3 border-border transition-colors ${
                  mode === m ? "bg-foreground text-background" : "bg-background text-muted hover:text-foreground"
                }`}
              >
                {m === "link" ? "Link / Texto" : "Wi-Fi"}
              </button>
            ))}
          </div>
          {mode === "wifi" && (
            <button
              onClick={() => setWifiHidden((v) => !v)}
              className={`flex items-center gap-2 font-body text-xs font-bold uppercase tracking-widest px-4 py-2 border-3 border-border transition-colors ${
                wifiHidden ? "bg-foreground text-background" : "bg-background text-muted hover:text-foreground"
              }`}
            >
              <span className="w-3 h-3 border-2 border-current flex items-center justify-center flex-shrink-0">
                {wifiHidden && <span className="w-1.5 h-1.5 bg-current block" />}
              </span>
              Rede oculta
            </button>
          )}
        </div>

        {mode === "link" ? (
          <div className="flex flex-col gap-2">
            <label className="font-body text-sm font-bold uppercase tracking-widest text-muted">{tr.labelLink}</label>
            <input
              type="text" value={url}
              onChange={(e) => { setUrl(e.target.value); if (error) setError(""); }}
              placeholder={tr.placeholderLink}
              className="font-body text-base border-3 border-border bg-background px-4 py-3 outline-none focus:border-foreground transition-colors placeholder:text-muted/50"
            />
            {error && <p className="font-body text-sm font-bold text-red-500">{error}</p>}
          </div>
        ) : (
          <>
            <div className="flex flex-col gap-2">
              <label className="font-body text-sm font-bold uppercase tracking-widest text-muted">Nome da rede</label>
              <input
                type="text" value={ssid}
                onChange={(e) => { setSsid(e.target.value); if (error) setError(""); }}
                placeholder="MinhaRede"
                className="font-body text-base border-3 border-border bg-background px-4 py-3 outline-none focus:border-foreground transition-colors placeholder:text-muted/50"
              />
              {error && <p className="font-body text-sm font-bold text-red-500">{error}</p>}
            </div>
            <div className="flex flex-col gap-2">
              <label className="font-body text-sm font-bold uppercase tracking-widest text-muted">Senha</label>
              <input
                type="text" value={wifiPass}
                onChange={(e) => setWifiPass(e.target.value)}
                placeholder="senha123"
                className="font-body text-base border-3 border-border bg-background px-4 py-3 outline-none focus:border-foreground transition-colors placeholder:text-muted/50"
              />
            </div>
          </>
        )}

        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <label className={`font-body text-sm font-bold uppercase tracking-widest ${template === "qr-only" ? "text-muted/30" : "text-muted"}`}>
              {tr.labelInfo}
            </label>
            {template !== "qr-only" && (
              <span className={`font-body text-xs font-bold tabular-nums ${info.length >= 110 ? "text-red-500" : "text-muted"}`}>
                {120 - info.length}
              </span>
            )}
          </div>
          <input
            type="text" value={info}
            onChange={(e) => setInfo(e.target.value)}
            placeholder={template === "qr-only" ? "—" : tr.placeholderInfo}
            disabled={template === "qr-only"}
            maxLength={120}
            className="font-body text-base border-3 border-border bg-background px-4 py-3 outline-none focus:border-foreground transition-colors placeholder:text-muted/50 disabled:opacity-30 disabled:cursor-not-allowed"
          />
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <label className="font-body text-sm font-bold uppercase tracking-widest text-muted">{tr.labelCaption}</label>
            <span className={`font-body text-xs font-bold tabular-nums ${caption.length >= 20 ? "text-red-500" : "text-muted"}`}>
              {30 - caption.length}
            </span>
          </div>
          <input
            type="text" value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder="Use a câmera do celular."
            maxLength={30}
            className="font-body text-base border-3 border-border bg-background px-4 py-3 outline-none focus:border-foreground transition-colors placeholder:text-muted/50"
          />
        </div>

        <button
          onClick={handleDownload}
          disabled={!hasContent || downloading}
          className="brutal-btn brutal-btn-adaptive px-8 py-4 font-body text-base font-bold uppercase tracking-wide disabled:opacity-40 disabled:cursor-not-allowed mt-auto"
        >
          {downloading ? "Gerando..." : tr.btnDownload}
        </button>
      </section>

      {/* ═══════════ PREVIEW ═══════════ */}
      <section className="col-span-4 md:col-span-2 border-3 border-border brutal-shadow bg-background p-6 flex flex-col gap-4 justify-between">

        <div className="flex items-center justify-between">
          <p className="font-body text-xs font-bold uppercase tracking-widest text-muted">preview</p>
          {qrCount !== null && (
            <p className="font-body text-xs font-bold uppercase tracking-widest text-muted">
              {qrCount.toLocaleString("pt-BR")} gerados
            </p>
          )}
        </div>

        <div ref={previewContainerRef} className="w-full" style={{ height: PREVIEW_HEIGHT }}>
          <div style={{ transformOrigin: "top left", transform: `scale(${previewScale})`, width: dims.w }}>
            <RenderTemplate template={template} {...tplProps} />
          </div>
        </div>

        {/* Template switcher + color picker */}
        <div className="flex items-center justify-between gap-2 pt-2 flex-wrap">
          <div className="flex gap-2">
            {TEMPLATES.map((tpl) => (
              <button
                key={tpl.id}
                onClick={() => setTemplate(tpl.id)}
                className={`font-body text-xs font-bold uppercase tracking-widest px-3 py-2 border-3 border-border transition-colors ${
                  template === tpl.id ? "bg-foreground text-background" : "bg-background text-muted hover:text-foreground"
                }`}
              >
                {tpl.label}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            {COLORS.map((c) => (
              <button
                key={c.value}
                onClick={() => setColor(c.value)}
                title={c.label}
                style={{ backgroundColor: c.value }}
                className={`w-7 h-7 rounded-full border-3 transition-transform ${
                  color === c.value ? "border-foreground scale-110" : "border-transparent hover:scale-105"
                }`}
              />
            ))}
            <button
              onClick={() => setNoBorder((v) => !v)}
              className={`flex items-center gap-2 font-body text-xs font-bold uppercase tracking-widest px-3 py-2 border-3 border-border transition-colors ${
                noBorder ? "bg-foreground text-background" : "bg-background text-muted hover:text-foreground"
              }`}
            >
              <span className="w-3 h-3 border-2 border-current flex items-center justify-center flex-shrink-0">
                {noBorder && <span className="w-1.5 h-1.5 bg-current block" />}
              </span>
              Sem borda
            </button>
          </div>
        </div>
      </section>

      {/* Hidden high-res export render */}
      <div aria-hidden ref={templateRef} style={{
        position: "fixed", left: -9999, top: -9999,
        pointerEvents: "none", zIndex: -1,
      }}>
        <RenderTemplate template={template} {...{ ...tplProps, url: url || "https://rodrigo.wtf", s: EXPORT_SCALE }} />
      </div>
    </main>
  );
}
