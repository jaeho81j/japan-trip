import { useState } from 'react';
import type { FlightsState } from '../types';

type Leg = keyof FlightsState;

const AIRLINES: Record<string, string> = {
  NH: 'ANA',
  JL: 'JAL',
  KE: 'KOREAN AIR',
  OZ: 'ASIANA',
  '7C': 'JEJU AIR',
  LJ: 'JIN AIR',
  TW: "T'WAY",
  BX: 'AIR BUSAN',
  RS: 'AIR SEOUL',
};

const WEEK = ['일', '월', '화', '수', '목', '금', '토'];
function formatDate(dateStr: string): string {
  if (!dateStr) return '';
  const d = new Date(dateStr + 'T00:00:00');
  if (isNaN(d.getTime())) return '';
  return `${d.getMonth() + 1}월 ${d.getDate()}일 (${WEEK[d.getDay()]})`;
}
function airline(flightNo: string): string {
  const m = flightNo.trim().toUpperCase().match(/^([A-Z]{2}|\dC|[A-Z]\d)/);
  return (m && AIRLINES[m[1]]) || '항공권';
}
function airportCode(s: string): string {
  const m = s.toUpperCase().match(/\b([A-Z]{3})\b/);
  if (m) return m[1];
  return s.trim().slice(0, 3).toUpperCase() || '???';
}
function airportName(s: string): string {
  return s.replace(/\b[A-Z]{3}\b/, '').trim();
}

// 장식용 바코드 (실제 스캔 불가 — 티켓 느낌만)
function Barcode() {
  const bars = '3141592653589793238462643383279502884197169399375105';
  return (
    <div className="flex items-end gap-[1.5px] h-10" aria-hidden>
      {bars.split('').map((n, i) => (
        <span
          key={i}
          className="bg-gray-900 dark:bg-gray-100"
          style={{ width: (Number(n) % 3) + 1 + 'px', height: '100%' }}
        />
      ))}
    </div>
  );
}

export default function BoardingPass({ flights }: { flights: FlightsState }) {
  const [leg, setLeg] = useState<Leg>('outbound');
  const f = flights[leg];
  const filled = f.flightNo.trim() !== '';

  return (
    <div className="rounded-2xl bg-white dark:bg-[#1C1C1E] border border-black/[0.04] dark:border-white/[0.08] shadow-[0_6px_20px_-8px_rgba(0,0,0,0.15)] dark:shadow-none overflow-hidden">
      <div className="flex items-center gap-2 px-4 pt-3">
        <span className="text-sm font-semibold text-gray-500 dark:text-gray-400 mr-auto">탑승권</span>
        <div className="flex rounded-lg bg-black/[0.05] dark:bg-white/[0.08] p-0.5 text-xs">
          {(['outbound', 'inbound'] as Leg[]).map((l) => (
            <button
              key={l}
              onClick={() => setLeg(l)}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                leg === l ? 'bg-white dark:bg-[#2C2C2E] text-accent-600 dark:text-accent-300 shadow-sm' : 'text-gray-500 dark:text-gray-400'
              }`}
            >
              {l === 'outbound' ? '가는 편' : '오는 편'}
            </button>
          ))}
        </div>
      </div>

      {!filled ? (
        <p className="px-4 py-8 text-center text-sm text-gray-400">
          {leg === 'outbound' ? '가는 편' : '오는 편'} 항공편을 홈 화면에서 등록하면
          <br />
          탑승권 형태로 보여드려요.
        </p>
      ) : (
        <div className="px-4 pb-4 pt-2">
          {/* 항공사 · 편명 · 날짜 */}
          <div className="flex items-center justify-between">
            <span className="text-[13px] font-bold tracking-wide text-accent-600 dark:text-accent-300">{airline(f.flightNo)}</span>
            <span className="text-xs text-gray-400">{f.flightNo.toUpperCase()}</span>
          </div>
          <p className="text-[11px] text-gray-400 mt-0.5">{formatDate(f.date)}</p>

          {/* 공항 코드 */}
          <div className="flex items-end justify-between mt-3">
            <div>
              <p className="text-[30px] leading-none font-extrabold text-gray-900 dark:text-white">{airportCode(f.from)}</p>
              <p className="text-[11px] text-gray-400 mt-1 max-w-[90px] truncate">{airportName(f.from) || '출발'}</p>
            </div>
            <div className="flex-1 flex flex-col items-center px-2 -mb-1">
              <span className="text-accent-500">✈</span>
              <span className="w-full border-t border-dashed border-gray-300 dark:border-gray-700 mt-1" />
            </div>
            <div className="text-right">
              <p className="text-[30px] leading-none font-extrabold text-gray-900 dark:text-white">{airportCode(f.to)}</p>
              <p className="text-[11px] text-gray-400 mt-1 max-w-[90px] truncate ml-auto">{airportName(f.to) || '도착'}</p>
            </div>
          </div>

          {/* 시각 */}
          <div className="flex items-center justify-between mt-3 text-sm">
            <div>
              <p className="text-[10px] text-gray-400">출발</p>
              <p className="font-semibold text-gray-800 dark:text-gray-200 tabular-nums">{f.departTime || '--:--'}</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] text-gray-400">도착</p>
              <p className="font-semibold text-gray-800 dark:text-gray-200 tabular-nums">{f.arriveTime || '--:--'}</p>
            </div>
          </div>
        </div>
      )}

      {/* 절취선 (양옆 노치) */}
      <div className="relative">
        <span className="absolute -left-2 top-1/2 -translate-y-1/2 h-4 w-4 rounded-full bg-[#F2F2F7] dark:bg-black" />
        <span className="absolute -right-2 top-1/2 -translate-y-1/2 h-4 w-4 rounded-full bg-[#F2F2F7] dark:bg-black" />
        <div className="border-t border-dashed border-gray-200 dark:border-gray-700 mx-3" />
      </div>

      {/* 바코드 */}
      <div className="px-4 py-3 flex items-center justify-between gap-3">
        <Barcode />
        <span className="text-[10px] text-gray-400 text-right leading-tight">
          실제 탑승권은 항공사 앱/체크인에서
          <br />
          발급받으세요
        </span>
      </div>
    </div>
  );
}
