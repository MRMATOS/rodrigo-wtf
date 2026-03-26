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

  // Tenta obter cidade via GPS; se negado, usa cidade com mais pets
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

      {/* Filters */}
      {city && (
        <FilterBar
          filter={filter}
          neighborhood={neighborhood}
          onFilterChange={setFilter}
          onNeighborhoodChange={setNeighborhood}
        />
      )}

      {/* Map + Feed */}
      {city ? (
        <div className="flex flex-col lg:flex-row gap-4 h-[600px]">
          <div className="flex-1 border-3 border-border brutal-shadow overflow-hidden">
            <MapHub pets={filteredPets} city={city} />
          </div>
          <div className="lg:w-80 border-3 border-border brutal-shadow overflow-y-auto">
            <PetFeed pets={filteredPets} emptyLabel={t.radarPet.emptyState} />
          </div>
        </div>
      ) : null}

      {showLogin && (
        <LoginModal
          onLogin={handleLogin}
          onClose={() => { setShowLogin(false); setPendingAction(null); }}
        />
      )}
    </main>
  );
}
