"use client";

import { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import type { Pet } from "../_lib/supabase-pets";

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN!;

interface Props {
  pets: Pet[];
  city: string;
}

export default function MapHub({ pets, city }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);

  // Inicializa o mapa
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: "mapbox://styles/mapbox/light-v11",
      center: [-46.6333, -23.5505],
      zoom: 12,
      attributionControl: false,
    });

    map.addControl(new mapboxgl.NavigationControl({ showCompass: false }), "bottom-right");

    // Tenta centralizar na cidade via geocoding
    fetch(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(city)}.json?access_token=${mapboxgl.accessToken}&types=place&limit=1`
    )
      .then((r) => r.json())
      .then((data) => {
        const coords = data.features?.[0]?.center;
        if (coords) {
          map.flyTo({ center: coords as [number, number], zoom: 12 });
        }
      })
      .catch(() => {});

    mapRef.current = map;
    return () => { map.remove(); mapRef.current = null; };
  }, [city]);

  // Atualiza markers quando pets mudam
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    // Remove markers antigos
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    // Adiciona novos markers com popup
    pets.forEach((pet) => {
      const el = document.createElement("div");
      el.style.cssText = `
        width: 20px;
        height: 20px;
        border-radius: 50%;
        border: 3px solid #000;
        background: ${pet.type === "lost" ? "#ef4444" : "#22c55e"};
        cursor: pointer;
        box-shadow: 2px 2px 0 #000;
      `;

      const petUrl = `/ferramentas/radar-pet/pet/${pet.id}`;
      const petName = pet.name ?? "Sem nome";
      const badgeColor = pet.type === "lost" ? "#ef4444" : "#22c55e";
      const badgeLabel = pet.type === "lost" ? "Perdido" : "Encontrado";

      const popup = new mapboxgl.Popup({ offset: 16, closeButton: true, maxWidth: "220px" })
        .setHTML(`
          <div style="font-family:sans-serif;display:flex;flex-direction:column;gap:8px;padding:4px;">
            ${pet.photo_url ? `<img src="${pet.photo_url}" alt="${petName}" style="width:100%;height:120px;object-fit:cover;border:2px solid #000;" crossorigin="anonymous" />` : ""}
            <div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap;">
              <strong style="font-size:14px;">${petName}</strong>
              <span style="font-size:11px;font-weight:700;padding:2px 6px;border:2px solid #000;background:${badgeColor};color:#fff;text-transform:uppercase;">${badgeLabel}</span>
            </div>
            <a href="${petUrl}" style="font-size:12px;font-weight:700;text-transform:uppercase;text-decoration:underline;color:#000;">Ver detalhes →</a>
          </div>
        `);

      el.addEventListener("click", () => {
        popup.addTo(map);
      });

      const marker = new mapboxgl.Marker({ element: el })
        .setLngLat([pet.lng, pet.lat])
        .setPopup(popup)
        .addTo(map);

      markersRef.current.push(marker);
    });
  }, [pets]);

  return <div ref={containerRef} className="w-full h-full" />;
}
