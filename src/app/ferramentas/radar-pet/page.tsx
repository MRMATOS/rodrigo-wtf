"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useT } from "@/contexts/LanguageContext";
import { useAuth } from "./_lib/use-auth";
import { getActivePetsByCity, getCityWithMostPets } from "./_lib/supabase-pets";
import type { Pet } from "./_lib/supabase-pets";
import MapHub from "./_components/MapHub";
import PetFeed from "./_components/PetFeed";
import LoginModal from "./_components/LoginModal";

type FilterType = "all" | "lost" | "found";
type ViewMode = "map" | "list";
const PAGE_SIZE = 5;

function LoginRedirectHandler({ user, loading }: { user: ReturnType<typeof useAuth>["user"]; loading: boolean }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (searchParams.get("login") === "ok" && !loading && user) {
      const next = sessionStorage.getItem("radar-pet-next");
      sessionStorage.removeItem("radar-pet-next");
      if (next && next !== "/ferramentas/radar-pet") {
        router.replace(next);
      } else {
        router.replace("/ferramentas/radar-pet");
      }
    }
  }, [searchParams, loading, user, router]);

  return null;
}

export default function RadarPetHub() {
  const { t } = useT();
  const { user, loading, signInWithGoogle } = useAuth();
  const router = useRouter();

  const [city, setCity] = useState<string>("");
  const [cityInput, setCityInput] = useState<string>("");
  const [pets, setPets] = useState<Pet[]>([]);
  const [filter, setFilter] = useState<FilterType>("all");
  const [showLogin, setShowLogin] = useState(false);
  const [pendingAction, setPendingAction] = useState<"lost" | "found" | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("map");
  const [page, setPage] = useState(0);
  const [gpsLoading, setGpsLoading] = useState(false);

  useEffect(() => {
    getCityWithMostPets().then((topCity) => {
      if (topCity) setCity((prev) => prev || topCity);
    });

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
          );
          const data = await res.json();
          const detectedCity =
            data.address?.city || data.address?.town || data.address?.village || "";
          if (detectedCity) setCity(detectedCity);
        } catch { /* silent */ }
      },
      () => {},
      { timeout: 5000 }
    );
  }, []);

  const loadPets = useCallback(async (targetCity: string) => {
    if (!targetCity) return;
    try {
      const data = await getActivePetsByCity(targetCity);
      setPets(data);
    } catch {
      setPets([]);
    }
  }, []);

  useEffect(() => {
    if (city) loadPets(city);
  }, [city, loadPets]);

  function toggleFilter(type: "lost" | "found") {
    setFilter((prev) => prev === type ? "all" : type);
    setPage(0);
  }

  function handleGps() {
    setGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
          );
          const data = await res.json();
          const detectedCity =
            data.address?.city || data.address?.town || data.address?.village || "";
          if (detectedCity) setCity(detectedCity);
        } catch { /* silent */ }
        setGpsLoading(false);
      },
      () => setGpsLoading(false),
      { timeout: 8000 }
    );
  }

  const filteredPets = pets.filter((p) => filter === "all" || p.type === filter);
  const totalPages = Math.ceil(filteredPets.length / PAGE_SIZE);
  const pagedPets = filteredPets.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  function handleAction(action: "lost" | "found") {
    if (!user) { setPendingAction(action); setShowLogin(true); return; }
    router.push(`/ferramentas/radar-pet/cadastro?type=${action}`);
  }

  return (
    <main id="main-content" className="flex flex-col gap-4 md:gap-8">
      <Suspense fallback={null}>
        <LoginRedirectHandler user={user} loading={loading} />
      </Suspense>

      {/* Header */}
      <header className="border-3 border-border brutal-shadow bg-background p-8 md:p-12">
        <h1 className="font-heading text-[clamp(2.5rem,5vw,8rem)] font-bold uppercase leading-[1.1] tracking-tight">
          {t.radarPet.heroTitle}
        </h1>
        <p className="font-body text-base md:text-lg text-muted mt-4 max-w-xl">
          {t.radarPet.heroSubtitle}
        </p>
        <div className="flex flex-wrap gap-3 mt-6">
          <button
            onClick={() => handleAction("lost")}
            className="brutal-btn brutal-btn-adaptive px-6 py-3 font-body font-bold uppercase tracking-wide text-sm"
          >
            🔴 {t.radarPet.btnLost}
          </button>
          <button
            onClick={() => handleAction("found")}
            className="brutal-btn brutal-btn-adaptive px-6 py-3 font-body font-bold uppercase tracking-wide text-sm"
          >
            🟢 {t.radarPet.btnFound}
          </button>
          {user && (
            <button
              onClick={() => router.push("/ferramentas/radar-pet/meus-pets")}
              className="brutal-btn brutal-btn-adaptive px-6 py-3 font-body font-bold uppercase tracking-wide text-sm"
            >
              {t.radarPet.meusPets.title}
            </button>
          )}
        </div>
      </header>

      {/* Card unificado: filtros + busca por cidade */}
      <div className="border-3 border-border brutal-shadow bg-background p-4 flex flex-col gap-3">
        {/* Linha 1: filtros (esquerda) + mapa/lista (direita) */}
        <div className="flex items-center justify-between gap-2 flex-wrap">
          {/* Filtros Perdido / Encontrado */}
          <div className="flex border-3 border-border" style={{ boxShadow: "3px 3px 0 var(--border)" }}>
            <button
              onClick={() => toggleFilter("lost")}
              className={`px-4 py-2 font-body text-xs font-bold uppercase tracking-wide transition-colors ${
                filter === "lost"
                  ? "bg-red-600 text-white"
                  : "bg-background text-foreground hover:bg-red-50 dark:hover:bg-red-950"
              }`}
            >
              Perdido
            </button>
            <button
              onClick={() => toggleFilter("found")}
              className={`px-4 py-2 font-body text-xs font-bold uppercase tracking-wide border-l-3 border-border transition-colors ${
                filter === "found"
                  ? "bg-green-600 text-white"
                  : "bg-background text-foreground hover:bg-green-50 dark:hover:bg-green-950"
              }`}
            >
              Encontrado
            </button>
          </div>

          {/* Mapa / Lista */}
          <div className="flex border-3 border-border" style={{ boxShadow: "3px 3px 0 var(--border)" }}>
            <button
              onClick={() => setViewMode("map")}
              className={`px-4 py-2 font-body text-xs font-bold uppercase tracking-wide transition-colors ${
                viewMode === "map"
                  ? "bg-blue text-white"
                  : "bg-background text-foreground hover:bg-blue/10"
              }`}
            >
              Mapa
            </button>
            <button
              onClick={() => { setViewMode("list"); setPage(0); }}
              className={`px-4 py-2 font-body text-xs font-bold uppercase tracking-wide border-l-3 border-border transition-colors ${
                viewMode === "list"
                  ? "bg-blue text-white"
                  : "bg-background text-foreground hover:bg-blue/10"
              }`}
            >
              Lista
            </button>
          </div>
        </div>

        {/* Linha 2: busca por cidade + botão GPS */}
        <div className="flex flex-col gap-2">
          <div className="flex gap-2 items-center">
            <input
              type="text"
              value={cityInput}
              onChange={(e) => setCityInput(e.target.value)}
              placeholder="Permita a localização ou busque pela cidade"
              className="border-3 border-border bg-background font-body text-sm px-3 py-2 flex-1 focus:outline-none"
              onKeyDown={(e) => {
                if (e.key === "Enter" && cityInput.trim()) setCity(cityInput.trim());
              }}
            />
            <button
              onClick={handleGps}
              disabled={gpsLoading}
              title="Usar minha localização"
              className="border-3 border-border bg-background px-3 py-2 hover:bg-foreground/5 disabled:opacity-50 transition-colors"
              aria-label="Usar localização"
            >
            {gpsLoading ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="animate-spin">
                <path d="M21 12a9 9 0 1 1-6.219-8.56" />
              </svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square">
                <circle cx="12" cy="12" r="3" />
                <path d="M12 2v3M12 19v3M2 12h3M19 12h3" />
                <path d="M12 9a3 3 0 0 0 0 6 3 3 0 0 0 0-6z" fill="currentColor" fillOpacity=".2" />
              </svg>
            )}
          </button>
          </div>
          <button
            onClick={() => { if (cityInput.trim()) setCity(cityInput.trim()); }}
            className="brutal-btn brutal-btn-adaptive w-full py-2 font-body text-sm font-bold uppercase"
          >
            {t.radarPet.citySearch}
          </button>
        </div>
        {city && (
          <p className="font-body text-xs text-muted">
            Mostrando: <strong>{city}</strong>
            {filter !== "all" && <> · {filter === "lost" ? "Perdidos" : "Encontrados"}</>}
            {" "}({filteredPets.length} {filteredPets.length === 1 ? "resultado" : "resultados"})
          </p>
        )}
      </div>

      {/* Map mode */}
      {city && viewMode === "map" && (
        <div className="border-3 border-border brutal-shadow overflow-hidden h-[600px]">
          <MapHub pets={filteredPets} city={city} />
        </div>
      )}

      {/* List mode */}
      {city && viewMode === "list" && (
        <div className="flex flex-col border-3 border-border brutal-shadow">
          {pagedPets.length === 0 ? (
            <div className="p-8 text-center">
              <p className="font-body text-sm text-muted">{t.radarPet.emptyState}</p>
            </div>
          ) : (
            pagedPets.map((pet) => (
              <div key={pet.id} className="border-b-3 border-border last:border-b-0">
                <PetFeed pets={[pet]} emptyLabel="" />
              </div>
            ))
          )}

          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t-3 border-border">
              <button
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={page === 0}
                className="font-body text-xs font-bold uppercase tracking-widest px-4 py-2 border-3 border-border disabled:opacity-30 hover:bg-foreground/5 transition-colors"
              >
                ← Anterior
              </button>
              <span className="font-body text-xs text-muted">{page + 1} / {totalPages}</span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                disabled={page === totalPages - 1}
                className="font-body text-xs font-bold uppercase tracking-widest px-4 py-2 border-3 border-border disabled:opacity-30 hover:bg-foreground/5 transition-colors"
              >
                Próximo →
              </button>
            </div>
          )}
        </div>
      )}

      {showLogin && (
        <LoginModal
          onLogin={signInWithGoogle}
          onClose={() => { setShowLogin(false); setPendingAction(null); }}
        />
      )}
    </main>
  );
}
