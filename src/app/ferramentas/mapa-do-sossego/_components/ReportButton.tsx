"use client";

import { useState } from "react";
import type { NoiseType } from "../_lib/supabase-noise";
import { useT } from "@/contexts/LanguageContext";

type NoiseCategory = {
  type: NoiseType;
  emoji: string;
};

const NOISY_CATEGORY_KEYS: NoiseCategory[] = [
  { type: "latidos",    emoji: "🐕" },
  { type: "festas",     emoji: "🎵" },
  { type: "bares",      emoji: "🍻" },
  { type: "transito",   emoji: "🚗" },
  { type: "igrejas",    emoji: "⛪" },
  { type: "industrias", emoji: "🏭" },
  { type: "alarmes",    emoji: "🚨" },
  { type: "vizinhanca", emoji: "🗣️" },
];

type Step   = "choose" | "noisy-categories";
type Status = "idle" | "locating" | "sending" | "success" | "error" | "cooldown";

const COOLDOWN_MS  = 5 * 60 * 1000;
const COOLDOWN_KEY = "noise_last_report";

function getCooldownRemaining(): number {
  try {
    const last = localStorage.getItem(COOLDOWN_KEY);
    if (!last) return 0;
    const r = COOLDOWN_MS - (Date.now() - Number(last));
    return r > 0 ? r : 0;
  } catch { return 0; }
}

