"use client";

import dynamic from "next/dynamic";

const MapClient = dynamic(() => import("./MapClient"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-[#0a0a0a] flex items-center justify-center">
      <p className="font-heading text-[clamp(1.5rem,3vw,3rem)] font-bold uppercase text-[#CCFF00] animate-pulse">
        Carregando mapa...
      </p>
    </div>
  ),
});

export default function MapWrapper() {
  return (
    <div className="w-full h-full">
      <MapClient />
    </div>
  );
}
