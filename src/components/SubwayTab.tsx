import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import '../leafletSetup';
import { searchPlace } from '../geocode';
import { googleMapsTransitUrl } from '../googleMaps';
import { TOKYO_LINES, type Station } from '../tokyoLines';
import { SwapIcon, TrainIcon, SearchIcon, CompassIcon } from './Icons';

const TOKYO_STATION: [number, number] = [35.681236, 139.767125];

// Tokyo Metro + Toei + JR Yamanote schematic map, Wikimedia Commons, CC BY-SA 3.0.
// Special:FilePath always resolves to the current file without needing the hashed upload path.
const SUBWAY_MAP_IMAGE_URL =
  'https://commons.wikimedia.org/wiki/Special:FilePath/Tokyo_subway_map.PNG';
const SUBWAY_MAP_SOURCE_URL = 'https://commons.wikimedia.org/wiki/File:Tokyo_subway_map.PNG';
// Official always-up-to-date maps (link out; these are copyrighted so we don't embed them)
const OFFICIAL_METRO_MAP_KR = 'https://www.tokyometro.jp/kr/subwaymap/index.html';
const OFFICIAL_JR_MAP = 'https://www.jreast.co.jp/e/downloads/pdf/routemap_majorrailsub.pdf';

export default function SubwayTab() {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [routeFrom, setRouteFrom] = useState('');
  const [routeTo, setRouteTo] = useState('');
  const [selectedLineId, setSelectedLineId] = useState<string | null>(null);

  const selectedLine = TOKYO_LINES.find((l) => l.id === selectedLineId) ?? null;

  const asStation = (name: string) =>
    /(역|駅|station)$/i.test(name) ? `${name} 일본` : `${name}역 일본`;

  const searchRoute = () => {
    const from = routeFrom.trim();
    const to = routeTo.trim();
    if (!from || !to) return;
    // Google Maps transit directions show duration, transfers, and fares.
    // Korean station names work fine for Japan (e.g. "신주쿠역").
    window.open(googleMapsTransitUrl(asStation(from), asStation(to)), '_blank', 'noopener');
  };

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

  const searchOnMap = async (searchTerm: string) => {
    setLoading(true);
    setError(null);
    try {
      const result = await searchPlace(searchTerm);
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

  const search = () => {
    const q = query.trim();
    if (q) searchOnMap(`${q} station Tokyo`);
  };

  const showStationOnMap = (station: Station) => {
    // Japanese name gives Nominatim the most reliable match
    searchOnMap(`${station.ja}駅 東京`);
  };

  return (
    <div className="p-4 space-y-3 pb-24">
      <div className="rounded-2xl card-surface border border-black/[0.04] dark:border-white/[0.08] shadow-[0_6px_20px_-8px_rgba(0,0,0,0.15)] dark:shadow-none p-3 space-y-2">
        <p className="flex items-center gap-1.5 text-sm font-semibold text-gray-600 dark:text-gray-300"><SwapIcon className="h-4 w-4" />환승/경로 검색</p>
        <div className="flex items-center gap-2">
          <input
            className="flex-1 min-w-0 bg-black/[0.04] dark:bg-white/[0.06] outline-none border-0 rounded-lg px-2 py-1.5 text-sm"
            placeholder="출발역 (예: 신주쿠)"
            value={routeFrom}
            onChange={(e) => setRouteFrom(e.target.value)}
          />
          <button
            onClick={() => {
              setRouteFrom(routeTo);
              setRouteTo(routeFrom);
            }}
            title="출발/도착 바꾸기"
            className="shrink-0 text-gray-400 hover:text-accent-500"
          >
            ⇄
          </button>
          <input
            className="flex-1 min-w-0 bg-black/[0.04] dark:bg-white/[0.06] outline-none border-0 rounded-lg px-2 py-1.5 text-sm"
            placeholder="도착역 (예: 아사쿠사)"
            value={routeTo}
            onChange={(e) => setRouteTo(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && searchRoute()}
          />
        </div>
        <button
          onClick={searchRoute}
          disabled={!routeFrom.trim() || !routeTo.trim()}
          className="w-full rounded-xl bg-accent-600 text-white transition-transform active:scale-[0.97] py-2 text-sm font-medium hover:bg-accent-700 disabled:opacity-50 flex items-center justify-center gap-1.5"
        >
          <CompassIcon className="h-4 w-4" />소요시간·환승 검색 (구글맵)
        </button>
        <p className="text-[11px] text-gray-400">
          구글맵 대중교통 길찾기가 열려서 소요시간, 환승 노선, 요금까지 바로 확인할 수 있어요.
          한국어 역 이름 그대로 입력해도 돼요.
        </p>
      </div>

      <div className="rounded-2xl card-surface border border-black/[0.04] dark:border-white/[0.08] shadow-[0_6px_20px_-8px_rgba(0,0,0,0.15)] dark:shadow-none overflow-hidden">
        <div className="bg-black/[0.02] dark:bg-white/[0.04] px-4 py-2.5 text-[11px] font-bold uppercase tracking-[0.06em] text-gray-600 dark:text-gray-300 flex items-center justify-between">
          <span className="flex items-center gap-1.5"><TrainIcon className="h-3.5 w-3.5" />도쿄 지하철 노선도</span>
          <a
            href={SUBWAY_MAP_IMAGE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-normal text-accent-500 hover:text-accent-600"
          >
            원본 크게 보기
          </a>
        </div>
        <div className="overflow-auto bg-white p-2 max-h-[50vh]">
          <img
            src={SUBWAY_MAP_IMAGE_URL}
            alt="도쿄 지하철 노선도 (메트로·도에이·JR 야마노테선)"
            className="min-w-[600px] w-full"
          />
        </div>
        <div className="px-3 py-2 border-t border-gray-100 dark:border-gray-800 flex flex-wrap gap-x-3 gap-y-1 text-xs">
          <a
            href={OFFICIAL_METRO_MAP_KR}
            target="_blank"
            rel="noopener noreferrer"
            className="text-accent-500 hover:text-accent-600 font-medium"
          >
            📄 도쿄메트로 공식 노선도 (한국어)
          </a>
          <a
            href={OFFICIAL_JR_MAP}
            target="_blank"
            rel="noopener noreferrer"
            className="text-accent-500 hover:text-accent-600 font-medium"
          >
            📄 JR 동일본 노선도 (PDF)
          </a>
        </div>
        <p className="px-3 py-1.5 text-[11px] text-gray-400 border-t border-gray-100 dark:border-gray-800">
          위 요약 지도는 메트로·도에이·야마노테선만 표시돼요. 전체 노선은 공식 노선도 링크에서 확인하세요.
          지도:{' '}
          <a href={SUBWAY_MAP_SOURCE_URL} target="_blank" rel="noopener noreferrer" className="underline">
            Wikimedia Commons
          </a>{' '}
          (CC BY-SA 3.0)
        </p>
      </div>

      <div className="rounded-2xl card-surface border border-black/[0.04] dark:border-white/[0.08] shadow-[0_6px_20px_-8px_rgba(0,0,0,0.15)] dark:shadow-none overflow-hidden">
        <div className="bg-black/[0.02] dark:bg-white/[0.04] px-4 py-2.5 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.06em] text-gray-600 dark:text-gray-300">
          <TrainIcon className="h-3.5 w-3.5" />노선별 역 목록 (오프라인)
        </div>
        <div className="p-3 space-y-2">
          <div className="flex flex-wrap gap-1.5">
            {TOKYO_LINES.map((line) => (
              <button
                key={line.id}
                onClick={() => setSelectedLineId(selectedLineId === line.id ? null : line.id)}
                className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${
                  selectedLineId === line.id
                    ? 'border-transparent text-white'
                    : 'border-black/[0.06] dark:border-white/[0.1] text-gray-600 dark:text-gray-300'
                }`}
                style={selectedLineId === line.id ? { backgroundColor: line.color } : undefined}
              >
                <span
                  className="inline-block w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: selectedLineId === line.id ? '#ffffff' : line.color }}
                />
                {line.nameKo}
              </button>
            ))}
          </div>

          {selectedLine ? (
            <div>
              <p className="text-xs text-gray-400 mb-1">
                {selectedLine.operator} {selectedLine.nameKo} ({selectedLine.nameJa}) ·{' '}
                {selectedLine.stations.length}개 역 · 역을 탭하면 지도에 표시돼요
              </p>
              <ol className="max-h-[38vh] overflow-y-auto divide-y divide-gray-100 dark:divide-gray-800 border border-gray-100 dark:border-gray-800 rounded-lg">
                {selectedLine.stations.map((st, i) => (
                  <li key={`${st.romaji}-${i}`}>
                    <button
                      onClick={() => showStationOnMap(st)}
                      className="w-full flex items-center gap-2 px-2.5 py-1.5 text-left hover:bg-black/[0.03] dark:hover:bg-white/[0.05]"
                    >
                      <span
                        className="shrink-0 w-5 h-5 rounded-full text-[10px] font-bold text-white flex items-center justify-center"
                        style={{ backgroundColor: selectedLine.color }}
                      >
                        {i + 1}
                      </span>
                      <span className="flex-1 min-w-0 text-sm text-gray-800 dark:text-gray-200 truncate">
                        {st.ko}
                      </span>
                      <span className="shrink-0 text-xs text-gray-400">
                        {st.ja} · {st.romaji}
                      </span>
                    </button>
                  </li>
                ))}
              </ol>
            </div>
          ) : (
            <p className="text-xs text-gray-400">
              노선을 선택하면 전체 역 목록을 한국어·일본어·로마자로 볼 수 있어요. 인터넷 없이도 열려요.
            </p>
          )}
        </div>
      </div>

      <div className="rounded-2xl card-surface border border-black/[0.04] dark:border-white/[0.08] shadow-[0_6px_20px_-8px_rgba(0,0,0,0.15)] dark:shadow-none p-3 space-y-2">
        <p className="flex items-center gap-1.5 text-sm font-semibold text-gray-600 dark:text-gray-300"><SearchIcon className="h-4 w-4" />역/장소 검색</p>
        <div className="flex gap-2">
          <input
            className="flex-1 min-w-0 bg-black/[0.04] dark:bg-white/[0.06] outline-none border-0 rounded-lg px-2 py-1.5 text-sm"
            placeholder="역/장소 검색 (예: 신주쿠)"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && search()}
          />
          <button
            onClick={search}
            disabled={loading}
            className="shrink-0 rounded-xl bg-accent-600 text-white transition-transform active:scale-[0.97] px-3 text-sm font-medium hover:bg-accent-700 disabled:opacity-50"
          >
            {loading ? '검색중…' : '검색'}
          </button>
          <button
            onClick={goToTokyoStation}
            className="shrink-0 rounded-xl border border-black/[0.06] dark:border-white/[0.1] px-2 text-sm text-gray-500 dark:text-gray-400"
          >
            도쿄역
          </button>
        </div>
        {error && <p className="text-xs text-rose-500">{error}</p>}
      </div>

      <div className="rounded-xl overflow-hidden border border-black/[0.06] dark:border-white/[0.1]">
        <div ref={containerRef} className="h-60 w-full" />
      </div>

      <p className="text-xs text-gray-400 text-center">
        역/장소를 검색해서 실제 위치를 지도에서 확인하세요. 지도: CARTO · OpenStreetMap
      </p>
    </div>
  );
}
