import { useState } from 'react';
import { LANGUAGES, PHRASEBOOK, translateText, type LangCode } from '../translate';

export default function TranslatorTab() {
  const [source, setSource] = useState<LangCode>('ko');
  const [target, setTarget] = useState<LangCode>('ja');
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const swap = () => {
    setSource(target);
    setTarget(source);
    setInput(output);
    setOutput(input);
  };

  const translate = async () => {
    if (!input.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const result = await translateText(input, source, target);
      setOutput(result);
    } catch {
      setError('번역에 실패했어요. 잠시 후 다시 시도해주세요.');
    } finally {
      setLoading(false);
    }
  };

  const categories = Array.from(new Set(PHRASEBOOK.map((p) => p.category)));

  return (
    <div className="p-4 space-y-4 pb-24">
      <div className="rounded-xl border border-gray-200 dark:border-gray-800 p-3 space-y-2">
        <div className="flex items-center gap-2 text-sm">
          <select
            className="flex-1 bg-transparent outline-none border border-gray-200 dark:border-gray-800 rounded px-2 py-1.5"
            value={source}
            onChange={(e) => setSource(e.target.value as LangCode)}
          >
            {LANGUAGES.map((l) => (
              <option key={l.code} value={l.code}>
                {l.label}
              </option>
            ))}
          </select>
          <button onClick={swap} className="shrink-0 text-gray-400 hover:text-indigo-500 text-lg" title="방향 전환">
            ⇄
          </button>
          <select
            className="flex-1 bg-transparent outline-none border border-gray-200 dark:border-gray-800 rounded px-2 py-1.5"
            value={target}
            onChange={(e) => setTarget(e.target.value as LangCode)}
          >
            {LANGUAGES.map((l) => (
              <option key={l.code} value={l.code}>
                {l.label}
              </option>
            ))}
          </select>
        </div>

        <textarea
          className="w-full bg-transparent outline-none border border-gray-200 dark:border-gray-800 rounded px-2 py-2 text-sm min-h-20 text-gray-900 dark:text-gray-100"
          placeholder="번역할 문장을 입력하세요"
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />

        <button
          onClick={translate}
          disabled={loading || !input.trim()}
          className="w-full rounded-lg bg-indigo-600 text-white py-2 text-sm font-medium hover:bg-indigo-700 disabled:opacity-50"
        >
          {loading ? '번역중…' : '번역하기'}
        </button>

        {error && <p className="text-xs text-rose-500">{error}</p>}

        {output && (
          <div className="rounded-lg bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 text-left whitespace-pre-wrap">
            {output}
          </div>
        )}
      </div>

      <div className="space-y-3">
        {categories.map((cat) => (
          <div key={cat} className="rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
            <div className="bg-gray-50 dark:bg-gray-900 px-3 py-1.5 text-sm font-semibold text-gray-600 dark:text-gray-300">
              {cat}
            </div>
            <div className="divide-y divide-gray-100 dark:divide-gray-800">
              {PHRASEBOOK.filter((p) => p.category === cat).map((p) => (
                <div key={p.ko} className="px-3 py-2 text-sm text-left">
                  <p className="text-gray-800 dark:text-gray-200">{p.ko}</p>
                  <p className="text-indigo-500 dark:text-indigo-400">{p.ja}</p>
                  <p className="text-xs text-gray-400">{p.romaji}</p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
