import { useEffect, useState } from 'react';
import type { ExchangeState, SplitState } from '../types';
import { fetchExchangeRate } from '../exchange';
import SplitCalculator from './SplitCalculator';
import { CalcIcon, RefreshIcon, BulbIcon } from './Icons';

type Props = {
  exchange: ExchangeState;
  onChange: (exchange: ExchangeState) => void;
  split: SplitState;
  onSplitChange: (split: SplitState) => void;
};

const QUICK_AMOUNTS = [1000, 5000, 10000, 30000, 50000];
const QUICK_DISCOUNTS = [5, 7, 10];

export default function ExchangeTab({ exchange, onChange, split, onSplitChange }: Props) {
  const [jpyInput, setJpyInput] = useState('10000');
  const [krwInput, setKrwInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // tax-free / discount calculator
  const [priceInput, setPriceInput] = useState('');
  const [taxRate, setTaxRate] = useState<10 | 8>(10);
  const [discountInput, setDiscountInput] = useState('');

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

  const toKrw = (jpy: number) =>
    rate != null ? ` (약 ${Math.round(jpy * (rate / 100)).toLocaleString()}원)` : '';

  // Japanese price tags show tax-included prices; tax-free shopping removes
  // the consumption tax (10% general goods / 8% food & consumables).
  const price = Number(priceInput) || 0;
  const discount = Math.min(100, Math.max(0, Number(discountInput) || 0));
  const taxFreePrice = Math.round(price / (1 + taxRate / 100));
  const discountedPrice = Math.round(price * (1 - discount / 100));
  const taxFreeDiscounted = Math.round(taxFreePrice * (1 - discount / 100));

  return (
    <div className="p-4 space-y-4 pb-24">
      <div className="rounded-2xl card-surface border border-black/[0.04] dark:border-white/[0.08] shadow-[0_6px_20px_-8px_rgba(0,0,0,0.15)] dark:shadow-none p-3 space-y-1 text-center">
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
          <button onClick={refresh} disabled={loading} className="inline-flex items-center gap-1 text-accent-500 hover:text-accent-600">
            <RefreshIcon className="h-3.5 w-3.5" />새로고침
          </button>
        </div>
        {error && <p className="text-xs text-rose-500">{error}</p>}
      </div>

      <div className="rounded-2xl card-surface border border-black/[0.04] dark:border-white/[0.08] shadow-[0_6px_20px_-8px_rgba(0,0,0,0.15)] dark:shadow-none p-3 space-y-3">
        <div className="space-y-1">
          <label className="text-xs text-gray-400">엔화 (JPY)</label>
          <input
            type="number"
            className="w-full bg-black/[0.04] dark:bg-white/[0.06] outline-none border-0 rounded-lg px-3 py-2 text-lg text-right text-gray-900 dark:text-gray-100"
            value={jpyInput}
            onChange={(e) => onJpyChange(e.target.value)}
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {QUICK_AMOUNTS.map((yen) => (
            <button
              key={yen}
              onClick={() => setQuickAmount(yen)}
              className="rounded-full bg-black/[0.05] dark:bg-white/[0.08] text-gray-600 dark:text-gray-300 text-xs px-2.5 py-1"
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
            className="w-full bg-black/[0.04] dark:bg-white/[0.06] outline-none border-0 rounded-lg px-3 py-2 text-lg text-right text-gray-900 dark:text-gray-100"
            value={krwInput}
            onChange={(e) => onKrwChange(e.target.value)}
          />
        </div>
        {rate == null && (
          <p className="text-xs text-gray-400 text-center">환율을 조회하면 자동 계산돼요.</p>
        )}
      </div>

      <div className="rounded-2xl card-surface border border-black/[0.04] dark:border-white/[0.08] shadow-[0_6px_20px_-8px_rgba(0,0,0,0.15)] dark:shadow-none p-3 space-y-3">
        <p className="flex items-center gap-1.5 text-sm font-semibold text-gray-600 dark:text-gray-300"><CalcIcon className="h-4 w-4" />면세·할인 계산기</p>

        <div className="space-y-1">
          <label className="text-xs text-gray-400">상품 가격 (엔, 세금 포함 표시가)</label>
          <input
            type="number"
            min={0}
            placeholder="예: 11000"
            className="w-full bg-black/[0.04] dark:bg-white/[0.06] outline-none border-0 rounded-lg px-3 py-2 text-lg text-right text-gray-900 dark:text-gray-100"
            value={priceInput}
            onChange={(e) => setPriceInput(e.target.value)}
          />
        </div>

        <div className="flex gap-2 text-xs">
          <button
            onClick={() => setTaxRate(10)}
            className={`flex-1 rounded-lg py-1.5 border ${
              taxRate === 10
                ? 'border-accent-400 bg-accent-50 dark:bg-accent-950 text-accent-600 dark:text-accent-300'
                : 'border-black/[0.06] dark:border-white/[0.1] text-gray-400'
            }`}
          >
            일반 상품 (소비세 10%)
          </button>
          <button
            onClick={() => setTaxRate(8)}
            className={`flex-1 rounded-lg py-1.5 border ${
              taxRate === 8
                ? 'border-accent-400 bg-accent-50 dark:bg-accent-950 text-accent-600 dark:text-accent-300'
                : 'border-black/[0.06] dark:border-white/[0.1] text-gray-400'
            }`}
          >
            식품·소모품 (8%)
          </button>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-xs text-gray-400 shrink-0">할인 쿠폰</label>
          <input
            type="number"
            min={0}
            max={100}
            placeholder="0"
            className="w-16 min-w-0 bg-black/[0.04] dark:bg-white/[0.06] outline-none border-0 rounded-lg px-2 py-1 text-sm text-right"
            value={discountInput}
            onChange={(e) => setDiscountInput(e.target.value)}
          />
          <span className="text-xs text-gray-400">%</span>
          {QUICK_DISCOUNTS.map((d) => (
            <button
              key={d}
              onClick={() => setDiscountInput(String(d))}
              className="rounded-full bg-black/[0.05] dark:bg-white/[0.08] text-gray-600 dark:text-gray-300 text-xs px-2 py-1"
            >
              {d}%
            </button>
          ))}
        </div>

        {price > 0 ? (
          <div className="rounded-xl bg-black/[0.02] dark:bg-white/[0.04] divide-y divide-gray-100 dark:divide-gray-800 text-sm">
            <div className="flex items-center justify-between px-3 py-2">
              <span className="text-gray-500 dark:text-gray-400">🛂 면세 적용가 (소비세 {taxRate}% 제외)</span>
              <span className="font-semibold text-gray-900 dark:text-gray-100 text-right">
                {taxFreePrice.toLocaleString()}엔{toKrw(taxFreePrice)}
              </span>
            </div>
            {discount > 0 && (
              <>
                <div className="flex items-center justify-between px-3 py-2">
                  <span className="text-gray-500 dark:text-gray-400">🎟️ 할인 {discount}%만 적용</span>
                  <span className="font-semibold text-gray-900 dark:text-gray-100 text-right">
                    {discountedPrice.toLocaleString()}엔{toKrw(discountedPrice)}
                  </span>
                </div>
                <div className="flex items-center justify-between px-3 py-2">
                  <span className="text-gray-500 dark:text-gray-400">💯 면세 + 할인 {discount}%</span>
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400 text-right">
                    {taxFreeDiscounted.toLocaleString()}엔{toKrw(taxFreeDiscounted)}
                  </span>
                </div>
              </>
            )}
            <div className="flex items-center justify-between px-3 py-2 text-xs">
              <span className="text-gray-400">절약 금액</span>
              <span className="text-rose-500 font-medium">
                -{(price - (discount > 0 ? taxFreeDiscounted : taxFreePrice)).toLocaleString()}엔
              </span>
            </div>
          </div>
        ) : (
          <p className="text-xs text-gray-400 text-center">
            가격표 금액을 입력하면 면세가와 할인가를 계산해드려요.
          </p>
        )}

        <p className="flex gap-1.5 text-[11px] text-gray-400">
          <BulbIcon className="h-3.5 w-3.5 shrink-0 mt-px" />
          <span>면세는 보통 같은 매장에서 5,000엔 이상 구매 시 가능하고 여권이 필요해요. 매장·조건에 따라 다를 수 있으니 계산 전 확인하세요.</span>
        </p>
      </div>

      <SplitCalculator split={split} onChange={onSplitChange} rate={rate} />
    </div>
  );
}
