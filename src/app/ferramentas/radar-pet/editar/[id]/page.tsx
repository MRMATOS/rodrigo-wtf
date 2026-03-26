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
      if (data.user_id !== user.id) { setUnauthorized(true); setPetLoading(false); return; }
      setPet(data);
      setPetLoading(false);
    });
  }, [user, params.id, router]);

  if (loading || (petLoading && !unauthorized)) {
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
