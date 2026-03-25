"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useT } from "@/contexts/LanguageContext";
import { useAuth } from "../_lib/use-auth";
import LoginModal from "../_components/LoginModal";
import PetForm from "../_components/PetForm";
import type { PetType } from "../_lib/supabase-pets";

export default function CadastroPage() {
  const { t } = useT();
  const { user, loading, signInWithGoogle } = useAuth();
  const searchParams = useSearchParams();
  const router = useRouter();
  const type = (searchParams.get("type") ?? "lost") as PetType;

  const [showLogin, setShowLogin] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      setShowLogin(true);
    }
  }, [loading, user]);

  if (loading) {
    return (
      <main className="flex items-center justify-center min-h-64">
        <p className="font-body text-muted animate-pulse">Carregando...</p>
      </main>
    );
  }

  const title = type === "lost" ? t.radarPet.cadastro.titleLost : t.radarPet.cadastro.titleFound;

  return (
    <main id="main-content" className="max-w-2xl mx-auto flex flex-col gap-8 py-8 px-4">
      <header>
        <button
          onClick={() => router.back()}
          className="font-body text-xs font-bold uppercase tracking-widest text-muted hover:text-foreground transition-colors mb-4 block"
        >
          {t.back}
        </button>
        <h1 className="font-heading text-3xl md:text-5xl font-bold uppercase">{title}</h1>
      </header>

      {user ? (
        <PetForm type={type} userId={user.id} />
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
