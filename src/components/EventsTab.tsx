import { useState } from 'react';
import type { CustomEvent, TripInfo } from '../types';
import { type TokyoEvent, type TokyoSpot, TOKYO_MUSEUMS, eventsForTrip } from '../tokyoEvents';
import { PinIcon, SearchIcon, CalendarIcon, SparkleIcon, PlusIcon, MapIcon, InfoIcon } from './Icons';

type Props = {
  trip: TripInfo;
  customEvents: CustomEvent[];
  onCustomChange: (events: CustomEvent[]) => void;
};

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
  'rounded-2xl card-surface border border-black/[0.04] dark:border-white/[0.08] shadow-[0_6px_20px_-8px_rgba(0,0,0,0.15)] dark:shadow-none';
const FIELD = 'bg-black/[0.04] dark:bg-white/[0.06] outline-none border-0 rounded-lg px-2.5 py-1.5 text-sm';

const searchUrl = (q: string) => `https://www.google.com/search?q=${encodeURIComponent(q)}`;
const mapsUrl = (q: string) => `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}`;

const SPOT_STYLE: Record<TokyoSpot['category'], string> = {
  박물관: 'bg-sky-50 text-sky-600 dark:bg-sky-500/15 dark:text-sky-300',
  미술관: 'bg-indigo-50 text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-300',
  체험: 'bg-teal-50 text-teal-600 dark:bg-teal-500/15 dark:text-teal-300',
};

