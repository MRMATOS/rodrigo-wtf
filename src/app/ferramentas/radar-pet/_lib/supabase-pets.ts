import { createBrowserClient } from "@supabase/ssr";

function getClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

// ─── Types ────────────────────────────────────────────────────────────────────

export type PetType = "lost" | "found";
export type PetStatus = "active" | "resolved" | "expired";
export type ResolvedVia = "platform" | "other" | "no";

export interface Pet {
  id: string;
  user_id: string;
  type: PetType;
  name: string | null;
  breed: string | null;
  description: string;
  photo_url: string;
  whatsapp: string;
  neighborhood: string;
  lat: number;
  lng: number;
  city: string;
  reward: boolean;
  reward_amount: string | null;
  status: PetStatus;
  resolved_via: ResolvedVia | null;
  created_at: string;
  last_renewed_at: string;
  reminder_sent_at: string | null;
}

export interface PetInsert {
  type: PetType;
  name?: string;
  breed?: string;
  description: string;
  photo_url: string;
  whatsapp: string;
  neighborhood: string;
  lat: number;
  lng: number;
  city: string;
  reward: boolean;
  reward_amount?: string;
}

// ─── Queries ──────────────────────────────────────────────────────────────────

export async function getActivePetsByCity(city: string): Promise<Pet[]> {
  const { data, error } = await getClient()
    .from("pets")
    .select("*")
    .eq("status", "active")
    .eq("city", city)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data as Pet[]) ?? [];
}

export async function getPetById(id: string): Promise<Pet | null> {
  const { data, error } = await getClient()
    .from("pets")
    .select("*")
    .eq("id", id)
    .single();
  if (error) return null;
  return data as Pet;
}

export async function getMyPets(userId: string): Promise<Pet[]> {
  const { data, error } = await getClient()
    .from("pets")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data as Pet[]) ?? [];
}

// ─── Mutations ────────────────────────────────────────────────────────────────

export async function createPet(pet: PetInsert & { user_id: string }): Promise<Pet> {
  const { data, error } = await getClient()
    .from("pets")
    .insert(pet)
    .select()
    .single();
  if (error) throw error;
  return data as Pet;
}

export async function updatePet(id: string, updates: Partial<PetInsert>): Promise<void> {
  const { error } = await getClient()
    .from("pets")
    .update(updates)
    .eq("id", id);
  if (error) throw error;
}

export async function resolvePet(id: string, resolvedVia: ResolvedVia): Promise<void> {
  const { error } = await getClient()
    .from("pets")
    .update({ status: "resolved", resolved_via: resolvedVia })
    .eq("id", id);
  if (error) throw error;
}

export async function renewPet(id: string): Promise<void> {
  const { error } = await getClient()
    .from("pets")
    .update({ last_renewed_at: new Date().toISOString(), status: "active" })
    .eq("id", id);
  if (error) throw error;
}

export async function deletePet(id: string): Promise<void> {
  const { error } = await getClient()
    .from("pets")
    .delete()
    .eq("id", id);
  if (error) throw error;
}

// ─── Storage ──────────────────────────────────────────────────────────────────

const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

export async function uploadPetPhoto(
  userId: string,
  file: File
): Promise<string> {
  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    throw new Error("Formato de arquivo não permitido. Use JPG, PNG, WEBP ou GIF.");
  }
  if (file.size > MAX_FILE_SIZE) {
    throw new Error("A foto deve ter no máximo 10 MB.");
  }

  const client = getClient();
  const extMap: Record<string, string> = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
    "image/gif": "gif",
  };
  const ext = extMap[file.type] ?? "jpg";
  const path = `${userId}/${Date.now()}.${ext}`;

  const { error } = await client.storage
    .from("pet-photos")
    .upload(path, file, { cacheControl: "3600", upsert: false });

  if (error) throw error;

  const { data } = client.storage.from("pet-photos").getPublicUrl(path);
  return data.publicUrl;
}

export async function getCityWithMostPets(): Promise<string | null> {
  const { data, error } = await getClient()
    .from("pets")
    .select("city")
    .eq("status", "active");
  if (error || !data || data.length === 0) return null;

  const counts: Record<string, number> = {};
  for (const row of data) {
    if (row.city) counts[row.city] = (counts[row.city] ?? 0) + 1;
  }
  const topCity = Object.entries(counts).sort((a, b) => b[1] - a[1])[0];
  return topCity ? topCity[0] : null;
}
