"use client";

import { useRef, useEffect, useState } from "react";
import html2canvas from "html2canvas";
import { QRCodeSVG } from "qrcode.react";
import type { Pet } from "../_lib/supabase-pets";

interface Props {
  pet: Pet;
  onClose: () => void;
}

const POSTER_W = 794;
const POSTER_H = 1123;

interface PosterContentProps {
  pet: Pet;
  petUrl: string;
  statusLabel: string;
  infoLine: string;
  rewardDisplay: string | null;
}

function PosterContent({ pet, petUrl, statusLabel, infoLine }: PosterContentProps) {
  return (
    <div
      style={{
        width: `${POSTER_W}px`,
        minHeight: `${POSTER_H}px`,
        backgroundColor: "#ffffff",
        display: "flex",
        flexDirection: "column",
        fontFamily: "'Space Grotesk', 'Arial Black', sans-serif",
        color: "#000000",
        overflow: "hidden",
      }}
    >
      {/* Cabeçalho — fundo branco, sem tinta desnecessária */}
      <div style={{
        backgroundColor: "#ffffff",
        padding: "20px 48px 40px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "8px",
      }}>
        <h1 style={{
          fontSize: "88px",
          fontWeight: "900",
          textTransform: "uppercase",
          lineHeight: 1,
          letterSpacing: "-2px",
          margin: 0,
          color: "#1a1a1a",
          textAlign: "center",
          fontFamily: "'Space Grotesk', 'Arial Black', sans-serif",
        }}>
          PROCURA-SE
        </h1>
      </div>

      {/* Foto como background-image (fix html2canvas object-fit) */}
      {pet.photo_url && (
        <div style={{
          width: "100%",
          height: "480px",
          backgroundImage: `url(${pet.photo_url})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          flexShrink: 0,
          borderBottom: "4px solid #000",
        }} />
      )}

      {/* Bloco de informações — fundo branco */}
      <div style={{
        backgroundColor: "#ffffff",
        padding: "28px 48px",
        borderBottom: "2px solid #000",
      }}>
        {pet.name && (
          <p style={{
            fontSize: "32px",
            fontWeight: "800",
            margin: "0 0 6px 0",
            lineHeight: 1.1,
            fontFamily: "'Space Grotesk', 'Arial Black', sans-serif",
          }}>
            {pet.name}
          </p>
        )}
        {infoLine && (
          <p style={{
            fontSize: "16px",
            fontWeight: "600",
            color: "#555",
            margin: 0,
            lineHeight: 1.6,
          }}>
            {infoLine}
          </p>
        )}
      </div>

      {/* Descrição — fundo branco, linha divisória embaixo */}
      <div style={{ padding: "24px 48px", flex: 1, borderBottom: "2px solid #000" }}>
        <p style={{
          fontSize: "17px",
          fontWeight: "500",
          lineHeight: 1.65,
          margin: 0,
          color: "#222",
        }}>
          {pet.description}
        </p>
      </div>

      {/* Rodapé com QR — fundo branco, texto preto */}
      <div style={{
        backgroundColor: "#ffffff",
        padding: "28px 48px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "24px",
      }}>
        <div>
          <p style={{
            color: "#1a1a1a",
            fontSize: "12px",
            fontWeight: "700",
            letterSpacing: "2px",
            textTransform: "uppercase",
            margin: "0 0 4px 0",
          }}>
            ESCANEIE E AVISE
          </p>
          <p style={{ color: "#1a1a1a", fontSize: "14px", fontWeight: "600", margin: 0 }}>
            rodrigo.wtf/radar-pet
          </p>
        </div>
        <div style={{ backgroundColor: "#fff", padding: "10px", flexShrink: 0 }}>
          <QRCodeSVG
            value={petUrl}
            size={120}
            bgColor="#ffffff"
            fgColor="#000000"
            level="M"
          />
        </div>
      </div>
    </div>
  );
}

export default function PosterGenerator({ pet, onClose }: Props) {
  // posterRef aponta para o elemento OFF-SCREEN sem nenhum transform — usado pelo html2canvas
  const posterRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  const petUrl = typeof window !== "undefined"
    ? `${window.location.origin}/ferramentas/radar-pet/pet/${pet.id}`
    : `/ferramentas/radar-pet/pet/${pet.id}`;

  useEffect(() => {
    function calcScale() {
      const maxH = window.innerHeight * 0.82;
      const maxW = window.innerWidth * 0.92;
      const s = Math.min(maxH / POSTER_H, maxW / POSTER_W, 1);
      setScale(s);
    }
    calcScale();
    window.addEventListener("resize", calcScale);
    return () => window.removeEventListener("resize", calcScale);
  }, []);

  async function handleDownload() {
    if (!posterRef.current) return;
    const canvas = await html2canvas(posterRef.current, {
      scale: 2,
      useCORS: true,
      backgroundColor: "#ffffff",
    });
    canvas.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.download = `cartaz-${pet.name ?? "pet"}.png`;
      link.href = url;
      link.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    }, "image/png");
  }

  const statusLabel = pet.type === "lost" ? "PERDIDO" : "ENCONTRADO";

  const rewardDisplay = pet.reward && pet.reward_amount
    ? (pet.reward_amount.startsWith("R$") ? pet.reward_amount : `R$ ${pet.reward_amount}`)
    : null;

  const infoLine = [
    pet.breed,
    pet.neighborhood,
    rewardDisplay ? `Gratificação: ${rewardDisplay}` : null,
  ].filter(Boolean).join("  ·  ");

  const contentProps: PosterContentProps = { pet, petUrl, statusLabel, infoLine, rewardDisplay };

  return (
    <>
      {/* Elemento off-screen usado pelo html2canvas — sem transform, sem interferência */}
      <div
        ref={posterRef}
        style={{
          position: "fixed",
          top: "-9999px",
          left: "-9999px",
          width: `${POSTER_W}px`,
          pointerEvents: "none",
        }}
      >
        <PosterContent {...contentProps} />
      </div>

      {/* Overlay — z acima do navbar (z-[100]) */}
      <div className="fixed inset-0 z-[150] bg-black/80" onClick={onClose} />

      {/* Wrapper scrollável — acima do overlay */}
      <div className="fixed inset-0 z-[200] flex flex-col items-center justify-start overflow-y-auto py-6 pointer-events-none">
        <div className="pointer-events-auto flex flex-col items-center gap-4">

          {/* Container com altura real escalada — evita sobreposição com botões */}
          <div style={{
            width: `${POSTER_W * scale}px`,
            height: `${POSTER_H * scale}px`,
            position: "relative",
            flexShrink: 0,
          }}>
            <div style={{
              transform: `scale(${scale})`,
              transformOrigin: "top left",
              width: `${POSTER_W}px`,
              position: "absolute",
              top: 0,
              left: 0,
            }}>
              {/* Preview visual — apenas para exibição, sem ref */}
              <PosterContent {...contentProps} />
            </div>
          </div>

          {/* Controles — sempre abaixo do cartaz */}
          <div className="flex gap-3">
            <button
              onClick={handleDownload}
              className="brutal-btn brutal-btn-adaptive px-8 py-4 font-body font-bold uppercase tracking-wide"
            >
              Baixar PNG
            </button>
            <button
              onClick={onClose}
              className="font-body text-sm font-bold uppercase tracking-wide px-6 py-4 border-3 border-border bg-background"
            >
              Fechar
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
