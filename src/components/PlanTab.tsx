import type { ItineraryDay, JournalEntry, TripInfo } from '../types';
import SubTabs from './SubTabs';
import ItineraryTab from './ItineraryTab';
import JournalTab from './JournalTab';
import EventsTab from './EventsTab';

export type PlanSub = 'itinerary' | 'events' | 'journal';

type Props = {
  sub: PlanSub;
  onSubChange: (sub: PlanSub) => void;
  days: ItineraryDay[];
  onDaysChange: (days: ItineraryDay[]) => void;
  journal: JournalEntry[];
  onJournalChange: (journal: JournalEntry[]) => void;
  trip: TripInfo;
};

const SUBS = [
  { key: 'itinerary', label: '일정' },
  { key: 'events', label: '이벤트' },
  { key: 'journal', label: '일지' },
] as const;

export default function PlanTab({ sub, onSubChange, days, onDaysChange, journal, onJournalChange, trip }: Props) {
  return (
    <div>
      <SubTabs tabs={SUBS} value={sub} onChange={onSubChange} />
      {sub === 'itinerary' && <ItineraryTab days={days} onChange={onDaysChange} />}
      {sub === 'events' && <EventsTab trip={trip} />}
      {sub === 'journal' && <JournalTab entries={journal} onChange={onJournalChange} />}
    </div>
  );
}
