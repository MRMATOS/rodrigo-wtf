"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useT } from "@/contexts/LanguageContext";
import { useAuth } from "./_lib/use-auth";
import { getActivePetsByCity, getCityWithMostPets } from "./_lib/supabase-pets";
import type { Pet } from "./_lib/supabase-pets";
import MapHub from "./_components/MapHub";
import PetFeed from "./_components/PetFeed";
import FilterBar from "./_components/FilterBar";
import LoginModal from "./_components/LoginModal";

type FilterType = "all" | "lost" | "found";
type ViewMode = "map" | "list";
const PAGE_SIZE = 5;

// Componente separado para lidar com useSearchParams (requer Suspense)
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
  const [neighborhood, setNeighborhood] = useState<string>("");
  const [showLogin, setShowLogin] = useState(false);
  const [pendingAction, setPendingAction] = useState<"lost" | "found" | null>(null);
  const [geoCity, setGeoCity] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("map");
  const [page, setPage] = useState(0);

  // Carrega cidade mais popular imediatamente como fallback
  // e sobrescreve com GPS se disponível
  useEffect(() => {
    // Fallback imediato: cidade com mais pets (não espera GPS)
    getCityWithMostPets().then((topCity) => {
      if (topCity) setCity((prev) => prev || topCity);
    });

    // Tenta GPS em paralelo — se resolver, sobrescreve
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

  const filteredPets = pets.filter((p) => {
    if (filter !== "all" && p.type !== filter) return false;
    if (neighborhood && !p.neighborhood.toLowerCase().includes(neighborhood.toLowerCase())) return false;
    return true;
  });

  const totalPages = Math.ceil(filteredPets.length / PAGE_SIZE);
  const pagedPets = filteredPets.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  function handleFilterChange(f: FilterType) { setFilter(f); setPage(0); }
  function handleNeighborhoodChange(n: string) { setNeighborhood(n); setPage(0); }

  function handleAction(action: "lost" | "found") {
    if (!user) {
      setPendingAction(action);
      setShowLogin(true);
      return;
    }
    router.push(`/ferramentas/radar-pet/cadastro?type=${action}`);
  }

  function handleLogin() {
    signInWithGoogle();
  }

  return (
    <main id="main-content" className="flex flex-col gap-4 md:gap-8">
      {/* Lida com redirect pós-login sem bloquear o prerender */}
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

      {/* City selector (shown when GPS unavailable) */}
      {!geoCity && (
        <div className="border-3 border-border brutal-shadow bg-background p-6 flex flex-col sm:flex-row gap-3">
          <p className="font-body text-sm text-muted flex-1">{t.radarPet.cityPrompt}</p>
          <div className="flex gap-2">
            <input
              type="text"
              value={cityInput}
              onChange={(e) => setCityInput(e.target.value)}
              placeholder={t.radarPet.cityPlaceholder}
              className="border-3 border-border bg-background font-body text-sm px-3 py-2 w-48 focus:outline-none"
              onKeyDown={(e) => {
                if (e.key === "Enter" && cityInput.trim()) setCity(cityInput.trim());
              }}
            />
            <button
              onClick={() => { if (cityInput.trim()) setCity(cityInput.trim()); }}
              className="brutal-btn brutal-btn-adaptive px-4 py-2 font-body text-sm font-bold uppercase"
            >
              {t.radarPet.citySearch}
            </button>
          </div>
        </div>
      )}

      {/* Filters + View toggle */}
      {city && (
        <div className="flex flex-col gap-3">
          <FilterBar
            filter={filter}
            neighborhood={neighborhood}
            onFilterChange={handleFilterChange}
            onNeighborhoodChange={handleNeighborhoodChange}
          />
          <div className="flex gap-0 border-3 border-border brutal-shadow w-fit">
            <button
              onClick={() => setViewMode("map")}
              className={`px-6 py-2 font-body text-sm font-bold uppercase tracking-wide transition-colors ${
                viewMode === "map"
                  ? "bg-foreground text-background"
                  : "bg-background text-foreground hover:bg-foreground/10"
              }`}
            >
              Mapa
            </button>
            <button
              onClick={() => { setViewMode("list"); setPage(0); }}
              className={`px-6 py-2 font-body text-sm font-bold uppercase tracking-wide border-l-3 border-border transition-colors ${
                viewMode === "list"
                  ? "bg-foreground text-background"
                  : "bg-background text-foreground hover:bg-foreground/10"
              }`}
            >
              Lista
            </button>
          </div>
        </div>
      )}

      {/* Map mode */}
      {city && viewMode === "map" && (
        <div className="border-3 border-border brutal-shadow overflow-hidden h-[600px]">
          <MapHub pets={filteredPets} city={city} />
        </div>
      )}

      {/* List mode */}
      {city && viewMode === "list" && (
        <div className="flex flex-col gap-0 border-3 border-border brutal-shadow">
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

          {/* Paginação */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t-3 border-border bg-background">
              <button
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={page === 0}
                className="font-body text-xs font-bold uppercase tracking-widest px-4 py-2 border-3 border-border disabled:opacity-30 hover:bg-foreground/5 transition-colors"
              >
                ← Anterior
              </button>
              <span className="font-body text-xs text-muted">
                {page + 1} / {totalPages}
              </span>
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
          onLogin={handleLogin}
          onClose={() => { setShowLogin(false); setPendingAction(null); }}
        />
      )}
    </main>
  );
}
