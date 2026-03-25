import { notFound } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import type { Pet } from "../../_lib/supabase-pets";
import PetPageLost from "../../_components/PetPageLost";
import PetPageFound from "../../_components/PetPageFound";

export const dynamic = "force-dynamic";

async function fetchPet(id: string): Promise<Pet | null> {
  const client = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  const { data } = await client
    .from("pets")
    .select("*")
    .eq("id", id)
    .single();
  return (data as Pet) ?? null;
}

export default async function PetPublicPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const pet = await fetchPet(id);

  if (!pet) notFound();

  return (
    <main id="main-content" className="max-w-lg mx-auto py-8 px-4">
      {pet.status === "resolved" || pet.status === "expired" ? (
        <div className="border-3 border-border brutal-shadow bg-background p-8 text-center flex flex-col gap-4">
          <p className="font-heading text-2xl font-bold uppercase">
            Caso Encerrado
          </p>
          <p className="font-body text-muted">
            Este anúncio foi encerrado ou expirou.
          </p>
        </div>
      ) : pet.type === "lost" ? (
        <PetPageLost pet={pet} />
      ) : (
        <PetPageFound pet={pet} />
      )}
    </main>
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const pet = await fetchPet(id);
  if (!pet) return { title: "Pet não encontrado" };
  return {
    title: pet.name ? `${pet.name} — Radar Pet` : "Pet Encontrado — Radar Pet",
    description: pet.description,
    openGraph: {
      images: pet.photo_url ? [pet.photo_url] : [],
    },
  };
}
