import type { TripData } from '../types';
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

type Props = {
  settings: AppSettings;
  onSettingsChange: (settings: AppSettings) => void;
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
      <div className="flex-1 flex rounded-lg bg-gray-100 dark:bg-gray-800 p-0.5">
        {options.map((o) => (
          <button
            key={o.key}
            onClick={() => onChange(o.key)}
            className={`flex-1 rounded-md py-1.5 text-xs font-medium transition-colors ${
              value === o.key
                ? 'bg-white dark:bg-gray-950 text-accent-600 dark:text-accent-400 shadow-sm'
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

export default function SettingsTab({ settings, onSettingsChange, data, onImport }: Props) {
  const set = <K extends keyof AppSettings>(key: K, value: AppSettings[K]) =>
    onSettingsChange({ ...settings, [key]: value });

  return (
    <div className="pb-24">
      <div className="p-4 pb-0 space-y-4">
        <div className="rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden bg-white dark:bg-gray-950">
          <div className="bg-gray-50 dark:bg-gray-900 px-3 py-1.5 text-sm font-semibold text-gray-600 dark:text-gray-300">
            🎨 디자인 설정
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
                      ? 'ring-2 ring-offset-2 ring-gray-400 dark:ring-gray-500 dark:ring-offset-gray-950 scale-105'
                      : ''
                  }`}
                  style={{ backgroundColor: a.palette[600] }}
                />
              ))}
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

      {/* 긴급 정보 · 여행 팁 · 백업 */}
      <MoreTab data={data} onImport={onImport} />
    </div>
  );
}
