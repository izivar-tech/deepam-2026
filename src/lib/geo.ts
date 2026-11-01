export interface Coordinates {
  lat: number;
  lng: number;
}

function toRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

/** Haversine distance in km between two coordinates */
export function distanceKm(a: Coordinates, b: Coordinates): number {
  const R = 6371;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const x =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
}

/** Sort items by proximity to user location, attaching distance field */
export function sortByProximity<T extends Coordinates>(
  items: T[],
  userLocation: Coordinates,
): (T & { distance: number })[] {
  return items
    .map((item) => ({ ...item, distance: distanceKm(userLocation, item) }))
    .sort((a, b) => a.distance - b.distance);
}

/** Format distance for display: "350 m" or "1.4 km" */
export function formatDistance(km: number): string {
  return km < 1 ? `${Math.round(km * 1000)} m` : `${km.toFixed(1)} km`;
}

/**
 * Estimate walk time at ~4 km/h (conservative — crowded festival route)
 * Returns: "8 min walk" or "1h 10m walk"
 */
export function estimateWalkTime(km: number): string {
  const minutes = Math.round((km / 4) * 60);
  if (minutes < 60) return `${minutes} min walk`;
  return `${Math.floor(minutes / 60)}h ${minutes % 60}m walk`;
}
