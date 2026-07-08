export type PlaceCategory =
  | 'meal'
  | 'cafe'
  | 'dessert'
  | 'convenience'
  | 'atm'
  | 'pharmacy'
  | 'toilet'
  | 'locker';

export type Place = {
  id: number;
  name: string;
  category: PlaceCategory;
  cuisine?: string;
  lat: number;
  lng: number;
  distanceM: number;
};

type OverpassElement = {
  id: number;
  // nodes carry lat/lon directly; ways/relations carry a computed center
  lat?: number;
  lon?: number;
  center?: { lat: number; lon: number };
  tags?: Record<string, string>;
};

type OverpassResponse = {
  elements: OverpassElement[];
};

function haversineMeters(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371000;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function categorize(tags: Record<string, string>): PlaceCategory | null {
  if (tags.amenity === 'cafe') return 'cafe';
  if (tags.amenity === 'restaurant' || tags.amenity === 'fast_food' || tags.amenity === 'food_court') {
    return 'meal';
  }
  if (tags.amenity === 'ice_cream' || tags.shop === 'bakery' || tags.shop === 'confectionery') {
    return 'dessert';
  }
  if (tags.shop === 'convenience') return 'convenience';
  if (tags.amenity === 'atm' || (tags.amenity === 'bank' && tags.atm === 'yes')) return 'atm';
  if (tags.amenity === 'pharmacy' || tags.shop === 'chemist') return 'pharmacy';
  if (tags.amenity === 'toilets') return 'toilet';
  if (tags.amenity === 'locker' || tags.amenity === 'luggage_locker') return 'locker';
  return null;
}

// Public Overpass instances; tried in order in case one is overloaded.
const OVERPASS_ENDPOINTS = [
  'https://overpass-api.de/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter',
];

export async function fetchNearbyPlaces(lat: number, lng: number, radiusM: number): Promise<Place[]> {
  // `nwr` matches nodes AND ways/relations — many shops are mapped as
  // building outlines, so node-only queries miss a large share of places.
  const query = `[out:json][timeout:25];
(
  nwr["amenity"~"^(restaurant|cafe|fast_food|food_court|ice_cream|atm|bank|pharmacy|toilets|locker|luggage_locker)$"](around:${radiusM},${lat},${lng});
  nwr["shop"~"^(bakery|confectionery|convenience|chemist)$"](around:${radiusM},${lat},${lng});
);
out center tags;`;

  let data: OverpassResponse | null = null;
  let lastError: unknown;
  for (const endpoint of OVERPASS_ENDPOINTS) {
    try {
      const res = await fetch(endpoint, { method: 'POST', body: query });
      if (!res.ok) throw new Error(`overpass fetch failed: ${res.status}`);
      data = (await res.json()) as OverpassResponse;
      break;
    } catch (err) {
      lastError = err;
    }
  }
  if (!data) {
    throw lastError instanceof Error ? lastError : new Error('overpass fetch failed');
  }

  const places: Place[] = [];

  // ATMs, toilets, and lockers are frequently unnamed — fall back to a category label
  const FALLBACK_NAME: Partial<Record<PlaceCategory, string>> = {
    atm: 'ATM',
    toilet: '화장실',
    locker: '코인 로커',
    pharmacy: '약국',
    convenience: '편의점',
  };

  for (const el of data.elements) {
    const tags = el.tags ?? {};
    const category = categorize(tags);
    if (!category) continue;
    const name = tags['name:ko'] || tags.name || tags['name:en'] || FALLBACK_NAME[category];
    if (!name) continue;
    const elLat = el.lat ?? el.center?.lat;
    const elLng = el.lon ?? el.center?.lon;
    if (elLat == null || elLng == null) continue;
    places.push({
      id: el.id,
      name,
      category,
      cuisine: tags.cuisine,
      lat: elLat,
      lng: elLng,
      distanceM: Math.round(haversineMeters(lat, lng, elLat, elLng)),
    });
  }

  return places.sort((a, b) => a.distanceM - b.distanceM);
}

export function tabelogSearchUrl(name: string, area = ''): string {
  const q = [name, area, 'site:tabelog.com'].filter(Boolean).join(' ');
  return `https://www.google.com/search?q=${encodeURIComponent(q)}`;
}
