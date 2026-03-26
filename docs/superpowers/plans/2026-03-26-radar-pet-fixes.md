# Radar Pet — Correções e Melhorias — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Corrigir 11 bugs e melhorias na ferramenta Radar Pet: cartaz, mapa, formulário, e nova funcionalidade de edição.

**Architecture:** Modificações em componentes React existentes + nova rota de edição. Sem mudanças no schema do banco — só nova query `getCityWithMostPets`. As correções são independentes e podem ser commitadas uma a uma.

**Tech Stack:** Next.js 14 (App Router), React, Mapbox GL JS, html2canvas, Supabase, TypeScript

---

### Task 1: WhatsApp auto-prefixo 55

**Files:**
- Modify: `src/app/ferramentas/radar-pet/_components/PetForm.tsx:97-98`

- [ ] **Step 1: Abrir PetForm.tsx e localizar o handleSubmit**

No arquivo `src/app/ferramentas/radar-pet/_components/PetForm.tsx`, linha 97, está:
```ts
const whatsappClean = whatsapp.trim().replace(/\D/g, "");
if (!whatsappClean || whatsappClean.length < 8) { setError(tc.errorWhatsapp); return; }
```

- [ ] **Step 2: Adicionar auto-prefixo 55 após a limpeza**

Substituir essas duas linhas por:
```ts
const whatsappClean = whatsapp.trim().replace(/\D/g, "");
if (!whatsappClean || whatsappClean.length < 8) { setError(tc.errorWhatsapp); return; }
const whatsappFinal = whatsappClean.startsWith("55") ? whatsappClean : `55${whatsappClean}`;
```

E na linha 111, trocar `whatsapp: whatsappClean,` por `whatsapp: whatsappFinal,`:
```ts
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
```

- [ ] **Step 3: Verificar manualmente**

Testar cadastro com número `42998703287` — deve salvar `5542998703287` no banco.
Testar com número `5542998703287` — deve salvar `5542998703287` (sem duplicar).

- [ ] **Step 4: Commit**

```bash
git add src/app/ferramentas/radar-pet/_components/PetForm.tsx
git commit -m "fix(radar-pet): auto-prefix 55 to whatsapp number on submit"
```

---

### Task 2: Nova query getCityWithMostPets

**Files:**
- Modify: `src/app/ferramentas/radar-pet/_lib/supabase-pets.ts`

- [ ] **Step 1: Adicionar a função no final de supabase-pets.ts**

No arquivo `src/app/ferramentas/radar-pet/_lib/supabase-pets.ts`, adicionar após `uploadPetPhoto`:

```ts
export async function getCityWithMostPets(): Promise<string | null> {
  const { data, error } = await getClient()
    .from("pets")
    .select("city")
    .eq("status", "active");
  if (error || !data || data.length === 0) return null;

  const counts: Record<string, number> = {};
  for (const row of data) {
    if (row.city) counts[row.city] = (counts[row.city] ?? 0) + 1;
  }
  const topCity = Object.entries(counts).sort((a, b) => b[1] - a[1])[0];
  return topCity ? topCity[0] : null;
}
```

- [ ] **Step 2: Commit**

```bash
git add src/app/ferramentas/radar-pet/_lib/supabase-pets.ts
git commit -m "feat(radar-pet): add getCityWithMostPets query"
```

---

### Task 3: Mapa padrão com cidade mais popular

**Files:**
- Modify: `src/app/ferramentas/radar-pet/page.tsx`

- [ ] **Step 1: Importar getCityWithMostPets**

Na linha 7 do arquivo `src/app/ferramentas/radar-pet/page.tsx`, adicionar ao import existente:
```ts
import { getActivePetsByCity, getCityWithMostPets } from "./_lib/supabase-pets";
```

- [ ] **Step 2: Substituir o useEffect do GPS**

O useEffect atual (linhas 31–57) tenta GPS e silencia falha. Modificar para, ao falhar GPS (ou enquanto aguarda), carregar cidade mais popular:

