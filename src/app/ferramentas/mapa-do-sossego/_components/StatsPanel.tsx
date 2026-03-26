"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import type mapboxgl from "mapbox-gl";
import type { NoiseZone } from "../_lib/supabase-noise";
import { useT } from "@/contexts/LanguageContext";

interface Props {
  map:   mapboxgl.Map;
  zones: NoiseZone[];
}

type Filter = "all" | "critical" | "quiet";

async function reverseGeocode(lng: number, lat: number): Promise<string> {
  const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
  if (!token) return `${lat.toFixed(3)}, ${lng.toFixed(3)}`;

  try {
    const res = await fetch(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json` +
      `?types=neighborhood,locality,place&language=pt&limit=1&access_token=${token}`
    );
    if (!res.ok) return `${lat.toFixed(3)}, ${lng.toFixed(3)}`;
    const json = await res.json() as { features?: { text: string; context?: { text: string }[] }[] };
    const feat = json.features?.[0];
    if (!feat) return `${lat.toFixed(3)}, ${lng.toFixed(3)}`;
    const city = feat.context?.find((c) => c.text)?.text;
    return city ? `${feat.text}, ${city}` : feat.text;
  } catch {
    return `${lat.toFixed(3)}, ${lng.toFixed(3)}`;
  }
}

export default function StatsPanel({ map, zones }: Props) {
  const [open, setOpen]     = useState(false);
  const [filter, setFilter] = useState<Filter>("all");
  const [names, setNames]   = useState<Record<string, string>>({});
  const { t } = useT();

  const noisy = zones.filter((z) => z.noisy_count > 0).slice(0, 5);
  const quiet = zones.filter((z) => z.quiet_count > 0 && z.noisy_count === 0).slice(0, 5);

  // Reverse geocode when modal opens for the first time
  useEffect(() => {
    if (!open || zones.length === 0) return;

    const toFetch = [...noisy, ...quiet].filter(
      (z) => !names[`${z.lng},${z.lat}`]
    );
    if (toFetch.length === 0) return;

    Promise.all(
      toFetch.map(async (z) => {
        const name = await reverseGeocode(z.lng, z.lat);
        return { key: `${z.lng},${z.lat}`, name };
      })
    ).then((results) => {
      setNames((prev) => {
        const next = { ...prev };
        results.forEach(({ key, name }) => { next[key] = name; });
        return next;
      });
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, zones]);

  function flyTo(z: NoiseZone) {
    map.flyTo({ center: [z.lng, z.lat], zoom: 16, speed: 1.4 });
    setOpen(false);
  }

  function zoneName(z: NoiseZone) {
    return names[`${z.lng},${z.lat}`] ?? "…";
  }

  function toggleFilter(value: "critical" | "quiet") {
    setFilter((prev) => (prev === value ? "all" : value));
  }

  const showCritical = filter === "all" || filter === "critical";
  const showQuiet    = filter === "all" || filter === "quiet";

  return (
    <>
      {/* Trigger button */}
      <button
        onClick={() => setOpen(true)}
        className="w-14 h-10 font-body text-base transition-all active:scale-95 flex items-center justify-center map-btn-fixed map-stats-btn border-2"
        aria-label={t.map.stats.title}
      >
        📊
      </button>

      {/* Modal portal */}
      {open && createPortal(
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-[100] bg-black/60"
            onClick={() => setOpen(false)}
          />

          {/* Modal */}
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[101] w-[min(90vw,360px)] max-h-[70vh] flex flex-col bg-background border-3 border-border brutal-shadow">
            {/* Header */}
            <div className="flex items-center justify-between px-4 pt-4 pb-3 border-b-2 border-border shrink-0">
              <h3 className="font-heading text-sm font-bold uppercase">{t.map.stats.title}</h3>
              <div className="flex items-center gap-2">
                {/* Filter: critical */}
                <button
                  onClick={() => toggleFilter("critical")}
                  className={`w-8 h-8 flex items-center justify-center border-2 transition-all ${
                    filter === "critical"
                      ? "border-black bg-red-400"
                      : "border-transparent hover:border-border"
                  }`}
                  aria-label="Filtrar críticas"
                >
                  🔴
                </button>
                {/* Filter: quiet */}
                <button
                  onClick={() => toggleFilter("quiet")}
                  className={`w-8 h-8 flex items-center justify-center border-2 transition-all ${
                    filter === "quiet"
                      ? "border-black bg-green-400"
                      : "border-transparent hover:border-border"
                  }`}
                  aria-label="Filtrar silenciosas"
                >
                  🟢
                </button>
                {/* Close */}
                <button
                  onClick={() => setOpen(false)}
                  className="w-8 h-8 flex items-center justify-center border-2 border-transparent hover:border-border font-heading text-sm font-bold transition-all ml-1"
                  aria-label="Fechar"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Content — scrollable */}
            <div className="overflow-y-auto flex flex-col gap-4 p-4">
              {zones.length === 0 ? (
                <p className="font-body text-xs text-muted">{t.map.stats.noData}</p>
              ) : (
                <>
                  {showCritical && noisy.length > 0 && (
                    <section>
                      <p className="font-body text-xs text-red-400 uppercase tracking-wide mb-2">{t.map.stats.mostCritical}</p>
                      {noisy.map((z, i) => (
                        <button
                          key={i}
                          onClick={() => flyTo(z)}
                          className="w-full text-left font-body text-xs py-1.5 px-2 hover:bg-card border border-transparent hover:border-border transition-colors flex justify-between items-center gap-2"
                        >
                          <span className="truncate">{zoneName(z)}</span>
                          <span className="text-red-400 font-bold shrink-0">{z.noisy_count} rep.</span>
                        </button>
                      ))}
                    </section>
                  )}

                  {showQuiet && quiet.length > 0 && (
                    <section>
                      <p className="font-body text-xs text-green-400 uppercase tracking-wide mb-2">{t.map.stats.mostQuiet}</p>
                      {quiet.map((z, i) => (
                        <button
                          key={i}
                          onClick={() => flyTo(z)}
                          className="w-full text-left font-body text-xs py-1.5 px-2 hover:bg-card border border-transparent hover:border-border transition-colors flex justify-between items-center gap-2"
                        >
                          <span className="truncate">{zoneName(z)}</span>
                          <span className="text-green-400 font-bold shrink-0">{z.quiet_count} rep.</span>
                        </button>
                      ))}
                    </section>
                  )}

                  {zones.length > 0 && !noisy.length && !quiet.length && (
                    <p className="font-body text-xs text-muted">{t.map.stats.noData}</p>
                  )}
                </>
              )}
            </div>
          </div>
        </>,
        document.body
      )}
    </>
  );
}
