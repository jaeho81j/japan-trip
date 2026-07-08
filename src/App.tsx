import { useState } from 'react';
import { useLocalStorage } from './useLocalStorage';
import { defaultData } from './defaultData';
import { useSettings } from './settings';
import type { TripData } from './types';
import TripHeader from './components/TripHeader';
import HomeTab from './components/HomeTab';
import PlanTab, { type PlanSub } from './components/PlanTab';
import QrTab from './components/QrTab';
import MoneyTab, { type MoneySub } from './components/MoneyTab';
import ChecklistTab, { type ChecklistSub } from './components/ChecklistTab';
import GuideTab, { type GuideSub } from './components/GuideTab';
import SettingsTab from './components/SettingsTab';
import { NavIcon } from './components/Icons';

const TABS = [
  { key: 'home', label: '홈' },
  { key: 'plan', label: '일정' },
  { key: 'wallet', label: '지갑' },
  { key: 'money', label: '돈' },
  { key: 'lists', label: '체크' },
  { key: 'guide', label: '가이드' },
] as const;

const TITLES: Record<string, string> = {
  home: '홈',
  plan: '일정',
  wallet: '지갑',
  money: '돈',
  lists: '체크',
  guide: '가이드',
  settings: '설정',
};

type TabKey = (typeof TABS)[number]['key'] | 'settings';

export default function App() {
  const [stored, setStored] = useLocalStorage<TripData>('japan-travel-journal', defaultData);
  const data: TripData = { ...defaultData, ...stored };
  const setData = (next: TripData) => setStored(next);
  const [settings, setSettings] = useSettings();

  const [tab, setTab] = useState<TabKey>('home');
  const [planSub, setPlanSub] = useState<PlanSub>('itinerary');
  const [moneySub, setMoneySub] = useState<MoneySub>('exchange');
  const [listsSub, setListsSub] = useState<ChecklistSub>('prep');
  const [guideSub, setGuideSub] = useState<GuideSub>('subway');

  // 홈 바로가기 등에서 탭 + 하위 탭으로 이동
  const navigate = (t: string, sub?: string) => {
    setTab(t as TabKey);
    if (t === 'plan' && sub) setPlanSub(sub as PlanSub);
    if (t === 'money' && sub) setMoneySub(sub as MoneySub);
    if (t === 'lists' && sub) setListsSub(sub as ChecklistSub);
    if (t === 'guide' && sub) setGuideSub(sub as GuideSub);
  };

  return (
    <div className="min-h-svh bg-[#F2F2F7] dark:bg-black flex flex-col max-w-md mx-auto">
      <TripHeader
        title={TITLES[tab] ?? '홈'}
        settingsActive={tab === 'settings'}
        onOpenSettings={() => setTab('settings')}
      />

      <main className="flex-1 overflow-y-auto overflow-x-hidden">
        {tab === 'home' && (
          <HomeTab
            data={data}
            onNavigate={navigate}
            onFlightsChange={(flights) => setData({ ...data, flights })}
            onLodgingsChange={(lodgings) => setData({ ...data, lodgings })}
          />
        )}
        {tab === 'plan' && (
          <PlanTab
            sub={planSub}
            onSubChange={setPlanSub}
            days={data.itinerary}
            onDaysChange={(itinerary) => setData({ ...data, itinerary })}
            journal={data.journal}
            onJournalChange={(journal) => setData({ ...data, journal })}
          />
        )}
        {tab === 'wallet' && (
          <QrTab
            qr={data.qr}
            onChange={(qr) => setData({ ...data, qr })}
            documents={data.documents}
            onDocumentsChange={(documents) => setData({ ...data, documents })}
          />
        )}
        {tab === 'money' && (
          <MoneyTab
            sub={moneySub}
            onSubChange={setMoneySub}
            exchange={data.exchange}
            onExchangeChange={(exchange) => setData({ ...data, exchange })}
            split={data.split}
            onSplitChange={(split) => setData({ ...data, split })}
            budget={data.budget}
            onBudgetChange={(budget) => setData({ ...data, budget })}
            currency={data.trip.currency}
            onCurrencyChange={(currency) => setData({ ...data, trip: { ...data.trip, currency } })}
            itineraryDays={data.itinerary}
          />
        )}
        {tab === 'lists' && (
          <ChecklistTab
            sub={listsSub}
            onSubChange={setListsSub}
            packing={data.packing}
            onPackingChange={(packing) => setData({ ...data, packing })}
            shopping={data.shopping}
            onShoppingChange={(shopping) => setData({ ...data, shopping })}
            prep={data.prep}
            onPrepChange={(prep) => setData({ ...data, prep })}
            currency={data.trip.currency}
          />
        )}
        {tab === 'guide' && (
          <GuideTab
            sub={guideSub}
            onSubChange={setGuideSub}
            weather={data.weather}
            onWeatherChange={(weather) => setData({ ...data, weather })}
            itineraryDays={data.itinerary}
          />
        )}
        {tab === 'settings' && (
          <SettingsTab
            settings={settings}
            onSettingsChange={setSettings}
            trip={data.trip}
            onTripChange={(trip) => setData({ ...data, trip })}
            data={data}
            onImport={(imported) => setData({ ...defaultData, ...imported })}
          />
        )}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto border-t border-black/[0.06] dark:border-white/[0.08] bg-white/80 dark:bg-[#1C1C1E]/75 backdrop-blur-xl flex pt-1.5 pb-[calc(env(safe-area-inset-bottom)+0.5rem)] z-20">
        {TABS.map((t) => {
          const active = tab === t.key;
          return (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex-1 flex flex-col items-center gap-1 text-[10.5px] transition-colors ${
                active ? 'text-accent-600 dark:text-accent-400 font-semibold' : 'text-gray-400 dark:text-gray-500'
              }`}
            >
              <NavIcon name={t.key} active={active} className="h-6 w-6" />
              {t.label}
            </button>
          );
        })}
      </nav>
    </div>
  );
}
