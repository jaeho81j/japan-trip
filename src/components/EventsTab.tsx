import type { TripInfo } from '../types';
import { type TokyoEvent, eventsForTrip } from '../tokyoEvents';
import { PinIcon, SearchIcon, CalendarIcon, SparkleIcon } from './Icons';

type Props = { trip: TripInfo };

const WEEK = ['일', '월', '화', '수', '목', '금', '토'];
function formatMD(dateStr: string): string {
  if (!dateStr) return '';
  const d = new Date(dateStr + 'T00:00:00');
  if (isNaN(d.getTime())) return '';
  return `${d.getMonth() + 1}/${d.getDate()}(${WEEK[d.getDay()]})`;
}

const CAT_STYLE: Record<TokyoEvent['category'], string> = {
  마츠리: 'bg-rose-50 text-rose-600 dark:bg-rose-500/15 dark:text-rose-300',
  불꽃놀이: 'bg-violet-50 text-violet-600 dark:bg-violet-500/15 dark:text-violet-300',
  시즌: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-300',
  전통: 'bg-amber-50 text-amber-600 dark:bg-amber-500/15 dark:text-amber-300',
};

const CARD =
  'rounded-2xl bg-white dark:bg-[#1C1C1E] border border-black/[0.04] dark:border-white/[0.08] shadow-[0_6px_20px_-8px_rgba(0,0,0,0.15)] dark:shadow-none';

const searchUrl = (q: string) => `https://www.google.com/search?q=${encodeURIComponent(q)}`;

const CALENDARS = [
  { label: 'Time Out Tokyo', href: 'https://www.timeout.com/tokyo/things-to-do' },
  { label: 'Japan Guide 이벤트', href: 'https://www.japan-guide.com/event/' },
  { label: 'Tokyo Cheapo', href: 'https://tokyocheapo.com/events/' },
];

function EventCard({ ev, highlight }: { ev: TokyoEvent; highlight?: boolean }) {
  return (
    <div className={`${CARD} p-3.5 space-y-1.5 ${highlight ? 'ring-1 ring-accent-400/60' : ''}`}>
      <div className="flex items-center gap-2">
        <span className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-semibold ${CAT_STYLE[ev.category]}`}>
          {ev.category}
        </span>
        <span className="flex-1 min-w-0 font-semibold text-gray-900 dark:text-gray-100">{ev.name}</span>
      </div>
      <p className="flex items-center gap-1 text-xs text-gray-400">
        <PinIcon className="h-3.5 w-3.5 shrink-0" />
        {ev.area} · {ev.approx}
      </p>
      <p className="text-[13px] text-gray-600 dark:text-gray-300 leading-relaxed">{ev.desc}</p>
      <a
        href={searchUrl(ev.verifyQuery)}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-block text-xs font-medium text-accent-600 dark:text-accent-400"
      >
        정확한 날짜 확인 →
      </a>
    </div>
  );
}

export default function EventsTab({ trip }: Props) {
  const hasDates = !!trip.startDate;
  const { during, nearby } = eventsForTrip(trip.startDate, trip.endDate);

  return (
    <div className="p-4 space-y-4 pb-24">
      {/* 여행 기간 배너 */}
      {hasDates ? (
        <div className="rounded-2xl bg-gradient-to-br from-[#3B82F6] to-[#2152D8] text-white p-4">
          <p className="text-xs text-white/80">여행 기간</p>
          <p className="text-lg font-bold mt-0.5">
            {formatMD(trip.startDate)} ~ {formatMD(trip.endDate || trip.startDate)}
          </p>
          <p className="text-xs text-white/80 mt-1">이 기간 도쿄권 축제·불꽃놀이를 골라봤어요.</p>
        </div>
      ) : (
        <div className={`${CARD} p-4 text-sm text-gray-500 dark:text-gray-400`}>
          <b>설정 → 여행 정보</b>에서 여행 날짜를 입력하면, 그 기간에 열리는 이벤트를 자동으로 골라드려요.
        </div>
      )}

      {/* 여행 기간 이벤트 */}
      {hasDates && (
        <div className="space-y-2">
          <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.06em] text-gray-500 dark:text-gray-400 px-1">
            <SparkleIcon className="h-3.5 w-3.5" />여행 기간 이벤트
          </p>
          {during.length > 0 ? (
            during.map((ev) => <EventCard key={ev.id} ev={ev} highlight />)
          ) : (
            <p className={`${CARD} p-4 text-sm text-gray-400`}>
              여행 날짜에 딱 겹치는 정기 축제가 없어요. 아래 실시간 캘린더에서 그날의 콘서트·전시·팝업도 확인해보세요.
            </p>
          )}
        </div>
      )}

      {/* 그 무렵 이벤트 */}
      {nearby.length > 0 && (
        <div className="space-y-2">
          <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.06em] text-gray-500 dark:text-gray-400 px-1">
            <CalendarIcon className="h-3.5 w-3.5" />그 무렵 이벤트 (같은 달)
          </p>
          {nearby.map((ev) => (
            <EventCard key={ev.id} ev={ev} />
          ))}
        </div>
      )}

      {/* 실시간 이벤트 캘린더 링크 */}
      <div className={`${CARD} p-3.5 space-y-2`}>
        <p className="flex items-center gap-1.5 text-sm font-semibold text-gray-700 dark:text-gray-200"><SearchIcon className="h-4 w-4" />실시간 이벤트 캘린더</p>
        <p className="text-xs text-gray-400">
          콘서트·전시·팝업·스포츠 등 그때그때 바뀌는 일정은 아래에서 날짜로 검색해보세요.
        </p>
        <div className="flex flex-wrap gap-2">
          {CALENDARS.map((c) => (
            <a
              key={c.label}
              href={c.href}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-lg bg-accent-50 dark:bg-accent-500/15 text-accent-600 dark:text-accent-300 px-3 py-1.5 text-xs font-medium"
            >
              {c.label} ↗
            </a>
          ))}
        </div>
      </div>

      <p className="text-[11px] text-gray-400 leading-relaxed px-1">
        ※ 표시된 날짜는 <b>예년 기준</b>이에요. 마츠리·불꽃놀이도 해마다 하루 이틀 달라지거나 우천 취소될 수 있으니,
        각 이벤트의 <b>‘정확한 날짜 확인’</b> 링크로 꼭 확정된 일정을 확인하세요.
      </p>
    </div>
  );
}
