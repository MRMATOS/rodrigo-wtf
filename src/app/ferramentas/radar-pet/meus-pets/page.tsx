"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useT } from "@/contexts/LanguageContext";
import { useAuth } from "../_lib/use-auth";
import { getMyPets, resolvePet, renewPet, deletePet } from "../_lib/supabase-pets";
import type { Pet, ResolvedVia } from "../_lib/supabase-pets";
import ResolveModal from "../_components/ResolveModal";
import PosterGenerator from "../_components/PosterGenerator";
import LoginModal from "../_components/LoginModal";

export default function MeusPetsPage() {
  const { t } = useT();
  const { user, loading, signInWithGoogle } = useAuth();
  const router = useRouter();
  const m = t.radarPet.meusPets;

  const [pets, setPets] = useState<Pet[]>([]);
  const [resolveTarget, setResolveTarget] = useState<Pet | null>(null);
  const [posterTarget, setPosterTarget] = useState<Pet | null>(null);
  const [showLogin, setShowLogin] = useState(false);

  const loadPets = useCallback(async () => {
    if (!user) return;
    const data = await getMyPets(user.id);
    setPets(data);
  }, [user]);

  useEffect(() => {
    if (!loading && !user) setShowLogin(true);
    if (user) loadPets();
  }, [user, loading, loadPets]);

  async function handleResolve(via: ResolvedVia) {
    if (!resolveTarget) return;
    await resolvePet(resolveTarget.id, via);
    setResolveTarget(null);
    await loadPets();
  }

  async function handleRenew(id: string) {
    await renewPet(id);
    await loadPets();
  }

  async function handleDelete(id: string) {
    if (!confirm("Excluir este cadastro?")) return;
    await deletePet(id);
    await loadPets();
  }

  function daysUntilExpiry(lastRenewed: string): number {
    const diff = Date.now() - new Date(lastRenewed).getTime();
    const daysPassed = Math.floor(diff / (1000 * 60 * 60 * 24));
    return Math.max(0, 30 - daysPassed);
  }

  if (loading) {
    return (
      <main className="flex items-center justify-center min-h-64">
        <p className="font-body text-muted animate-pulse">Carregando...</p>
      </main>
    );
  }

  return (
    <main id="main-content" className="max-w-2xl mx-auto flex flex-col gap-8 py-8 px-4">
      <header>
        <button
          onClick={() => router.push("/ferramentas/radar-pet")}
          className="font-body text-xs font-bold uppercase tracking-widest text-muted hover:text-foreground transition-colors mb-4 block"
        >
          {t.back}
        </button>
        <h1 className="font-heading text-3xl md:text-5xl font-bold uppercase">{m.title}</h1>
      </header>

      {user ? (
        <>
          {pets.length === 0 ? (
            <p className="font-body text-muted">{m.empty}</p>
          ) : (
            <div className="flex flex-col gap-6">
              {pets.map((pet) => {
                const days = daysUntilExpiry(pet.last_renewed_at);
                const statusLabel =
                  pet.status === "active" ? m.statusActive :
                  pet.status === "resolved" ? m.statusResolved :
                  m.statusExpired;

                return (
                  <article
                    key={pet.id}
                    className="border-3 border-border brutal-shadow bg-background p-6 flex flex-col gap-4"
                  >
                    <div className="flex items-start gap-4">
                      {pet.photo_url && (
                        <a href={`/ferramentas/radar-pet/pet/${pet.id}`}>
                          <img
                            src={pet.photo_url}
                            alt={pet.name ?? "Pet"}
                            className="w-20 h-20 object-cover border-3 border-border flex-shrink-0 hover:opacity-80 transition-opacity cursor-pointer"
                          />
                        </a>
                      )}
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          {pet.name && (
                            <p className="font-heading font-bold text-lg uppercase">{pet.name}</p>
                          )}
                          <span className="font-body text-xs font-bold uppercase tracking-widest px-2 py-0.5 border-2 border-border">
                            {statusLabel}
                          </span>
                          <span className={`font-body text-xs font-bold uppercase tracking-widest px-2 py-0.5 border-2 border-border ${
                            pet.type === "lost" ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"
                          }`}>
                            {pet.type === "lost" ? "Perdido" : "Encontrado"}
                          </span>
                        </div>
                        {pet.breed && <p className="font-body text-sm text-muted">{pet.breed}</p>}
                        <p className="font-body text-xs text-muted">{pet.neighborhood}</p>
                        {pet.status === "active" && (
                          <p className="font-body text-xs text-muted">{m.expiresIn(days)}</p>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
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
                      <button
                        onClick={() => handleDelete(pet.id)}
                        className="font-body text-xs font-bold uppercase tracking-widest px-4 py-2 border-3 border-border text-red-600 hover:bg-red-50 transition-colors"
                      >
                        {m.btnDelete}
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </>
      ) : (
        <p className="font-body text-muted">{t.radarPet.gpsRequired}</p>
      )}

      {resolveTarget && (
        <ResolveModal
          onConfirm={handleResolve}
          onClose={() => setResolveTarget(null)}
        />
      )}

      {posterTarget && (
        <PosterGenerator
          pet={posterTarget}
          onClose={() => setPosterTarget(null)}
        />
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
