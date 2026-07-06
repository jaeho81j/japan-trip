import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import '../leafletSetup';
import { searchPlace } from '../geocode';

const TOKYO_STATION: [number, number] = [35.681236, 139.767125];

// Bilingual (EN/JP) Tokyo subway schematic map by Comicinker, Wikimedia Commons, CC BY-SA 3.0.
// Special:FilePath always resolves to the current file without needing the hashed upload path.
const SUBWAY_MAP_IMAGE_URL =
  'https://commons.wikimedia.org/wiki/Special:FilePath/Tokyo_subway_map_en_jp.svg';
const SUBWAY_MAP_SOURCE_URL =
  'https://commons.wikimedia.org/wiki/File:Tokyo_subway_map_en_jp.svg';

export default function SubwayTab() {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    const isDark = window.matchMedia?.('(prefers-color-scheme: dark)').matches;
    const map = L.map(containerRef.current).setView(TOKYO_STATION, 13);
    L.tileLayer(
      `https://{s}.basemaps.cartocdn.com/rastertiles/${isDark ? 'dark_all' : 'voyager'}/{z}/{x}/{y}{r}.png`,
      {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 20,
      },
    ).addTo(map);
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
      <div className="rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
        <div className="bg-gray-50 dark:bg-gray-900 px-3 py-1.5 text-sm font-semibold text-gray-600 dark:text-gray-300 flex items-center justify-between">
          <span>🚇 도쿄 지하철 노선도</span>
          <a
            href={SUBWAY_MAP_IMAGE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-normal text-indigo-500 hover:text-indigo-600"
          >
            원본 크게 보기
          </a>
        </div>
        <div className="overflow-auto bg-white p-2 max-h-[50vh]">
          <img
            src={SUBWAY_MAP_IMAGE_URL}
            alt="도쿄 지하철 노선도 (영문/일문 병기)"
            className="min-w-[600px] w-full"
          />
        </div>
        <p className="px-3 py-1.5 text-[11px] text-gray-400 border-t border-gray-100 dark:border-gray-800">
          지도:{' '}
          <a href={SUBWAY_MAP_SOURCE_URL} target="_blank" rel="noopener noreferrer" className="underline">
            Comicinker, Wikimedia Commons
          </a>{' '}
          (CC BY-SA 3.0)
        </p>
      </div>

      <div className="rounded-xl border border-gray-200 dark:border-gray-800 p-3 space-y-2">
        <p className="text-sm font-semibold text-gray-600 dark:text-gray-300">📍 역/장소 검색</p>
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
        <div ref={containerRef} className="h-[45vh] w-full" />
      </div>

      <p className="text-xs text-gray-400 text-center">
        역/장소를 검색해서 실제 위치를 지도에서 확인하세요. 지도: CARTO · OpenStreetMap
      </p>
    </div>
  );
}
