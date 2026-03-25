import Link from "next/link";
import type { Pet } from "../_lib/supabase-pets";

interface Props {
  pet: Pet;
}

export default function PetCard({ pet }: Props) {
  const isLost = pet.type === "lost";

  return (
    <Link
      href={`/ferramentas/radar-pet/pet/${pet.id}`}
      className="block border-b-3 border-border hover:bg-muted/10 transition-colors p-4"
    >
      <div className="flex gap-3">
        {pet.photo_url && (
          <img
            src={pet.photo_url}
            alt={pet.name ?? "Pet"}
            className="w-16 h-16 object-cover border-3 border-border flex-shrink-0"
          />
        )}
        <div className="flex flex-col gap-1 min-w-0">
          <div className="flex items-center gap-2">
            <span
              className={`font-body text-xs font-bold uppercase tracking-widest px-1.5 py-0.5 border-2 border-border ${
                isLost ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"
              }`}
            >
              {isLost ? "Perdido" : "Encontrado"}
            </span>
            {pet.reward && (
              <span className="font-body text-xs font-bold uppercase tracking-widest px-1.5 py-0.5 border-2 border-border bg-yellow-100 text-yellow-800">
                Gratificação
              </span>
            )}
          </div>
          {pet.name && (
            <p className="font-heading font-bold text-base uppercase truncate">{pet.name}</p>
          )}
          {pet.breed && (
            <p className="font-body text-xs text-muted truncate">{pet.breed}</p>
          )}
          <p className="font-body text-xs text-muted">{pet.neighborhood}</p>
        </div>
      </div>
    </Link>
  );
}
