import { useState } from 'react';
import { MOODS, type JournalEntry } from '../types';

type Props = {
  entries: JournalEntry[];
  onChange: (entries: JournalEntry[]) => void;
};

export default function JournalTab({ entries, onChange }: Props) {
  const [date, setDate] = useState('');
  const [text, setText] = useState('');
  const [mood, setMood] = useState<string>(MOODS[0]);

  const add = () => {
    if (!text.trim()) return;
    onChange([
      { id: crypto.randomUUID(), date, text: text.trim(), mood },
      ...entries,
    ]);
    setText('');
  };

  const remove = (id: string) => onChange(entries.filter((e) => e.id !== id));

  const sorted = [...entries].sort((a, b) => (b.date || '').localeCompare(a.date || ''));

  return (
    <div className="p-4 space-y-4 pb-24">
      <div className="rounded-xl border border-gray-200 dark:border-gray-800 p-3 space-y-2">
        <div className="flex items-center gap-2">
          <input
            type="date"
            className="bg-transparent outline-none border border-gray-200 dark:border-gray-800 rounded px-2 py-1 text-sm"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
          <div className="flex gap-1 ml-auto">
            {MOODS.map((m) => (
              <button
                key={m}
                onClick={() => setMood(m)}
                className={`text-xl px-1 rounded ${mood === m ? 'bg-indigo-100 dark:bg-indigo-900' : ''}`}
              >
                {m}
              </button>
            ))}
          </div>
        </div>
        <textarea
          className="w-full bg-transparent outline-none border border-gray-200 dark:border-gray-800 rounded px-2 py-2 text-sm min-h-20 text-gray-900 dark:text-gray-100"
          placeholder="오늘 하루는 어땠나요?"
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <button
          onClick={add}
          className="w-full rounded-lg bg-indigo-600 text-white py-2 text-sm font-medium hover:bg-indigo-700"
        >
          기록 남기기
        </button>
      </div>

      {sorted.length === 0 && (
        <p className="text-center text-gray-400 text-sm py-4">아직 작성된 일지가 없어요.</p>
      )}

      <div className="space-y-3">
        {sorted.map((e) => (
          <div key={e.id} className="rounded-xl border border-gray-200 dark:border-gray-800 p-3">
            <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 mb-1">
              <span>
                {e.mood} {e.date || '날짜 미지정'}
              </span>
              <button onClick={() => remove(e.id)} className="text-gray-300 hover:text-rose-500">
                삭제
              </button>
            </div>
            <p className="whitespace-pre-wrap text-gray-800 dark:text-gray-200 text-sm text-left">
              {e.text}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
