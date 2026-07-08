type Props<K extends string> = {
  tabs: readonly { key: K; label: string }[];
  value: K;
  onChange: (key: K) => void;
};

export default function SubTabs<K extends string>({ tabs, value, onChange }: Props<K>) {
  return (
    <div className="sticky top-0 z-10 bg-[#F2F2F7]/85 dark:bg-black/70 backdrop-blur-xl px-4 pt-3 pb-2">
      <div className="flex rounded-xl bg-black/[0.05] dark:bg-white/[0.08] p-1 gap-1">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => onChange(t.key)}
            className={`flex-1 rounded-lg py-1.5 text-sm font-semibold transition-colors ${
              value === t.key
                ? 'bg-white dark:bg-[#2C2C2E] text-accent-600 dark:text-accent-400 shadow-sm'
                : 'text-gray-500 dark:text-gray-400'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>
    </div>
  );
}
