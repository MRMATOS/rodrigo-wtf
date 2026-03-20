"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import mapboxgl from "mapbox-gl";
import type { NoiseType } from "../_lib/supabase-noise";
import LoginModal from "./LoginModal";
import { useAuth } from "../_lib/use-auth";
import { snapToRoad } from "../_lib/map-matching";

interface Props {
  map: mapboxgl.Map;
  onSegmentsUpdated: () => void;
}

type RecordingStatus = "idle" | "recording" | "classifying" | "sending" | "done";
type ReportStep = "choose" | "noisy-categories";

const NOISY_CATEGORIES: { type: NoiseType; label: string; emoji: string }[] = [
  { type: "latidos",    label: "Latidos",          emoji: "🐕" },
  { type: "festas",     label: "Festas/noturno",   emoji: "🎵" },
  { type: "bares",      label: "Bares/rua",        emoji: "🍻" },
  { type: "transito",   label: "Trânsito",         emoji: "🚗" },
  { type: "igrejas",    label: "Igrejas/cultos",   emoji: "⛪" },
  { type: "industrias", label: "Indústrias",       emoji: "🏭" },
  { type: "alarmes",    label: "Alarmes/sirenes",  emoji: "🚨" },
  { type: "vizinhanca", label: "Vizinhança",       emoji: "🗣️" },
];

const MAX_DURATION_MS   = 5 * 60 * 1000; // 5 minutos
const SEGMENT_INTERVAL  = 30 * 1000;     // classifica a cada 30s
const SOURCE_ID         = "trajeto-live-source";
const LAYER_ID          = "trajeto-live-layer";