export default function ReportButton({ onReported }: { onReported?: () => void }) {
  const [open, setOpen]           = useState(false);
  const [step, setStep]           = useState<Step>("choose");
  const [status, setStatus]       = useState<Status>("idle");
  const [errorMsg, setErrorMsg]   = useState("");
  const [cooldownSec, setCooldownSec] = useState(0);
  const { t } = useT();

  const reportTypeLabels: Record<string, string> = {
    latidos:    t.map.report.reportTypes.barking,
    festas:     t.map.report.reportTypes.parties,
    bares:      t.map.report.reportTypes.bars,
    transito:   t.map.report.reportTypes.traffic,
    igrejas:    t.map.report.reportTypes.churches,
    industrias: t.map.report.reportTypes.industries,
    alarmes:    t.map.report.reportTypes.alarms,
    vizinhanca: t.map.report.reportTypes.neighbors,
  };

  function handleOpen() {
    const remaining = getCooldownRemaining();
    if (remaining > 0) {
      setStatus("cooldown");
      setCooldownSec(Math.ceil(remaining / 1000));
      const interval = setInterval(() => {
        const r = getCooldownRemaining();
        if (r <= 0) { clearInterval(interval); setStatus("idle"); setCooldownSec(0); }
        else setCooldownSec(Math.ceil(r / 1000));
      }, 1000);
    } else {
      setStatus("idle");
    }
    setStep("choose");
    setErrorMsg("");
    setOpen(true);
  }

  function handleClose() {
    if (status === "locating" || status === "sending") return;
    setOpen(false);
    setStep("choose");
    setStatus("idle");
  }

  async function sendReport(noiseType: NoiseType) {
    setStatus("locating");
    setErrorMsg("");

    let coords: GeolocationCoordinates;
    try {
      coords = await new Promise<GeolocationCoordinates>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
          (p) => resolve(p.coords),
          (e) => reject(e),
          { enableHighAccuracy: true, timeout: 10000 }
        );
      });
    } catch {
      setStatus("error");
      setErrorMsg(t.map.report.errorLocation);
      return;
    }

    setStatus("sending");

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/validate-noise-report`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({
            noise_type: noiseType,
            lng: Math.round(coords.longitude * 1000) / 1000,
            lat: Math.round(coords.latitude * 1000) / 1000,
          }),
        }
      );

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error((body as { error?: string }).error ?? `Erro ${res.status}`);
      }

      localStorage.setItem(COOLDOWN_KEY, String(Date.now()));
      setStatus("success");
      onReported?.();
      setTimeout(() => { setStatus("idle"); setOpen(false); setStep("choose"); }, 2000);
    } catch (err) {
      setStatus("error");
      setErrorMsg(err instanceof Error ? err.message : t.map.report.errorSend);
    }
  }

  const busy = status === "locating" || status === "sending";

  return (
    <>
      {/* Botão de reporte */}
      <button
        onClick={handleOpen}
        className="w-14 h-14 rounded-full bg-acid text-black font-body font-bold text-xl flex items-center justify-center transition-transform active:scale-95 map-btn-fixed border-3"
        aria-label="Reportar ruído"
      >
        +
      </button>

      {/* Overlay */}
      {open && (
        <div
          className="fixed inset-0 z-[20] bg-black/60"
          onClick={handleClose}
        />
      )}

      {/* Bottom sheet */}
      <div
        className={`fixed bottom-0 left-0 right-0 z-[30] bg-background border-t-3 border-border brutal-shadow transition-transform duration-300 ${
          open ? "translate-y-0" : "translate-y-full"
        }`}
      >
        <div className="p-6 flex flex-col gap-5 max-w-lg mx-auto">
          <div className="flex items-center justify-between">
            <h2 className="font-heading text-xl font-bold uppercase">
              {step === "noisy-categories" ? t.map.report.noiseTypePrompt : t.map.report.prompt}
            </h2>
            <button
              onClick={handleClose}
              disabled={busy}
              className="font-body text-muted text-sm uppercase tracking-wide disabled:opacity-40"
            >
              {t.map.report.close}
            </button>
          </div>

          {/* Estados de feedback */}
          {status === "cooldown" ? (
            <p className="font-body text-center text-muted uppercase tracking-wide py-4 text-sm">
              Aguarde {Math.floor(cooldownSec / 60)}:{String(cooldownSec % 60).padStart(2, "0")} para reportar novamente
            </p>
          ) : status === "success" ? (
            <p className="font-body text-center text-green-400 font-bold uppercase tracking-wide py-4">
              {t.map.report.success}
            </p>
          ) : status === "locating" ? (
            <p className="font-body text-center text-muted uppercase tracking-wide py-4 animate-pulse">
              {t.map.report.locating}
            </p>
          ) : status === "sending" ? (
            <p className="font-body text-center text-muted uppercase tracking-wide py-4 animate-pulse">
              {t.map.report.sending}
            </p>
          ) : step === "choose" ? (
            /* Passo 1 — Sossegado ou Barulhento */
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => sendReport("sossegado")}
                className="bg-green-500 hover:bg-green-400 text-black font-body font-bold uppercase tracking-wide text-sm py-6 px-3 border-3 border-border brutal-shadow flex flex-col items-center gap-2 transition-transform active:scale-95"
              >
                <span className="text-3xl">🌿</span>
                {t.map.report.quiet.replace("🌿 ", "")}
              </button>
              <button
                onClick={() => setStep("noisy-categories")}
                className="bg-red-500 hover:bg-red-400 text-black font-body font-bold uppercase tracking-wide text-sm py-6 px-3 border-3 border-border brutal-shadow flex flex-col items-center gap-2 transition-transform active:scale-95"
              >
                <span className="text-3xl">🔊</span>
                {t.map.report.noisy.replace("🔊 ", "")}
              </button>
            </div>
          ) : (
            /* Passo 2 — Categorias de ruído */
            <>
              <button
                onClick={() => setStep("choose")}
                className="self-start font-body text-muted text-xs uppercase tracking-wide"
              >
                {t.map.report.back}
              </button>
              <div className="grid grid-cols-2 gap-2">
                {NOISY_CATEGORY_KEYS.map(({ type, emoji }) => (
                  <button
                    key={type}
                    onClick={() => sendReport(type)}
                    className="bg-card hover:bg-card/80 text-foreground font-body text-xs uppercase tracking-wide py-3 px-3 border-2 border-border brutal-shadow flex items-center gap-2 transition-transform active:scale-95 text-left"
                  >
                    <span className="text-xl shrink-0">{emoji}</span>
                    {reportTypeLabels[type]}
                  </button>
                ))}
              </div>
            </>
          )}

          {status === "error" && (
            <p className="font-body text-center text-red-400 text-sm">{errorMsg}</p>
          )}
        </div>
      </div>
    </>
  );
}
