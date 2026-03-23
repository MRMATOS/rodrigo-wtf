"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { getNoiseSegments, getNoiseReports, getNoiseZones } from "../_lib/supabase-noise";
import type { NoiseSegmentFeature, NoiseReportFeature, NoiseZone } from "../_lib/supabase-noise";
import HeatmapLayer   from "./HeatmapLayer";
import PolylinesLayer from "./PolylinesLayer";
import ReportButton   from "./ReportButton";
import FilterBar      from "./FilterBar";
import StatsPanel     from "./StatsPanel";
import TrajetoPanel   from "./TrajetoPanel";
import { useT } from "@/contexts/LanguageContext";

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN!;

const INITIAL_ZOOM = 15;

type Shift     = "all" | "day" | "night";
type Intensity = "all" | "high" | "quiet";
type MapMode   = "calor" | "trajeto";

export default function MapClient() {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef       = useRef<mapboxgl.Map | null>(null);
  const { t } = useT();

  const [mapLoaded, setMapLoaded] = useState(false);
  const [segments,  setSegments]  = useState<NoiseSegmentFeature[]>([]);
  const [reports,   setReports]   = useState<NoiseReportFeature[]>([]);
  const [zones,     setZones]     = useState<NoiseZone[]>([]);
  const [mode,      setMode]      = useState<MapMode>("calor");
  const [shift,           setShift]           = useState<Shift>("all");
  const [intensityFilter, setIntensityFilter] = useState<Intensity>("all");

  const reloadData = useCallback(() => {
    getNoiseSegments().then(setSegments).catch(console.error);
    getNoiseReports().then(setReports).catch(console.error);
    getNoiseZones().then(setZones).catch(console.error);
  }, []);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: "mapbox://styles/mapbox/dark-v11",
      center: [-46.6333, -23.5505],
      zoom: INITIAL_ZOOM,
      attributionControl: false,
    });

    map.addControl(new mapboxgl.AttributionControl({ compact: true }), "bottom-right");
    map.addControl(new mapboxgl.NavigationControl({ showCompass: false }), "bottom-right");

    const geolocate = new mapboxgl.GeolocateControl({
      positionOptions: { enableHighAccuracy: true },
      trackUserLocation: true,
      showUserHeading: true,
      showAccuracyCircle: false,
    });
    map.addControl(geolocate, "bottom-right");

    map.on("load", () => {
      setMapLoaded(true);
      geolocate.trigger(); // ativa automaticamente ao carregar
    });
    mapRef.current = map;

    return () => { map.remove(); mapRef.current = null; };
  }, []);

  useEffect(() => { reloadData(); }, [reloadData]);

  const heatLegend = [
    { color: "#7f1d1d", label: t.map.legend.veryNoisy },
    { color: "#ef4444", label: t.map.legend.noisy },
    { color: "#eab308", label: t.map.legend.moderate },
    { color: "#22c55e", label: t.map.legend.quiet },
  ];

  const lineLegend = [
    { color: "#ef4444", label: t.map.legend.noisy },
    { color: "#22c55e", label: t.map.legend.quiet },
  ];

  return (
    <div className="relative w-full h-full">
      <div ref={containerRef} className="w-full h-full" />

      {mapLoaded && mapRef.current && (
        mode === "calor" ? (
          <HeatmapLayer
            map={mapRef.current}
            segments={[]}
            reports={reports}
            shift={shift}
            intensityFilter={intensityFilter}
          />
        ) : (
          <PolylinesLayer map={mapRef.current} segments={segments} />
        )
      )}

      {/* Coluna de controles — direita */}
      <div className="absolute top-6 right-4 z-[10] flex flex-col items-end gap-2 w-28">

        {/* Toggle de modo */}
        <div className="flex w-full border-2 border-black" style={{ boxShadow: "3px 3px 0 #000" }}>
          <button
            onClick={() => setMode("calor")}
            className={`flex-1 font-body text-xs uppercase tracking-wide py-2 transition-all ${
              mode === "calor" ? "map-chip-active" : "map-chip"
            }`}
          >
            🌡️
          </button>
          <button
            onClick={() => setMode("trajeto")}
            className={`flex-1 font-body text-xs uppercase tracking-wide py-2 transition-all border-l-2 border-black ${
              mode === "trajeto" ? "map-chip-active" : "map-chip"
            }`}
          >
            🚶
          </button>
        </div>

        {mode === "calor" ? (
          <>
            <FilterBar
              shift={shift}
              intensityFilter={intensityFilter}
              onShiftChange={setShift}
              onIntensityChange={setIntensityFilter}
            />
            {mapLoaded && mapRef.current && (
              <div className="flex gap-1 w-full justify-end">
                {/* Centralizar na minha localização */}
                <button
                  onClick={() => {
                    navigator.geolocation.getCurrentPosition(
                      (pos) => mapRef.current?.flyTo({
                        center: [pos.coords.longitude, pos.coords.latitude],
                        zoom: 16,
                        speed: 1.5,
                      }),
                      () => {},
                      { enableHighAccuracy: true, timeout: 8000 }
                    );
                  }}
                  className="w-14 h-10 font-body text-base transition-all active:scale-95 flex items-center justify-center map-btn-fixed map-stats-btn border-2"
                  aria-label={t.map.myLocation}
                >
                  📍
                </button>
                <StatsPanel map={mapRef.current} zones={zones} />
              </div>
            )}
            <ReportButton onReported={reloadData} />
          </>
        ) : (
          mapLoaded && mapRef.current && (
            <TrajetoPanel map={mapRef.current} onSegmentsUpdated={reloadData} />
          )
        )}
      </div>

      {/* Legenda */}
      <div className="absolute bottom-12 left-4 flex flex-col gap-1 pointer-events-none">
        {mode === "calor" ? (
          <>
            {heatLegend.map(({ color, label }) => (
              <div key={label} className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
                <span className="font-body text-xs text-white opacity-80 uppercase tracking-wide">{label}</span>
              </div>
            ))}
          </>
        ) : (
          <>
            {lineLegend.map(({ color, label }) => (
              <div key={label} className="flex items-center gap-2">
                <span className="w-4 h-1.5 rounded-full" style={{ backgroundColor: color }} />
                <span className="font-body text-xs text-white opacity-80 uppercase tracking-wide">{label}</span>
              </div>
            ))}
            <div className="flex items-center gap-2 mt-1">
              <span className="font-body text-xs text-white opacity-50 uppercase tracking-wide">{t.map.legend.clickLine}</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
