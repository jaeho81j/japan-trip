import type { PackingItem, ShoppingItem } from '../types';
import SubTabs from './SubTabs';
import PackingTab from './PackingTab';
import ShoppingTab from './ShoppingTab';

export type ChecklistSub = 'packing' | 'shopping';

type Props = {
  sub: ChecklistSub;
  onSubChange: (sub: ChecklistSub) => void;
  packing: PackingItem[];
  onPackingChange: (packing: PackingItem[]) => void;
  shopping: ShoppingItem[];
  onShoppingChange: (shopping: ShoppingItem[]) => void;
  currency: string;
};

const SUBS = [
  { key: 'packing', label: '짐 목록' },
  { key: 'shopping', label: '쇼핑 리스트' },
] as const;

export default function ChecklistTab(props: Props) {
  return (
    <div>
      <SubTabs tabs={SUBS} value={props.sub} onChange={props.onSubChange} />
      {props.sub === 'packing' && <PackingTab items={props.packing} onChange={props.onPackingChange} />}
      {props.sub === 'shopping' && (
        <ShoppingTab items={props.shopping} onChange={props.onShoppingChange} currency={props.currency} />
      )}
    </div>
  );
}
