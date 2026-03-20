import { createClient } from "@supabase/supabase-js";

function getClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

// ─── Types ────────────────────────────────────────────────────────────────────

export type NoiseType =
  | "sossegado"
  | "latidos" | "festas" | "bares" | "transito"
  | "igrejas" | "industrias" | "alarmes" | "vizinhanca";

export const NOISY_TYPES: NoiseType[] = [
  "latidos", "festas", "bares", "transito",
  "igrejas", "industrias", "alarmes", "vizinhanca",
];

export interface NoiseSegmentFeature {
  id: string;
  noise_type: NoiseType;
  intensity: number;
  geojson: string;
}

export interface NoiseReportFeature {
  id: string;
  noise_type: NoiseType;
  geojson: string;
  reported_at: string;
}

export interface NoiseZone {
  lng: number;
  lat: number;
  total_reports: number;
  noisy_count: number;
  quiet_count: number;
}

// ─── Queries ──────────────────────────────────────────────────────────────────

export async function getNoiseSegments(): Promise<NoiseSegmentFeature[]> {
  const { data, error } = await getClient().rpc("get_noise_segments_geojson");
  if (error) throw error;
  return (data as NoiseSegmentFeature[]) ?? [];
}

export async function getNoiseReports(): Promise<NoiseReportFeature[]> {
  const { data, error } = await getClient().rpc("get_noise_reports_geojson");
  if (error) throw error;
  return (data as NoiseReportFeature[]) ?? [];
}

export async function getNoiseZones(): Promise<NoiseZone[]> {
  const { data, error } = await getClient().rpc("get_noise_zones");
  if (error) throw error;
  return (data as NoiseZone[]) ?? [];
}
