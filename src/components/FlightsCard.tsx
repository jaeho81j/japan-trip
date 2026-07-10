import { useState } from 'react';
import type { FlightInfo, FlightsState } from '../types';
import { FlightArrow } from './Icons';

type Props = {
  flights: FlightsState;
  onChange: (flights: FlightsState) => void;
  onBoardingPass?: () => void;
};

type Leg = keyof FlightsState;

const LEG_META: Record<Leg, { label: string; dir: 'out' | 'in' }> = {
  outbound: { label: '가는 편', dir: 'out' },
  inbound: { label: '오는 편', dir: 'in' },
};

const WEEK = ['일', '월', '화', '수', '목', '금', '토'];
function formatMD(dateStr: string): string {
  if (!dateStr) return '';
  const d = new Date(dateStr + 'T00:00:00');
  if (isNaN(d.getTime())) return '';
  return `${d.getMonth() + 1}/${d.getDate()}(${WEEK[d.getDay()]})`;
}
const spaceFlightNo = (no: string) => no.replace(/^([A-Z]{1,3})\s*(\d)/, '$1 $2');
const liveStatusUrl = (flightNo: string) =>
  `https://www.google.com/search?q=${encodeURIComponent(`${flightNo} 항공편 현황`)}`;

function FlightForm({ flight, onSave, onCancel }: { flight: FlightInfo; onSave: (f: FlightInfo) => void; onCancel: () => void }) {
  const [draft, setDraft] = useState<FlightInfo>(flight);
  const set = (patch: Partial<FlightInfo>) => setDraft({ ...draft, ...patch });
  const field = 'bg-black/[0.04] dark:bg-white/[0.06] outline-none border-0 rounded-lg px-2 py-1.5 text-sm';

  return (
    <div className="space-y-2 px-4 py-3">
      <div className="flex gap-2">
        <input
          className={`w-24 min-w-0 ${field}`}
          placeholder="편명 (NH855)"
          value={draft.flightNo}
          onChange={(e) => set({ flightNo: e.target.value.toUpperCase() })}
        />
        <input type="date" className={`flex-1 min-w-0 ${field}`} value={draft.date} onChange={(e) => set({ date: e.target.value })} />
      </div>
      <div className="flex items-center gap-2">
        <input className={`flex-1 min-w-0 ${field}`} placeholder="출발지 (인천 ICN)" value={draft.from} onChange={(e) => set({ from: e.target.value })} />
        <span className="text-gray-300">→</span>
        <input className={`flex-1 min-w-0 ${field}`} placeholder="도착지 (하네다 HND)" value={draft.to} onChange={(e) => set({ to: e.target.value })} />
      </div>
      <div className="flex items-center gap-2">
        <label className="text-xs text-gray-400 shrink-0">출발</label>
        <input type="time" className={`flex-1 min-w-0 ${field}`} value={draft.departTime} onChange={(e) => set({ departTime: e.target.value })} />
        <label className="text-xs text-gray-400 shrink-0">도착</label>
        <input type="time" className={`flex-1 min-w-0 ${field}`} value={draft.arriveTime} onChange={(e) => set({ arriveTime: e.target.value })} />
      </div>
      <div className="flex gap-2">
        <button onClick={onCancel} className="flex-1 rounded-xl bg-black/[0.05] dark:bg-white/[0.08] text-gray-500 py-1.5 text-sm font-medium">
          취소
        </button>
        <button onClick={() => onSave(draft)} className="flex-1 rounded-xl bg-accent-600 text-white py-1.5 text-sm font-medium active:scale-[0.97] transition-transform">
          저장
        </button>
      </div>
    </div>
  );
}

export default function FlightsCard({ flights, onChange, onBoardingPass }: Props) {
  const [editing, setEditing] = useState<Leg | null>(null);
  const anyFilled = flights.outbound.flightNo.trim() !== '' || flights.inbound.flightNo.trim() !== '';

  return (
    <div className="rounded-2xl card-surface border border-black/[0.04] dark:border-white/[0.08] shadow-[0_6px_20px_-8px_rgba(0,0,0,0.15)] dark:shadow-none overflow-hidden">
      <div className="flex items-center justify-between px-4 pt-3 pb-1">
        <span className="text-sm font-semibold text-gray-500 dark:text-gray-400">항공편</span>
        {anyFilled && onBoardingPass && (
          <button onClick={onBoardingPass} className="text-sm font-medium text-accent-600 dark:text-accent-400">
            탑승권 →
          </button>
        )}
      </div>
      <div className="divide-y divide-gray-100 dark:divide-gray-800">
        {(Object.keys(LEG_META) as Leg[]).map((leg) => {
          const flight = flights[leg];
          const meta = LEG_META[leg];
          const filled = flight.flightNo.trim() !== '';

          if (editing === leg) {
            return (
              <FlightForm
                key={leg}
                flight={flight}
                onCancel={() => setEditing(null)}
                onSave={(f) => {
                  onChange({ ...flights, [leg]: f });
                  setEditing(null);
                }}
              />
            );
          }

          if (!filled) {
            return (
              <button
                key={leg}
                onClick={() => setEditing(leg)}
                className="w-full flex items-center gap-3 px-4 py-3 text-left"
              >
                <span className="h-9 w-9 shrink-0 rounded-full bg-black/[0.04] dark:bg-white/[0.06] flex items-center justify-center text-gray-400">
                  <FlightArrow dir={meta.dir} className="h-4 w-4" />
                </span>
                <span className="text-sm text-gray-400">{meta.label} 등록 (편명·시간) +</span>
              </button>
            );
          }

          return (
            <button key={leg} onClick={() => setEditing(leg)} className="w-full flex items-center gap-3 px-4 py-3 text-left">
              <span className="h-9 w-9 shrink-0 rounded-full bg-accent-50 dark:bg-accent-900/40 text-accent-600 dark:text-accent-300 flex items-center justify-center">
                <FlightArrow dir={meta.dir} className="h-4 w-4" />
              </span>
              <span className="flex-1 min-w-0">
                <span className="block text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
                  {flight.from || '?'} <span className="text-gray-300">→</span> {flight.to || '?'}
                </span>
                <span className="block text-xs text-gray-400 truncate">
                  {spaceFlightNo(flight.flightNo)}
                  {flight.date && ` · ${formatMD(flight.date)}`}
                </span>
              </span>
              <span className="shrink-0 text-right">
                <span className="block text-sm font-medium text-gray-800 dark:text-gray-200 tabular-nums">
                  {flight.departTime || '--:--'} <span className="text-gray-300">→</span> {flight.arriveTime || '--:--'}
                </span>
                <a
                  href={liveStatusUrl(flight.flightNo)}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="text-[11px] text-accent-500 hover:text-accent-600"
                >
                  🔎 실시간 →
                </a>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
