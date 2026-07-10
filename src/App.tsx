import { useRef, useState } from 'react';
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
import Onboarding from './components/Onboarding';
import Splash from './components/Splash';
import { NavIcon } from './components/Icons';

const TABS = [
  { key: 'home', label: '홈' },
  { key: 'plan', label: '일정' },
  { key: 'wallet', label: '지갑' },
  { key: 'money', label: '돈' },
  { key: 'lists', label: '체크' },
  { key: 'guide', label: '가이드' },
] as const;

// 슬라이드 방향 판정용 전체 순서 (설정은 기어로 진입, 맨 끝)
const ORDER = ['home', 'plan', 'wallet', 'money', 'lists', 'guide', 'settings'] as const;
// 스와이프로 넘길 수 있는 탭 (설정 제외)
const SWIPE_TABS = ['home', 'plan', 'wallet', 'money', 'lists', 'guide'] as const;

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
  const [onboardingDone, setOnboardingDone] = useLocalStorage<boolean>('japan-onboarding-done', false);

  const [tab, setTab] = useState<TabKey>('home');
  const [planSub, setPlanSub] = useState<PlanSub>('itinerary');
  const [moneySub, setMoneySub] = useState<MoneySub>('exchange');
  const [listsSub, setListsSub] = useState<ChecklistSub>('prep');
  const [guideSub, setGuideSub] = useState<GuideSub>('subway');

  // 전환 애니메이션 상태
  const [slideDir, setSlideDir] = useState<'left' | 'right'>('right');
  const [animKey, setAnimKey] = useState(0);

  // 스와이프 제스처 상태
  const [dragX, setDragX] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [springing, setSpringing] = useState(false);
  const sw = useRef({ id: -1, x0: 0, y0: 0, axis: '' as '' | 'x' | 'y', w: 1, active: false });

  const swipeIndex = (SWIPE_TABS as readonly string[]).indexOf(tab);

  // 방향 계산 후 탭 전환 (슬라이드/헤더/스프링팝 트리거)
  const go = (next: TabKey) => {
    if (next === tab) return;
    const oi = ORDER.indexOf(tab as (typeof ORDER)[number]);
    const ni = ORDER.indexOf(next as (typeof ORDER)[number]);
    setSlideDir(ni >= oi ? 'right' : 'left');
    setAnimKey((k) => k + 1);
    setDragX(0);
    setTab(next);
  };

  // 홈 바로가기 등에서 탭 + 하위 탭으로 이동
  const navigate = (t: string, sub?: string) => {
    if (t === 'plan' && sub) setPlanSub(sub as PlanSub);
    if (t === 'money' && sub) setMoneySub(sub as MoneySub);
    if (t === 'lists' && sub) setListsSub(sub as ChecklistSub);
    if (t === 'guide' && sub) setGuideSub(sub as GuideSub);
    go(t as TabKey);
  };

  const onPointerDown = (e: React.PointerEvent) => {
    if (swipeIndex < 0) return; // 설정 화면은 스와이프 제외
    const el = e.target as HTMLElement;
    if (el.closest('input, textarea, select, [data-noswipe]')) return;
    sw.current = { id: e.pointerId, x0: e.clientX, y0: e.clientY, axis: '', w: e.currentTarget.clientWidth || 1, active: true };
    setSpringing(false);
  };
  const onPointerMove = (e: React.PointerEvent) => {
    const s = sw.current;
    if (!s.active || e.pointerId !== s.id) return;
    const dx = e.clientX - s.x0;
    const dy = e.clientY - s.y0;
    if (s.axis === '') {
      if (Math.abs(dx) < 8 && Math.abs(dy) < 8) return;
      s.axis = Math.abs(dx) > Math.abs(dy) * 1.2 ? 'x' : 'y';
      if (s.axis === 'x') {
        try {
          e.currentTarget.setPointerCapture(e.pointerId);
        } catch {
          /* noop */
        }
      }
    }
    if (s.axis !== 'x') return;
    let d = dx;
    const atStart = swipeIndex === 0;
    const atEnd = swipeIndex === SWIPE_TABS.length - 1;
    if ((d > 0 && atStart) || (d < 0 && atEnd)) d *= 0.32; // 러버밴드
    setDragging(true);
    setDragX(d);
  };
  const endSwipe = () => {
    const s = sw.current;
    if (!s.active) return;
    s.active = false;
    if (s.axis !== 'x') {
      setDragging(false);
      setDragX(0);
      return;
    }
    const threshold = Math.min(72, s.w * 0.24);
    const dx = dragX;
    setDragging(false);
    if (dx <= -threshold && swipeIndex < SWIPE_TABS.length - 1) {
      go(SWIPE_TABS[swipeIndex + 1]);
    } else if (dx >= threshold && swipeIndex > 0) {
      go(SWIPE_TABS[swipeIndex - 1]);
    } else {
      setSpringing(true);
      setDragX(0);
      window.setTimeout(() => setSpringing(false), 460);
    }
  };

  const contentAnim = slideDir === 'right' ? 'anim-slide-right' : 'anim-slide-left';
  const swipeStyle: React.CSSProperties = {
    transform: dragX ? `translateX(${dragX}px)` : undefined,
    transition: dragging ? 'none' : springing ? 'transform 0.44s cubic-bezier(0.34,1.46,0.44,1)' : 'none',
    touchAction: 'pan-y',
  };

  return (
    <div className="app-shell h-[100svh] overflow-hidden bg-[#F2F2F7] dark:bg-black flex flex-col max-w-md mx-auto">
      <Splash />
      {!onboardingDone && <Onboarding trip={data.trip} onDone={() => setOnboardingDone(true)} />}
      <TripHeader
        title={TITLES[tab] ?? '홈'}
        headerAnim={slideDir === 'right' ? 'anim-hdr-right' : 'anim-hdr-left'}
        animKey={animKey}
        settingsActive={tab === 'settings'}
        onOpenSettings={() => go('settings')}
      />

      <main
        className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endSwipe}
        onPointerCancel={endSwipe}
        style={swipeStyle}
      >
        <div key={animKey} className={contentAnim}>
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
              trip={data.trip}
              customEvents={data.customEvents}
              onCustomEventsChange={(customEvents) => setData({ ...data, customEvents })}
            />
          )}
          {tab === 'wallet' && (
            <QrTab
              qr={data.qr}
              onChange={(qr) => setData({ ...data, qr })}
              documents={data.documents}
              onDocumentsChange={(documents) => setData({ ...data, documents })}
              flights={data.flights}
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
              onReplayOnboarding={() => setOnboardingDone(false)}
              data={data}
              onImport={(imported) => setData({ ...defaultData, ...imported })}
            />
          )}
        </div>
      </main>

      <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white dark:bg-[#1C1C1E] flex pt-1.5 pb-[calc(env(safe-area-inset-bottom)+0.5rem)] z-20">
        {/* 상단 소프트 페이드: 콘텐츠가 탭바 위로 부드럽게 사라지도록 */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-full h-4 bg-gradient-to-t from-white to-transparent dark:from-[#1C1C1E]"
        />
        {TABS.map((t) => {
          const active = tab === t.key;
          return (
            <button
              key={t.key}
              onClick={() => go(t.key)}
              className={`flex-1 flex flex-col items-center gap-1 text-[10.5px] transition-colors ${
                active ? 'text-accent-600 dark:text-accent-400 font-semibold' : 'text-gray-400 dark:text-gray-500'
              }`}
            >
              <span
                key={active ? `on-${animKey}` : 'off'}
                className={`h-[22px] w-[34px] rounded-full flex items-center justify-center transition-colors ${
                  active ? `bg-accent-500/15 anim-tab-pop` : ''
                }`}
              >
                <NavIcon name={t.key} active={active} className="h-[19px] w-[19px]" />
              </span>
              {t.label}
            </button>
          );
        })}
      </nav>
    </div>
  );
}
