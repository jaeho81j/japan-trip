import { useState } from 'react';
import type { PrepItem } from '../types';

type Props = {
  items: PrepItem[];
  onChange: (items: PrepItem[]) => void;
};

const WHEN_OPTIONS = ['D-30', 'D-14', 'D-7', 'D-3', 'D-1', '당일'];

// Sort helper: earlier prep first, "당일" last.
function whenRank(when: string): number {
  if (when === '당일') return 0;
  const m = when.match(/D-(\d+)/);
  return m ? Number(m[1]) : 999;
}

export default function PrepTab({ items, onChange }: Props) {
  const [task, setTask] = useState('');
  const [when, setWhen] = useState('D-7');

  const add = () => {
    if (!task.trim()) return;
    onChange([...items, { id: crypto.randomUUID(), when, task: task.trim(), done: false }]);
    setTask('');
  };

  const toggle = (id: string) =>
    onChange(items.map((i) => (i.id === id ? { ...i, done: !i.done } : i)));
  const remove = (id: string) => onChange(items.filter((i) => i.id !== id));

  // group by "when", ordered from earliest to trip day
  const groups = WHEN_OPTIONS.map((w) => ({
    when: w,
    items: items.filter((i) => i.when === w),
  }))
    .filter((g) => g.items.length > 0)
    .sort((a, b) => whenRank(b.when) - whenRank(a.when));

  const doneCount = items.filter((i) => i.done).length;

  return (
    <div className="p-4 space-y-4 pb-24">
      <div className="rounded-2xl bg-white dark:bg-[#1C1C1E] border border-black/[0.04] dark:border-white/[0.08] shadow-[0_6px_20px_-8px_rgba(0,0,0,0.15)] dark:shadow-none p-3 space-y-2">
        <div className="flex gap-2">
          <select
            className="w-20 shrink-0 bg-black/[0.04] dark:bg-white/[0.06] outline-none border-0 rounded-lg px-1 py-1.5 text-sm"
            value={when}
            onChange={(e) => setWhen(e.target.value)}
          >
            {WHEN_OPTIONS.map((w) => (
              <option key={w} value={w}>
                {w}
              </option>
            ))}
          </select>
          <input
            className="flex-1 min-w-0 bg-black/[0.04] dark:bg-white/[0.06] outline-none border-0 rounded-lg px-2 py-1.5 text-sm"
            placeholder="준비할 일 추가"
            value={task}
            onChange={(e) => setTask(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && add()}
          />
          <button
            onClick={add}
            className="shrink-0 rounded-xl bg-accent-600 text-white transition-transform active:scale-[0.97] px-3 text-sm font-medium hover:bg-accent-700"
          >
            추가
          </button>
        </div>
        {items.length > 0 && (
          <p className="text-xs text-gray-400 text-right">
            {doneCount} / {items.length} 완료
          </p>
        )}
      </div>

      {items.length === 0 && (
        <p className="text-center text-gray-400 text-sm py-4">아직 준비 항목이 없어요.</p>
      )}

      {groups.map((group) => (
        <div key={group.when} className="rounded-2xl bg-white dark:bg-[#1C1C1E] border border-black/[0.04] dark:border-white/[0.08] shadow-[0_6px_20px_-8px_rgba(0,0,0,0.15)] dark:shadow-none overflow-hidden">
          <div className="bg-black/[0.02] dark:bg-white/[0.04] px-4 py-2.5 text-[11px] font-bold uppercase tracking-[0.06em] text-accent-600 dark:text-accent-400">
            {group.when}
          </div>
          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            {group.items.map((i) => (
              <div key={i.id} className="flex items-center gap-2 px-3 py-2">
                <input
                  type="checkbox"
                  checked={i.done}
                  onChange={() => toggle(i.id)}
                  className="w-4 h-4 accent-accent-600 shrink-0"
                />
                <span
                  className={`flex-1 min-w-0 text-sm text-left ${i.done ? 'line-through text-gray-400' : 'text-gray-800 dark:text-gray-200'}`}
                >
                  {i.task}
                </span>
                <button
                  onClick={() => remove(i.id)}
                  className="shrink-0 text-gray-300 hover:text-rose-500 text-sm"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
