import { useState } from 'react';
import type { Activity, ItineraryDay } from '../types';
import { searchPlace } from '../geocode';
import { googleMapsSearchUrl, googleMapsSearchUrlForCoords } from '../googleMaps';
import DayMap from './DayMap';

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
  const [mapOpenDays, setMapOpenDays] = useState<Set<string>>(new Set());
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
          className="rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden"
        >
          <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-900 px-3 py-2">
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
            <button
              onClick={() => toggleMap(day.id)}
              className={`ml-auto shrink-0 whitespace-nowrap text-sm ${mapOpenDays.has(day.id) ? 'text-indigo-600 dark:text-indigo-400 font-medium' : 'text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}`}
            >
              🗺️ 지도
            </button>
            <button
              onClick={() => removeDay(day.id)}
              className="shrink-0 whitespace-nowrap text-gray-400 hover:text-rose-500 text-sm"
            >
              삭제
            </button>
          </div>

          {mapOpenDays.has(day.id) && (
            <DayMap
              activities={day.activities}
              onActivityMove={(actId, lat, lng) => updateActivity(day.id, actId, { lat, lng })}
            />
          )}

          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            {day.activities.map((act) => (
              <div key={act.id} className="flex flex-wrap items-start gap-2 px-3 py-2">
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
                      className="shrink-0 text-sm disabled:opacity-30"
                    >
                      {geocodingIds.has(act.id) ? '⏳' : act.lat != null ? '📍' : '🔍'}
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
                        className="shrink-0 text-sm"
                      >
                        🧭
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
                </div>
                <button
                  onClick={() => removeActivity(day.id, act.id)}
                  className="text-gray-300 hover:text-rose-500 text-sm"
                >
                  ✕
                </button>
              </div>
            ))}
            <button
              onClick={() => addActivity(day.id)}
              className="w-full text-left px-3 py-2 text-sm text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950"
            >
              + 활동 추가
            </button>
          </div>
        </div>
      ))}

      <button
        onClick={addDay}
        className="w-full rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-700 py-3 text-gray-500 dark:text-gray-400 hover:border-indigo-400 hover:text-indigo-500"
      >
        + 날짜 추가
      </button>
    </div>
  );
}
