export function googleMapsSearchUrl(query: string): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}

export function googleMapsSearchUrlForCoords(lat: number, lng: number): string {
  return googleMapsSearchUrl(`${lat},${lng}`);
}
