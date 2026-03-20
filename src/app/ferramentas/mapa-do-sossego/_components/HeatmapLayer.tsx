"use client";

import { useEffect } from "react";
import type mapboxgl from "mapbox-gl";
import type { NoiseSegmentFeature, NoiseReportFeature } from "../_lib/supabase-noise";

interface Props {
  map: mapboxgl.Map;
  segments: NoiseSegmentFeature[];
  reports: NoiseReportFeature[];
  shift?: "day" | "night" | "all";
  intensityFilter?: "high" | "quiet" | "all";
}

const NOISY_SOURCE  = "heatmap-noisy-source";
const NOISY_LAYER   = "heatmap-noisy-layer";
const QUIET_SOURCE  = "heatmap-quiet-source";
const QUIET_LAYER   = "heatmap-quiet-layer";

function isDay(isoDate: string): boolean {
  const h = new Date(isoDate).getHours();
  return h >= 6 && h < 18;
}

function buildCollection(features: GeoJSON.Feature<GeoJSON.Point>[]): GeoJSON.FeatureCollection {
  return { type: "FeatureCollection", features };
}

export default function HeatmapLayer({
  map, segments, reports, shift = "all", intensityFilter = "all",
}: Props) {
  useEffect(() => {
    const noisyFeatures: GeoJSON.Feature<GeoJSON.Point>[] = [];
    const quietFeatures: GeoJSON.Feature<GeoJSON.Point>[] = [];

    // Segmentos de trajeto — ponto médio
    for (const seg of segments) {
      try {
        const geom = JSON.parse(seg.geojson) as GeoJSON.LineString;
        const mid = Math.floor(geom.coordinates.length / 2);
        const [lng, lat] = geom.coordinates[mid];
        const isNoisy = seg.noise_type !== "sossegado";
        if (intensityFilter === "high"  && !isNoisy) continue;
        if (intensityFilter === "quiet" && isNoisy)  continue;
        const target = isNoisy ? noisyFeatures : quietFeatures;
        target.push({ type: "Feature", geometry: { type: "Point", coordinates: [lng, lat] }, properties: { weight: isNoisy ? seg.intensity : 1 } });
      } catch { /* geom inválida */ }
    }

    // Reportes pontuais
    for (const rep of reports) {
      if (shift === "day"   && !isDay(rep.reported_at)) continue;
      if (shift === "night" && isDay(rep.reported_at))  continue;
      const isNoisy = rep.noise_type !== "sossegado";
      if (intensityFilter === "high"  && !isNoisy) continue;
      if (intensityFilter === "quiet" && isNoisy)  continue;
      try {
        const geom = JSON.parse(rep.geojson) as GeoJSON.Point;
        const target = isNoisy ? noisyFeatures : quietFeatures;
        target.push({ type: "Feature", geometry: geom, properties: { weight: 1 } });
      } catch { /* geom inválida */ }
    }

    // ── Layer de barulho (transparente → amarelo → vermelho) ──────────────
    if (map.getSource(NOISY_SOURCE)) {
      (map.getSource(NOISY_SOURCE) as mapboxgl.GeoJSONSource).setData(buildCollection(noisyFeatures));
    } else {
      map.addSource(NOISY_SOURCE, { type: "geojson", data: buildCollection(noisyFeatures) });
      map.addLayer({
        id: NOISY_LAYER, type: "heatmap", source: NOISY_SOURCE,
        paint: {
          "heatmap-weight":     ["get", "weight"],
          "heatmap-intensity":  ["interpolate", ["linear"], ["zoom"], 8, 0.6, 14, 2.0, 18, 3.0],
          "heatmap-radius":     ["interpolate", ["linear"], ["zoom"], 8, 80, 12, 120, 14, 160, 18, 200],
          "heatmap-opacity":    0.8,
          "heatmap-color": [
            "interpolate", ["linear"], ["heatmap-density"],
            0,    "rgba(0,0,0,0)",
            0.2,  "#eab308",   // 1 reporte isolado → amarelo
            0.5,  "#f97316",   // alguns reportes → laranja
            0.75, "#ef4444",   // crítico → vermelho
            1.0,  "#7f1d1d",   // muito crítico → bordô
          ],
        },
      });
    }

    // ── Layer de sossego (transparente → verde) ───────────────────────────
    if (map.getSource(QUIET_SOURCE)) {
      (map.getSource(QUIET_SOURCE) as mapboxgl.GeoJSONSource).setData(buildCollection(quietFeatures));
    } else {
      map.addSource(QUIET_SOURCE, { type: "geojson", data: buildCollection(quietFeatures) });
      map.addLayer({
        id: QUIET_LAYER, type: "heatmap", source: QUIET_SOURCE,
        paint: {
          "heatmap-weight":     ["get", "weight"],
          "heatmap-intensity":  ["interpolate", ["linear"], ["zoom"], 8, 0.6, 14, 2.0, 18, 3.0],
          "heatmap-radius":     ["interpolate", ["linear"], ["zoom"], 8, 80, 12, 120, 14, 160, 18, 200],
          "heatmap-opacity":    0.8,
          "heatmap-color": [
            "interpolate", ["linear"], ["heatmap-density"],
            0,    "rgba(0,0,0,0)",
            0.2,  "#86efac",   // 1 reporte isolado → verde claro
            0.6,  "#22c55e",   // vários → verde
            1.0,  "#15803d",   // muitos → verde escuro
          ],
        },
      });
    }

    return () => {
      try {
        if (map.getLayer(NOISY_LAYER))   map.removeLayer(NOISY_LAYER);
        if (map.getSource(NOISY_SOURCE)) map.removeSource(NOISY_SOURCE);
        if (map.getLayer(QUIET_LAYER))   map.removeLayer(QUIET_LAYER);
        if (map.getSource(QUIET_SOURCE)) map.removeSource(QUIET_SOURCE);
      } catch { /* mapa já destruído */ }
    };
  }, [map, segments, reports, shift, intensityFilter]);

  return null;
}