```ts
useEffect(() => {
  navigator.geolocation.getCurrentPosition(
    async (pos) => {
      const { latitude, longitude } = pos.coords;
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
        );
        const data = await res.json();
        const detectedCity =
          data.address?.city ||
          data.address?.town ||
          data.address?.village ||
          "";
        if (detectedCity) {
          setGeoCity(detectedCity);
          setCity(detectedCity);
        }
      } catch {
        // silently fail
      }
    },
    async () => {
      // GPS negado — carregar cidade com mais pets como padrão
      const topCity = await getCityWithMostPets();
      if (topCity) setCity(topCity);
    }
  );
}, []);
```

- [ ] **Step 3: Remover o bloco de placeholder vazio**

No JSX (linhas 171–175), o bloco `else` que mostra texto de placeholder quando não há cidade:
```tsx
) : (
  <div className="border-3 border-border brutal-shadow bg-background p-12 text-center">
    <p className="font-body text-muted">{t.radarPet.cityPrompt}</p>
  </div>
)}
```
Substituir por `null` — com a nova lógica, sempre haverá uma cidade:
```tsx
) : null}
```

- [ ] **Step 4: Commit**

```bash
git add src/app/ferramentas/radar-pet/page.tsx
git commit -m "feat(radar-pet): show map with most-populated city as default"
```

---

### Task 4: Marker clique abre popup em vez de navegar

**Files:**
- Modify: `src/app/ferramentas/radar-pet/_components/MapHub.tsx`

- [ ] **Step 1: Substituir o handler de clique do marker por popup Mapbox**

O arquivo atual (`src/app/ferramentas/radar-pet/_components/MapHub.tsx`) usa `router.push()` no clique do marker. Substituir o `useEffect` de markers (linhas 54–84) por:

```ts
useEffect(() => {
  const map = mapRef.current;
  if (!map) return;

  markersRef.current.forEach((m) => m.remove());
  markersRef.current = [];

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
```

- [ ] **Step 2: Remover import useRouter (não usado mais)**

Remover linha:
```ts
import { useRouter } from "next/navigation";
```
E remover `const router = useRouter();` do corpo do componente.

- [ ] **Step 3: Verificar visualmente**

Ao clicar num marker, deve aparecer popup com foto, nome, badge e link. Clicar "Ver detalhes →" navega para página do pet.

- [ ] **Step 4: Commit**

```bash
git add src/app/ferramentas/radar-pet/_components/MapHub.tsx
git commit -m "feat(radar-pet): show pet popup on marker click instead of navigating"
```

---

### Task 5: Redesign do cartaz + correções de layout

**Files:**
- Modify: `src/app/ferramentas/radar-pet/_components/PosterGenerator.tsx`

- [ ] **Step 1: Substituir o componente completo PosterGenerator.tsx**

Reescrever o arquivo com:
1. Título centrado, Space Grotesk, fundo escuro
2. Status (PERDIDO/ENCONTRADO) abaixo do título
3. Foto como `background-image` div (fix para html2canvas)
4. Bloco de info com hierarquia tipográfica e escala de cinza
5. Gratificação inline com as outras infos (com "R$" automático)
6. Rodapé escuro com QR code

