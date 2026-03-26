"use client";

import { useState } from "react";
import { useT } from "@/contexts/LanguageContext";
import type { Pet } from "../_lib/supabase-pets";

interface Props {
  pet: Pet;
}

export default function PetPageLost({ pet }: Props) {
  const { t } = useT();
  const p = t.radarPet.petPage.lost;

  const [status, setStatus] = useState<"idle" | "loading" | "denied">("idle");
  const [copied, setCopied] = useState(false);

  function handleCopyLink() {
    navigator.clipboard.writeText(window.location.href).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  }

  function handleSaw() {
    setStatus("loading");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        const mapsUrl = `https://maps.google.com/?q=${latitude},${longitude}`;
        const text = encodeURIComponent(
          `${pet.name ?? "Seu pet"} pode estar aqui: ${mapsUrl}`
        );
        window.location.href = `https://wa.me/${pet.whatsapp}?text=${text}`;
      },
      () => {
        setStatus("denied");
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="inline-block">
        <span className="font-body text-xs font-bold uppercase tracking-widest px-3 py-1 border-3 border-border bg-red-100 text-red-800">
          {p.badge}
        </span>
      </div>

      {pet.photo_url && (
        <img
          src={pet.photo_url}
          alt={pet.name ?? "Pet"}
          className="w-full max-h-96 object-cover border-3 border-border"
        />
      )}

      <div className="flex flex-col gap-1">
        {pet.name && (
          <h1 className="font-heading text-3xl md:text-5xl font-bold uppercase">{pet.name}</h1>
        )}
        {pet.breed && (
          <p className="font-body text-base text-muted">{pet.breed}</p>
        )}
        <p className="font-body text-sm text-muted">{pet.neighborhood}</p>
        {pet.reward && pet.reward_amount && (
          <p className="font-body text-sm font-bold">Gratificação: {pet.reward_amount}</p>
        )}
      </div>

      {pet.description && (
        <p className="font-body text-base leading-relaxed">{pet.description}</p>
      )}

      <div className="flex flex-col gap-3">
        <p className="font-body text-sm text-muted">{p.locationPrompt}</p>
        {status === "denied" ? (
          <button
            disabled
            className="brutal-btn brutal-btn-adaptive px-8 py-5 font-body text-lg font-bold uppercase tracking-wide opacity-50 cursor-not-allowed"
          >
            {p.btnGpsDenied}
          </button>
        ) : (
          <button
            onClick={handleSaw}
            disabled={status === "loading"}
            className="brutal-btn brutal-btn-adaptive px-8 py-5 font-body text-lg font-bold uppercase tracking-wide disabled:opacity-70"
          >
            {status === "loading" ? p.gettingLocation : p.btnSaw}
          </button>
        )}

        <button
          onClick={handleCopyLink}
          className="font-body text-sm font-bold uppercase tracking-wide px-8 py-4 border-3 border-border bg-background hover:bg-foreground/5 transition-colors"
        >
          {copied ? "✓ Link copiado!" : "Copiar link"}
        </button>
      </div>
    </div>
  );
}
