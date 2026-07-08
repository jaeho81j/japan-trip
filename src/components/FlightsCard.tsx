import { useState } from 'react';
import type { FlightInfo, FlightsState } from '../types';

type Props = {
  flights: FlightsState;
  onChange: (flights: FlightsState) => void;
};

type Leg = keyof FlightsState;

const LEG_META: Record<Leg, { label: string; icon: string }> = {
  outbound: { label: '가는 편', icon: '🛫' },
  inbound: { label: '오는 편', icon: '🛬' },
};

const liveStatusUrl = (flightNo: string) =>
  `https://www.google.com/search?q=${encodeURIComponent(`${flightNo} 항공편 현황`)}`;
const fr24Url = (flightNo: string) =>
  `https://www.flightradar24.com/data/flights/${encodeURIComponent(flightNo.replace(/\s+/g, '').toLowerCase())}`;

function FlightForm({ flight, onSave }: { flight: FlightInfo; onSave: (f: FlightInfo) => void }) {
  const [draft, setDraft] = useState<FlightInfo>(flight);
  const set = (patch: Partial<FlightInfo>) => setDraft({ ...draft, ...patch });

  return (
    <div className="space-y-2 px-3 py-2">
      <div className="flex gap-2">
        <input
          className="w-24 min-w-0 bg-black/[0.04] dark:bg-white/[0.06] outline-none border-0 rounded-lg px-2 py-1.5 text-sm"
          placeholder="편명 (KE703)"
          value={draft.flightNo}
          onChange={(e) => set({ flightNo: e.target.value.toUpperCase() })}
        />
        <input
          type="date"
          className="flex-1 min-w-0 bg-black/[0.04] dark:bg-white/[0.06] outline-none border-0 rounded-lg px-2 py-1.5 text-sm"
          value={draft.date}
          onChange={(e) => set({ date: e.target.value })}
        />
      </div>
      <div className="flex items-center gap-2">
        <input
          className="flex-1 min-w-0 bg-black/[0.04] dark:bg-white/[0.06] outline-none border-0 rounded-lg px-2 py-1.5 text-sm"
          placeholder="출발지 (인천 ICN)"
          value={draft.from}
          onChange={(e) => set({ from: e.target.value })}
        />
        <span className="text-gray-300">→</span>
        <input
          className="flex-1 min-w-0 bg-black/[0.04] dark:bg-white/[0.06] outline-none border-0 rounded-lg px-2 py-1.5 text-sm"
          placeholder="도착지 (나리타 NRT)"
          value={draft.to}
          onChange={(e) => set({ to: e.target.value })}
        />
      </div>
      <div className="flex items-center gap-2 text-sm">
        <label className="text-xs text-gray-400 shrink-0">출발</label>
        <input
          type="time"
          className="flex-1 min-w-0 bg-black/[0.04] dark:bg-white/[0.06] outline-none border-0 rounded-lg px-2 py-1.5"
          value={draft.departTime}
          onChange={(e) => set({ departTime: e.target.value })}
        />
        <label className="text-xs text-gray-400 shrink-0">도착</label>
        <input
          type="time"
          className="flex-1 min-w-0 bg-black/[0.04] dark:bg-white/[0.06] outline-none border-0 rounded-lg px-2 py-1.5"
          value={draft.arriveTime}
          onChange={(e) => set({ arriveTime: e.target.value })}
        />
      </div>
      <button
        onClick={() => onSave(draft)}
        className="w-full rounded-xl bg-accent-600 text-white transition-transform active:scale-[0.97] py-1.5 text-sm font-medium hover:bg-accent-700"
      >
        저장
      </button>
    </div>
  );
}

export default function FlightsCard({ flights, onChange }: Props) {
  const [editing, setEditing] = useState<Leg | null>(null);

  return (
    <div className="rounded-2xl bg-white dark:bg-[#1C1C1E] border border-black/[0.04] dark:border-white/[0.08] shadow-[0_6px_20px_-8px_rgba(0,0,0,0.15)] dark:shadow-none overflow-hidden">
      <div className="bg-black/[0.02] dark:bg-white/[0.04] px-4 py-2.5 text-[11px] font-bold uppercase tracking-[0.06em] text-gray-600 dark:text-gray-300">
        ✈️ 내 항공편
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
                onSave={(f) => {
                  onChange({ ...flights, [leg]: f });
                  setEditing(null);
                }}
              />
            );
          }

          return (
            <div key={leg} className="px-3 py-2">
              {filled ? (
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                      {meta.icon} {meta.label} {flight.flightNo}
                    </span>
                    {flight.date && <span className="text-xs text-gray-400">{flight.date}</span>}
                    <button
                      onClick={() => setEditing(leg)}
                      className="ml-auto text-xs text-gray-400 hover:text-accent-500"
                    >
                      수정
                    </button>
                  </div>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    {flight.from || '?'} <b>{flight.departTime || '--:--'}</b>
                    <span className="text-gray-300 mx-1">→</span>
                    {flight.to || '?'} <b>{flight.arriveTime || '--:--'}</b>
                  </p>
                  <div className="flex gap-3 text-xs">
                    <a
                      href={liveStatusUrl(flight.flightNo)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-accent-500 hover:text-accent-600 font-medium"
                    >
                      🔎 실시간 현황
                    </a>
                    <a
                      href={fr24Url(flight.flightNo)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-accent-500 hover:text-accent-600"
                    >
                      Flightradar24
                    </a>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setEditing(leg)}
                  className="w-full text-left text-sm text-gray-400 hover:text-accent-500 py-1"
                >
                  {meta.icon} {meta.label} 등록 (편명·시간 입력) +
                </button>
              )}
            </div>
          );
        })}
      </div>
      <p className="px-3 py-1.5 text-[11px] text-gray-400 border-t border-gray-100 dark:border-gray-800">
        지연·게이트 정보는 "실시간 현황"으로 확인하세요. 입력한 시간표는 오프라인에서도 보여요.
      </p>
    </div>
  );
}
