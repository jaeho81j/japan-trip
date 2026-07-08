type Props<K extends string> = {
  tabs: readonly { key: K; label: string }[];
  value: K;
  onChange: (key: K) => void;
};

export default function SubTabs<K extends string>({ tabs, value, onChange }: Props<K>) {
  return (
    <div className="sticky top-0 z-10 bg-gray-50/95 dark:bg-gray-950/95 backdrop-blur px-4 pt-3 pb-2">
      <div className="flex rounded-lg bg-gray-200/70 dark:bg-gray-800 p-0.5">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => onChange(t.key)}
            className={`flex-1 rounded-md py-1.5 text-sm font-medium transition-colors ${
              value === t.key
                ? 'bg-white dark:bg-gray-950 text-accent-600 dark:text-accent-400 shadow-sm'
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
