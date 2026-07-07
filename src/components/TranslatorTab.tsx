import { useRef, useState } from 'react';
import { LANGUAGES, PHRASEBOOK, translateText, type LangCode } from '../translate';

type ScanPhase = 'idle' | 'ocr' | 'translating' | 'done';

export default function TranslatorTab() {
  const [source, setSource] = useState<LangCode>('ko');
  const [target, setTarget] = useState<LangCode>('ja');
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const scanFileRef = useRef<HTMLInputElement>(null);
  const [scanPhase, setScanPhase] = useState<ScanPhase>('idle');
  const [scanProgress, setScanProgress] = useState(0);
  const [scanText, setScanText] = useState('');
  const [scanResult, setScanResult] = useState('');
  const [scanError, setScanError] = useState<string | null>(null);

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

  const scan = async (file: File) => {
    setScanPhase('ocr');
    setScanProgress(0);
    setScanText('');
    setScanResult('');
    setScanError(null);
    try {
      // OCR engine + Japanese language data (~20MB) load on first use only
      const { createWorker } = await import('tesseract.js');
      const worker = await createWorker('jpn', 1, {
        logger: (m) => {
          if (m.status === 'recognizing text') setScanProgress(Math.round(m.progress * 100));
        },
      });
      const { data } = await worker.recognize(file);
      await worker.terminate();
      // tesseract inserts spurious spaces between Japanese glyphs
      const text = data.text.replace(/[ \t]+/g, '').trim();
      setScanText(text);
      if (!text) {
        setScanError('글자를 찾지 못했어요. 글자가 크고 또렷하게 나오게 다시 찍어보세요.');
        setScanPhase('idle');
        return;
      }
      setScanPhase('translating');
      const translated = await translateText(text.slice(0, 450), 'ja', 'ko');
      setScanResult(translated);
      setScanPhase('done');
    } catch {
      setScanError(
        '스캔에 실패했어요. 인터넷 연결을 확인하고 다시 시도해주세요. (복잡한 글자는 아래 구글 렌즈가 더 정확해요)',
      );
      setScanPhase('idle');
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

      <div className="rounded-xl border border-gray-200 dark:border-gray-800 p-3 space-y-2">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold text-gray-600 dark:text-gray-300">📷 사진 스캔 번역 (일→한)</p>
          <a
            href="https://lens.google.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-indigo-500 hover:text-indigo-600"
          >
            구글 렌즈 ↗
          </a>
        </div>

        <button
          onClick={() => scanFileRef.current?.click()}
          disabled={scanPhase === 'ocr' || scanPhase === 'translating'}
          className="w-full rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-700 py-3 text-sm text-gray-500 dark:text-gray-400 hover:border-indigo-400 hover:text-indigo-500 disabled:opacity-50"
        >
          {scanPhase === 'ocr'
            ? `📖 글자 인식 중… ${scanProgress}%`
            : scanPhase === 'translating'
              ? '🔄 번역 중…'
              : '📸 메뉴판·간판 사진 찍기 / 선택'}
        </button>
        <input
          ref={scanFileRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) scan(file);
            e.target.value = '';
          }}
        />

        {scanText && (
          <div className="rounded-lg bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 px-3 py-2 text-left space-y-1">
            <p className="text-xs text-gray-400">인식된 일본어</p>
            <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{scanText}</p>
          </div>
        )}
        {scanResult && (
          <div className="rounded-lg bg-indigo-50 dark:bg-indigo-950 border border-indigo-200 dark:border-indigo-900 px-3 py-2 text-left space-y-1">
            <p className="text-xs text-indigo-400">한국어 번역</p>
            <p className="text-sm text-gray-900 dark:text-gray-100 whitespace-pre-wrap">{scanResult}</p>
          </div>
        )}
        {scanError && <p className="text-xs text-rose-500">{scanError}</p>}
        <p className="text-[11px] text-gray-400">
          첫 사용 시 인식 엔진(약 20MB)을 내려받아요. 인쇄된 글자가 크고 또렷할수록 잘 인식되고,
          손글씨·장식 글꼴은 구글 렌즈를 추천해요.
        </p>
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
