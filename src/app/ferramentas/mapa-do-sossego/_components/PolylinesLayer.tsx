"use client";

import { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import type { NoiseSegmentFeature } from "../_lib/supabase-noise";

interface Props {
  map:      mapboxgl.Map;
  segments: NoiseSegmentFeature[];
}

const SOURCE_ID = "noise-segments-source";
const LAYER_ID  = "noise-segments-layer";

const CATEGORY_LABEL: Record<string, string> = {
  sossegado:   "🌿 Sossegado",
  latidos:     "🐕 Latidos constantes",
  festas:      "🎵 Festas e vida noturna",
  bares:       "🍻 Bares e pessoas na rua",
  transito:    "🚗 Trânsito barulhento",
  igrejas:     "⛪ Igrejas e cultos",
  industrias:  "🏭 Indústrias ou oficinas",
  alarmes:     "🚨 Alarmes ou sirenes",
  vizinhanca:  "🗣️ Vizinhança ruidosa",
};

export default function PolylinesLayer({ map, segments }: Props) {
  const popupRef = useRef<mapboxgl.Popup | null>(null);

  useEffect(() => {
    const features: GeoJSON.Feature<GeoJSON.LineString>[] = [];

    for (const seg of segments) {
      try {
        const geom = JSON.parse(seg.geojson) as GeoJSON.LineString;
        const noisy = seg.noise_type !== "sossegado";
        features.push({
          type: "Feature",
          geometry: geom,
          properties: {
            noise_type: seg.noise_type,
            // Binário: vermelho = qualquer barulho, verde = sossegado
            color:      noisy ? "#ef4444" : "#22c55e",
            // Intensidade futura: por enquanto intensity 1 = fino, 3 = normal
            // Quando houver múltiplos reportes sobrepostos, intensity sobe
            width_base: seg.intensity,
          },
        });
      } catch { /* geom inválida */ }
    }

    const geojson: GeoJSON.FeatureCollection = { type: "FeatureCollection", features };

    if (map.getSource(SOURCE_ID)) {
      (map.getSource(SOURCE_ID) as mapboxgl.GeoJSONSource).setData(geojson);
    } else {
      map.addSource(SOURCE_ID, { type: "geojson", data: geojson });

      // Linha de fundo (halo) para legibilidade
      map.addLayer({
        id: `${LAYER_ID}-halo`,
        type: "line",
        source: SOURCE_ID,
        layout: { "line-join": "round", "line-cap": "round" },
        paint: {
          "line-color": "#000000",
          "line-width": ["interpolate", ["linear"], ["zoom"], 14, 5, 18, 11],
          "line-opacity": 0.4,
        },
      });

      // Linha principal — espessura proporcional a intensity
      map.addLayer({
        id: LAYER_ID,
        type: "line",
        source: SOURCE_ID,
        layout: { "line-join": "round", "line-cap": "round" },
        paint: {
          "line-color": ["get", "color"],
          "line-width": [
            "interpolate", ["linear"], ["zoom"],
            14, ["*", ["get", "width_base"], 2],
            18, ["*", ["get", "width_base"], 4],
          ],
          "line-opacity": 0.9,
        },
      });
    }

    // Click → popup com categoria
    function handleClick(e: mapboxgl.MapMouseEvent & { features?: mapboxgl.MapboxGeoJSONFeature[] }) {
      const features = map.queryRenderedFeatures(e.point, { layers: [LAYER_ID] });
      if (!features.length) return;

      const props      = features[0].properties as { noise_type: string };
      const noisy      = props.noise_type !== "sossegado";
      const label      = CATEGORY_LABEL[props.noise_type] ?? props.noise_type;
      const bgColor    = noisy ? "#ef4444" : "#22c55e";

      popupRef.current?.remove();
      popupRef.current = new mapboxgl.Popup({ closeButton: true, maxWidth: "220px", offset: 8 })
        .setLngLat(e.lngLat)
        .setHTML(`
          <div style="background:${bgColor};padding:8px 28px 8px 10px;
                      font-size:11px;text-transform:uppercase;letter-spacing:0.06em;
                      font-weight:700;white-space:nowrap;">
            ${label}
          </div>
        `)
        .addTo(map);
    }

    function handleMouseEnter() { map.getCanvas().style.cursor = "pointer"; }
    function handleMouseLeave() { map.getCanvas().style.cursor = ""; }

    map.on("click",       LAYER_ID, handleClick);
    map.on("mouseenter",  LAYER_ID, handleMouseEnter);
    map.on("mouseleave",  LAYER_ID, handleMouseLeave);

    return () => {
      map.off("click",      LAYER_ID, handleClick);
      map.off("mouseenter", LAYER_ID, handleMouseEnter);
      map.off("mouseleave", LAYER_ID, handleMouseLeave);
      popupRef.current?.remove();
      try {
        if (map.getLayer(LAYER_ID))          map.removeLayer(LAYER_ID);
        if (map.getLayer(`${LAYER_ID}-halo`)) map.removeLayer(`${LAYER_ID}-halo`);
        if (map.getSource(SOURCE_ID))         map.removeSource(SOURCE_ID);
      } catch { /* mapa já destruído */ }
    };
  }, [map, segments]);

  return null;
}
