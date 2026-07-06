export type GeocodeResult = {
  lat: number;
  lng: number;
  label: string;
};

export async function searchPlace(query: string): Promise<GeocodeResult | null> {
  const trimmed = query.trim();
  if (!trimmed) return null;

  const url = new URL('https://nominatim.openstreetmap.org/search');
  url.searchParams.set('format', 'jsonv2');
  url.searchParams.set('q', trimmed);
  url.searchParams.set('limit', '1');

  const res = await fetch(url.toString(), {
    headers: { Accept: 'application/json' },
  });
  if (!res.ok) return null;

  const results = (await res.json()) as Array<{ lat: string; lon: string; display_name: string }>;
  const first = results[0];
  if (!first) return null;

  return { lat: Number(first.lat), lng: Number(first.lon), label: first.display_name };
}
