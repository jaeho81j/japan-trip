import { useState } from 'react';
import type { TripInfo } from '../types';
import { CalendarIcon, TicketIcon, YenIcon, CompassIcon } from './Icons';

type Props = {
  trip: TripInfo;
  onDone: () => void;
};

const WEEK = ['일', '월', '화', '수', '목', '금', '토'];
function formatMD(dateStr: string): string {
  if (!dateStr) return '';
  const d = new Date(dateStr + 'T00:00:00');
  if (isNaN(d.getTime())) return '';
  return `${d.getMonth() + 1}/${d.getDate()}(${WEEK[d.getDay()]})`;
}
function dday(startDate: string): string {
  if (!startDate) return 'D-?';
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const start = new Date(startDate + 'T00:00:00');
  const diff = Math.round((start.getTime() - today.getTime()) / 86400000);
  return diff > 0 ? `D-${diff}` : diff === 0 ? 'D-DAY' : `D+${-diff}`;
}

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

const FEATURES = [
  { Icon: CalendarIcon, title: '일정 관리', desc: '날짜별 일정과 비용을 타임라인으로' },
  { Icon: TicketIcon, title: '여행 지갑', desc: '탑승권 · 입국 QR · 문서를 한곳에' },
  { Icon: YenIcon, title: '환전 · 정산', desc: '환율 계산부터 더치페이 정산까지' },
  { Icon: CompassIcon, title: '현지 가이드', desc: '날씨 · 환승 검색 · 여행 일본어 표현' },
];

export default function Onboarding({ trip, onDone }: Props) {
  const [step, setStep] = useState(0);
  const [closing, setClosing] = useState(false);
  const last = step === 2;

  const finish = () => {
    setClosing(true);
    window.setTimeout(onDone, 280);
  };
  const next = () => (last ? finish() : setStep((s) => s + 1));

  return (
    <div
      className="fixed inset-0 z-[60] max-w-md mx-auto bg-[#F2F2F7] dark:bg-black flex flex-col px-6 pt-14 pb-8"
      style={closing ? { animation: 'obOut 0.28s ease forwards' } : undefined}
    >
      <div className="flex justify-end">
        <button onClick={finish} className="text-sm font-medium text-gray-400 dark:text-gray-500 px-2 py-1">
          건너뛰기
        </button>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center text-center">
        {step === 0 && (
          <div key="s0" className="anim-pop-open flex flex-col items-center">
            <div className="h-24 w-24 rounded-[24px] bg-gradient-to-br from-[#3B82F6] to-[#2152D8] text-white flex items-center justify-center shadow-[0_16px_36px_-12px_rgba(37,99,235,0.6)]">
              <Torii className="h-12 w-12" />
            </div>
            <h2 className="text-[26px] font-extrabold text-gray-900 dark:text-white mt-7">일본 여행의 모든 것</h2>
            <p className="text-[15px] text-gray-500 dark:text-gray-400 mt-3 leading-relaxed">
              일정부터 지갑, 환전, 짐 체크까지
              <br />
              여행 준비의 전부를 한 앱에서
            </p>
          </div>
        )}

        {step === 1 && (
          <div key="s1" className="anim-pop-open w-full">
            <h2 className="text-[26px] font-extrabold text-gray-900 dark:text-white mb-7 text-center">이런 걸 할 수 있어요</h2>
            <div className="space-y-4 text-left">
              {FEATURES.map(({ Icon, title, desc }) => (
                <div key={title} className="flex items-center gap-3.5">
                  <span className="h-11 w-11 shrink-0 rounded-2xl bg-accent-50 dark:bg-accent-900/40 text-accent-600 dark:text-accent-300 flex items-center justify-center">
                    <Icon className="h-[22px] w-[22px]" />
                  </span>
                  <div>
                    <p className="text-[15px] font-semibold text-gray-900 dark:text-gray-100">{title}</p>
                    <p className="text-[13px] text-gray-500 dark:text-gray-400">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {step === 2 && (
          <div key="s2" className="anim-pop-open w-full flex flex-col items-center">
            <div className="relative overflow-hidden w-full rounded-[22px] bg-gradient-to-br from-[#3B82F6] to-[#2152D8] text-white p-5 shadow-[0_16px_36px_-14px_rgba(37,99,235,0.55)]">
              <Torii className="absolute -right-3 -bottom-2 h-28 w-28 text-white/10" />
              <div className="relative">
                <p className="text-[13px] font-semibold text-white/85">{trip.destination || '일본 여행'}</p>
                <p className="text-[38px] leading-none font-extrabold tracking-tight mt-1.5">{dday(trip.startDate)}</p>
                {trip.startDate && (
                  <p className="text-xs text-white/80 mt-1.5">
                    {formatMD(trip.startDate)} – {formatMD(trip.endDate || trip.startDate)}
                  </p>
                )}
              </div>
            </div>
            <h2 className="text-[26px] font-extrabold text-gray-900 dark:text-white mt-7">준비 완료!</h2>
            <p className="text-[15px] text-gray-500 dark:text-gray-400 mt-2">이제 여행 준비를 시작해볼까요?</p>
          </div>
        )}
      </div>

      {/* 도트 인디케이터 */}
      <div className="flex justify-center gap-1.5 mb-5">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className={`h-1.5 rounded-full transition-all ${i === step ? 'w-5 bg-accent-500' : 'w-1.5 bg-gray-300 dark:bg-gray-700'}`}
          />
        ))}
      </div>

      <button
        onClick={next}
        className="w-full rounded-2xl bg-accent-600 text-white py-3.5 text-base font-bold active:scale-[0.98] transition-transform"
      >
        {last ? '시작하기' : '다음'}
      </button>
    </div>
  );
}
