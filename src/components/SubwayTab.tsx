import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import '../leafletSetup';
import { searchPlace } from '../geocode';

const TOKYO_STATION: [number, number] = [35.681236, 139.767125];

export default function SubwayTab() {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    const map = L.map(containerRef.current).setView(TOKYO_STATION, 13);
    L.tileLayer('https://tile.memomaps.de/tilegen/{z}/{x}/{y}.png', {
      attribution:
        'Map <a href="https://memomaps.de/">memomaps.de</a> <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, data &copy; OpenStreetMap contributors',
      maxZoom: 18,
    }).addTo(map);
    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
      markerRef.current = null;
    };
  }, []);

  const goToTokyoStation = () => {
    mapRef.current?.flyTo(TOKYO_STATION, 13);
  };

  const search = async () => {
    const q = query.trim();
    if (!q) return;
    setLoading(true);
    setError(null);
    try {
      const result = await searchPlace(`${q} station Tokyo`);
      if (!result) {
        setError('위치를 찾을 수 없어요.');
        return;
      }
      const map = mapRef.current;
      if (!map) return;
      if (markerRef.current) {
        markerRef.current.setLatLng([result.lat, result.lng]);
      } else {
        markerRef.current = L.marker([result.lat, result.lng]).addTo(map);
      }
      markerRef.current.bindPopup(result.label).openPopup();
      map.flyTo([result.lat, result.lng], 15);
    } catch {
      setError('검색에 실패했어요. 잠시 후 다시 시도해주세요.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 space-y-3 pb-24">
      <div className="rounded-xl border border-gray-200 dark:border-gray-800 p-3 space-y-2">
        <div className="flex gap-2">
          <input
            className="flex-1 min-w-0 bg-transparent outline-none border border-gray-200 dark:border-gray-800 rounded px-2 py-1.5 text-sm"
            placeholder="역/장소 검색 (예: 신주쿠)"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && search()}
          />
          <button
            onClick={search}
            disabled={loading}
            className="shrink-0 rounded-lg bg-indigo-600 text-white px-3 text-sm font-medium hover:bg-indigo-700 disabled:opacity-50"
          >
            {loading ? '검색중…' : '검색'}
          </button>
          <button
            onClick={goToTokyoStation}
            className="shrink-0 rounded-lg border border-gray-200 dark:border-gray-800 px-2 text-sm text-gray-500 dark:text-gray-400"
          >
            도쿄역
          </button>
        </div>
        {error && <p className="text-xs text-rose-500">{error}</p>}
      </div>

      <div className="rounded-xl overflow-hidden border border-gray-200 dark:border-gray-800">
        <div ref={containerRef} className="h-[60vh] w-full" />
      </div>

      <p className="text-xs text-gray-400 text-center">
        지도를 확대하면 도쿄 지하철·JR 노선이 표시돼요. 데이터: OpenStreetMap · memomaps.de
      </p>
    </div>
  );
}
