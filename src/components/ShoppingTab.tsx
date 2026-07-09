import { useState } from 'react';
import type { ShoppingItem } from '../types';
import { BulbIcon } from './Icons';

type Props = {
  items: ShoppingItem[];
  onChange: (items: ShoppingItem[]) => void;
  currency: string;
};

export default function ShoppingTab({ items, onChange, currency }: Props) {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('기타');

  const categories = Array.from(new Set(items.map((i) => i.category)));

  const add = () => {
    if (!name.trim()) return;
    onChange([
      ...items,
      {
        id: crypto.randomUUID(),
        name: name.trim(),
        category: category.trim() || '기타',
        store: '',
        price: 0,
        bought: false,
        taxFree: false,
      },
    ]);
    setName('');
  };

  const update = (id: string, patch: Partial<ShoppingItem>) =>
    onChange(items.map((i) => (i.id === id ? { ...i, ...patch } : i)));

  const remove = (id: string) => onChange(items.filter((i) => i.id !== id));

  const boughtCount = items.filter((i) => i.bought).length;
  const totalSpent = items.filter((i) => i.bought).reduce((s, i) => s + i.price, 0);
  const taxFreeSpent = items.filter((i) => i.bought && i.taxFree).reduce((s, i) => s + i.price, 0);

  return (
    <div className="p-4 space-y-4 pb-24">
      <div className="rounded-2xl bg-white dark:bg-[#1C1C1E] border border-black/[0.04] dark:border-white/[0.08] shadow-[0_6px_20px_-8px_rgba(0,0,0,0.15)] dark:shadow-none p-3 grid grid-cols-2 gap-2 text-sm">
        <div>
          <p className="text-gray-400">구매 완료</p>
          <p className="font-semibold text-gray-900 dark:text-gray-100">
            {boughtCount} / {items.length}
          </p>
        </div>
        <div>
          <p className="text-gray-400">총 지출</p>
          <p className="font-semibold text-gray-900 dark:text-gray-100">
            {totalSpent.toLocaleString()} {currency}
          </p>
        </div>
        <div className="col-span-2 text-xs text-gray-400">
          면세 대상 구매액: {taxFreeSpent.toLocaleString()} {currency}
          <span className="flex gap-1 mt-0.5">
            <BulbIcon className="h-3.5 w-3.5 shrink-0 mt-px" />
            <span>면세는 매장·구매액 기준이 다를 수 있으니 계산 전 여권을 꼭 지참하고 매장에서 확인하세요.</span>
          </span>
        </div>
      </div>

      <div className="rounded-2xl bg-white dark:bg-[#1C1C1E] border border-black/[0.04] dark:border-white/[0.08] shadow-[0_6px_20px_-8px_rgba(0,0,0,0.15)] dark:shadow-none p-3 space-y-2">
        <div className="flex gap-2">
          <input
            className="flex-1 min-w-0 bg-black/[0.04] dark:bg-white/[0.06] outline-none border-0 rounded-lg px-2 py-1.5 text-sm"
            placeholder="살 것"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && add()}
          />
          <input
            className="w-20 min-w-0 bg-black/[0.04] dark:bg-white/[0.06] outline-none border-0 rounded-lg px-2 py-1.5 text-sm"
            placeholder="카테고리"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            list="shopping-categories"
          />
          <datalist id="shopping-categories">
            {categories.map((c) => (
              <option key={c} value={c} />
            ))}
          </datalist>
          <button
            onClick={add}
            className="shrink-0 rounded-xl bg-accent-600 text-white transition-transform active:scale-[0.97] px-3 text-sm font-medium hover:bg-accent-700"
          >
            추가
          </button>
        </div>
      </div>

      {items.length === 0 && (
        <p className="text-center text-gray-400 text-sm py-4">아직 쇼핑 목록이 없어요.</p>
      )}

      {categories.map((cat) => (
        <div key={cat} className="rounded-2xl bg-white dark:bg-[#1C1C1E] border border-black/[0.04] dark:border-white/[0.08] shadow-[0_6px_20px_-8px_rgba(0,0,0,0.15)] dark:shadow-none overflow-hidden">
          <div className="bg-black/[0.02] dark:bg-white/[0.04] px-4 py-2.5 text-[11px] font-bold uppercase tracking-[0.06em] text-gray-600 dark:text-gray-300">
            {cat}
          </div>
          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            {items
              .filter((i) => i.category === cat)
              .map((i) => (
                <div key={i.id} className="px-3 py-2 space-y-1">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={i.bought}
                      onChange={() => update(i.id, { bought: !i.bought })}
                      className="w-4 h-4 accent-accent-600 shrink-0"
                    />
                    <span
                      className={`flex-1 min-w-0 truncate text-left text-sm ${i.bought ? 'line-through text-gray-400' : 'text-gray-800 dark:text-gray-200'}`}
                    >
                      {i.name}
                    </span>
                    {i.taxFree && (
                      <span className="shrink-0 text-xs bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-300 rounded-full px-2 py-0.5">
                        면세
                      </span>
                    )}
                    <button onClick={() => remove(i.id)} className="shrink-0 text-gray-300 hover:text-rose-500 text-sm">
                      ✕
                    </button>
                  </div>
                  <div className="flex items-center gap-2 text-xs pl-6">
                    <input
                      className="flex-1 min-w-0 bg-black/[0.04] dark:bg-white/[0.06] outline-none border-0 rounded-lg px-1.5 py-1 text-gray-500 dark:text-gray-400"
                      placeholder="매장"
                      value={i.store}
                      onChange={(e) => update(i.id, { store: e.target.value })}
                    />
                    <input
                      type="number"
                      className="w-20 min-w-0 bg-black/[0.04] dark:bg-white/[0.06] outline-none border-0 rounded-lg px-1.5 py-1 text-right"
                      placeholder="가격"
                      value={i.price || ''}
                      onChange={(e) => update(i.id, { price: Number(e.target.value) })}
                    />
                    <label className="flex items-center gap-1 shrink-0 text-gray-400">
                      <input
                        type="checkbox"
                        checked={i.taxFree}
                        onChange={() => update(i.id, { taxFree: !i.taxFree })}
                        className="w-3.5 h-3.5 accent-emerald-600"
                      />
                      면세
                    </label>
                  </div>
                </div>
              ))}
          </div>
        </div>
      ))}
    </div>
  );
}
