import { query, where, getDocs, doc, getDoc } from "firebase/firestore";
import { Collections } from "@/lib/firestore";
import type { Event, HelpPoint, HelpPointCategory } from "@/types";
import mockHelpPoints from "@/data/mock/help-points.json";

// Module-level client cache: keyed by "eventId" or "eventId:category"
const cache = new Map<string, { data: HelpPoint[]; fetchedAt: number }>();
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

function isFresh(fetchedAt: number): boolean {
  return Date.now() - fetchedAt < CACHE_TTL_MS;
}

function normalizeHelpPoint(
  id: string,
  data: Record<string, unknown>,
): HelpPoint {
  return {
    id,
    name: String(data.name ?? ""),
    nameTamil: String(data.nameTamil ?? ""),
    category: data.category as HelpPointCategory,
    address: String(data.address ?? ""),
    addressTamil: String(data.addressTamil ?? ""),
    lat: Number(data.lat ?? 0),
    lng: Number(data.lng ?? 0),
    phone: String(data.phone ?? ""),
    hours: String(data.hours ?? ""),
    hoursTamil: String(data.hoursTamil ?? ""),
    status: (data.status as HelpPoint["status"]) ?? "inactive",
    eventIds: Array.isArray(data.eventIds) ? data.eventIds : [],
    tags: Array.isArray(data.tags) ? data.tags : [],
    createdAt: String(data.createdAt ?? ""),
    updatedAt: String(data.updatedAt ?? ""),
  };
}

function getMockForEvent(event: Event): HelpPoint[] {
  const activeCategories = new Set(event.categories);
  // Mock data is local — skip eventId check, just filter by active categories
  return (mockHelpPoints as HelpPoint[]).filter(
    (hp) => hp.status === "active" && activeCategories.has(hp.category),
  );
}

/**
 * Fetch all active help points for an event.
 * Filters by event.categories so inactive categories are hidden.
 * Falls back to mock data if Firestore returns nothing.
 */
export async function fetchHelpPointsByEvent(event: Event): Promise<HelpPoint[]> {
  const key = event.id;
  const cached = cache.get(key);
  if (cached && isFresh(cached.fetchedAt)) return cached.data;

  try {
    const q = query(
      Collections.helpPoints(),
      where("eventIds", "array-contains", event.id),
      where("status", "==", "active"),
    );
    const snapshot = await getDocs(q);

    if (!snapshot.empty) {
      const all = snapshot.docs.map((d) =>
        normalizeHelpPoint(d.id, d.data() as Record<string, unknown>),
      );
      const activeCategories = new Set(event.categories);
      const filtered = all.filter((hp) => activeCategories.has(hp.category));
      cache.set(key, { data: filtered, fetchedAt: Date.now() });
      return filtered;
    }
  } catch {
    // Firestore unavailable — fall through to mock
  }

  const mockData = getMockForEvent(event);
  cache.set(key, { data: mockData, fetchedAt: Date.now() });
  return mockData;
}

/**
 * Fetch active help points for a specific category within an event.
 * Uses the cached full list if available, otherwise queries Firestore directly.
 * Falls back to mock data if Firestore returns nothing.
 */
export async function fetchHelpPointsByCategory(
  event: Event,
  category: HelpPointCategory,
): Promise<HelpPoint[]> {
  // If we already have the full list cached, filter from it
  const fullCacheKey = event.id;
  const fullCached = cache.get(fullCacheKey);
  if (fullCached && isFresh(fullCached.fetchedAt)) {
    return fullCached.data.filter((hp) => hp.category === category);
  }

  const cacheKey = `${event.id}:${category}`;
  const cached = cache.get(cacheKey);
  if (cached && isFresh(cached.fetchedAt)) return cached.data;

  try {
    const q = query(
      Collections.helpPoints(),
      where("eventIds", "array-contains", event.id),
      where("category", "==", category),
      where("status", "==", "active"),
    );
    const snapshot = await getDocs(q);

    if (!snapshot.empty) {
      const data = snapshot.docs.map((d) =>
        normalizeHelpPoint(d.id, d.data() as Record<string, unknown>),
      );
      cache.set(cacheKey, { data, fetchedAt: Date.now() });
      return data;
    }
  } catch {
    // Firestore unavailable — fall through to mock
  }

  // Mock data is local — skip eventId check
  const mockData = (mockHelpPoints as HelpPoint[]).filter(
    (hp) => hp.category === category && hp.status === "active",
  );
  cache.set(cacheKey, { data: mockData, fetchedAt: Date.now() });
  return mockData;
}

/** Fetch a single help point by ID. Falls back to mock data if not found in Firestore. */
export async function fetchHelpPointById(id: string): Promise<HelpPoint | null> {
  try {
    const docRef = doc(Collections.helpPoints(), id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return normalizeHelpPoint(docSnap.id, docSnap.data() as Record<string, unknown>);
    }
  } catch {
    // Firestore unavailable — fall through to mock
  }
  return (mockHelpPoints as HelpPoint[]).find((hp) => hp.id === id) ?? null;
}

/** Invalidate the cache (call from admin after updating help points) */
export function invalidateHelpPointCache(): void {
  cache.clear();
}
