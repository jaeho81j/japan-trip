import type { ItineraryDay, JournalEntry } from '../types';
import SubTabs from './SubTabs';
import ItineraryTab from './ItineraryTab';
import JournalTab from './JournalTab';

export type PlanSub = 'itinerary' | 'journal';

type Props = {
  sub: PlanSub;
  onSubChange: (sub: PlanSub) => void;
  days: ItineraryDay[];
  onDaysChange: (days: ItineraryDay[]) => void;
  journal: JournalEntry[];
  onJournalChange: (journal: JournalEntry[]) => void;
};

const SUBS = [
  { key: 'itinerary', label: '일정' },
  { key: 'journal', label: '여행 일지' },
] as const;

export default function PlanTab({ sub, onSubChange, days, onDaysChange, journal, onJournalChange }: Props) {
  return (
    <div>
      <SubTabs tabs={SUBS} value={sub} onChange={onSubChange} />
      {sub === 'itinerary' && <ItineraryTab days={days} onChange={onDaysChange} />}
      {sub === 'journal' && <JournalTab entries={journal} onChange={onJournalChange} />}
    </div>
  );
}
