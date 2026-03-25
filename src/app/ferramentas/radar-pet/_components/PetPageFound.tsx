"use client";

import { useT } from "@/contexts/LanguageContext";
import type { Pet } from "../_lib/supabase-pets";

interface Props {
  pet: Pet;
}

export default function PetPageFound({ pet }: Props) {
  const { t } = useT();
  const p = t.radarPet.petPage.found;

  return (
    <div className="flex flex-col gap-6">
      <div className="inline-block">
        <span className="font-body text-xs font-bold uppercase tracking-widest px-3 py-1 border-3 border-border bg-green-100 text-green-800">
          {p.badge}
        </span>
      </div>

      {pet.photo_url && (
        <img
          src={pet.photo_url}
          alt="Pet encontrado"
          className="w-full max-h-96 object-cover border-3 border-border"
        />
      )}

      <div className="flex flex-col gap-1">
        <p className="font-body text-sm text-muted">{p.subtitle}</p>
        <p className="font-body text-base">{pet.neighborhood}</p>
      </div>

      {pet.description && (
        <p className="font-body text-base leading-relaxed">{pet.description}</p>
      )}

      <a
        href={`https://wa.me/${pet.whatsapp}`}
        target="_blank"
        rel="noopener noreferrer"
        className="brutal-btn brutal-btn-adaptive px-8 py-5 font-body text-lg font-bold uppercase tracking-wide text-center"
      >
        {p.btnOwner}
      </a>
    </div>
  );
}
