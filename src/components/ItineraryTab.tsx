import { Fragment, useState } from 'react';
import type { Activity, ItineraryDay } from '../types';
import { searchPlace } from '../geocode';
import { googleMapsSearchUrl, googleMapsSearchUrlForCoords, googleMapsTransitUrl } from '../googleMaps';
import DayMap from './DayMap';
import { MapIcon, SearchIcon, PinIcon, CompassIcon, RefreshIcon, YenIcon, TrainIcon } from './Icons';

// 두 좌표 사이 직선거리(km)
function haversineKm(aLat: number, aLng: number, bLat: number, bLng: number): number {
  const R = 6371;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(bLat - aLat);
  const dLng = toRad(bLng - aLng);
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(aLat)) * Math.cos(toRad(bLat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(s));
}
// 구글맵 길찾기용 출발/도착 식별자 (좌표 우선, 없으면 장소/이름 텍스트)
function endpoint(act: Activity): string | null {
  if (act.lat != null && act.lng != null) return `${act.lat},${act.lng}`;
  const t = (act.location || act.title || '').trim();
  return t || null;
}
function distLabel(km: number): string {
  return km < 1 ? `${Math.round(km * 1000)}m` : `${km.toFixed(1)}km`;
}

type Props = {
  days: ItineraryDay[];
  onChange: (days: ItineraryDay[]) => void;
};

function emptyActivity(): Activity {
  return {
    id: crypto.randomUUID(),
    time: '',
    title: '',
    location: '',
    notes: '',
    lat: null,
    lng: null,
  };
}

