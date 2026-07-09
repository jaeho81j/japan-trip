import { APP_VERSION } from '../version';
import { SlidersIcon } from './Icons';

type Props = {
  title: string;
  headerAnim: string;
  animKey: number;
  settingsActive: boolean;
  onOpenSettings: () => void;
};

export default function TripHeader({ title, headerAnim, animKey, settingsActive, onOpenSettings }: Props) {
  return (
    <div className="relative z-20 shrink-0 bg-[#F2F2F7] dark:bg-black px-5 pt-3 pb-2">
      {/* 하단 소프트 페이드: 콘텐츠가 헤더 밑으로 부드럽게 사라지도록 */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-full h-4 bg-gradient-to-b from-[#F2F2F7] to-transparent dark:from-black"
      />
      <div className="flex items-center justify-between gap-2">
        <h1 key={animKey} className={`text-[28px] font-extrabold tracking-tight text-gray-900 dark:text-white flex items-baseline gap-1.5 ${headerAnim}`}>
          {title}
          <span className="text-[10px] font-medium text-gray-400 dark:text-gray-500">{APP_VERSION}</span>
        </h1>
        <button
          onClick={onOpenSettings}
          aria-label="설정"
          className={`shrink-0 h-9 w-9 rounded-full flex items-center justify-center transition-colors ${
            settingsActive
              ? 'bg-accent-500/15 text-accent-600 dark:text-accent-300'
              : 'bg-black/[0.05] dark:bg-white/[0.08] text-gray-500 dark:text-gray-300'
          }`}
        >
          <SlidersIcon className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}
