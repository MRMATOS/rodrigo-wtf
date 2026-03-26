"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { useT } from "@/contexts/LanguageContext";
import { updatePet, uploadPetPhoto } from "../_lib/supabase-pets";
import type { Pet } from "../_lib/supabase-pets";

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN!;

interface Props {
  pet: Pet;
  userId: string;
}

export default function PetEditForm({ pet, userId }: Props) {
  const { t } = useT();
  const router = useRouter();
  const tc = t.radarPet.cadastro;

  const [name, setName] = useState(pet.name ?? "");
  const [breed, setBreed] = useState(pet.breed ?? "");
  const [description, setDescription] = useState(pet.description);
  const [whatsapp, setWhatsapp] = useState(pet.whatsapp);
  const [neighborhood, setNeighborhood] = useState(pet.neighborhood);
  const [reward, setReward] = useState(pet.reward);
  const [rewardAmount, setRewardAmount] = useState(pet.reward_amount ?? "");
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(pet.photo_url);
  const [coords, setCoords] = useState<{ lat: number; lng: number }>({ lat: pet.lat, lng: pet.lng });
  const [city, setCity] = useState(pet.city);
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
      center: [pet.lng, pet.lat],
      zoom: 14,
      attributionControl: false,
    });

    const marker = new mapboxgl.Marker({ color: "#ef4444" })
      .setLngLat([pet.lng, pet.lat])
      .addTo(map);
    markerRef.current = marker;

    map.on("click", async (e) => {
      const { lng, lat } = e.lngLat;
      setCoords({ lat, lng });
      markerRef.current?.setLngLat([lng, lat]);

      try {
        const res = await fetch(
          `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${mapboxgl.accessToken}&types=place`
        );
        const data = await res.json();
        setCity(data.features?.[0]?.text ?? "");
      } catch {
        setCity("");
      }
    });

    mapRef.current = map;
    return () => { map.remove(); mapRef.current = null; };
  }, [pet.lat, pet.lng]);

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const whatsappClean = whatsapp.trim().replace(/\D/g, "");
    if (!whatsappClean || whatsappClean.length < 8) { setError(tc.errorWhatsapp); return; }
    const whatsappFinal = whatsappClean.startsWith("55") ? whatsappClean : `55${whatsappClean}`;

    setSubmitting(true);
    try {
      let photoUrl = pet.photo_url;
      if (photoFile) {
        photoUrl = await uploadPetPhoto(userId, photoFile);
      }

      await updatePet(pet.id, {
        name: pet.type === "lost" ? name || undefined : undefined,
        breed: pet.type === "lost" ? breed || undefined : undefined,
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
      {pet.type === "lost" && (
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

      {pet.type === "lost" && (
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

      {pet.type === "lost" && (
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
        <p className="font-body text-xs text-muted">
          📍 {coords.lat.toFixed(5)}, {coords.lng.toFixed(5)} {city && `· ${city}`}
        </p>
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
        {submitting ? tc.btnSubmitting : "Salvar alterações"}
      </button>
    </form>
  );
}