export default function TrajetoPanel({ map, onSegmentsUpdated }: Props) {
  const { user, loading, signInWithGoogle, getAccessToken } = useAuth();
  const [showLogin, setShowLogin]       = useState(false);
  const [status, setStatus]             = useState<RecordingStatus>("idle");
  const [reportStep, setReportStep]     = useState<ReportStep>("choose");
  const [timeLeft, setTimeLeft]         = useState(MAX_DURATION_MS);

  // Pontos GPS acumulados na sessão atual
  const pointsRef      = useRef<[number, number][]>([]);
  // Pontos desde o último checkpoint (para o segmento atual)
  const segPointsRef   = useRef<[number, number][]>([]);
  const watchIdRef     = useRef<number | null>(null);
  const timerRef       = useRef<ReturnType<typeof setInterval> | null>(null);
  const segTimerRef    = useRef<ReturnType<typeof setInterval> | null>(null);
  const sessionIdRef   = useRef<string>(crypto.randomUUID());
  const segmentsRef    = useRef<{ coords: [number,number][]; noise_type: NoiseType }[]>([]);
  const startTimeRef   = useRef<number>(0);

  // Atualiza a linha ao vivo no mapa
  const updateLiveLine = useCallback((coords: [number, number][]) => {
    if (coords.length < 2) return;
    const geojson: GeoJSON.FeatureCollection = {
      type: "FeatureCollection",
      features: [{
        type: "Feature",
        geometry: { type: "LineString", coordinates: coords },
        properties: {},
      }],
    };
    if (map.getSource(SOURCE_ID)) {
      (map.getSource(SOURCE_ID) as mapboxgl.GeoJSONSource).setData(geojson);
    } else {
      map.addSource(SOURCE_ID, { type: "geojson", data: geojson });
      map.addLayer({
        id: LAYER_ID,
        type: "line",
        source: SOURCE_ID,
        paint: {
          "line-color": "#CCFF00",
          "line-width": 4,
          "line-dasharray": [2, 1],
        },
      });
    }
  }, [map]);

  function removeLiveLine() {
    try {
      if (map.getLayer(LAYER_ID))   map.removeLayer(LAYER_ID);
      if (map.getSource(SOURCE_ID)) map.removeSource(SOURCE_ID);
    } catch { /* mapa destruído */ }
  }

  function startRecording() {
    sessionIdRef.current  = crypto.randomUUID();
    pointsRef.current     = [];
    segPointsRef.current  = [];
    segmentsRef.current   = [];
    startTimeRef.current  = Date.now();
    setTimeLeft(MAX_DURATION_MS);
    setStatus("recording");

    // Countdown
    timerRef.current = setInterval(() => {
      const elapsed = Date.now() - startTimeRef.current;
      const remaining = MAX_DURATION_MS - elapsed;
      if (remaining <= 0) {
        stopAndClassify();
      } else {
        setTimeLeft(remaining);
      }
    }, 1000);

    // Watch position
    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        const coord: [number, number] = [pos.coords.longitude, pos.coords.latitude];
        pointsRef.current.push(coord);
        segPointsRef.current.push(coord);
        updateLiveLine(pointsRef.current);
        map.panTo(coord);
      },
      (err) => console.error("GPS error:", err),
      { enableHighAccuracy: true, maximumAge: 2000 }
    );
  }

  function stopAndClassify() {
    clearInterval(timerRef.current!);
    clearInterval(segTimerRef.current!);
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    // Se há pontos pendentes, pede classificação do último trecho
    if (segPointsRef.current.length >= 2) {
      setStatus("classifying");
      setReportStep("choose");
    } else {
      sendSegments();
    }
  }

  async function classifySegment(noiseType: NoiseType) {
    if (segPointsRef.current.length >= 2) {
      // Snap-to-road antes de guardar o segmento
      const snapped = await snapToRoad([...segPointsRef.current]);
      segmentsRef.current.push({ coords: snapped, noise_type: noiseType });
    }
    segPointsRef.current = [];

    // Atualiza linha ao vivo com todos os segmentos snapped + pontos atuais
    const allSnapped = segmentsRef.current.flatMap((s) => s.coords);
    if (allSnapped.length >= 2) updateLiveLine(allSnapped);

    await sendSegments();
  }

  async function sendSegments() {
    if (segmentsRef.current.length === 0) {
      removeLiveLine();
      setStatus("idle");
      return;
    }
    setStatus("sending");

    try {
      const token = await getAccessToken();
      if (!token) throw new Error("Sessão expirada. Faça login novamente.");

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/validate-noise-segment`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
          body: JSON.stringify({
            session_id: sessionIdRef.current,
            segments:   segmentsRef.current.map((seg) => ({
              noise_type: seg.noise_type,
              coords:     seg.coords,
            })),
          }),
        }
      );

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error((body as { error?: string }).error ?? `Erro ${res.status}`);
      }

      onSegmentsUpdated();
    } catch (err) {
      console.error("Erro ao salvar segmentos:", err);
    }

    removeLiveLine();
    setStatus("done");
    setTimeout(() => setStatus("idle"), 2500);
  }

  // Limpa ao desmontar
  useEffect(() => {
    return () => {
      clearInterval(timerRef.current!);
      clearInterval(segTimerRef.current!);
      if (watchIdRef.current !== null) navigator.geolocation.clearWatch(watchIdRef.current);
      removeLiveLine();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const minutes = Math.floor(timeLeft / 60000);
  const seconds = Math.floor((timeLeft % 60000) / 1000);

  if (loading) return null;

  return (
    <>
      {showLogin && (
        <LoginModal
          onLogin={() => { setShowLogin(false); signInWithGoogle(); }}
          onClose={() => setShowLogin(false)}
        />
      )}

      {/* Painel de gravação */}
      {status === "idle" && (
        <button
          onClick={() => { if (!user) { setShowLogin(true); } else { startRecording(); } }}
          className="w-full font-body font-bold text-xs uppercase tracking-wide px-3 py-2 map-chip-active text-center"
        >
          🚶 Gravar Trajeto
        </button>
      )}

      {status === "recording" && (
        <div className="flex flex-col gap-1 items-end">
          <div className="font-body text-xs uppercase tracking-wide px-3 py-1.5 bg-[#F4F4F0] text-black border-2 border-black animate-pulse"
            style={{ boxShadow: "3px 3px 0 #000" }}>
            ⏱ {minutes}:{String(seconds).padStart(2, "0")}
          </div>
          <button
            onClick={stopAndClassify}
            className="w-full font-body font-bold text-xs uppercase tracking-wide px-3 py-2 bg-red-500 text-black border-2 border-black"
            style={{ boxShadow: "3px 3px 0 #000" }}
          >
            ⏹ Parar
          </button>
        </div>
      )}

      {status === "classifying" && (
        <div className="fixed inset-0 z-[40] flex items-end justify-center pointer-events-none">
          <div className="pointer-events-auto w-full max-w-lg bg-[#F4F4F0] border-t-3 border-black p-5 flex flex-col gap-4"
            style={{ boxShadow: "0 -4px 0 #000" }}>
            <p className="font-heading text-base font-bold uppercase text-black">
              {reportStep === "choose" ? "Como estava o ruído nesse trecho?" : "Qual tipo de barulho?"}
            </p>

            {reportStep === "choose" ? (
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => classifySegment("sossegado")}
                  className="bg-green-500 text-black font-body font-bold uppercase text-sm py-5 border-3 border-black flex flex-col items-center gap-1 active:scale-95"
                  style={{ boxShadow: "4px 4px 0 #000" }}
                >
                  <span className="text-2xl">🌿</span> Sossegado
                </button>
                <button
                  onClick={() => setReportStep("noisy-categories")}
                  className="bg-red-500 text-black font-body font-bold uppercase text-sm py-5 border-3 border-black flex flex-col items-center gap-1 active:scale-95"
                  style={{ boxShadow: "4px 4px 0 #000" }}
                >
                  <span className="text-2xl">🔊</span> Barulhento
                </button>
              </div>
            ) : (
              <>
                <button
                  onClick={() => setReportStep("choose")}
                  className="self-start font-body text-xs text-black/50 uppercase tracking-wide !text-black/50"
                >
                  ← Voltar
                </button>
                <div className="grid grid-cols-2 gap-2">
                  {NOISY_CATEGORIES.map(({ type, label, emoji }) => (
                    <button
                      key={type}
                      onClick={() => classifySegment(type)}
                      className="bg-white text-black font-body text-xs uppercase tracking-wide py-3 px-2 border-2 border-black flex items-center gap-2 active:scale-95 text-left"
                      style={{ boxShadow: "3px 3px 0 #000" }}
                    >
                      <span className="text-lg shrink-0">{emoji}</span>
                      {label}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {status === "sending" && (
        <div className="font-body text-xs uppercase tracking-wide px-3 py-2 bg-[#F4F4F0] text-black border-2 border-black animate-pulse"
          style={{ boxShadow: "3px 3px 0 #000" }}>
          Salvando…
        </div>
      )}

      {status === "done" && (
        <div className="font-body text-xs uppercase tracking-wide px-3 py-2 bg-green-500 text-black border-2 border-black font-bold"
          style={{ boxShadow: "3px 3px 0 #000" }}>
          ✓ Trajeto salvo!
        </div>
      )}
    </>
  );
}
