import type { PackingItem, PrepItem, ShoppingItem } from '../types';
import SubTabs from './SubTabs';
import PackingTab from './PackingTab';
import ShoppingTab from './ShoppingTab';
import PrepTab from './PrepTab';

export type ChecklistSub = 'prep' | 'packing' | 'shopping';

type Props = {
  sub: ChecklistSub;
  onSubChange: (sub: ChecklistSub) => void;
  packing: PackingItem[];
  onPackingChange: (packing: PackingItem[]) => void;
  shopping: ShoppingItem[];
  onShoppingChange: (shopping: ShoppingItem[]) => void;
  prep: PrepItem[];
  onPrepChange: (prep: PrepItem[]) => void;
  currency: string;
};

const SUBS = [
  { key: 'prep', label: '준비' },
  { key: 'packing', label: '짐 목록' },
  { key: 'shopping', label: '쇼핑' },
] as const;

export default function ChecklistTab(props: Props) {
  return (
    <div>
      <SubTabs tabs={SUBS} value={props.sub} onChange={props.onSubChange} />
      {props.sub === 'prep' && <PrepTab items={props.prep} onChange={props.onPrepChange} />}
      {props.sub === 'packing' && <PackingTab items={props.packing} onChange={props.onPackingChange} />}
      {props.sub === 'shopping' && (
        <ShoppingTab items={props.shopping} onChange={props.onShoppingChange} currency={props.currency} />
      )}
    </div>
  );
}
