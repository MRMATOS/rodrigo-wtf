"use client";

import { useRef } from "react";
import html2canvas from "html2canvas";
import { QRCodeSVG } from "qrcode.react";
import type { Pet } from "../_lib/supabase-pets";

interface Props {
  pet: Pet;
  onClose: () => void;
}

export default function PosterGenerator({ pet, onClose }: Props) {
  const posterRef = useRef<HTMLDivElement>(null);
  const petUrl = typeof window !== "undefined"
    ? `${window.location.origin}/ferramentas/radar-pet/pet/${pet.id}`
    : `/ferramentas/radar-pet/pet/${pet.id}`;

  async function handleDownload() {
    if (!posterRef.current) return;
    const canvas = await html2canvas(posterRef.current, {
      scale: 2,
      useCORS: true,
      backgroundColor: "#ffffff",
    });
    const link = document.createElement("a");
    link.download = `cartaz-${pet.name ?? "pet"}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  }

  const caption = [
    pet.name,
    pet.breed,
    pet.neighborhood,
  ].filter(Boolean).join(" · ");

  return (
    <>
      <div className="fixed inset-0 z-[40] bg-black/70" onClick={onClose} />
      <div className="fixed inset-0 z-[50] flex items-center justify-center p-6 overflow-auto pointer-events-none">
        <div className="pointer-events-auto flex flex-col gap-4 items-center">
          {/* Cartaz A4 — 794x1123px */}
          <div
            ref={posterRef}
            style={{
              width: "794px",
              minHeight: "1123px",
              backgroundColor: "#ffffff",
              padding: "48px",
              display: "flex",
              flexDirection: "column",
              gap: "24px",
              fontFamily: "'Neue Haas Grotesk', 'Arial Black', sans-serif",
              color: "#000000",
            }}
          >
            {/* Título */}
            <h1
              style={{
                fontSize: "96px",
                fontWeight: "900",
                textTransform: "uppercase",
                lineHeight: 1,
                letterSpacing: "-2px",
                margin: 0,
              }}
            >
              PROCURA-SE
            </h1>

            {/* Foto */}
            <div
              style={{
                width: "100%",
                height: "480px",
                border: "4px solid #000",
                overflow: "hidden",
                flexShrink: 0,
              }}
            >
              {pet.photo_url && (
                <img
                  src={pet.photo_url}
                  alt={pet.name ?? "Pet"}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  crossOrigin="anonymous"
                />
              )}
            </div>

            {/* Legenda */}
            <div style={{ textAlign: "center" }}>
              <p style={{ fontWeight: "700", fontSize: "22px", margin: 0 }}>
                {caption}
              </p>
              {pet.reward && pet.reward_amount && (
                <p style={{ fontWeight: "700", fontSize: "18px", margin: "8px 0 0 0" }}>
                  Gratificação: {pet.reward_amount}
                </p>
              )}
            </div>

            {/* Descrição + QR Code */}
            <div style={{ display: "flex", gap: "24px", alignItems: "flex-start", flex: 1 }}>
              <p style={{ flex: 1, fontSize: "18px", fontWeight: "700", lineHeight: 1.5, margin: 0 }}>
                {pet.description}
              </p>
              <div style={{ flexShrink: 0 }}>
                <QRCodeSVG
                  value={petUrl}
                  size={160}
                  bgColor="#ffffff"
                  fgColor="#000000"
                  level="M"
                />
                <p style={{ fontSize: "10px", textAlign: "center", marginTop: "4px", fontWeight: "600" }}>
                  Escaneie e avise!
                </p>
              </div>
            </div>
          </div>

          {/* Controles */}
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
