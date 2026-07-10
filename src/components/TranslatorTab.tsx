import { useEffect, useRef, useState } from 'react';
import { LANGUAGES, PHRASEBOOK, translateText, type LangCode } from '../translate';
import { CameraIcon, MicIcon, SpeakerIcon } from './Icons';

type ScanPhase = 'idle' | 'ocr' | 'translating' | 'done';

const BCP47: Record<LangCode, string> = { ko: 'ko-KR', ja: 'ja-JP', en: 'en-US' };

type SpeechRecognitionLike = {
  lang: string;
  interimResults: boolean;
  maxAlternatives: number;
  onresult: ((event: { results: { 0: { 0: { transcript: string } } } }) => void) | null;
  onerror: ((event: { error?: string }) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
  abort: () => void;
};

function createRecognition(): SpeechRecognitionLike | null {
  const w = window as unknown as {
    SpeechRecognition?: new () => SpeechRecognitionLike;
    webkitSpeechRecognition?: new () => SpeechRecognitionLike;
  };
  const Ctor = w.SpeechRecognition ?? w.webkitSpeechRecognition;
  return Ctor ? new Ctor() : null;
}

export default function TranslatorTab() {
  const [source, setSource] = useState<LangCode>('ko');
  const [target, setTarget] = useState<LangCode>('ja');
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [listening, setListening] = useState(false);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);

  const scanFileRef = useRef<HTMLInputElement>(null);
  const [scanPhase, setScanPhase] = useState<ScanPhase>('idle');
  const [scanProgress, setScanProgress] = useState(0);
  const [scanText, setScanText] = useState('');
  const [scanResult, setScanResult] = useState('');
  const [scanError, setScanError] = useState<string | null>(null);

  useEffect(() => () => recognitionRef.current?.abort(), []);

  const swap = () => {
    setSource(target);
    setTarget(source);
    setInput(output);
    setOutput(input);
  };

  const translateNow = async (text: string) => {
    if (!text.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const result = await translateText(text, source, target);
      setOutput(result);
    } catch {
      setError('번역에 실패했어요. 잠시 후 다시 시도해주세요.');
    } finally {
      setLoading(false);
    }
  };

  const translate = () => translateNow(input);

  const toggleListening = () => {
    if (listening) {
      recognitionRef.current?.stop();
      return;
    }
    const recognition = createRecognition();
    if (!recognition) {
      setError('이 브라우저는 음성인식을 지원하지 않아요. (안드로이드 크롬 권장)');
      return;
    }
    recognitionRef.current = recognition;
    recognition.lang = BCP47[source];
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setInput(transcript);
      translateNow(transcript);
    };
    recognition.onerror = (event) => {
      setListening(false);
      setError(
        event.error === 'not-allowed'
          ? '마이크 권한을 허용해주세요.'
          : '음성을 인식하지 못했어요. 다시 말해보세요.',
      );
    };
    recognition.onend = () => setListening(false);
    setError(null);
    setListening(true);
    recognition.start();
  };

  const speak = (text: string, lang: LangCode) => {
    if (!('speechSynthesis' in window) || !text) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = BCP47[lang];
    utterance.rate = 0.9;
    window.speechSynthesis.speak(utterance);
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
      <div className="rounded-2xl card-surface border border-black/[0.04] dark:border-white/[0.08] shadow-[0_6px_20px_-8px_rgba(0,0,0,0.15)] dark:shadow-none p-3 space-y-2">
        <div className="flex items-center gap-2 text-sm">
          <select
            className="flex-1 bg-black/[0.04] dark:bg-white/[0.06] outline-none border-0 rounded-lg px-2 py-1.5"
            value={source}
            onChange={(e) => setSource(e.target.value as LangCode)}
          >
            {LANGUAGES.map((l) => (
              <option key={l.code} value={l.code}>
                {l.label}
              </option>
            ))}
          </select>
          <button onClick={swap} className="shrink-0 text-gray-400 hover:text-accent-500 text-lg" title="방향 전환">
            ⇄
          </button>
          <select
            className="flex-1 bg-black/[0.04] dark:bg-white/[0.06] outline-none border-0 rounded-lg px-2 py-1.5"
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
          className="w-full bg-black/[0.04] dark:bg-white/[0.06] outline-none border-0 rounded-lg px-2 py-2 text-sm min-h-20 text-gray-900 dark:text-gray-100"
          placeholder="번역할 문장을 입력하세요"
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />

        <div className="flex gap-2">
          <button
            onClick={toggleListening}
            className={`shrink-0 inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium border ${
              listening
                ? 'bg-rose-500 border-rose-500 text-white animate-pulse'
                : 'border-black/[0.06] dark:border-white/[0.1] text-gray-600 dark:text-gray-300'
            }`}
          >
            <MicIcon className="h-4 w-4" />
            {listening ? '듣는 중… (탭하면 중지)' : '말하기'}
          </button>
          <button
            onClick={translate}
            disabled={loading || !input.trim()}
            className="flex-1 rounded-xl bg-accent-600 text-white transition-transform active:scale-[0.97] py-2 text-sm font-medium hover:bg-accent-700 disabled:opacity-50"
          >
            {loading ? '번역중…' : '번역하기'}
          </button>
        </div>

        {error && <p className="text-xs text-rose-500">{error}</p>}

        {output && (
          <div className="rounded-xl bg-black/[0.02] dark:bg-white/[0.04] border border-black/[0.06] dark:border-white/[0.1] px-3 py-2 text-left space-y-1.5">
            <p className="text-sm text-gray-900 dark:text-gray-100 whitespace-pre-wrap">{output}</p>
            <button
              onClick={() => speak(output, target)}
              className="inline-flex items-center gap-1 text-xs text-accent-500 hover:text-accent-600 font-medium"
            >
              <SpeakerIcon className="h-3.5 w-3.5" />소리내어 읽기 ({LANGUAGES.find((l) => l.code === target)?.label})
            </button>
          </div>
        )}
      </div>

      <div className="rounded-2xl card-surface border border-black/[0.04] dark:border-white/[0.08] shadow-[0_6px_20px_-8px_rgba(0,0,0,0.15)] dark:shadow-none p-3 space-y-2">
        <div className="flex items-center justify-between">
          <p className="flex items-center gap-1.5 text-sm font-semibold text-gray-600 dark:text-gray-300"><CameraIcon className="h-4 w-4" />사진 스캔 번역 (일→한)</p>
          <a
            href="https://lens.google.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-accent-500 hover:text-accent-600"
          >
            구글 렌즈 ↗
          </a>
        </div>

        <button
          onClick={() => scanFileRef.current?.click()}
          disabled={scanPhase === 'ocr' || scanPhase === 'translating'}
          className="w-full inline-flex items-center justify-center gap-1.5 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-700 py-3 text-sm text-gray-500 dark:text-gray-400 hover:border-accent-400 hover:text-accent-500 disabled:opacity-50"
        >
          <CameraIcon className="h-4 w-4" />
          {scanPhase === 'ocr'
            ? `글자 인식 중… ${scanProgress}%`
            : scanPhase === 'translating'
              ? '번역 중…'
              : '메뉴판·간판 사진 찍기 / 선택'}
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
          <div className="rounded-xl bg-black/[0.02] dark:bg-white/[0.04] border border-black/[0.06] dark:border-white/[0.1] px-3 py-2 text-left space-y-1">
            <p className="text-xs text-gray-400">인식된 일본어</p>
            <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{scanText}</p>
          </div>
        )}
        {scanResult && (
          <div className="rounded-lg bg-accent-50 dark:bg-accent-950 border border-accent-200 dark:border-accent-900 px-3 py-2 text-left space-y-1">
            <p className="text-xs text-accent-400">한국어 번역</p>
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
          <div key={cat} className="rounded-2xl card-surface border border-black/[0.04] dark:border-white/[0.08] shadow-[0_6px_20px_-8px_rgba(0,0,0,0.15)] dark:shadow-none overflow-hidden">
            <div className="bg-black/[0.02] dark:bg-white/[0.04] px-4 py-2.5 text-[11px] font-bold uppercase tracking-[0.06em] text-gray-600 dark:text-gray-300">
              {cat}
            </div>
            <div className="divide-y divide-gray-100 dark:divide-gray-800">
              {PHRASEBOOK.filter((p) => p.category === cat).map((p) => (
                <div key={p.ko} className="px-3 py-2 text-sm text-left">
                  <p className="text-gray-800 dark:text-gray-200">{p.ko}</p>
                  <p className="text-accent-500 dark:text-accent-400">{p.ja}</p>
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
