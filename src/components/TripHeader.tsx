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
    <div className="border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 px-4 py-3">
      <div className="flex items-center justify-between gap-2">
        <input
          className="text-lg font-semibold bg-transparent outline-none w-full text-gray-900 dark:text-gray-100"
          value={trip.destination}
          onChange={(e) => onChange({ ...trip, destination: e.target.value })}
          placeholder="여행지"
        />
        {diff !== null && (
          <span className="shrink-0 text-sm font-medium px-2 py-1 rounded-full bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300">
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
          className="bg-transparent outline-none border border-gray-200 dark:border-gray-800 rounded px-2 py-1"
          value={trip.startDate}
          onChange={(e) => onChange({ ...trip, startDate: e.target.value })}
        />
        <span className="self-center">~</span>
        <input
          type="date"
          className="bg-transparent outline-none border border-gray-200 dark:border-gray-800 rounded px-2 py-1"
          value={trip.endDate}
          onChange={(e) => onChange({ ...trip, endDate: e.target.value })}
        />
      </div>
    </div>
  );
}
