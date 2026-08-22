export function getLocationUrl(mapUrl: string | null, address: string) {
  const explicitUrl = mapUrl?.trim();
  if (explicitUrl) return explicitUrl;

  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
}