```tsx
"use client";

import { useRef, useEffect, useState } from "react";
import html2canvas from "html2canvas";
import { QRCodeSVG } from "qrcode.react";
import type { Pet } from "../_lib/supabase-pets";

interface Props {
  pet: Pet;
  onClose: () => void;
}

export default function PosterGenerator({ pet, onClose }: Props) {
  const posterRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  const petUrl = typeof window !== "undefined"
    ? `${window.location.origin}/ferramentas/radar-pet/pet/${pet.id}`
    : `/ferramentas/radar-pet/pet/${pet.id}`;

  useEffect(() => {
    function calcScale() {
      const maxH = window.innerHeight * 0.85;
      const maxW = window.innerWidth * 0.92;
      const s = Math.min(maxH / 1123, maxW / 794, 1);
      setScale(s);
    }
    calcScale();
    window.addEventListener("resize", calcScale);
    return () => window.removeEventListener("resize", calcScale);
  }, []);

  async function handleDownload() {
    if (!posterRef.current) return;
    const canvas = await html2canvas(posterRef.current, {
      scale: 2,
      useCORS: true,
      backgroundColor: "#ffffff",
    });
    canvas.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.download = `cartaz-${pet.name ?? "pet"}.png`;
      link.href = url;
      link.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    }, "image/png");
  }

  const statusLabel = pet.type === "lost" ? "PERDIDO" : "ENCONTRADO";

  const rewardDisplay = pet.reward && pet.reward_amount
    ? (pet.reward_amount.startsWith("R$") ? pet.reward_amount : `R$ ${pet.reward_amount}`)
    : null;

  const infoLine = [
    pet.name,
    pet.breed,
    pet.neighborhood,
    rewardDisplay ? `Gratificação: ${rewardDisplay}` : null,
  ].filter(Boolean).join("  ·  ");

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 z-[40] bg-black/80" onClick={onClose} />

      {/* Wrapper com scroll */}
      <div className="fixed inset-0 z-[50] flex flex-col items-center justify-start overflow-y-auto py-6 pointer-events-none">
        <div className="pointer-events-auto flex flex-col items-center gap-4 w-full">

          {/* Cartaz escalado */}
          <div style={{ transform: `scale(${scale})`, transformOrigin: "top center", width: "794px", flexShrink: 0 }}>
            <div
              ref={posterRef}
              style={{
                width: "794px",
                minHeight: "1123px",
                backgroundColor: "#ffffff",
                display: "flex",
                flexDirection: "column",
                fontFamily: "'Space Grotesk', 'Arial Black', sans-serif",
                color: "#000000",
                overflow: "hidden",
              }}
            >
              {/* Cabeçalho escuro */}
              <div style={{
                backgroundColor: "#111111",
                padding: "40px 48px 32px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "8px",
              }}>
                <h1 style={{
                  fontSize: "88px",
                  fontWeight: "900",
                  textTransform: "uppercase",
                  lineHeight: 1,
                  letterSpacing: "-2px",
                  margin: 0,
                  color: "#ffffff",
                  textAlign: "center",
                }}>
                  PROCURA-SE
                </h1>
                <span style={{
                  fontSize: "20px",
                  fontWeight: "700",
                  letterSpacing: "4px",
                  textTransform: "uppercase",
                  color: pet.type === "lost" ? "#ef4444" : "#22c55e",
                }}>
                  {statusLabel}
                </span>
              </div>

              {/* Foto como background-image (fix para html2canvas + object-fit) */}
              {pet.photo_url && (
                <div style={{
                  width: "100%",
                  height: "480px",
                  backgroundImage: `url(${pet.photo_url})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  flexShrink: 0,
                  borderBottom: "4px solid #000",
                }} />
              )}

              {/* Bloco de informações */}
              <div style={{
                backgroundColor: "#f4f4f4",
                padding: "28px 48px",
                borderBottom: "3px solid #ddd",
              }}>
                {pet.name && (
                  <p style={{ fontSize: "32px", fontWeight: "800", margin: "0 0 6px 0", lineHeight: 1.1 }}>
                    {pet.name}
                  </p>
                )}
                <p style={{ fontSize: "16px", fontWeight: "600", color: "#555", margin: 0, lineHeight: 1.6 }}>
                  {infoLine}
                </p>
              </div>

              {/* Descrição */}
              <div style={{ padding: "24px 48px", flex: 1 }}>
                <p style={{ fontSize: "17px", fontWeight: "500", lineHeight: 1.65, margin: 0, color: "#222" }}>
                  {pet.description}
                </p>
              </div>

              {/* Rodapé escuro com QR */}
              <div style={{
                backgroundColor: "#222222",
                padding: "28px 48px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "24px",
              }}>
                <div>
                  <p style={{ color: "#aaa", fontSize: "12px", fontWeight: "700", letterSpacing: "2px", textTransform: "uppercase", margin: "0 0 4px 0" }}>
                    ESCANEIE E AVISE
                  </p>
                  <p style={{ color: "#fff", fontSize: "14px", fontWeight: "600", margin: 0 }}>
                    radarPet.rodrigo.wtf
                  </p>
                </div>
                <div style={{ backgroundColor: "#fff", padding: "10px", flexShrink: 0 }}>
                  <QRCodeSVG
                    value={petUrl}
                    size={120}
                    bgColor="#ffffff"
                    fgColor="#000000"
                    level="M"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Controles (fora do scaled, sempre visíveis) */}
          <div
            className="flex gap-3"
            style={{ marginTop: `${794 * scale * (1123 / 794) * 0 + 8}px` }}
          >
            <button
              onClick={handleDownload}
              className="brutal-btn brutal-btn-adaptive px-8 py-4 font-body font-bold uppercase tracking-wide"
            >
              Baixar PNG
            </button>
            <button
              onClick={onClose}
              className="font-body text-sm font-bold uppercase tracking-wide px-6 py-4 border-3 border-border bg-background"
            >
              Fechar
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
```

- [ ] **Step 2: Verificar visualmente**

Abrir o cartaz em viewport pequena (mobile) — botões devem aparecer abaixo do cartaz.
Baixar PNG — verificar que foto não está distorcida e nome do arquivo é `cartaz-[nome].png` sem URL.
Verificar que título está centralizado.
Verificar que gratificação aparece na mesma linha das outras infos com "R$".

- [ ] **Step 3: Commit**

```bash
git add src/app/ferramentas/radar-pet/_components/PosterGenerator.tsx
git commit -m "feat(radar-pet): redesign poster - centered title, grayscale, fix image distortion, fix download URL"
```

---

### Task 6: Edição de pet — nova rota e componente

**Files:**
- Create: `src/app/ferramentas/radar-pet/editar/[id]/page.tsx`
- Create: `src/app/ferramentas/radar-pet/_components/PetEditForm.tsx`
- Modify: `src/app/ferramentas/radar-pet/meus-pets/page.tsx`

- [ ] **Step 1: Criar PetEditForm.tsx**

Criar `src/app/ferramentas/radar-pet/_components/PetEditForm.tsx`:

```tsx
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

    // Marker inicial na posição atual do pet
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
```

- [ ] **Step 2: Criar a rota editar/[id]/page.tsx**

Criar `src/app/ferramentas/radar-pet/editar/[id]/page.tsx`:

```tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useT } from "@/contexts/LanguageContext";
import { useAuth } from "../../_lib/use-auth";
import { getPetById } from "../../_lib/supabase-pets";
import type { Pet } from "../../_lib/supabase-pets";
import PetEditForm from "../../_components/PetEditForm";
import LoginModal from "../../_components/LoginModal";

