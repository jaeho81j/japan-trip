import { useState } from 'react';
import type { SplitState } from '../types';
import { DivideIcon } from './Icons';

type Props = {
  split: SplitState;
  onChange: (split: SplitState) => void;
  // KRW per 100 JPY from the exchange card; null until fetched
  rate: number | null;
};

function computeSettlement(split: SplitState) {
  const { members, expenses } = split;
  const total = expenses.reduce((s, e) => s + e.amount, 0);
  const share = members.length > 0 ? total / members.length : 0;
  const balances = members.map((name) => ({
    name,
    paid: expenses.filter((e) => e.payer === name).reduce((s, e) => s + e.amount, 0),
  }));

  const debtors = balances
    .map((b) => ({ name: b.name, amount: share - b.paid }))
    .filter((b) => b.amount > 0.5)
    .sort((a, b) => b.amount - a.amount);
  const creditors = balances
    .map((b) => ({ name: b.name, amount: b.paid - share }))
    .filter((b) => b.amount > 0.5)
    .sort((a, b) => b.amount - a.amount);

  const transfers: { from: string; to: string; amount: number }[] = [];
  let i = 0;
  let j = 0;
  while (i < debtors.length && j < creditors.length) {
    const amount = Math.min(debtors[i].amount, creditors[j].amount);
    transfers.push({ from: debtors[i].name, to: creditors[j].name, amount: Math.round(amount) });
    debtors[i].amount -= amount;
    creditors[j].amount -= amount;
    if (debtors[i].amount < 0.5) i++;
    if (creditors[j].amount < 0.5) j++;
  }

  return { total, share, balances, transfers };
}

