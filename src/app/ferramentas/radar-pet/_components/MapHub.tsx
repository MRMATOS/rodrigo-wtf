"use client";

import { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import type { Pet } from "../_lib/supabase-pets";
import { useRouter } from "next/navigation";

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN!;

interface Props {
  pets: Pet[];
  city: string;
}

export default function MapHub({ pets, city }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const router = useRouter();

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

    // Adiciona novos markers
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
      el.addEventListener("click", () => {
        router.push(`/ferramentas/radar-pet/pet/${pet.id}`);
      });

      const marker = new mapboxgl.Marker({ element: el })
        .setLngLat([pet.lng, pet.lat])
        .addTo(map);

      markersRef.current.push(marker);
    });
  }, [pets, router]);

  return <div ref={containerRef} className="w-full h-full" />;
}
