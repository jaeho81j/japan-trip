import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import '../leafletSetup';
import { searchPlace } from '../geocode';
import { fetchNearbyPlaces, tabelogSearchUrl, type Place, type PlaceCategory } from '../places';
import { googleMapsSearchUrlForCoords } from '../googleMaps';

const CATEGORY_META: Record<PlaceCategory, { label: string; emoji: string }> = {
  meal: { label: '식사', emoji: '🍽️' },
  cafe: { label: '카페', emoji: '☕' },
  dessert: { label: '디저트', emoji: '🍰' },
};

const RADIUS_OPTIONS = [500, 1000, 2000];

type Origin = { lat: number; lng: number; label: string };

export default function FoodTab() {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const layerRef = useRef<L.LayerGroup | null>(null);

  const [locationQuery, setLocationQuery] = useState('');
  const [origin, setOrigin] = useState<Origin | null>(null);
  const [radius, setRadius] = useState(1000);
  const [categories, setCategories] = useState<Set<PlaceCategory>>(
    new Set(['meal', 'cafe', 'dessert']),
  );
  const [places, setPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    const map = L.map(containerRef.current).setView([35.681236, 139.767125], 14);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(map);
    layerRef.current = L.layerGroup().addTo(map);
    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
      layerRef.current = null;
    };
  }, []);

  const shown = places.filter((p) => categories.has(p.category));

  useEffect(() => {
    const map = mapRef.current;
    const layer = layerRef.current;
    if (!map || !layer) return;
    layer.clearLayers();

    if (origin) {
      L.circleMarker([origin.lat, origin.lng], {
        radius: 8,
        color: '#ffffff',
        weight: 2,
        fillColor: '#2563eb',
        fillOpacity: 1,
      })
        .bindPopup(origin.label)
        .addTo(layer);
    }

    shown.forEach((p) => {
      L.marker([p.lat, p.lng]).bindPopup(`${CATEGORY_META[p.category].emoji} ${p.name}`).addTo(layer);
    });

    const points: [number, number][] = shown.map((p) => [p.lat, p.lng]);
    if (origin) points.push([origin.lat, origin.lng]);
    if (points.length > 0) {
      map.fitBounds(L.latLngBounds(points), { padding: [32, 32], maxZoom: 16 });
    }
  }, [places, categories, origin]);

  const runSearch = async (o: Origin) => {
    setLoading(true);
    setError(null);
    try {
      const results = await fetchNearbyPlaces(o.lat, o.lng, radius);
      setPlaces(results);
      if (results.length === 0) setError('주변에서 결과를 찾지 못했어요. 반경을 넓혀보세요.');
    } catch {
      setError('검색에 실패했어요. 잠시 후 다시 시도해주세요.');
    } finally {
      setLoading(false);
    }
  };

  const useMyLocation = () => {
    if (!navigator.geolocation) {
      setError('이 브라우저에서는 위치 확인을 지원하지 않아요.');
      return;
    }
    setLoading(true);
    setError(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const o = { lat: pos.coords.latitude, lng: pos.coords.longitude, label: '내 위치' };
        setOrigin(o);
        runSearch(o);
      },
      () => {
        setLoading(false);
        setError('위치 권한을 확인해주세요.');
      },
    );
  };

  const searchLocation = async () => {
    if (!locationQuery.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const result = await searchPlace(locationQuery);
      if (!result) {
        setError('위치를 찾을 수 없어요.');
        setLoading(false);
        return;
      }
      const o = { lat: result.lat, lng: result.lng, label: locationQuery.trim() };
      setOrigin(o);
      await runSearch(o);
    } catch {
      setError('검색에 실패했어요. 잠시 후 다시 시도해주세요.');
      setLoading(false);
    }
  };

  const toggleCategory = (cat: PlaceCategory) => {
    setCategories((prev) => {
      const next = new Set(prev);
      if (next.has(cat)) next.delete(cat);
      else next.add(cat);
      return next;
    });
  };

  return (
    <div className="p-4 space-y-3 pb-24">
      <div className="rounded-xl border border-gray-200 dark:border-gray-800 p-3 space-y-2">
        <div className="flex gap-2">
          <input
            className="flex-1 min-w-0 bg-transparent outline-none border border-gray-200 dark:border-gray-800 rounded px-2 py-1.5 text-sm"
            placeholder="위치 검색 (예: 신주쿠역)"
            value={locationQuery}
            onChange={(e) => setLocationQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && searchLocation()}
          />
          <button
            onClick={searchLocation}
            disabled={loading}
            className="shrink-0 rounded-lg bg-indigo-600 text-white px-3 text-sm font-medium hover:bg-indigo-700 disabled:opacity-50"
          >
            검색
          </button>
          <button
            onClick={useMyLocation}
            disabled={loading}
            className="shrink-0 rounded-lg border border-gray-200 dark:border-gray-800 px-2 text-sm text-gray-500 dark:text-gray-400 disabled:opacity-50"
          >
            📍 내 위치
          </button>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-gray-400">반경</span>
          {RADIUS_OPTIONS.map((r) => (
            <button
              key={r}
              onClick={() => setRadius(r)}
              className={`rounded-full px-2 py-1 ${
                radius === r
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-900 text-gray-500 dark:text-gray-400'
              }`}
            >
              {r >= 1000 ? `${r / 1000}km` : `${r}m`}
            </button>
          ))}
          {origin && (
            <button
              onClick={() => runSearch(origin)}
              disabled={loading}
              className="ml-auto text-indigo-500 hover:text-indigo-600 disabled:opacity-50"
            >
              🔄 다시 검색
            </button>
          )}
        </div>

        <div className="flex gap-2 text-xs">
          {(Object.keys(CATEGORY_META) as PlaceCategory[]).map((cat) => (
            <button
              key={cat}
              onClick={() => toggleCategory(cat)}
              className={`flex-1 rounded-lg py-1.5 border ${
                categories.has(cat)
                  ? 'border-indigo-400 bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-300'
                  : 'border-gray-200 dark:border-gray-800 text-gray-400'
              }`}
            >
              {CATEGORY_META[cat].emoji} {CATEGORY_META[cat].label}
            </button>
          ))}
        </div>

        {error && <p className="text-xs text-rose-500">{error}</p>}
      </div>

      <div className="rounded-xl overflow-hidden border border-gray-200 dark:border-gray-800">
        <div ref={containerRef} className="h-52 w-full" />
      </div>

      {places.length === 0 && !loading && (
        <p className="text-center text-gray-400 text-sm py-4">
          위치를 검색하거나 내 위치를 사용해서 주변 식사·카페·디저트를 찾아보세요.
        </p>
      )}

      <div className="rounded-xl border border-gray-200 dark:border-gray-800 divide-y divide-gray-100 dark:divide-gray-800 overflow-hidden">
        {shown.map((p) => (
          <div key={p.id} className="px-3 py-2 text-sm space-y-1">
            <div className="flex items-center gap-2">
              <span>{CATEGORY_META[p.category].emoji}</span>
              <span className="flex-1 min-w-0 truncate text-left font-medium text-gray-900 dark:text-gray-100">
                {p.name}
              </span>
              <span className="shrink-0 text-xs text-gray-400">{p.distanceM}m</span>
            </div>
            <div className="flex items-center gap-3 text-xs">
              {p.cuisine && <span className="text-gray-400">{p.cuisine}</span>}
              <a
                href={googleMapsSearchUrlForCoords(p.lat, p.lng)}
                target="_blank"
                rel="noopener noreferrer"
                className="text-indigo-500 hover:text-indigo-600"
              >
                구글맵
              </a>
              <a
                href={tabelogSearchUrl(p.name, origin?.label)}
                target="_blank"
                rel="noopener noreferrer"
                className="text-rose-500 hover:text-rose-600"
              >
                타베로그
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