function SpotCard({ s }: { s: TokyoSpot }) {
  return (
    <div className={`${CARD} p-3.5 space-y-1.5`}>
      <div className="flex items-center gap-2">
        <span className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-semibold ${SPOT_STYLE[s.category]}`}>
          {s.category}
        </span>
        <span className="flex-1 min-w-0 font-semibold text-gray-900 dark:text-gray-100">{s.name}</span>
      </div>
      <p className="flex items-center gap-1 text-xs text-gray-400">
        <PinIcon className="h-3.5 w-3.5 shrink-0" />
        {s.area}
      </p>
      <p className="text-[13px] text-gray-600 dark:text-gray-300 leading-relaxed">{s.desc}</p>
      <p className="text-[11px] text-gray-400">{s.hours} · {s.closed}</p>
      <div className="flex gap-3 pt-0.5">
        <a href={searchUrl(s.searchQuery)} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs font-medium text-accent-600 dark:text-accent-400">
          <InfoIcon className="h-3.5 w-3.5" />정보·예약
        </a>
        <a href={mapsUrl(s.mapQuery)} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs font-medium text-accent-600 dark:text-accent-400">
          <MapIcon className="h-3.5 w-3.5" />지도
        </a>
      </div>
    </div>
  );
}

const AREAS = ['우에노', '신주쿠', '시부야', '긴자', '도쿄 황궁(고쿄)', '아키하바라', '아사쿠사', '롯폰기', '하라주쿠', '오다이바', '이케부쿠로', '도쿄역'];
const CATEGORIES = ['전시·미술관', '박물관', '공연·콘서트', '축제', '스포츠', '쇼핑·팝업', '명소', '기타'];

const CALENDARS = [
  { label: 'Time Out Tokyo', href: 'https://www.timeout.com/tokyo/things-to-do' },
  { label: 'Japan Guide 이벤트', href: 'https://www.japan-guide.com/event/' },
  { label: 'Tokyo Cheapo', href: 'https://tokyocheapo.com/events/' },
];

function CuratedCard({ ev, highlight }: { ev: TokyoEvent; highlight?: boolean }) {
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

export default function EventsTab({ trip, customEvents, onCustomChange }: Props) {
  const hasDates = !!trip.startDate;
  const { during, nearby } = eventsForTrip(trip.startDate, trip.endDate);

  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [date, setDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [area, setArea] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [memo, setMemo] = useState('');
  const [url, setUrl] = useState('');

  const reset = () => {
    setName(''); setDate(''); setEndDate(''); setArea(''); setCategory(CATEGORIES[0]); setMemo(''); setUrl('');
  };
  const add = () => {
    if (!name.trim()) return;
    onCustomChange([
      ...customEvents,
      { id: crypto.randomUUID(), name: name.trim(), date, endDate: endDate || undefined, area: area.trim(), category, memo: memo.trim(), url: url.trim() || undefined },
    ]);
    reset();
    setOpen(false);
  };
  const remove = (id: string) => onCustomChange(customEvents.filter((e) => e.id !== id));

  const sortedCustom = [...customEvents].sort((a, b) => (a.date || '9999').localeCompare(b.date || '9999'));

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

      {/* 내 이벤트 (직접 추가) */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.06em] text-gray-500 dark:text-gray-400">
            <SparkleIcon className="h-3.5 w-3.5" />내 이벤트
          </p>
          <button
            onClick={() => setOpen((v) => !v)}
            className="inline-flex items-center gap-1 text-xs font-medium text-accent-600 dark:text-accent-400"
          >
            <PlusIcon className="h-3.5 w-3.5" />직접 추가
          </button>
        </div>

        {open && (
          <div className={`${CARD} p-3 space-y-2`}>
            <input className={`w-full ${FIELD}`} placeholder="이벤트 이름 (예: 팀랩 플래닛, ○○ 전시)" value={name} onChange={(e) => setName(e.target.value)} />
            <div className="flex gap-2">
              <input type="date" className={`flex-1 min-w-0 ${FIELD}`} value={date} onChange={(e) => setDate(e.target.value)} />
              <span className="self-center text-gray-400 text-xs">~</span>
              <input type="date" className={`flex-1 min-w-0 ${FIELD}`} value={endDate} onChange={(e) => setEndDate(e.target.value)} />
            </div>
            <div className="flex gap-2">
              <input list="area-suggestions" className={`flex-1 min-w-0 ${FIELD}`} placeholder="장소/지역" value={area} onChange={(e) => setArea(e.target.value)} />
              <datalist id="area-suggestions">
                {AREAS.map((a) => (
                  <option key={a} value={a} />
                ))}
              </datalist>
              <select className={`w-28 shrink-0 ${FIELD}`} value={category} onChange={(e) => setCategory(e.target.value)}>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <input className={`w-full ${FIELD}`} placeholder="메모 (예: 사전 예매 필요, 09:00 오픈)" value={memo} onChange={(e) => setMemo(e.target.value)} />
            <input className={`w-full ${FIELD}`} placeholder="링크 (선택 · 공식 사이트/예매)" value={url} onChange={(e) => setUrl(e.target.value)} />
            <div className="flex gap-2 pt-0.5">
              <button onClick={() => { reset(); setOpen(false); }} className="flex-1 rounded-lg bg-black/[0.05] dark:bg-white/[0.08] text-gray-500 py-2 text-sm font-medium">
                취소
              </button>
              <button onClick={add} className="flex-1 rounded-lg bg-accent-600 text-white py-2 text-sm font-medium active:scale-[0.98] transition-transform">
                추가
              </button>
            </div>
          </div>
        )}

        {sortedCustom.length === 0 && !open && (
          <p className={`${CARD} p-4 text-sm text-gray-400`}>
            가고 싶은 전시·박물관·미술관·공연을 직접 추가해보세요. 날짜를 넣으면 여행 순서대로 정렬돼요.
          </p>
        )}

        {sortedCustom.map((ev) => (
          <div key={ev.id} className={`${CARD} p-3.5 space-y-1.5`}>
            <div className="flex items-center gap-2">
              <span className="shrink-0 rounded-full px-2 py-0.5 text-[11px] font-semibold bg-accent-50 text-accent-600 dark:bg-accent-500/15 dark:text-accent-300">
                {ev.category}
              </span>
              <span className="flex-1 min-w-0 font-semibold text-gray-900 dark:text-gray-100 truncate">{ev.name}</span>
              <button onClick={() => remove(ev.id)} className="shrink-0 text-gray-300 hover:text-rose-500">
                ✕
              </button>
            </div>
            {(ev.date || ev.area) && (
              <p className="flex items-center gap-1 text-xs text-gray-400">
                <PinIcon className="h-3.5 w-3.5 shrink-0" />
                {ev.area || '장소 미정'}
                {ev.date && ` · ${formatMD(ev.date)}${ev.endDate ? `~${formatMD(ev.endDate)}` : ''}`}
              </p>
            )}
            {ev.memo && <p className="text-[13px] text-gray-600 dark:text-gray-300 leading-relaxed">{ev.memo}</p>}
            {ev.url && (
              <a href={ev.url} target="_blank" rel="noopener noreferrer" className="inline-block text-xs font-medium text-accent-600 dark:text-accent-400 truncate max-w-full">
                링크 열기 →
              </a>
            )}
          </div>
        ))}
      </div>

      {/* 여행 기간 이벤트 (큐레이션) */}
      {hasDates && (
        <div className="space-y-2">
          <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.06em] text-gray-500 dark:text-gray-400 px-1">
            <SparkleIcon className="h-3.5 w-3.5" />여행 기간 이벤트
          </p>
          {during.length > 0 ? (
            during.map((ev) => <CuratedCard key={ev.id} ev={ev} highlight />)
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
            <CuratedCard key={ev.id} ev={ev} />
          ))}
        </div>
      )}

      {/* 박물관·미술관 (상설) */}
      <div className="space-y-2">
        <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.06em] text-gray-500 dark:text-gray-400 px-1">
          <InfoIcon className="h-3.5 w-3.5" />박물관·미술관 (상설)
        </p>
        {TOKYO_MUSEUMS.map((s) => (
          <SpotCard key={s.id} s={s} />
        ))}
        <p className="text-[11px] text-gray-400 px-1">마음에 드는 곳은 위 “내 이벤트”에 날짜와 함께 담아두면 편해요.</p>
      </div>

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
        ※ 큐레이션된 축제·불꽃놀이 날짜는 <b>예년 기준</b>이에요. 해마다 하루 이틀 달라지거나 우천 취소될 수 있으니
        각 이벤트의 <b>‘정확한 날짜 확인’</b> 링크로 확정 일정을 확인하세요.
      </p>
    </div>
  );
}
