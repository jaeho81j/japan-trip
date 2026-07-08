import { useState } from 'react';
import type { PackingItem } from '../types';

type Props = {
  items: PackingItem[];
  onChange: (items: PackingItem[]) => void;
};

export default function PackingTab({ items, onChange }: Props) {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('기타');

  const categories = Array.from(new Set(items.map((i) => i.category)));

  const add = () => {
    if (!name.trim()) return;
    onChange([
      ...items,
      { id: crypto.randomUUID(), name: name.trim(), category: category.trim() || '기타', qty: 1, packed: false },
    ]);
    setName('');
  };

  const toggle = (id: string) =>
    onChange(items.map((i) => (i.id === id ? { ...i, packed: !i.packed } : i)));

  const remove = (id: string) => onChange(items.filter((i) => i.id !== id));

  const setQty = (id: string, qty: number) =>
    onChange(items.map((i) => (i.id === id ? { ...i, qty: Math.max(1, qty) } : i)));

  const packedCount = items.filter((i) => i.packed).length;

  return (
    <div className="p-4 space-y-4 pb-24">
      <div className="rounded-xl border border-gray-200 dark:border-gray-800 p-3 space-y-2">
        <div className="flex gap-2">
          <input
            className="flex-1 min-w-0 bg-transparent outline-none border border-gray-200 dark:border-gray-800 rounded px-2 py-1.5 text-sm"
            placeholder="짐 이름"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && add()}
          />
          <input
            className="w-24 bg-transparent outline-none border border-gray-200 dark:border-gray-800 rounded px-2 py-1.5 text-sm"
            placeholder="카테고리"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            list="categories"
          />
          <datalist id="categories">
            {categories.map((c) => (
              <option key={c} value={c} />
            ))}
          </datalist>
          <button
            onClick={add}
            className="rounded-lg bg-accent-600 text-white px-3 text-sm font-medium hover:bg-accent-700"
          >
            추가
          </button>
        </div>
        {items.length > 0 && (
          <p className="text-xs text-gray-400 text-right">
            {packedCount} / {items.length} 챙김
          </p>
        )}
      </div>

      {categories.map((cat) => (
        <div key={cat} className="rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
          <div className="bg-gray-50 dark:bg-gray-900 px-3 py-1.5 text-sm font-semibold text-gray-600 dark:text-gray-300">
            {cat}
          </div>
          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            {items
              .filter((i) => i.category === cat)
              .map((i) => (
                <div key={i.id} className="flex items-center gap-2 px-3 py-2">
                  <input
                    type="checkbox"
                    checked={i.packed}
                    onChange={() => toggle(i.id)}
                    className="w-4 h-4 accent-accent-600"
                  />
                  <span
                    className={`flex-1 text-sm text-left ${i.packed ? 'line-through text-gray-400' : 'text-gray-800 dark:text-gray-200'}`}
                  >
                    {i.name}
                  </span>
                  <input
                    type="number"
                    min={1}
                    className="w-12 bg-transparent outline-none text-sm text-right border border-gray-200 dark:border-gray-800 rounded"
                    value={i.qty}
                    onChange={(e) => setQty(i.id, Number(e.target.value))}
                  />
                  <button onClick={() => remove(i.id)} className="text-gray-300 hover:text-rose-500 text-sm">
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
