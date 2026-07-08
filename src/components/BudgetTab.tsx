import { useState } from 'react';
import type { BudgetItem, ItineraryDay } from '../types';

type Props = {
  items: BudgetItem[];
  onChange: (items: BudgetItem[]) => void;
  currency: string;
  onCurrencyChange: (currency: string) => void;
  itineraryDays: ItineraryDay[];
};

const CURRENCIES = ['JPY', 'KRW', 'USD'];

function format(n: number, currency: string) {
  return `${n.toLocaleString()} ${currency}`;
}

export default function BudgetTab({ items, onChange, currency, onCurrencyChange, itineraryDays }: Props) {
  const [category, setCategory] = useState('식비');
  const [description, setDescription] = useState('');
  const [planned, setPlanned] = useState('');

  const add = () => {
    if (!description.trim()) return;
    onChange([
      ...items,
      {
        id: crypto.randomUUID(),
        category: category.trim() || '기타',
        description: description.trim(),
        planned: Number(planned) || 0,
        actual: 0,
      },
    ]);
    setDescription('');
    setPlanned('');
  };

  const update = (id: string, patch: Partial<BudgetItem>) =>
    onChange(items.map((i) => (i.id === id ? { ...i, ...patch } : i)));

  const remove = (id: string) => onChange(items.filter((i) => i.id !== id));

  const totalPlanned = items.reduce((s, i) => s + i.planned, 0);
  const itinerarySpent = itineraryDays.reduce(
    (s, d) => s + d.activities.reduce((a, act) => a + (act.cost || 0), 0),
    0,
  );
  const totalActual = items.reduce((s, i) => s + i.actual, 0) + itinerarySpent;

  // Category-wise actual spending (budget items + itinerary activity costs)
  const byCategory = new Map<string, number>();
  for (const i of items) {
    if (i.actual > 0) byCategory.set(i.category, (byCategory.get(i.category) || 0) + i.actual);
  }
  if (itinerarySpent > 0) byCategory.set('일정 활동', (byCategory.get('일정 활동') || 0) + itinerarySpent);
  const categoryRows = [...byCategory.entries()].sort((a, b) => b[1] - a[1]);
  const maxCategory = categoryRows.length ? categoryRows[0][1] : 0;

  return (
    <div className="p-4 space-y-4 pb-24">
      <div className="rounded-xl border border-gray-200 dark:border-gray-800 p-3 grid grid-cols-2 gap-2 text-sm">
        <div>
          <p className="text-gray-400">예산 합계</p>
          <p className="font-semibold text-gray-900 dark:text-gray-100">{format(totalPlanned, currency)}</p>
        </div>
        <div>
          <p className="text-gray-400">실제 지출</p>
          <p
            className={`font-semibold ${totalActual > totalPlanned ? 'text-rose-500' : 'text-gray-900 dark:text-gray-100'}`}
          >
            {format(totalActual, currency)}
          </p>
        </div>
        {itinerarySpent > 0 && (
          <p className="col-span-2 text-xs text-gray-400">
            🗺️ 일정 탭 활동 비용 {format(itinerarySpent, currency)} 포함
          </p>
        )}
        <div className="col-span-2 flex items-center gap-2 text-xs text-gray-400">
          통화
          <select
            className="bg-transparent border border-gray-200 dark:border-gray-800 rounded px-1"
            value={currency}
            onChange={(e) => onCurrencyChange(e.target.value)}
          >
            {CURRENCIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </div>

      {categoryRows.length > 0 && (
        <div className="rounded-xl border border-gray-200 dark:border-gray-800 p-3 space-y-2">
          <p className="text-sm font-semibold text-gray-600 dark:text-gray-300">📊 지출 요약</p>
          {categoryRows.map(([cat, amount]) => (
            <div key={cat} className="space-y-0.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-600 dark:text-gray-300">{cat}</span>
                <span className="text-gray-500 dark:text-gray-400">
                  {format(amount, currency)}
                  <span className="text-gray-400"> · {Math.round((amount / totalActual) * 100)}%</span>
                </span>
              </div>
              <div className="h-2 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
                <div
                  className="h-full rounded-full bg-accent-500"
                  style={{ width: `${maxCategory ? (amount / maxCategory) * 100 : 0}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="rounded-xl border border-gray-200 dark:border-gray-800 p-3 space-y-2">
        <div className="flex gap-2">
          <input
            className="w-16 min-w-0 bg-transparent outline-none border border-gray-200 dark:border-gray-800 rounded px-2 py-1.5 text-sm"
            placeholder="분류"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          />
          <input
            className="flex-1 min-w-0 bg-transparent outline-none border border-gray-200 dark:border-gray-800 rounded px-2 py-1.5 text-sm"
            placeholder="내용"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && add()}
          />
          <input
            type="number"
            className="w-16 min-w-0 bg-transparent outline-none border border-gray-200 dark:border-gray-800 rounded px-2 py-1.5 text-sm"
            placeholder="예산"
            value={planned}
            onChange={(e) => setPlanned(e.target.value)}
          />
          <button
            onClick={add}
            className="shrink-0 rounded-lg bg-accent-600 text-white px-3 text-sm font-medium hover:bg-accent-700"
          >
            추가
          </button>
        </div>
      </div>

      {items.length === 0 && (
        <p className="text-center text-gray-400 text-sm py-4">아직 예산 항목이 없어요.</p>
      )}

      <div className="rounded-xl border border-gray-200 dark:border-gray-800 divide-y divide-gray-100 dark:divide-gray-800 overflow-hidden">
        {items.map((i) => (
          <div key={i.id} className="px-3 py-2 text-sm space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-400 shrink-0 max-w-[35%] truncate">{i.category}</span>
              <span className="flex-1 min-w-0 truncate text-left text-gray-800 dark:text-gray-200">
                {i.description}
              </span>
              <button onClick={() => remove(i.id)} className="shrink-0 text-gray-300 hover:text-rose-500">
                ✕
              </button>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <label className="flex items-center gap-1">
                예산
                <input
                  type="number"
                  className="w-16 min-w-0 bg-transparent outline-none text-right border border-gray-200 dark:border-gray-800 rounded"
                  value={i.planned}
                  onChange={(e) => update(i.id, { planned: Number(e.target.value) })}
                />
              </label>
              <label className="flex items-center gap-1">
                지출
                <input
                  type="number"
                  className="w-16 min-w-0 bg-transparent outline-none text-right border border-gray-200 dark:border-gray-800 rounded"
                  value={i.actual}
                  onChange={(e) => update(i.id, { actual: Number(e.target.value) })}
                />
              </label>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
