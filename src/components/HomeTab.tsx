import type { TripData } from '../types';
import { weatherIcon } from '../weather';

type Props = {
  data: TripData;
  onNavigate: (tab: string) => void;
};

function localToday(): string {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function dDayLabel(startDate: string, endDate: string): { label: string; sub: string } | null {
  if (!startDate) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const start = new Date(startDate);
  start.setHours(0, 0, 0, 0);
  const end = endDate ? new Date(endDate) : start;
  end.setHours(0, 0, 0, 0);
  const diff = Math.round((start.getTime() - today.getTime()) / 86400000);
  if (diff > 0) return { label: `D-${diff}`, sub: '출발까지' };
  if (today.getTime() <= end.getTime()) {
    const dayN = Math.round((today.getTime() - start.getTime()) / 86400000) + 1;
    return { label: `여행 ${dayN}일차`, sub: '즐거운 여행 되세요!' };
  }
  return { label: '여행 완료', sub: '수고하셨어요 ✈️' };
}

const SHORTCUTS = [
  { tab: 'qr', icon: '🎫', label: 'QR·문서' },
  { tab: 'translator', icon: '💬', label: '번역기' },
  { tab: 'subway', icon: '🚇', label: '환승검색' },
  { tab: 'more', icon: '🆘', label: '긴급정보' },
];

export default function HomeTab({ data, onNavigate }: Props) {
  const today = localToday();
  const dday = dDayLabel(data.trip.startDate, data.trip.endDate);

  const todayPlan = data.itinerary.find((d) => d.date === today);
  const upcoming = !todayPlan
    ? [...data.itinerary].filter((d) => d.date > today).sort((a, b) => a.date.localeCompare(b.date))[0]
    : null;
  const planToShow = todayPlan ?? upcoming ?? null;

  const todayWeather = data.weather.daily.find((d) => d.date === today);
  const rate = data.exchange.krwPer100Jpy;

  return (
    <div className="p-4 space-y-3 pb-24">
      <div className="rounded-xl bg-indigo-600 text-white p-4 text-center space-y-0.5">
        <p className="text-3xl font-bold">{dday ? dday.label : '🗾 일본 여행'}</p>
        <p className="text-xs text-indigo-200">
          {dday ? dday.sub : '여행 날짜를 상단에서 설정해보세요'}
          {data.trip.startDate && ` · ${data.trip.startDate} ~ ${data.trip.endDate || '?'}`}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => onNavigate('weather')}
          className="rounded-xl border border-gray-200 dark:border-gray-800 p-3 text-left"
        >
          <p className="text-xs text-gray-400">오늘 {data.weather.city} 날씨</p>
          {todayWeather ? (
            <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              {weatherIcon(todayWeather.weatherCode)} {Math.round(todayWeather.tempMax)}°
              <span className="text-sm text-gray-400"> / {Math.round(todayWeather.tempMin)}°</span>
            </p>
          ) : (
            <p className="text-sm text-gray-400 mt-1">날씨 탭에서 조회 →</p>
          )}
          {todayWeather && (
            <p className="text-xs text-sky-500">💧 강수확률 {todayWeather.precipitationProb}%</p>
          )}
        </button>

        <button
          onClick={() => onNavigate('exchange')}
          className="rounded-xl border border-gray-200 dark:border-gray-800 p-3 text-left"
        >
          <p className="text-xs text-gray-400">100엔</p>
          {rate != null ? (
            <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              {rate.toLocaleString(undefined, { maximumFractionDigits: 1 })}원
            </p>
          ) : (
            <p className="text-sm text-gray-400 mt-1">돈 탭에서 조회 →</p>
          )}
          <p className="text-xs text-gray-400">면세·할인 계산 →</p>
        </button>
      </div>

      <button
        onClick={() => onNavigate('itinerary')}
        className="w-full rounded-xl border border-gray-200 dark:border-gray-800 p-3 text-left"
      >
        <p className="text-xs text-gray-400">
          {todayPlan ? '📍 오늘 일정' : upcoming ? `📍 다음 일정 (${upcoming.date})` : '📍 일정'}
        </p>
        {planToShow && planToShow.activities.length > 0 ? (
          <div className="mt-1 space-y-1">
            {planToShow.activities.slice(0, 4).map((a) => (
              <p key={a.id} className="text-sm text-gray-800 dark:text-gray-200">
                <span className="text-gray-400 text-xs mr-1">{a.time || '—'}</span>
                {a.title || '(이름 없는 활동)'}
              </p>
            ))}
            {planToShow.activities.length > 4 && (
              <p className="text-xs text-gray-400">외 {planToShow.activities.length - 4}개 →</p>
            )}
          </div>
        ) : (
          <p className="text-sm text-gray-400 mt-1">등록된 일정이 없어요. 일정을 만들어보세요 →</p>
        )}
      </button>

      <div className="grid grid-cols-4 gap-2">
        {SHORTCUTS.map((s) => (
          <button
            key={s.tab}
            onClick={() => onNavigate(s.tab)}
            className="rounded-xl border border-gray-200 dark:border-gray-800 py-3 flex flex-col items-center gap-1"
          >
            <span className="text-xl">{s.icon}</span>
            <span className="text-xs text-gray-500 dark:text-gray-400">{s.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