export default function EditarPetPage() {
  const { t } = useT();
  const { user, loading, signInWithGoogle } = useAuth();
  const router = useRouter();
  const params = useParams<{ id: string }>();

  const [pet, setPet] = useState<Pet | null>(null);
  const [petLoading, setPetLoading] = useState(true);
  const [showLogin, setShowLogin] = useState(false);
  const [unauthorized, setUnauthorized] = useState(false);

  useEffect(() => {
    if (!loading && !user) setShowLogin(true);
  }, [loading, user]);

  useEffect(() => {
    if (!user || !params.id) return;
    getPetById(params.id).then((data) => {
      if (!data) { router.push("/ferramentas/radar-pet/meus-pets"); return; }
      if (data.user_id !== user.id) { setUnauthorized(true); return; }
      setPet(data);
      setPetLoading(false);
    });
  }, [user, params.id, router]);

  if (loading || petLoading) {
    return (
      <main className="flex items-center justify-center min-h-64">
        <p className="font-body text-muted animate-pulse">Carregando...</p>
      </main>
    );
  }

  if (unauthorized) {
    return (
      <main className="max-w-2xl mx-auto py-8 px-4">
        <p className="font-body text-red-600">Você não tem permissão para editar este cadastro.</p>
      </main>
    );
  }

  return (
    <main id="main-content" className="max-w-2xl mx-auto flex flex-col gap-8 py-8 px-4">
      <header>
        <button
          onClick={() => router.push("/ferramentas/radar-pet/meus-pets")}
          className="font-body text-xs font-bold uppercase tracking-widest text-muted hover:text-foreground transition-colors mb-4 block"
        >
          {t.back}
        </button>
        <h1 className="font-heading text-3xl md:text-5xl font-bold uppercase">Editar cadastro</h1>
      </header>

      {user && pet ? (
        <PetEditForm pet={pet} userId={user.id} />
      ) : (
        <p className="font-body text-muted">{t.radarPet.gpsRequired}</p>
      )}

      {showLogin && (
        <LoginModal
          onLogin={signInWithGoogle}
          onClose={() => router.push("/ferramentas/radar-pet")}
        />
      )}
    </main>
  );
}
```

- [ ] **Step 3: Adicionar botão Editar na página meus-pets**

No arquivo `src/app/ferramentas/radar-pet/meus-pets/page.tsx`, dentro do bloco de botões (após linha 130, dentro do `pet.status === "active"` block), adicionar o botão Editar:

```tsx
<button
  onClick={() => router.push(`/ferramentas/radar-pet/editar/${pet.id}`)}
  className="brutal-btn brutal-btn-adaptive px-4 py-2 font-body text-xs font-bold uppercase tracking-wide"
