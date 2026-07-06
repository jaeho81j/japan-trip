export type ExchangeRate = {
  krwPer100Jpy: number;
  fetchedAt: string;
};

async function fetchFromFrankfurter(base: string): Promise<number> {
  const url = new URL(`${base}/latest`);
  url.searchParams.set('amount', '100');
  url.searchParams.set('from', 'JPY');
  url.searchParams.set('to', 'KRW');

  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(`exchange rate fetch failed: ${res.status}`);

  const data = (await res.json()) as { rates: { KRW: number } };
  return data.rates.KRW;
}

async function fetchFromOpenErApi(): Promise<number> {
  const res = await fetch('https://open.er-api.com/v6/latest/JPY');
  if (!res.ok) throw new Error(`exchange rate fetch failed: ${res.status}`);

  const data = (await res.json()) as { rates: { KRW: number } };
  return data.rates.KRW * 100;
}

// Try a couple of free, keyless providers in order in case one is temporarily
// unreachable or has moved domains (Frankfurter migrated from .app to .dev).
const PROVIDERS = [
  () => fetchFromFrankfurter('https://api.frankfurter.dev/v1'),
  () => fetchFromFrankfurter('https://api.frankfurter.app'),
  () => fetchFromOpenErApi(),
];

export async function fetchExchangeRate(): Promise<ExchangeRate> {
  let lastError: unknown;
  for (const provider of PROVIDERS) {
    try {
      const krwPer100Jpy = await provider();
      return { krwPer100Jpy, fetchedAt: new Date().toISOString() };
    } catch (err) {
      lastError = err;
    }
  }
  throw lastError instanceof Error ? lastError : new Error('exchange rate fetch failed');
}