export default function ItineraryTab({ days, onChange }: Props) {
  const [closedDays, setClosedDays] = useState<Set<string>>(new Set());
  const [mapOpenDays, setMapOpenDays] = useState<Set<string>>(new Set());

  const toggleDay = (dayId: string) =>
    setClosedDays((prev) => {
      const next = new Set(prev);
      if (next.has(dayId)) next.delete(dayId);
      else next.add(dayId);
      return next;
    });
  const [geocodingIds, setGeocodingIds] = useState<Set<string>>(new Set());
  const [geocodeErrors, setGeocodeErrors] = useState<Record<string, string>>({});

  const addDay = () => {
    const nextIndex = days.length + 1;
    onChange([
      ...days,
      { id: crypto.randomUUID(), date: '', title: `Day ${nextIndex}`, activities: [] },
    ]);
  };

  const updateDay = (id: string, patch: Partial<ItineraryDay>) => {
    onChange(days.map((d) => (d.id === id ? { ...d, ...patch } : d)));
  };

  const removeDay = (id: string) => {
    onChange(days.filter((d) => d.id !== id));
  };

  const addActivity = (dayId: string) => {
    updateDay(dayId, {
      activities: [...days.find((d) => d.id === dayId)!.activities, emptyActivity()],
    });
  };

  const updateActivity = (dayId: string, actId: string, patch: Partial<Activity>) => {
    const day = days.find((d) => d.id === dayId)!;
    updateDay(dayId, {
      activities: day.activities.map((a) => (a.id === actId ? { ...a, ...patch } : a)),
    });
  };

  const removeActivity = (dayId: string, actId: string) => {
    const day = days.find((d) => d.id === dayId)!;
    updateDay(dayId, { activities: day.activities.filter((a) => a.id !== actId) });
  };

  const moveDay = (index: number, dir: -1 | 1) => {
    const target = index + dir;
    if (target < 0 || target >= days.length) return;
    const copy = [...days];
    [copy[index], copy[target]] = [copy[target], copy[index]];
    onChange(copy);
  };

  const toggleMap = (dayId: string) => {
    setMapOpenDays((prev) => {
      const next = new Set(prev);
      if (next.has(dayId)) next.delete(dayId);
      else next.add(dayId);
      return next;
    });
  };

  const geocodeActivity = async (dayId: string, act: Activity) => {
    if (!act.location.trim() || geocodingIds.has(act.id)) return;
    setGeocodingIds((prev) => new Set(prev).add(act.id));
    setGeocodeErrors((prev) => {
      const { [act.id]: _drop, ...rest } = prev;
      return rest;
    });
    try {
      const result = await searchPlace(act.location);
      if (result) {
        updateActivity(dayId, act.id, { lat: result.lat, lng: result.lng });
        setMapOpenDays((prev) => new Set(prev).add(dayId));
      } else {
        setGeocodeErrors((prev) => ({ ...prev, [act.id]: '위치를 찾을 수 없어요' }));
      }
    } catch {
      setGeocodeErrors((prev) => ({ ...prev, [act.id]: '검색 실패, 다시 시도해주세요' }));
    } finally {
      setGeocodingIds((prev) => {
        const next = new Set(prev);
        next.delete(act.id);
        return next;
      });
    }
  };

  return (
    <div className="p-4 space-y-4 pb-24">
      {days.length === 0 && (
        <p className="text-center text-gray-400 text-sm py-8">
          아직 일정이 없어요. 아래 버튼으로 첫 날을 추가하세요.
        </p>
      )}
      {days.map((day, index) => (
        <div
          key={day.id}
          className="rounded-2xl card-surface border border-black/[0.04] dark:border-white/[0.08] shadow-[0_6px_20px_-8px_rgba(0,0,0,0.15)] dark:shadow-none overflow-hidden"
        >
          <div className="flex items-center gap-2 bg-black/[0.03] dark:bg-white/[0.05] px-3 py-2">
            <div className="flex flex-col">
              <button
                aria-label="위로"
                onClick={() => moveDay(index, -1)}
                className="text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 text-xs leading-none"
              >
                ▲
              </button>
              <button
                aria-label="아래로"
                onClick={() => moveDay(index, 1)}
                className="text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 text-xs leading-none"
              >
                ▼
              </button>
            </div>
            <input
              className="font-semibold bg-transparent outline-none flex-none w-20 text-gray-900 dark:text-gray-100"
              value={day.title}
              onChange={(e) => updateDay(day.id, { title: e.target.value })}
            />
            <input
              type="date"
              className="bg-transparent outline-none text-sm text-gray-500 dark:text-gray-400"
              value={day.date}
              onChange={(e) => updateDay(day.id, { date: e.target.value })}
            />
            <span className="ml-auto shrink-0 text-xs text-gray-400">{day.activities.length}개</span>
            <button
              onClick={() => toggleMap(day.id)}
              className={`shrink-0 whitespace-nowrap text-sm inline-flex items-center gap-1 ${mapOpenDays.has(day.id) ? 'text-accent-600 dark:text-accent-400 font-medium' : 'text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}`}
            >
              <MapIcon className="h-4 w-4" />지도
            </button>
            <button
              onClick={() => removeDay(day.id)}
              className="shrink-0 whitespace-nowrap text-gray-400 hover:text-rose-500 text-sm"
            >
              삭제
            </button>
            <button
              aria-label={closedDays.has(day.id) ? '펼치기' : '접기'}
              onClick={() => toggleDay(day.id)}
              className="shrink-0 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 text-xs w-5 text-center"
            >
              <span className={`inline-block transition-transform ${closedDays.has(day.id) ? '' : 'rotate-90'}`}>›</span>
            </button>
          </div>

          {!closedDays.has(day.id) && (
          <div className="anim-pop-open">
          {mapOpenDays.has(day.id) && (
            <DayMap
              activities={day.activities}
              onActivityMove={(actId, lat, lng) => updateActivity(day.id, actId, { lat, lng })}
            />
          )}

          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            {day.activities.map((act, ai) => {
              const prev = ai > 0 ? day.activities[ai - 1] : null;
              const oFrom = prev ? endpoint(prev) : null;
              const oTo = endpoint(act);
              const km =
                prev && prev.lat != null && prev.lng != null && act.lat != null && act.lng != null
                  ? haversineKm(prev.lat, prev.lng, act.lat, act.lng)
                  : null;
              return (
              <Fragment key={act.id}>
              {prev && oFrom && oTo && (
                <div className="flex items-center gap-2 px-3 py-1.5 bg-black/[0.015] dark:bg-white/[0.03]">
                  <TrainIcon className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                  <span className="text-[11px] text-gray-400">
                    {km != null ? `직선 약 ${distLabel(km)}` : '다음 장소로 이동'}
                  </span>
                  <a
                    href={googleMapsTransitUrl(oFrom, oTo)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ml-auto text-[11px] font-medium text-accent-500 hover:text-accent-600"
                  >
                    경로·시간 →
                  </a>
                </div>
              )}
              <div className="flex flex-wrap items-start gap-2 px-3 py-2">
                <input
                  type="time"
                  className="bg-transparent outline-none text-sm w-24 text-gray-700 dark:text-gray-300"
                  value={act.time}
                  onChange={(e) => updateActivity(day.id, act.id, { time: e.target.value })}
                />
                <div className="flex-1 min-w-[140px] space-y-1">
                  <input
                    className="w-full bg-transparent outline-none font-medium text-gray-900 dark:text-gray-100"
                    placeholder="활동/장소 이름"
                    value={act.title}
                    onChange={(e) => updateActivity(day.id, act.id, { title: e.target.value })}
                  />
                  <div className="flex items-center gap-1">
                    <input
                      className="flex-1 min-w-0 bg-transparent outline-none text-sm text-gray-500 dark:text-gray-400"
                      placeholder="위치"
                      value={act.location}
                      onChange={(e) =>
                        updateActivity(day.id, act.id, { location: e.target.value, lat: null, lng: null })
                      }
                      onKeyDown={(e) => e.key === 'Enter' && geocodeActivity(day.id, act)}
                    />
                    <button
                      onClick={() => geocodeActivity(day.id, act)}
                      disabled={geocodingIds.has(act.id) || !act.location.trim()}
                      title="위치 검색"
                      className="shrink-0 disabled:opacity-30 text-gray-400 hover:text-accent-500"
                    >
                      {geocodingIds.has(act.id) ? (
                        <RefreshIcon className="h-4 w-4 animate-spin" />
                      ) : act.lat != null ? (
                        <PinIcon className="h-4 w-4 text-accent-500" />
                      ) : (
                        <SearchIcon className="h-4 w-4" />
                      )}
                    </button>
                    {act.location.trim() && (
                      <a
                        href={
                          act.lat != null && act.lng != null
                            ? googleMapsSearchUrlForCoords(act.lat, act.lng)
                            : googleMapsSearchUrl(act.location)
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                        title="구글맵에서 열기"
                        className="shrink-0 text-gray-400 hover:text-accent-500"
                      >
                        <CompassIcon className="h-4 w-4" />
                      </a>
                    )}
                  </div>
                  {geocodeErrors[act.id] && (
                    <p className="text-xs text-rose-500">{geocodeErrors[act.id]}</p>
                  )}
                  <input
                    className="w-full bg-transparent outline-none text-sm text-gray-500 dark:text-gray-400"
                    placeholder="메모"
                    value={act.notes}
                    onChange={(e) => updateActivity(day.id, act.id, { notes: e.target.value })}
                  />
                  <div className="flex items-center gap-1 text-xs text-gray-400">
                    <span className="inline-flex items-center gap-0.5"><YenIcon className="h-3.5 w-3.5" />비용</span>
                    <input
                      type="number"
                      min={0}
                      className="w-24 min-w-0 bg-transparent outline-none text-right border border-black/[0.06] dark:border-white/[0.1] rounded px-1.5 py-0.5"
                      placeholder="0"
                      value={act.cost || ''}
                      onChange={(e) => updateActivity(day.id, act.id, { cost: Number(e.target.value) || 0 })}
                    />
                    <span>엔 (예산 탭에 자동 합산)</span>
                  </div>
                </div>
                <button
                  onClick={() => removeActivity(day.id, act.id)}
                  className="text-gray-300 hover:text-rose-500 text-sm"
                >
                  ✕
                </button>
              </div>
              </Fragment>
              );
            })}
            <button
              onClick={() => addActivity(day.id)}
              className="w-full text-left px-3 py-2 text-sm text-accent-600 dark:text-accent-400 hover:bg-accent-50 dark:hover:bg-accent-950"
            >
              + 활동 추가
            </button>
          </div>
          </div>
          )}
        </div>
      ))}

      <button
        onClick={addDay}
        className="w-full rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-700 py-3 text-gray-500 dark:text-gray-400 hover:border-accent-400 hover:text-accent-500"
      >
        + 날짜 추가
      </button>
    </div>
  );
}