>
  Editar
</button>
```

Adicionar logo após o botão do cartaz:
```tsx
{pet.status === "active" && (
  <>
    {pet.type === "lost" && (
      <button
        onClick={() => setPosterTarget(pet)}
        className="brutal-btn brutal-btn-adaptive px-4 py-2 font-body text-xs font-bold uppercase tracking-wide"
      >
        {m.btnPoster}
      </button>
    )}
    <button
      onClick={() => router.push(`/ferramentas/radar-pet/editar/${pet.id}`)}
      className="brutal-btn brutal-btn-adaptive px-4 py-2 font-body text-xs font-bold uppercase tracking-wide"
    >
      Editar
    </button>
    <button
      onClick={() => setResolveTarget(pet)}
      className="brutal-btn brutal-btn-adaptive px-4 py-2 font-body text-xs font-bold uppercase tracking-wide"
    >
      {m.btnResolve}
    </button>
    <button
      onClick={() => handleRenew(pet.id)}
      className="brutal-btn brutal-btn-adaptive px-4 py-2 font-body text-xs font-bold uppercase tracking-wide"
    >
      {m.btnRenew}
    </button>
  </>
)}
```

- [ ] **Step 4: Verificar**

Acessar `/meus-pets` → clicar Editar num pet → formulário pré-populado → salvar → redireciona para `/meus-pets`.
Tentar acessar `/editar/[id-alheio]` → mostrar mensagem de não autorizado.

- [ ] **Step 5: Commit**

```bash
git add src/app/ferramentas/radar-pet/_components/PetEditForm.tsx \
        src/app/ferramentas/radar-pet/editar/[id]/page.tsx \
        src/app/ferramentas/radar-pet/meus-pets/page.tsx
git commit -m "feat(radar-pet): add pet edit functionality"
```

---

## Ordem de execução recomendada

1. Task 1 (WhatsApp) — mais simples, sem dependências
2. Task 2 (query cidade) — pré-requisito do Task 3
3. Task 3 (mapa padrão) — depende do Task 2
4. Task 4 (popup marker) — independente
5. Task 5 (redesign cartaz) — independente, maior impacto visual
6. Task 6 (edição) — independente, maior volume de código
