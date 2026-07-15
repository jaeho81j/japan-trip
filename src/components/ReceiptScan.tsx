import { useRef, useState } from 'react';
import { translateText } from '../translate';
import { CameraIcon } from './Icons';

type Phase = 'idle' | 'ocr' | 'parsing' | 'review';

type Props = {
  currency: string;
  onAdd: (item: { category: string; description: string; amount: number }) => void;
};

// 일본어 영수증 텍스트에서 합계 금액과 상호(첫 줄) 추출
function parseAmounts(s: string): number[] {
  const re = /[¥￥]?\s*([0-9]{1,3}(?:,[0-9]{3})+|[0-9]{2,7})\s*円?/g;
  const out: number[] = [];
  let m: RegExpExecArray | null;
  while ((m = re.exec(s))) {
    const n = Number(m[1].replace(/,/g, ''));
    if (!isNaN(n)) out.push(n);
  }
  return out;
}
function parseReceipt(text: string): { amount: number | null; store: string } {
  const lines = text
    .split(/\n+/)
    .map((l) => l.trim())
    .filter(Boolean);
  const TOTAL = /(合\s*計|お会計|ご請求|総額|総計|税込合計|お買上げ計)/;
  const totalAmts: number[] = [];
  for (const line of lines) {
    if (TOTAL.test(line)) totalAmts.push(...parseAmounts(line));
  }
  let amount: number | null = totalAmts.length ? Math.max(...totalAmts) : null;
  if (amount == null) {
    const all = parseAmounts(text).filter((n) => n <= 9_999_999);
    amount = all.length ? Math.max(...all) : null;
  }
  const store = (lines[0] || '').slice(0, 30);
  return { amount, store };
}

// 상호/품목 키워드로 분류 자동 추정
const STORE_CAT: { re: RegExp; cat: string }[] = [
  { re: /(セブン|ローソン|ファミ|ミニストップ|デイリー|7[-\s]?eleven|lawson|familymart|コンビニ)/i, cat: '편의점' },
  { re: /(スタバ|スターバックス|starbucks|ドトール|タリーズ|コメダ|コーヒー|カフェ|cafe|珈琲)/i, cat: '카페' },
  { re: /(マクドナルド|mcdonald|すき家|吉野家|松屋|ラーメン|寿司|そば|うどん|居酒屋|焼肉|食堂|レストラン|定食|restaurant|牛丼|カレー|天ぷら|うなぎ)/i, cat: '식비' },
  { re: /(ユニクロ|uniqlo|\bgu\b|無印|muji|ドン・?キホーテ|ドンキ|ビックカメラ|ヨドバシ|イオン|aeon|百貨店|マート|市場|土産|みやげ)/i, cat: '쇼핑' },
  { re: /(薬|ドラッグ|マツモトキヨシ|ウエルシア|サンドラッグ|pharmacy|drug|コスメ)/i, cat: '약·생필품' },
  { re: /(\bjr\b|メトロ|地下鉄|suica|pasmo|タクシー|taxi|切符|乗車|運賃|鉄道|バス|\bbus\b)/i, cat: '교통' },
];
function guessCategory(text: string): string {
  for (const { re, cat } of STORE_CAT) if (re.test(text)) return cat;
  return '식비';
}

