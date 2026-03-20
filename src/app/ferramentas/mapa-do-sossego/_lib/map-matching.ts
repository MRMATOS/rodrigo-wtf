/**
 * Mapbox Map Matching API wrapper
 * Docs: https://docs.mapbox.com/api/navigation/map-matching/
 *
 * Recebe coordenadas GPS brutas e retorna o trajeto snapped às ruas.
 * Limite da API: 100 waypoints por requisição.
 */

const MAX_WAYPOINTS = 100;

/**
 * Divide um array em chunks com 1 ponto de sobreposição entre eles
 * para garantir continuidade da linha ao concatenar.
 */
function chunk<T>(arr: T[], size: number): T[][] {
  if (arr.length <= size) return [arr];
  const chunks: T[][] = [];
  let i = 0;
  while (i < arr.length) {
    chunks.push(arr.slice(i, i + size));
    i += size - 1;
  }
  return chunks;
}

/**
 * Chama a Map Matching API para um lote de até 100 pontos.
 * Retorna as coordenadas snapped ou null se a API falhar.
 */
async function matchChunk(
  coords: [number, number][],
  token: string
): Promise<[number, number][] | null> {
  if (coords.length < 2) return null;

  const coordStr  = coords.map(([lng, lat]) => `${lng},${lat}`).join(";");
  const radiuses  = coords.map(() => 25).join(";"); // 25m de tolerância por ponto

  const url =
    `https://api.mapbox.com/matching/v5/mapbox/walking/${coordStr}` +
    `?geometries=geojson&radiuses=${radiuses}&access_token=${token}`;

  try {
    const res = await fetch(url);
    if (!res.ok) return null;

    const json = await res.json() as {
      matchings?: { geometry: { coordinates: [number, number][] } }[];
      code?: string;
    };

    if (json.code !== "Ok" || !json.matchings?.length) return null;

    // Pode retornar múltiplos matchings se houver gaps no trajeto — concatena todos
    return json.matchings.flatMap((m) => m.geometry.coordinates);
  } catch {
    return null;
  }
}

/**
 * Faz snap-to-road de uma lista de coordenadas GPS brutas.
 * Divide automaticamente em chunks se passar de 100 pontos.
 * Se a API falhar em todos os chunks, retorna o GPS bruto como fallback.
 */
export async function snapToRoad(
  rawCoords: [number, number][]
): Promise<[number, number][]> {
  const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
  if (!token || rawCoords.length < 2) return rawCoords;

  const chunks  = chunk(rawCoords, MAX_WAYPOINTS);
  const results = await Promise.all(chunks.map((c) => matchChunk(c, token)));

  // Se todos falharam, usa GPS bruto
  if (results.every((r) => r === null)) return rawCoords;

  // Concatena resultados; chunks com falha usam coordenadas brutas
  const merged: [number, number][] = [];
  for (let i = 0; i < chunks.length; i++) {
    const coords = results[i] ?? chunks[i];
    if (merged.length > 0) {
      merged.push(...coords.slice(1)); // evita duplicar ponto de sobreposição
    } else {
      merged.push(...coords);
    }
  }

  return merged;
}
