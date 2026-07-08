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
  // compressed data URLs; optional so entries saved before this field still load
  photos?: string[];
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

export type TravelDocument = {
  id: string;
  title: string;
  image: string; // compressed data URL
};

export type SplitExpense = {
  id: string;
  payer: string;
  description: string;
  amount: number; // JPY
};

export type SplitState = {
  members: string[];
  expenses: SplitExpense[];
};

export type FlightInfo = {
  flightNo: string;
  from: string; // e.g. 인천(ICN)
  to: string;
  date: string;
  departTime: string;
  arriveTime: string;
};

export type FlightsState = {
  outbound: FlightInfo;
  inbound: FlightInfo;
};

export type LodgingInfo = {
  id: string;
  name: string;
  addressJa: string; // Japanese address to show taxi drivers
  checkIn: string; // date
  checkOut: string; // date
  confirmation: string;
};

export type PrepItem = {
  id: string;
  when: string; // e.g. D-14, D-7, D-1
  task: string;
  done: boolean;
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
  documents: TravelDocument[];
  split: SplitState;
  flights: FlightsState;
  lodgings: LodgingInfo[];
  prep: PrepItem[];
};

export const MOODS = ['😄', '🙂', '😐', '😫', '🤩'] as const;
