import type { TripInfo } from '../types';

type Props = {
  trip: TripInfo;
  onChange: (trip: TripInfo) => void;
  settingsActive: boolean;
  onOpenSettings: () => void;
};

function dDay(startDate: string) {
  if (!startDate) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const start = new Date(startDate);
  start.setHours(0, 0, 0, 0);
  const diff = Math.round((start.getTime() - today.getTime()) / 86400000);
  return diff;
}

export default function TripHeader({ trip, onChange, settingsActive, onOpenSettings }: Props) {
  const diff = dDay(trip.startDate);

  return (
    <div className="sticky top-0 z-10 border-b border-black/[0.05] dark:border-white/[0.06] bg-[#F2F2F7]/80 dark:bg-black/70 backdrop-blur-xl px-4 pt-3 pb-2.5">
      <div className="flex items-center justify-between gap-2">
        <input
          className="text-[26px] font-extrabold tracking-tight bg-transparent outline-none w-full text-gray-900 dark:text-white"
          value={trip.destination}
          onChange={(e) => onChange({ ...trip, destination: e.target.value })}
          placeholder="여행지"
        />
        {diff !== null && (
          <span className="shrink-0 text-sm font-bold px-2.5 py-1 rounded-full bg-accent-500/15 text-accent-600 dark:text-accent-300">
            {diff > 0 ? `D-${diff}` : diff === 0 ? 'D-DAY' : `D+${-diff}`}
          </span>
        )}
        <button
          onClick={onOpenSettings}
          aria-label="설정"
          className={`shrink-0 h-8 w-8 rounded-full flex items-center justify-center text-base ${
            settingsActive
              ? 'bg-accent-50 dark:bg-accent-900/50 text-accent-600 dark:text-accent-300'
              : 'text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-900'
          }`}
        >
          ⚙️
        </button>
      </div>
      <div className="flex gap-2 mt-2 text-sm text-gray-500 dark:text-gray-400">
        <input
          type="date"
          className="bg-black/[0.04] dark:bg-white/[0.06] outline-none border-0 rounded-lg px-2 py-1"
          value={trip.startDate}
          onChange={(e) => onChange({ ...trip, startDate: e.target.value })}
        />
        <span className="self-center">~</span>
        <input
          type="date"
          className="bg-black/[0.04] dark:bg-white/[0.06] outline-none border-0 rounded-lg px-2 py-1"
          value={trip.endDate}
          onChange={(e) => onChange({ ...trip, endDate: e.target.value })}
        />
      </div>
    </div>
  );
}
