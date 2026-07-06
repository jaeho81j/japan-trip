export type Activity = {
  id: string;
  time: string;
  title: string;
  location: string;
  notes: string;
  lat: number | null;
  lng: number | null;
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

export type TripData = {
  trip: TripInfo;
  itinerary: ItineraryDay[];
  journal: JournalEntry[];
  packing: PackingItem[];
  budget: BudgetItem[];
  weather: WeatherState;
  shopping: ShoppingItem[];
};

export const MOODS = ['😄', '🙂', '😐', '😫', '🤩'] as const;
