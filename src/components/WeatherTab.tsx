import { useState } from 'react';
import type { ItineraryDay, WeatherState } from '../types';
import { searchPlace } from '../geocode';
import { fetchForecast, weatherIcon } from '../weather';

type Props = {
  weather: WeatherState;
  onChange: (weather: WeatherState) => void;
  itineraryDays: ItineraryDay[];
};

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  const weekday = ['일', '월', '화', '수', '목', '금', '토'][d.getDay()];
  return `${d.getMonth() + 1}/${d.getDate()} (${weekday})`;
}

export default function WeatherTab({ weather, onChange, itineraryDays }: Props) {
  const [cityQuery, setCityQuery] = useState(weather.city);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const tripDates = new Set(itineraryDays.map((d) => d.date).filter(Boolean));

  const loadForecast = async (lat: number, lng: number, city: string) => {
    setLoading(true);
    setError(null);
    try {
      const daily = await fetchForecast(lat, lng);
      onChange({ city, lat, lng, fetchedAt: new Date().toISOString(), daily });
    } catch {
      setError('날씨 정보를 불러오지 못했어요. 잠시 후 다시 시도해주세요.');
    } finally {
      setLoading(false);
    }
  };

  const searchCity = async () => {
    if (!cityQuery.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const result = await searchPlace(cityQuery);
      if (!result) {
        setError('도시를 찾을 수 없어요.');
        setLoading(false);
        return;
      }
      await loadForecast(result.lat, result.lng, cityQuery.trim());
    } catch {
      setError('검색에 실패했어요. 잠시 후 다시 시도해주세요.');
      setLoading(false);
    }
  };

  const refresh = () => {
    if (weather.lat != null && weather.lng != null) {
      loadForecast(weather.lat, weather.lng, weather.city);
    }
  };

  return (
    <div className="p-4 space-y-4 pb-24">
      <div className="rounded-2xl bg-white dark:bg-[#1C1C1E] border border-black/[0.04] dark:border-white/[0.08] shadow-[0_6px_20px_-8px_rgba(0,0,0,0.15)] dark:shadow-none p-3 space-y-2">
        <div className="flex gap-2">
          <input
            className="flex-1 min-w-0 bg-black/[0.04] dark:bg-white/[0.06] outline-none border-0 rounded-lg px-2 py-1.5 text-sm"
            placeholder="도시 (예: Tokyo)"
            value={cityQuery}
            onChange={(e) => setCityQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && searchCity()}
          />
          <button
            onClick={searchCity}
            disabled={loading}
            className="shrink-0 rounded-xl bg-accent-600 text-white transition-transform active:scale-[0.97] px-3 text-sm font-medium hover:bg-accent-700 disabled:opacity-50"
          >
            {loading ? '검색중…' : '검색'}
          </button>
        </div>
        <div className="flex items-center justify-between text-xs text-gray-400">
          <span>
            {weather.fetchedAt
              ? `${weather.city} · 마지막 업데이트 ${new Date(weather.fetchedAt).toLocaleString('ko-KR', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' })}`
              : '아직 조회 전이에요'}
          </span>
          {weather.lat != null && (
            <button onClick={refresh} disabled={loading} className="text-accent-500 hover:text-accent-600">
              🔄 새로고침
            </button>
          )}
        </div>
        {error && <p className="text-xs text-rose-500">{error}</p>}
      </div>

      {weather.daily.length === 0 && !loading && (
        <p className="text-center text-gray-400 text-sm py-8">
          도시를 검색하면 최대 16일치 예보를 볼 수 있어요.
        </p>
      )}

      <div className="rounded-2xl bg-white dark:bg-[#1C1C1E] border border-black/[0.04] dark:border-white/[0.08] shadow-[0_6px_20px_-8px_rgba(0,0,0,0.15)] dark:shadow-none divide-y divide-gray-100 dark:divide-gray-800 overflow-hidden">
        {weather.daily.map((d) => (
          <div key={d.date} className="flex items-center gap-3 px-3 py-2 text-sm">
            <span className="w-16 shrink-0 text-gray-700 dark:text-gray-300">{formatDate(d.date)}</span>
            <span className="text-xl">{weatherIcon(d.weatherCode)}</span>
            <span className="flex-1 min-w-0 text-right text-gray-900 dark:text-gray-100">
              <span className="font-medium">{Math.round(d.tempMax)}°</span>
              <span className="text-gray-400"> / {Math.round(d.tempMin)}°</span>
            </span>
            <span className="w-14 shrink-0 text-right text-xs text-sky-500">💧{d.precipitationProb}%</span>
            {tripDates.has(d.date) && (
              <span className="shrink-0 text-xs bg-accent-100 dark:bg-accent-900/50 text-accent-600 dark:text-accent-300 rounded-full px-2 py-0.5">
                일정
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
