import type { TripData, TripInfo } from '../types';
import type { AppSettings } from '../settings';
import {
  ACCENTS,
  DARK_MODE_OPTIONS,
  FONT_OPTIONS,
  FONT_SIZE_OPTIONS,
  RADIUS_OPTIONS,
  defaultSettings,
} from '../settings';
import MoreTab from './MoreTab';
import { APP_VERSION_LABEL, forceUpdate } from '../version';
import { PinIcon, PaletteIcon, InfoIcon } from './Icons';

type Props = {
  settings: AppSettings;
  onSettingsChange: (settings: AppSettings) => void;
  trip: TripInfo;
  onTripChange: (trip: TripInfo) => void;
  onReplayOnboarding: () => void;
  data: TripData;
  onImport: (data: TripData) => void;
};

function OptionRow<K extends string>({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: readonly { key: K; label: string }[];
  value: K;
  onChange: (key: K) => void;
}) {
  return (
    <div className="px-3 py-2.5 flex items-center gap-3">
      <p className="w-16 shrink-0 text-sm text-gray-600 dark:text-gray-300">{label}</p>
      <div className="flex-1 flex rounded-lg bg-black/[0.05] dark:bg-white/[0.08] p-0.5">
        {options.map((o) => (
          <button
            key={o.key}
            onClick={() => onChange(o.key)}
            className={`flex-1 rounded-md py-1.5 text-xs font-medium transition-colors ${
              value === o.key
                ? 'card-surface text-accent-600 dark:text-accent-400 shadow-sm'
                : 'text-gray-500 dark:text-gray-400'
            }`}
          >
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function SettingsTab({ settings, onSettingsChange, trip, onTripChange, onReplayOnboarding, data, onImport }: Props) {
  const set = <K extends keyof AppSettings>(key: K, value: AppSettings[K]) =>
    onSettingsChange({ ...settings, [key]: value });
  const setTrip = <K extends keyof TripInfo>(key: K, value: TripInfo[K]) =>
    onTripChange({ ...trip, [key]: value });

  return (
    <div className="pb-24">
      <div className="p-4 pb-0 space-y-4">
        <div className="rounded-2xl card-surface border border-black/[0.04] dark:border-white/[0.08] shadow-[0_6px_20px_-8px_rgba(0,0,0,0.15)] dark:shadow-none overflow-hidden">
          <div className="bg-black/[0.02] dark:bg-white/[0.04] px-4 py-2.5 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.06em] text-gray-600 dark:text-gray-300">
            <PinIcon className="h-3.5 w-3.5" />여행 정보
          </div>
          <div className="px-3 py-2.5 flex items-center gap-3 border-b border-gray-100 dark:border-gray-800">
            <p className="w-16 shrink-0 text-sm text-gray-600 dark:text-gray-300">여행지</p>
            <input
              className="flex-1 min-w-0 bg-black/[0.04] dark:bg-white/[0.06] outline-none border-0 rounded-lg px-2.5 py-1.5 text-sm"
              value={trip.destination}
              onChange={(e) => setTrip('destination', e.target.value)}
              placeholder="예: 도쿄 · 오사카"
            />
          </div>
          <div className="px-3 py-2.5 flex items-center gap-3">
            <p className="w-16 shrink-0 text-sm text-gray-600 dark:text-gray-300">날짜</p>
            <input
              type="date"
              className="flex-1 min-w-0 bg-black/[0.04] dark:bg-white/[0.06] outline-none border-0 rounded-lg px-2 py-1.5 text-sm"
              value={trip.startDate}
              onChange={(e) => setTrip('startDate', e.target.value)}
            />
            <span className="text-gray-400 text-sm">~</span>
            <input
              type="date"
              className="flex-1 min-w-0 bg-black/[0.04] dark:bg-white/[0.06] outline-none border-0 rounded-lg px-2 py-1.5 text-sm"
              value={trip.endDate}
              onChange={(e) => setTrip('endDate', e.target.value)}
            />
          </div>
        </div>

        <div className="rounded-2xl card-surface border border-black/[0.04] dark:border-white/[0.08] shadow-[0_6px_20px_-8px_rgba(0,0,0,0.15)] dark:shadow-none overflow-hidden">
          <div className="bg-black/[0.02] dark:bg-white/[0.04] px-4 py-2.5 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.06em] text-gray-600 dark:text-gray-300">
            <PaletteIcon className="h-3.5 w-3.5" />디자인 설정
          </div>

          {/* 포인트 컬러 */}
          <div className="px-3 py-2.5 flex items-center gap-3 border-b border-gray-100 dark:border-gray-800">
            <p className="w-16 shrink-0 text-sm text-gray-600 dark:text-gray-300">컬러</p>
            <div className="flex-1 flex flex-wrap gap-2">
              {ACCENTS.map((a) => (
                <button
                  key={a.key}
                  onClick={() => set('accent', a.key)}
                  aria-label={a.label}
                  title={a.label}
                  className={`h-7 w-7 rounded-full transition-transform ${
                    settings.accent === a.key
                      ? 'ring-2 ring-offset-2 ring-accent-500 ring-offset-white dark:ring-offset-[#1C1C1E] scale-110'
                      : ''
                  }`}
                  style={{ backgroundColor: a.palette[600] }}
                />
              ))}
            </div>
          </div>

          {/* 채도 · 명도 */}
          <div className="px-3 py-2.5 space-y-2 border-b border-gray-100 dark:border-gray-800">
            <div className="flex items-center gap-3">
              <p className="w-16 shrink-0 text-sm text-gray-600 dark:text-gray-300">채도</p>
              <input
                type="range"
                min={40}
                max={140}
                value={settings.satPct}
                onChange={(e) => set('satPct', Number(e.target.value))}
                className="flex-1 accent-accent-600"
              />
              <span className="w-10 text-right text-xs text-gray-400 tabular-nums">{settings.satPct}%</span>
            </div>
            <div className="flex items-center gap-3">
              <p className="w-16 shrink-0 text-sm text-gray-600 dark:text-gray-300">명도</p>
              <input
                type="range"
                min={60}
                max={130}
                value={settings.lightPct}
                onChange={(e) => set('lightPct', Number(e.target.value))}
                className="flex-1 accent-accent-600"
              />
              <span className="w-10 text-right text-xs text-gray-400 tabular-nums">{settings.lightPct}%</span>
            </div>
            <div className="flex items-center gap-3">
              <p className="w-16 shrink-0 text-sm text-gray-600 dark:text-gray-300">서브탭<br />투명도</p>
              <input
                type="range"
                min={0}
                max={60}
                value={settings.subtabTransparency}
                onChange={(e) => set('subtabTransparency', Number(e.target.value))}
                className="flex-1 accent-accent-600"
              />
              <span className="w-10 text-right text-xs text-gray-400 tabular-nums">{settings.subtabTransparency}%</span>
            </div>
            <div className="flex items-center gap-3">
              <p className="w-16 shrink-0 text-sm text-gray-600 dark:text-gray-300">카드<br />투명도</p>
              <input
                type="range"
                min={0}
                max={60}
                value={settings.cardTransparency}
                onChange={(e) => set('cardTransparency', Number(e.target.value))}
                className="flex-1 accent-accent-600"
              />
              <span className="w-10 text-right text-xs text-gray-400 tabular-nums">{settings.cardTransparency}%</span>
            </div>
          </div>

          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            <OptionRow
              label="화면 모드"
              options={DARK_MODE_OPTIONS}
              value={settings.darkMode}
              onChange={(v) => set('darkMode', v)}
            />
            <OptionRow
              label="글꼴"
              options={FONT_OPTIONS}
              value={settings.font}
              onChange={(v) => set('font', v)}
            />
            <OptionRow
              label="글자 크기"
              options={FONT_SIZE_OPTIONS}
              value={settings.fontSize}
              onChange={(v) => set('fontSize', v)}
            />
            <OptionRow
              label="모서리"
              options={RADIUS_OPTIONS}
              value={settings.radius}
              onChange={(v) => set('radius', v)}
            />
          </div>

          <div className="px-3 py-2 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
            <p className="text-[11px] text-gray-400">설정은 이 기기에 자동 저장돼요.</p>
            <button
              onClick={() => onSettingsChange(defaultSettings)}
              className="text-xs font-medium text-gray-500 dark:text-gray-400 underline underline-offset-2"
            >
              기본값으로
            </button>
          </div>
        </div>
      </div>

      {/* 앱 정보 · 업데이트 */}
      <div className="px-4 pt-4">
        <div className="rounded-2xl card-surface border border-black/[0.04] dark:border-white/[0.08] shadow-[0_6px_20px_-8px_rgba(0,0,0,0.15)] dark:shadow-none overflow-hidden">
          <div className="bg-black/[0.02] dark:bg-white/[0.04] px-4 py-2.5 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.06em] text-gray-600 dark:text-gray-300">
            <InfoIcon className="h-3.5 w-3.5" />앱 정보
          </div>
          <div className="px-4 py-3 flex items-center justify-between gap-3">
            <div>
              <p className="text-sm text-gray-800 dark:text-gray-200">현재 버전</p>
              <p className="text-lg font-bold text-accent-600 dark:text-accent-400">{APP_VERSION_LABEL}</p>
            </div>
            <button
              onClick={forceUpdate}
              className="shrink-0 rounded-lg bg-accent-600 text-white px-3 py-2 text-sm font-medium hover:bg-accent-700"
            >
              최신으로 업데이트
            </button>
          </div>
          <p className="px-4 pb-3 text-[11px] text-gray-400 leading-relaxed">
            새 디자인이 안 보이면 이 버튼을 누르세요. 캐시만 비우고 새로고침하며, 저장한 여행 데이터는 그대로 유지됩니다.
          </p>
          <button
            onClick={onReplayOnboarding}
            className="w-full px-4 py-3 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between text-left"
          >
            <span className="text-sm text-gray-800 dark:text-gray-200">온보딩 다시 보기</span>
            <span className="text-gray-300 dark:text-gray-600">›</span>
          </button>
        </div>
      </div>

      {/* 긴급 정보 · 여행 팁 · 백업 */}
      <MoreTab data={data} onImport={onImport} />
    </div>
  );
}