export default function ReceiptScan({ currency, onAdd }: Props) {
  const camRef = useRef<HTMLInputElement>(null);
  const galRef = useRef<HTMLInputElement>(null);
  const [phase, setPhase] = useState<Phase>('idle');
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [note, setNote] = useState<string | null>(null);
  const [rawText, setRawText] = useState('');
  const [showRaw, setShowRaw] = useState(false);
  // 연속 스캔 큐
  const [queue, setQueue] = useState<File[]>([]);
  const [total, setTotal] = useState(0); // 이번 배치 총 장수
  const [added, setAdded] = useState(0);
  // 검토용 편집 필드
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('식비');

  const idle = () => {
    setPhase('idle');
    setProgress(0);
    setRawText('');
    setShowRaw(false);
    setAmount('');
    setDescription('');
    setCategory('식비');
  };

  const processFile = async (file: File) => {
    setPhase('ocr');
    setProgress(0);
    setError(null);
    try {
      const { createWorker } = await import('tesseract.js');
      const worker = await createWorker('jpn', 1, {
        logger: (m) => {
          if (m.status === 'recognizing text') setProgress(Math.round(m.progress * 100));
        },
      });
      const { data } = await worker.recognize(file);
      await worker.terminate();
      const text = data.text.replace(/[ \t]+/g, ' ').trim();
      setRawText(text);
      if (!text) {
        setError('글자를 찾지 못했어요. 이 장은 건너뛰거나 다시 찍어보세요.');
        setPhase('review'); // 검토 화면에서 수동 입력/건너뛰기 가능
        setAmount('');
        setDescription('');
        setCategory('식비');
        return;
      }
      const { amount: amt, store } = parseReceipt(text);
      setAmount(amt != null ? String(amt) : '');
      setCategory(guessCategory(text));
      setPhase('parsing');
      let desc = store;
      try {
        if (store) desc = await translateText(store, 'ja', 'ko');
      } catch {
        /* 번역 실패 시 원문 유지 */
      }
      setDescription((desc || '영수증').slice(0, 40));
      setPhase('review');
    } catch {
      setError('스캔에 실패했어요. 인터넷 연결을 확인하고 다시 시도해주세요.');
      setPhase('idle');
    }
  };

  const start = (files: File[]) => {
    if (!files.length) return;
    setNote(null);
    setAdded(0);
    setTotal(files.length);
    setQueue(files.slice(1));
    processFile(files[0]);
  };

  const goNext = () => {
    setQueue((q) => {
      if (q.length > 0) {
        const [nextFile, ...rest] = q;
        processFile(nextFile);
        return rest;
      }
      // 배치 끝
      idle();
      setTotal(0);
      return q;
    });
  };

  const confirm = () => {
    const n = Number(amount) || 0;
    if (n <= 0) {
      setError('금액을 확인해주세요. (또는 건너뛰기)');
      return;
    }
    onAdd({ category: category.trim() || '기타', description: description.trim() || '영수증', amount: n });
    const nextAdded = added + 1;
    setAdded(nextAdded);
    setError(null);
    const remaining = queue.length;
    setNote(remaining > 0 ? `추가됨 · 다음 영수증 (${remaining}장 남음)` : `${nextAdded}장 지출 추가 완료 ✓`);
    goNext();
  };

  const skip = () => {
    setError(null);
    const remaining = queue.length;
    setNote(remaining > 0 ? `건너뜀 · 다음 영수증 (${remaining}장 남음)` : added > 0 ? `${added}장 추가 완료 ✓` : null);
    goNext();
  };

  const cancelAll = () => {
    setQueue([]);
    setTotal(0);
    setError(null);
    idle();
  };

  const cur = total > 0 ? total - queue.length : 0; // 현재 몇 번째

  return (
    <div className="rounded-2xl card-surface border border-black/[0.04] dark:border-white/[0.08] shadow-[0_6px_20px_-8px_rgba(0,0,0,0.15)] dark:shadow-none p-3 space-y-2">
      <p className="flex items-center gap-1.5 text-sm font-semibold text-gray-600 dark:text-gray-300">
        <CameraIcon className="h-4 w-4" />영수증 스캔으로 지출 추가
        {total > 1 && phase !== 'idle' && (
          <span className="ml-auto text-[11px] font-medium text-accent-500">{cur}/{total}장</span>
        )}
      </p>

      {phase === 'idle' && (
        <>
          {note && <p className="text-xs text-emerald-600 dark:text-emerald-400">{note}</p>}
          <div className="flex gap-2">
            <button
              onClick={() => camRef.current?.click()}
              className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-700 py-3 text-sm text-gray-500 dark:text-gray-400 hover:border-accent-400 hover:text-accent-500"
            >
              <CameraIcon className="h-4 w-4" />촬영
            </button>
            <button
              onClick={() => galRef.current?.click()}
              className="flex-1 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-700 py-3 text-sm text-gray-500 dark:text-gray-400 hover:border-accent-400 hover:text-accent-500"
            >
              여러 장 선택
            </button>
          </div>
          <p className="text-[11px] text-gray-400">
            일본어 영수증의 <b>합계 금액</b>을 뽑고 상호를 번역·분류해 지출로 넣어드려요. 여러 장을 골라 <b>연속 스캔</b>도
            돼요. (첫 사용 시 인식 엔진 ~20MB 다운로드)
          </p>
        </>
      )}

      {(phase === 'ocr' || phase === 'parsing') && (
        <p className="py-3 text-center text-sm text-gray-500 dark:text-gray-400">
          {phase === 'ocr' ? `글자 인식 중… ${progress}%` : '금액 분석·번역 중…'}
        </p>
      )}

      {phase === 'review' && (
        <div className="space-y-2">
          <div className="flex gap-2">
            <input
              className="w-20 min-w-0 bg-black/[0.04] dark:bg-white/[0.06] outline-none border-0 rounded-lg px-2 py-1.5 text-sm"
              placeholder="분류"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            />
            <input
              className="flex-1 min-w-0 bg-black/[0.04] dark:bg-white/[0.06] outline-none border-0 rounded-lg px-2 py-1.5 text-sm"
              placeholder="내용 (상호)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              type="number"
              className="flex-1 min-w-0 bg-black/[0.04] dark:bg-white/[0.06] outline-none border-0 rounded-lg px-2 py-1.5 text-sm text-right font-semibold"
              placeholder="금액"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
            <span className="shrink-0 text-sm text-gray-400">{currency}</span>
          </div>
          <div className="flex items-center justify-between">
            <button onClick={() => setShowRaw((v) => !v)} className="text-[11px] text-gray-400 underline underline-offset-2">
              인식된 원문 {showRaw ? '숨기기' : '보기'}
            </button>
            <button onClick={cancelAll} className="text-[11px] text-gray-400">
              전체 취소
            </button>
          </div>
          {showRaw && (
            <pre className="max-h-28 overflow-auto whitespace-pre-wrap text-[11px] text-gray-400 bg-black/[0.03] dark:bg-white/[0.05] rounded-lg p-2">
              {rawText}
            </pre>
          )}
          <div className="flex gap-2 pt-0.5">
            <button onClick={skip} className="flex-1 rounded-lg bg-black/[0.05] dark:bg-white/[0.08] text-gray-500 py-2 text-sm font-medium">
              {queue.length > 0 ? '건너뛰기' : '건너뛰고 닫기'}
            </button>
            <button onClick={confirm} className="flex-1 rounded-lg bg-accent-600 text-white py-2 text-sm font-medium active:scale-[0.98] transition-transform">
              지출에 추가{queue.length > 0 ? ' · 다음' : ''}
            </button>
          </div>
        </div>
      )}

      {error && <p className="text-xs text-rose-500">{error}</p>}

      <input
        ref={camRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) start([f]);
          e.target.value = '';
        }}
      />
      <input
        ref={galRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => {
          const files = e.target.files ? Array.from(e.target.files) : [];
          if (files.length) start(files);
          e.target.value = '';
        }}
      />
    </div>
  );
}