export default function SplitCalculator({ split, onChange, rate }: Props) {
  const krwOf = (jpy: number) => (rate != null ? Math.round(jpy * (rate / 100)) : null);
  const [memberName, setMemberName] = useState('');
  const [payer, setPayer] = useState('');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');

  const addMember = () => {
    const name = memberName.trim();
    if (!name || split.members.includes(name)) return;
    onChange({ ...split, members: [...split.members, name] });
    setMemberName('');
    if (!payer) setPayer(name);
  };

  const removeMember = (name: string) => {
    const hasExpenses = split.expenses.some((e) => e.payer === name);
    if (
      !window.confirm(
        hasExpenses ? `${name}님의 지출 기록도 함께 삭제돼요. 계속할까요?` : `${name}님을 뺄까요?`,
      )
    ) {
      return;
    }
    onChange({
      members: split.members.filter((m) => m !== name),
      expenses: split.expenses.filter((e) => e.payer !== name),
    });
    if (payer === name) setPayer('');
  };

  const addExpense = () => {
    const amt = Number(amount);
    if (!payer || !amt || amt <= 0) return;
    onChange({
      ...split,
      expenses: [
        ...split.expenses,
        {
          id: crypto.randomUUID(),
          payer,
          description: description.trim() || '지출',
          amount: Math.round(amt),
        },
      ],
    });
    setDescription('');
    setAmount('');
  };

  const removeExpense = (id: string) =>
    onChange({ ...split, expenses: split.expenses.filter((e) => e.id !== id) });

  const { total, share, balances, transfers } = computeSettlement(split);

  return (
    <div className="rounded-2xl bg-white dark:bg-[#1C1C1E] border border-black/[0.04] dark:border-white/[0.08] shadow-[0_6px_20px_-8px_rgba(0,0,0,0.15)] dark:shadow-none p-3 space-y-3">
      <p className="flex items-center gap-1.5 text-sm font-semibold text-gray-600 dark:text-gray-300"><DivideIcon className="h-4 w-4" />1/N 계산기</p>

      <div className="flex gap-2">
        <input
          className="flex-1 min-w-0 bg-black/[0.04] dark:bg-white/[0.06] outline-none border-0 rounded-lg px-2 py-1.5 text-sm"
          placeholder="동행 이름 추가 (예: 나, 철수)"
          value={memberName}
          onChange={(e) => setMemberName(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && addMember()}
        />
        <button
          onClick={addMember}
          className="shrink-0 rounded-xl bg-accent-600 text-white transition-transform active:scale-[0.97] px-3 text-sm font-medium hover:bg-accent-700"
        >
          추가
        </button>
      </div>

      {split.members.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {split.members.map((m) => (
            <span
              key={m}
              className="inline-flex items-center gap-1 rounded-full bg-black/[0.05] dark:bg-white/[0.08] text-gray-700 dark:text-gray-300 text-xs px-2.5 py-1"
            >
              {m}
              <button onClick={() => removeMember(m)} className="text-gray-400 hover:text-rose-500">
                ✕
              </button>
            </span>
          ))}
        </div>
      )}

      {split.members.length >= 2 && (
        <>
          <div className="flex gap-2">
            <select
              className="w-20 shrink-0 bg-black/[0.04] dark:bg-white/[0.06] outline-none border-0 rounded-lg px-1 py-1.5 text-sm"
              value={payer}
              onChange={(e) => setPayer(e.target.value)}
            >
              <option value="">누가?</option>
              {split.members.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
            <input
              className="flex-1 min-w-0 bg-black/[0.04] dark:bg-white/[0.06] outline-none border-0 rounded-lg px-2 py-1.5 text-sm"
              placeholder="내용 (예: 점심)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
            <input
              type="number"
              min={0}
              className="w-20 min-w-0 bg-black/[0.04] dark:bg-white/[0.06] outline-none border-0 rounded-lg px-2 py-1.5 text-sm text-right"
              placeholder="엔"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addExpense()}
            />
            <button
              onClick={addExpense}
              disabled={!payer || !Number(amount)}
              className="shrink-0 rounded-xl bg-accent-50 dark:bg-accent-500/15 border-0 text-accent-600 dark:text-accent-400 px-2.5 text-sm font-medium disabled:opacity-40"
            >
              기록
            </button>
          </div>

          {split.expenses.length > 0 && (
            <div className="rounded-xl bg-black/[0.02] dark:bg-white/[0.04] divide-y divide-gray-100 dark:divide-gray-800 text-sm">
              {split.expenses.map((e) => (
                <div key={e.id} className="flex items-center gap-2 px-3 py-1.5">
                  <span className="text-xs text-gray-400 w-12 shrink-0 truncate">{e.payer}</span>
                  <span className="flex-1 min-w-0 truncate text-left text-gray-700 dark:text-gray-300">
                    {e.description}
                  </span>
                  <span className="shrink-0 text-gray-900 dark:text-gray-100">
                    {e.amount.toLocaleString()}엔
                  </span>
                  <button
                    onClick={() => removeExpense(e.id)}
                    className="shrink-0 text-gray-300 hover:text-rose-500"
                  >
                    ✕
                  </button>
                </div>
              ))}
              <div className="flex items-center justify-between px-3 py-1.5 text-xs">
                <span className="text-gray-400">
                  총 {total.toLocaleString()}엔 · 1인당 {Math.round(share).toLocaleString()}엔
                  {krwOf(Math.round(share)) != null &&
                    ` (약 ${krwOf(Math.round(share))!.toLocaleString()}원)`}
                </span>
              </div>
            </div>
          )}

          {transfers.length > 0 && (
            <div className="rounded-lg bg-emerald-50 dark:bg-emerald-950 border border-emerald-200 dark:border-emerald-900 px-3 py-2 space-y-1.5">
              <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-300">정산 방법</p>
              {transfers.map((t, i) => {
                const krw = krwOf(t.amount);
                return (
                  <div key={i} className="text-sm text-gray-800 dark:text-gray-200">
                    <p>
                      {t.from} → {t.to}: <b>{t.amount.toLocaleString()}엔</b>
                    </p>
                    {krw != null && (
                      <p className="text-emerald-700 dark:text-emerald-300">
원화로 정산 시 <b>{krw.toLocaleString()}원</b> 보내기
                      </p>
                    )}
                  </div>
                );
              })}
              <p className="text-[11px] text-emerald-600/70 dark:text-emerald-400/70 border-t border-emerald-100 dark:border-emerald-900 pt-1">
                {rate != null
                  ? `적용 환율: 100엔 = ${rate.toLocaleString(undefined, { maximumFractionDigits: 2 })}원 (위 환율 카드 기준) · 한국에 돌아와서 계좌이체할 때 원화 금액을 쓰세요`
                  : '위 환율 카드에서 환율을 조회하면 원화 정산 금액도 함께 표시돼요'}
              </p>
            </div>
          )}

          {split.expenses.length > 0 && transfers.length === 0 && (
            <p className="text-xs text-emerald-600 text-center">👏 이미 공평해요! 정산할 게 없어요.</p>
          )}

          {balances.length > 0 && split.expenses.length > 0 && (
            <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-[11px] text-gray-400">
              {balances.map((b) => (
                <span key={b.name}>
                  {b.name}: {b.paid.toLocaleString()}엔 냄
                </span>
              ))}
            </div>
          )}
        </>
      )}

      {split.members.length < 2 && (
        <p className="text-xs text-gray-400">동행을 2명 이상 추가하면 지출을 기록하고 정산할 수 있어요.</p>
      )}
    </div>
  );
}
