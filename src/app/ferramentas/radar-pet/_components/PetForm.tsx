"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { useT } from "@/contexts/LanguageContext";
import { createPet, uploadPetPhoto } from "../_lib/supabase-pets";
import type { PetType } from "../_lib/supabase-pets";

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN!;

interface Props {
  type: PetType;
  userId: string;
}

export default function PetForm({ type, userId }: Props) {
  const { t } = useT();
  const router = useRouter();
  const tc = t.radarPet.cadastro;

  const [name, setName] = useState("");
  const [breed, setBreed] = useState("");
  const [description, setDescription] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [neighborhood, setNeighborhood] = useState("");
  const [reward, setReward] = useState(false);
  const [rewardAmount, setRewardAmount] = useState("");
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [city, setCity] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markerRef = useRef<mapboxgl.Marker | null>(null);

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: "mapbox://styles/mapbox/light-v11",
      center: [-46.6333, -23.5505],
      zoom: 12,
      attributionControl: false,
    });

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        map.flyTo({ center: [pos.coords.longitude, pos.coords.latitude], zoom: 14 });
      },
      () => {}
    );

    map.on("click", async (e) => {
      const { lng, lat } = e.lngLat;
      setCoords({ lat, lng });

      if (markerRef.current) markerRef.current.remove();
      const marker = new mapboxgl.Marker({ color: "#ef4444" })
        .setLngLat([lng, lat])
        .addTo(map);
      markerRef.current = marker;

      try {
        const res = await fetch(
          `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${mapboxgl.accessToken}&types=place`
        );
        const data = await res.json();
        const detectedCity = data.features?.[0]?.text ?? "";
        setCity(detectedCity);
      } catch {
        setCity("");
      }
    });

    mapRef.current = map;
    return () => { map.remove(); mapRef.current = null; };
  }, []);

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!photoFile) { setError(tc.errorPhoto); return; }
    const whatsappClean = whatsapp.trim().replace(/\D/g, "");
    if (!whatsappClean || whatsappClean.length < 8) { setError(tc.errorWhatsapp); return; }
    const whatsappFinal = whatsappClean.startsWith("55") ? whatsappClean : `55${whatsappClean}`;
    if (!coords) { setError(tc.errorLocation); return; }

    setSubmitting(true);
    try {
      const photoUrl = await uploadPetPhoto(userId, photoFile);
      await createPet({
        user_id: userId,
        type,
        name: type === "lost" ? name || undefined : undefined,
        breed: type === "lost" ? breed || undefined : undefined,
        description,
        photo_url: photoUrl,
        whatsapp: whatsappFinal,
        neighborhood: neighborhood.trim(),
        lat: coords.lat,
        lng: coords.lng,
        city,
        reward,
        reward_amount: reward ? rewardAmount || undefined : undefined,
      });
      router.push("/ferramentas/radar-pet/meus-pets");
    } catch (err) {
      setError(String(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      {type === "lost" && (
        <div className="flex flex-col gap-2">
          <label className="font-body text-xs font-bold uppercase tracking-widest">{tc.labelName}</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={tc.placeholderName}
            className="border-3 border-border bg-background font-body text-sm px-3 py-3 focus:outline-none"
          />
        </div>
      )}

      {type === "lost" && (
        <div className="flex flex-col gap-2">
          <label className="font-body text-xs font-bold uppercase tracking-widest">{tc.labelBreed}</label>
          <input
            type="text"
            value={breed}
            onChange={(e) => setBreed(e.target.value)}
            placeholder={tc.placeholderBreed}
            className="border-3 border-border bg-background font-body text-sm px-3 py-3 focus:outline-none"
          />
        </div>
      )}

      <div className="flex flex-col gap-2">
        <label className="font-body text-xs font-bold uppercase tracking-widest">
          {tc.labelDescription}{" "}
          <span className="opacity-50">({description.length}/240)</span>
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value.slice(0, 240))}
          placeholder={tc.placeholderDescription}
          rows={3}
          className="border-3 border-border bg-background font-body text-sm px-3 py-3 focus:outline-none resize-none"
        />
      </div>

      <div className="flex flex-col gap-2">
        <label className="font-body text-xs font-bold uppercase tracking-widest">{tc.labelPhoto}</label>
        <input
          type="file"
          accept="image/*"
          onChange={handlePhotoChange}
          className="font-body text-sm"
        />
        {photoPreview && (
          <img src={photoPreview} alt="Preview" className="w-32 h-32 object-cover border-3 border-border" />
        )}
      </div>

      <div className="flex flex-col gap-2">
        <label className="font-body text-xs font-bold uppercase tracking-widest">{tc.labelWhatsapp}</label>
        <input
          type="text"
          value={whatsapp}
          onChange={(e) => setWhatsapp(e.target.value)}
          placeholder={tc.placeholderWhatsapp}
          className="border-3 border-border bg-background font-body text-sm px-3 py-3 focus:outline-none"
        />
      </div>

      <div className="flex flex-col gap-2">
        <label className="font-body text-xs font-bold uppercase tracking-widest">{tc.labelNeighborhood}</label>
        <input
          type="text"
          value={neighborhood}
          onChange={(e) => setNeighborhood(e.target.value)}
          placeholder={tc.placeholderNeighborhood}
          className="border-3 border-border bg-background font-body text-sm px-3 py-3 focus:outline-none"
        />
      </div>

      {type === "lost" && (
        <div className="flex flex-col gap-3">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={reward}
              onChange={(e) => setReward(e.target.checked)}
              className="w-5 h-5 border-3 border-border"
            />
            <span className="font-body text-sm font-bold uppercase tracking-wide">{tc.labelReward}</span>
          </label>
          {reward && (
            <div className="flex flex-col gap-2">
              <label className="font-body text-xs font-bold uppercase tracking-widest">{tc.labelRewardAmount}</label>
              <input
                type="text"
                value={rewardAmount}
                onChange={(e) => setRewardAmount(e.target.value)}
                placeholder={tc.placeholderRewardAmount}
                className="border-3 border-border bg-background font-body text-sm px-3 py-3 focus:outline-none"
              />
            </div>
          )}
        </div>
      )}

      <div className="flex flex-col gap-2">
        <label className="font-body text-xs font-bold uppercase tracking-widest">{tc.labelMap}</label>
        <div ref={mapContainerRef} className="w-full h-64 border-3 border-border" />
        {coords && (
          <p className="font-body text-xs text-muted">
            📍 {coords.lat.toFixed(5)}, {coords.lng.toFixed(5)} {city && `· ${city}`}
          </p>
        )}
      </div>

      {error && (
        <p className="font-body text-sm text-red-600 border-3 border-red-300 bg-red-50 px-4 py-3">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="brutal-btn brutal-btn-adaptive px-8 py-4 font-body text-base font-bold uppercase tracking-wide disabled:opacity-50"
      >
        {submitting ? tc.btnSubmitting : tc.btnSubmit}
      </button>
    </form>
  );
}
