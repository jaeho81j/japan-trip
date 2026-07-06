export type ExchangeRate = {
  krwPer100Jpy: number;
  fetchedAt: string;
};

export async function fetchExchangeRate(): Promise<ExchangeRate> {
  const url = new URL('https://api.frankfurter.app/latest');
  url.searchParams.set('amount', '100');
  url.searchParams.set('from', 'JPY');
  url.searchParams.set('to', 'KRW');

  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(`exchange rate fetch failed: ${res.status}`);

  const data = (await res.json()) as { rates: { KRW: number } };
  return { krwPer100Jpy: data.rates.KRW, fetchedAt: new Date().toISOString() };
}
