export type Activity = {
  id: string;
  time: string;
  title: string;
  location: string;
  notes: string;
  lat: number | null;
  lng: number | null;
  // JPY spent on this activity; optional so data saved before this field existed still loads
  cost?: number;
};

export type ItineraryDay = {
  id: string;
  date: string;
  title: string;
  activities: Activity[];
};

export type JournalEntry = {
  id: string;
  date: string;
  text: string;
  mood: string;
};

export type PackingItem = {
  id: string;
  name: string;
  category: string;
  qty: number;
  packed: boolean;
};

export type BudgetItem = {
  id: string;
  category: string;
  description: string;
  planned: number;
  actual: number;
};

export type TripInfo = {
  destination: string;
  startDate: string;
  endDate: string;
  currency: string;
};

export type WeatherDay = {
  date: string;
  weatherCode: number;
  tempMax: number;
  tempMin: number;
  precipitationProb: number;
};

export type WeatherState = {
  city: string;
  lat: number | null;
  lng: number | null;
  fetchedAt: string | null;
  daily: WeatherDay[];
};

export type ShoppingItem = {
  id: string;
  name: string;
  category: string;
  store: string;
  price: number;
  bought: boolean;
  taxFree: boolean;
};

export type ExchangeState = {
  krwPer100Jpy: number | null;
  fetchedAt: string | null;
};

export type QrState = {
  // compressed data URLs of uploaded QR screenshots
  visitJapan: string | null;
  taxFree: string | null;
};

export type TripData = {
  trip: TripInfo;
  itinerary: ItineraryDay[];
  journal: JournalEntry[];
  packing: PackingItem[];
  budget: BudgetItem[];
  weather: WeatherState;
  shopping: ShoppingItem[];
  exchange: ExchangeState;
  qr: QrState;
};

export const MOODS = ['😄', '🙂', '😐', '😫', '🤩'] as const;
