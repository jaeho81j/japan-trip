import { useState } from 'react';
import { useLocalStorage } from './useLocalStorage';
import { defaultData } from './defaultData';
import type { TripData } from './types';
import TripHeader from './components/TripHeader';
import ItineraryTab from './components/ItineraryTab';
import JournalTab from './components/JournalTab';
import PackingTab from './components/PackingTab';
import BudgetTab from './components/BudgetTab';
import WeatherTab from './components/WeatherTab';
import SubwayTab from './components/SubwayTab';
import FoodTab from './components/FoodTab';
import TranslatorTab from './components/TranslatorTab';
import ShoppingTab from './components/ShoppingTab';
import ExchangeTab from './components/ExchangeTab';
import MoreTab from './components/MoreTab';

const TABS = [
  { key: 'itinerary', label: '일정', icon: '🗺️' },
  { key: 'subway', label: '노선도', icon: '🚇' },
  { key: 'food', label: '맛집', icon: '🍜' },
  { key: 'shopping', label: '쇼핑', icon: '🛍️' },
  { key: 'exchange', label: '환율', icon: '💱' },
  { key: 'weather', label: '날씨', icon: '⛅' },
  { key: 'translator', label: '번역기', icon: '💬' },
  { key: 'journal', label: '일지', icon: '📝' },
  { key: 'packing', label: '짐목록', icon: '🎒' },
  { key: 'budget', label: '예산', icon: '💴' },
  { key: 'more', label: '더보기', icon: '⚙️' },
] as const;

type TabKey = (typeof TABS)[number]['key'];

export default function App() {
  const [stored, setStored] = useLocalStorage<TripData>('japan-travel-journal', defaultData);
  const data: TripData = { ...defaultData, ...stored };
  const setData = (next: TripData) => setStored(next);
  const [tab, setTab] = useState<TabKey>('itinerary');

  return (
    <div className="min-h-svh bg-gray-50 dark:bg-gray-950 flex flex-col max-w-md mx-auto">
      <TripHeader trip={data.trip} onChange={(trip) => setData({ ...data, trip })} />

      <main className="flex-1 overflow-y-auto">
        {tab === 'itinerary' && (
          <ItineraryTab days={data.itinerary} onChange={(itinerary) => setData({ ...data, itinerary })} />
        )}
        {tab === 'subway' && <SubwayTab />}
        {tab === 'food' && <FoodTab />}
        {tab === 'shopping' && (
          <ShoppingTab
            items={data.shopping}
            onChange={(shopping) => setData({ ...data, shopping })}
            currency={data.trip.currency}
          />
        )}
        {tab === 'exchange' && (
          <ExchangeTab exchange={data.exchange} onChange={(exchange) => setData({ ...data, exchange })} />
        )}
        {tab === 'weather' && (
          <WeatherTab
            weather={data.weather}
            onChange={(weather) => setData({ ...data, weather })}
            itineraryDays={data.itinerary}
          />
        )}
        {tab === 'translator' && <TranslatorTab />}
        {tab === 'journal' && (
          <JournalTab entries={data.journal} onChange={(journal) => setData({ ...data, journal })} />
        )}
        {tab === 'packing' && (
          <PackingTab items={data.packing} onChange={(packing) => setData({ ...data, packing })} />
        )}
        {tab === 'budget' && (
          <BudgetTab
            items={data.budget}
            onChange={(budget) => setData({ ...data, budget })}
            currency={data.trip.currency}
            onCurrencyChange={(currency) => setData({ ...data, trip: { ...data.trip, currency } })}
            itineraryDays={data.itinerary}
          />
        )}
        {tab === 'more' && (
          <MoreTab data={data} onImport={(imported) => setData({ ...defaultData, ...imported })} />
        )}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 flex overflow-x-auto">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`shrink-0 basis-[19%] flex flex-col items-center py-2 text-xs gap-0.5 whitespace-nowrap ${
              tab === t.key ? 'text-indigo-600 dark:text-indigo-400 font-medium' : 'text-gray-400'
            }`}
          >
            <span className="text-lg leading-none">{t.icon}</span>
            {t.label}
          </button>
        ))}
      </nav>
    </div>
  );
}
