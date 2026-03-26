"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { getNoiseSegments, getNoiseReports, getNoiseZones } from "../_lib/supabase-noise";
import type { NoiseSegmentFeature, NoiseReportFeature, NoiseZone } from "../_lib/supabase-noise";
import HeatmapLayer   from "./HeatmapLayer";
import PolylinesLayer from "./PolylinesLayer";
import ReportButton   from "./ReportButton";
import FilterBar, { type Shift, type Intensity } from "./FilterBar";
import StatsPanel     from "./StatsPanel";
import TrajetoPanel   from "./TrajetoPanel";
import { useT } from "@/contexts/LanguageContext";

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN!;

const INITIAL_ZOOM = 15;

type MapMode = "calor" | "trajeto";

export default function MapClient() {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef       = useRef<mapboxgl.Map | null>(null);
  const { t } = useT();

  const [mapLoaded, setMapLoaded] = useState(false);
  const [segments,  setSegments]  = useState<NoiseSegmentFeature[]>([]);
  const [reports,   setReports]   = useState<NoiseReportFeature[]>([]);
  const [zones,     setZones]     = useState<NoiseZone[]>([]);
  const [mode,            setMode]            = useState<MapMode>("calor");
  const [shift,           setShift]           = useState<Shift>("all");
  const [intensityFilter, setIntensityFilter] = useState<Intensity>("all");
  const [filtersOpen,     setFiltersOpen]     = useState(false);

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
      <div className="absolute top-6 right-4 z-[10] flex flex-col items-end gap-1 w-28">

        {/* Label Modos */}
        <span className="font-body text-[10px] uppercase tracking-widest opacity-40 pr-1 pb-0.5">
          {t.map.modes.label}
        </span>

        {/* Chips de modo */}
        <div className="flex flex-col w-full border-2 border-black" style={{ boxShadow: "3px 3px 0 #000" }}>
          <button
            onClick={() => setMode("calor")}
            className={`w-full font-body text-xs uppercase tracking-wide px-3 py-2 text-right transition-all active:scale-95 ${
              mode === "calor" ? "map-chip-active" : "map-chip"
            }`}
          >
            {t.map.modes.zone}
          </button>
          <button
            onClick={() => setMode("trajeto")}
            className={`w-full font-body text-xs uppercase tracking-wide px-3 py-2 text-right transition-all active:scale-95 border-t-2 border-black ${
              mode === "trajeto" ? "map-chip-active" : "map-chip"
            }`}
          >
            {t.map.modes.trajeto}
          </button>
        </div>

        {mode === "calor" ? (
          <>
            <div className="h-px bg-black dark:bg-white w-full my-1" />

            {/* Filtros toggle */}
            <div className="flex flex-col w-full border-2 border-black" style={{ boxShadow: "3px 3px 0 #000" }}>
              <button
                onClick={() => setFiltersOpen((v) => !v)}
                className={`w-full font-body text-xs uppercase tracking-wide px-3 py-2 text-right transition-all active:scale-95 ${
                  filtersOpen ? "map-chip-active" : "map-chip"
                }`}
              >
                {t.map.filter.label}
              </button>

              {filtersOpen && (
                <div className="border-t-2 border-black">
                  <FilterBar
                    shift={shift}
                    intensityFilter={intensityFilter}
                    onShiftChange={setShift}
                    onIntensityChange={setIntensityFilter}
                  />
                </div>
              )}
            </div>

            {mapLoaded && mapRef.current && (
              <>
                <div className="h-px bg-black dark:bg-white w-full my-1" />
                <div className="flex gap-1 w-full justify-end">
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
              </>
            )}
          </>
        ) : (
          mapLoaded && mapRef.current && (
            <TrajetoPanel map={mapRef.current} onSegmentsUpdated={reloadData} />
          )
        )}

        <div className="h-px bg-black dark:bg-white w-full my-1" />
        <ReportButton onReported={reloadData} />
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
