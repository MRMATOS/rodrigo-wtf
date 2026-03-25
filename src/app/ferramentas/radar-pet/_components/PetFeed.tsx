import type { Pet } from "../_lib/supabase-pets";
import PetCard from "./PetCard";

interface Props {
  pets: Pet[];
  emptyLabel: string;
}

export default function PetFeed({ pets, emptyLabel }: Props) {
  if (pets.length === 0) {
    return (
      <div className="p-6 text-center">
        <p className="font-body text-sm text-muted">{emptyLabel}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      {pets.map((pet) => (
        <PetCard key={pet.id} pet={pet} />
      ))}
    </div>
  );
}
