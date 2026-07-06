import { useEffect, useState } from 'react';
import type { ExchangeState } from '../types';
import { fetchExchangeRate } from '../exchange';

type Props = {
  exchange: ExchangeState;
  onChange: (exchange: ExchangeState) => void;
};

const QUICK_AMOUNTS = [1000, 5000, 10000, 30000, 50000];

export default function ExchangeTab({ exchange, onChange }: Props) {
  const [jpyInput, setJpyInput] = useState('10000');
  const [krwInput, setKrwInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchExchangeRate();
      onChange({ krwPer100Jpy: result.krwPer100Jpy, fetchedAt: result.fetchedAt });
    } catch {
      setError('환율 정보를 불러오지 못했어요. 잠시 후 다시 시도해주세요.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (exchange.krwPer100Jpy == null) {
      refresh();
    }
  }, []);

  useEffect(() => {
    if (exchange.krwPer100Jpy == null) return;
    const jpy = Number(jpyInput);
    if (!Number.isFinite(jpy)) return;
    setKrwInput(String(Math.round(jpy * (exchange.krwPer100Jpy / 100))));
  }, [exchange.krwPer100Jpy]);

  const rate = exchange.krwPer100Jpy;

  const onJpyChange = (value: string) => {
    setJpyInput(value);
    if (rate == null) return;
    const jpy = Number(value);
    setKrwInput(Number.isFinite(jpy) ? String(Math.round(jpy * (rate / 100))) : '');
  };

  const onKrwChange = (value: string) => {
    setKrwInput(value);
    if (rate == null) return;
    const krw = Number(value);
    setJpyInput(Number.isFinite(krw) ? String(Math.round(krw / (rate / 100))) : '');
  };

  const setQuickAmount = (yen: number) => {
    onJpyChange(String(yen));
  };

  return (
    <div className="p-4 space-y-4 pb-24">
      <div className="rounded-xl border border-gray-200 dark:border-gray-800 p-3 space-y-1 text-center">
        <p className="text-xs text-gray-400">100엔 (JPY)</p>
        <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
          {rate != null ? `${rate.toLocaleString(undefined, { maximumFractionDigits: 2 })}원` : loading ? '조회중…' : '—'}
        </p>
        <div className="flex items-center justify-center gap-2 text-xs text-gray-400">
          <span>
            {exchange.fetchedAt
              ? `업데이트 ${new Date(exchange.fetchedAt).toLocaleString('ko-KR', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' })}`
              : '아직 조회 전이에요'}
          </span>
          <button onClick={refresh} disabled={loading} className="text-indigo-500 hover:text-indigo-600">
            🔄 새로고침
          </button>
        </div>
        {error && <p className="text-xs text-rose-500">{error}</p>}
      </div>

      <div className="rounded-xl border border-gray-200 dark:border-gray-800 p-3 space-y-3">
        <div className="space-y-1">
          <label className="text-xs text-gray-400">엔화 (JPY)</label>
          <input
            type="number"
            className="w-full bg-transparent outline-none border border-gray-200 dark:border-gray-800 rounded px-3 py-2 text-lg text-right text-gray-900 dark:text-gray-100"
            value={jpyInput}
            onChange={(e) => onJpyChange(e.target.value)}
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {QUICK_AMOUNTS.map((yen) => (
            <button
              key={yen}
              onClick={() => setQuickAmount(yen)}
              className="rounded-full bg-gray-100 dark:bg-gray-900 text-gray-600 dark:text-gray-300 text-xs px-2.5 py-1"
            >
              {yen.toLocaleString()}엔
            </button>
          ))}
        </div>
        <div className="text-center text-gray-300 dark:text-gray-600">⇅</div>
        <div className="space-y-1">
          <label className="text-xs text-gray-400">원화 (KRW)</label>
          <input
            type="number"
            className="w-full bg-transparent outline-none border border-gray-200 dark:border-gray-800 rounded px-3 py-2 text-lg text-right text-gray-900 dark:text-gray-100"
            value={krwInput}
            onChange={(e) => onKrwChange(e.target.value)}
          />
        </div>
        {rate == null && (
          <p className="text-xs text-gray-400 text-center">환율을 조회하면 자동 계산돼요.</p>
        )}
      </div>
    </div>
  );
}
