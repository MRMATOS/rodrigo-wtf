"use client";

import { useState, useEffect } from "react";
import type mapboxgl from "mapbox-gl";
import type { NoiseZone } from "../_lib/supabase-noise";

interface Props {
  map:   mapboxgl.Map;
  zones: NoiseZone[];
}

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
    // "Bairro, Cidade" ou só "Cidade"
    const city = feat.context?.find((c) => c.text)?.text;
    return city ? `${feat.text}, ${city}` : feat.text;
  } catch {
    return `${lat.toFixed(3)}, ${lng.toFixed(3)}`;
  }
}

export default function StatsPanel({ map, zones }: Props) {
  const [open, setOpen]       = useState(false);
  const [names, setNames]     = useState<Record<string, string>>({});

  const noisy = zones.filter((z) => z.noisy_count > 0).slice(0, 5);
  const quiet = zones.filter((z) => z.quiet_count > 0 && z.noisy_count === 0).slice(0, 5);

  // Reverse geocode ao abrir o painel pela primeira vez
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

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-14 h-10 font-body text-base transition-all active:scale-95 flex items-center justify-center map-btn-fixed map-stats-btn border-2"
        aria-label="Estatísticas"
      >
        📊
      </button>

      <div
        className={`absolute top-12 right-0 z-[15] w-64 bg-background border-3 border-border brutal-shadow transition-all duration-200 overflow-hidden ${
          open ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2 pointer-events-none"
        }`}
      >
        <div className="p-4 flex flex-col gap-4">
          <h3 className="font-heading text-sm font-bold uppercase">Estatísticas</h3>

          {zones.length === 0 ? (
            <p className="font-body text-xs text-muted">Ainda sem dados suficientes.</p>
          ) : (
            <>
              {noisy.length > 0 && (
                <section>
                  <p className="font-body text-xs text-red-400 uppercase tracking-wide mb-2">🔴 Mais críticas</p>
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

              {quiet.length > 0 && (
                <section>
                  <p className="font-body text-xs text-green-400 uppercase tracking-wide mb-2">🟢 Mais silenciosas</p>
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
            </>
          )}
        </div>
      </div>
    </div>
  );
}
