import type { FlightsState, LodgingInfo, TripData } from '../types';
import { weatherIcon } from '../weather';
import FlightsCard from './FlightsCard';
import LodgingCard from './LodgingCard';
import { ChevronRight, TicketIcon, ChatIcon, TrainIcon, AlertIcon } from './Icons';
import type { ComponentType } from 'react';

type Props = {
  data: TripData;
  onNavigate: (tab: string, sub?: string) => void;
  onFlightsChange: (flights: FlightsState) => void;
  onLodgingsChange: (lodgings: LodgingInfo[]) => void;
};

const CARD =
  'rounded-2xl bg-white dark:bg-[#1C1C1E] border border-black/[0.04] dark:border-white/[0.08] shadow-[0_6px_20px_-8px_rgba(0,0,0,0.15)] dark:shadow-none';

const WEEK = ['일', '월', '화', '수', '목', '금', '토'];

function localToday(): string {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function formatMD(dateStr: string): string {
  if (!dateStr) return '';
  const d = new Date(dateStr + 'T00:00:00');
  if (isNaN(d.getTime())) return '';
  return `${d.getMonth() + 1}/${d.getDate()}(${WEEK[d.getDay()]})`;
}

function dayInfo(startDate: string, endDate: string) {
  if (!startDate) return { label: '일본 여행', sub: '설정에서 여행 날짜를 정해보세요' };
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const start = new Date(startDate + 'T00:00:00');
  const end = new Date((endDate || startDate) + 'T00:00:00');
  const diff = Math.round((start.getTime() - today.getTime()) / 86400000);
  if (diff > 0) return { label: `D-${diff}`, sub: diff <= 14 ? '출발까지 얼마 남지 않았어요' : '즐거운 여행 준비해요 ✈️' };
  if (today.getTime() <= end.getTime()) {
    const n = Math.round((today.getTime() - start.getTime()) / 86400000) + 1;
    return { label: `여행 ${n}일차`, sub: '즐거운 여행 되세요!' };
  }
  return { label: '여행 완료', sub: '수고하셨어요 ✈️' };
}

// 배경 장식용 토리이(⛩) 실루엣
function Torii({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" className={className} fill="currentColor" aria-hidden>
      <path d="M8 26h84v8H8z" />
      <path d="M14 34h72l-5 7H19z" />
      <path d="M24 41h9v52h-9zM67 41h9v52h-9z" />
      <path d="M20 50h60v6H20z" />
    </svg>
  );
}

export default function HomeTab({ data, onNavigate, onFlightsChange, onLodgingsChange }: Props) {
  const today = localToday();
  const di = dayInfo(data.trip.startDate, data.trip.endDate);
  const dateRange = data.trip.startDate
    ? `${formatMD(data.trip.startDate)} – ${formatMD(data.trip.endDate || data.trip.startDate)}`
    : '';
  const routeLine = [data.trip.destination || '일본 여행', dateRange].filter(Boolean).join(' · ');

  const todayPlan = data.itinerary.find((d) => d.date === today);
  const upcoming = !todayPlan
    ? [...data.itinerary].filter((d) => d.date >= today).sort((a, b) => a.date.localeCompare(b.date))[0]
    : null;
  const planToShow = todayPlan ?? upcoming ?? null;
  const planIndex = planToShow ? [...data.itinerary].sort((a, b) => a.date.localeCompare(b.date)).indexOf(planToShow) : -1;

  const todayWeather = data.weather.daily.find((d) => d.date === today) ?? data.weather.daily[0];
  const rate = data.exchange.krwPer100Jpy;

  return (
    <div className="px-4 pt-1 pb-24 space-y-3">
      {/* 히어로 */}
      <div className="relative overflow-hidden rounded-[26px] bg-gradient-to-br from-[#3B82F6] via-[#2E6BF0] to-[#2152D8] text-white p-6 shadow-[0_18px_40px_-16px_rgba(37,99,235,0.55)]">
        <Torii className="absolute -right-3 bottom-0 h-40 w-40 text-white/10" />
        <div className="relative">
          <p className="text-[13px] font-medium text-white/80">{routeLine}</p>
          <p className="text-[46px] leading-[1.05] font-extrabold tracking-tight mt-2">{di.label}</p>
          <p className="text-sm text-white/85 mt-1.5">{di.sub}</p>
        </div>
      </div>

      <FlightsCard flights={data.flights} onChange={onFlightsChange} onBoardingPass={() => onNavigate('wallet')} />

      <LodgingCard lodgings={data.lodgings} onChange={onLodgingsChange} />

      {/* 날씨 · 환율 미니 카드 */}
      <div className="grid grid-cols-2 gap-3">
        <button onClick={() => onNavigate('guide', 'weather')} className={`${CARD} p-3.5 text-left`}>
          <p className="text-xs text-gray-400">오늘 · {data.weather.city}</p>
          {todayWeather ? (
            <>
              <div className="flex items-center justify-between mt-1">
                <p className="text-[26px] leading-none font-bold text-gray-900 dark:text-gray-100">
                  {Math.round(todayWeather.tempMax)}°
                  <span className="text-base font-medium text-gray-400"> / {Math.round(todayWeather.tempMin)}°</span>
                </p>
                <span className="text-2xl leading-none">{weatherIcon(todayWeather.weatherCode)}</span>
              </div>
              <p className="text-xs text-sky-500 mt-1">강수 {todayWeather.precipitationProb}%</p>
              {data.weather.daily.length > 1 && (
                <div className="flex gap-1 mt-2">
                  {data.weather.daily.slice(0, 6).map((d, i) => (
                    <span key={d.date} className={`h-1 rounded-full ${i === 0 ? 'w-3 bg-accent-500' : 'w-1 bg-gray-300 dark:bg-gray-700'}`} />
                  ))}
                </div>
              )}
            </>
          ) : (
            <p className="text-sm text-gray-400 mt-3">가이드 탭에서 조회 →</p>
          )}
        </button>

        <button onClick={() => onNavigate('money', 'exchange')} className={`${CARD} p-3.5 text-left`}>
          <p className="text-xs text-gray-400">100엔 환율</p>
          {rate != null ? (
            <>
              <p className="text-[26px] leading-none font-bold text-gray-900 dark:text-gray-100 mt-1">
                {rate.toLocaleString(undefined, { maximumFractionDigits: 1 })}원
              </p>
              <svg viewBox="0 0 100 28" className="w-full h-7 mt-2" preserveAspectRatio="none" aria-hidden>
                <polyline
                  points="0,22 15,18 30,20 45,12 60,14 75,7 100,9"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="text-accent-500"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </>
          ) : (
            <p className="text-sm text-gray-400 mt-3">돈 탭에서 조회 →</p>
          )}
        </button>
      </div>

      {/* 다가오는 일정 */}
      <button onClick={() => onNavigate('plan', 'itinerary')} className={`${CARD} w-full p-4 text-left`}>
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">
            {planToShow
              ? `${todayPlan ? '오늘 일정' : '다가오는 일정'} · DAY ${planIndex + 1} · ${formatMD(planToShow.date)}`
              : '다가오는 일정'}
          </p>
          <ChevronRight className="h-4 w-4 text-gray-300 dark:text-gray-600" />
        </div>
        {planToShow && planToShow.activities.length > 0 ? (
          <div className="mt-2.5 space-y-2">
            {planToShow.activities.slice(0, 3).map((a) => (
              <div key={a.id} className="flex gap-2.5 text-sm">
                <span className="w-11 shrink-0 text-gray-400 tabular-nums">{a.time || '—'}</span>
                <span className="flex-1 min-w-0 text-gray-800 dark:text-gray-200 truncate">{a.title || '(이름 없는 활동)'}</span>
              </div>
            ))}
            {planToShow.activities.length > 3 && (
              <p className="text-xs font-medium text-accent-600 dark:text-accent-400 pl-[3.375rem]">
                +{planToShow.activities.length - 3}개 더보기
              </p>
            )}
          </div>
        ) : (
          <p className="text-sm text-gray-400 mt-2">등록된 일정이 없어요. 일정을 만들어보세요 →</p>
        )}
      </button>

      {/* 바로가기 */}
      <div className="grid grid-cols-4 gap-2.5">
        {(
          [
            { tab: 'wallet', sub: undefined, Icon: TicketIcon, label: 'QR·문서' },
            { tab: 'guide', sub: 'translator', Icon: ChatIcon, label: '번역기' },
            { tab: 'guide', sub: 'subway', Icon: TrainIcon, label: '환승검색' },
            { tab: 'settings', sub: undefined, Icon: AlertIcon, label: '긴급정보' },
          ] as { tab: string; sub?: string; Icon: ComponentType<{ className?: string }>; label: string }[]
        ).map((s) => (
          <button key={s.label} onClick={() => onNavigate(s.tab, s.sub)} className={`${CARD} py-3 flex flex-col items-center gap-1.5`}>
            <span className="h-9 w-9 rounded-full bg-accent-50 dark:bg-accent-900/40 text-accent-600 dark:text-accent-300 flex items-center justify-center">
              <s.Icon className="h-[18px] w-[18px]" />
            </span>
            <span className="text-[11px] text-gray-500 dark:text-gray-400">{s.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
