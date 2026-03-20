"use client";

import { useEffect } from "react";
import mapboxgl from "mapbox-gl";
import type { NoiseReportFeature } from "../_lib/supabase-noise";

interface Props {
  map: mapboxgl.Map;
  reports: NoiseReportFeature[];
}

const SOURCE_ID = "noise-reports-markers-source";
const LAYER_ID  = "noise-reports-markers-layer";

const NOISE_COLOR: Record<string, string> = {
  loud:      "#ef4444",
  risk:      "#eab308",
  peaceful:  "#22c55e",
};

export default function ReportsMarkerLayer({ map, reports }: Props) {
  useEffect(() => {
    const features: GeoJSON.Feature<GeoJSON.Point>[] = [];

    for (const rep of reports) {
      try {
        const geom = JSON.parse(rep.geojson) as GeoJSON.Point;
        features.push({
          type: "Feature",
          geometry: geom,
          properties: {
            color: NOISE_COLOR[rep.noise_type] ?? "#ffffff",
          },
        });
      } catch {
        // geom inválida, ignora
      }
    }

    const geojson: GeoJSON.FeatureCollection = {
      type: "FeatureCollection",
      features,
    };

    if (map.getSource(SOURCE_ID)) {
      (map.getSource(SOURCE_ID) as mapboxgl.GeoJSONSource).setData(geojson);
    } else {
      map.addSource(SOURCE_ID, { type: "geojson", data: geojson });
      map.addLayer({
        id: LAYER_ID,
        type: "circle",
        source: SOURCE_ID,
        paint: {
          "circle-radius":       ["interpolate", ["linear"], ["zoom"], 14, 6, 18, 12],
          "circle-color":        ["get", "color"],
          "circle-opacity":      0.9,
          "circle-stroke-width": 2,
          "circle-stroke-color": "#000000",
        },
      });
    }

    return () => {
      try {
        if (map.getLayer(LAYER_ID))  map.removeLayer(LAYER_ID);
        if (map.getSource(SOURCE_ID)) map.removeSource(SOURCE_ID);
      } catch {
        // mapa já destruído
      }
    };
  }, [map, reports]);

  return null;
}
