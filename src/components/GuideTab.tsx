import type { ItineraryDay, WeatherState } from '../types';
import SubTabs from './SubTabs';
import SubwayTab from './SubwayTab';
import FoodTab from './FoodTab';
import TranslatorTab from './TranslatorTab';
import WeatherTab from './WeatherTab';

export type GuideSub = 'subway' | 'food' | 'translator' | 'weather';

type Props = {
  sub: GuideSub;
  onSubChange: (sub: GuideSub) => void;
  weather: WeatherState;
  onWeatherChange: (weather: WeatherState) => void;
  itineraryDays: ItineraryDay[];
};

const SUBS = [
  { key: 'subway', label: '노선도' },
  { key: 'food', label: '맛집' },
  { key: 'translator', label: '번역' },
  { key: 'weather', label: '날씨' },
] as const;

export default function GuideTab({ sub, onSubChange, weather, onWeatherChange, itineraryDays }: Props) {
  return (
    <div>
      <SubTabs tabs={SUBS} value={sub} onChange={onSubChange} />
      {sub === 'subway' && <SubwayTab />}
      {sub === 'food' && <FoodTab />}
      {sub === 'translator' && <TranslatorTab />}
      {sub === 'weather' && (
        <WeatherTab weather={weather} onChange={onWeatherChange} itineraryDays={itineraryDays} />
      )}
    </div>
  );
}
