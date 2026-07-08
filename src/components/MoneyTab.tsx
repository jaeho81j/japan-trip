import type { BudgetItem, ExchangeState, ItineraryDay, SplitState } from '../types';
import SubTabs from './SubTabs';
import ExchangeTab from './ExchangeTab';
import BudgetTab from './BudgetTab';

export type MoneySub = 'exchange' | 'budget';

type Props = {
  sub: MoneySub;
  onSubChange: (sub: MoneySub) => void;
  exchange: ExchangeState;
  onExchangeChange: (exchange: ExchangeState) => void;
  split: SplitState;
  onSplitChange: (split: SplitState) => void;
  budget: BudgetItem[];
  onBudgetChange: (budget: BudgetItem[]) => void;
  currency: string;
  onCurrencyChange: (currency: string) => void;
  itineraryDays: ItineraryDay[];
};

const SUBS = [
  { key: 'exchange', label: '환율·정산' },
  { key: 'budget', label: '예산' },
] as const;

export default function MoneyTab(props: Props) {
  return (
    <div>
      <SubTabs tabs={SUBS} value={props.sub} onChange={props.onSubChange} />
      {props.sub === 'exchange' && (
        <ExchangeTab
          exchange={props.exchange}
          onChange={props.onExchangeChange}
          split={props.split}
          onSplitChange={props.onSplitChange}
        />
      )}
      {props.sub === 'budget' && (
        <BudgetTab
          items={props.budget}
          onChange={props.onBudgetChange}
          currency={props.currency}
          onCurrencyChange={props.onCurrencyChange}
          itineraryDays={props.itineraryDays}
        />
      )}
    </div>
  );
}
