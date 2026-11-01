import { query, where, getDocs, doc, getDoc } from "firebase/firestore";
import { Collections } from "@/lib/firestore";
import type { Event } from "@/types";
import mockEvent from "@/data/mock/event.json";

// ── Client-side cache ────────────────────────────────────────────────────────
let cachedEvent: { data: Event; fetchedAt: number } | null = null;
const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes — event data rarely changes

function isFresh(fetchedAt: number): boolean {
  return Date.now() - fetchedAt < CACHE_TTL_MS;
}

function normalizeEvent(id: string, data: Record<string, unknown>): Event {
  return {
    id,
    name: String(data.name ?? ""),
    nameTamil: String(data.nameTamil ?? ""),
    type: (data.type as Event["type"]) ?? "girivalam",
    date: String(data.date ?? ""),
    startDate: String(data.startDate ?? ""),
    endDate: String(data.endDate ?? ""),
    isLive: Boolean(data.isLive),
    categories: Array.isArray(data.categories) ? data.categories : [],
    bannerImage: data.bannerImage ? String(data.bannerImage) : undefined,
    announcements: Array.isArray(data.announcements) ? data.announcements : [],
    emergencyContacts: Array.isArray(data.emergencyContacts)
      ? data.emergencyContacts
      : [],
    createdAt: String(data.createdAt ?? ""),
    updatedAt: String(data.updatedAt ?? ""),
  };
}

/** Fetch the currently live event. Cached for 10 min. Falls back to mock data. */
export async function fetchLiveEvent(): Promise<Event | null> {
  // Return cached if fresh
  if (cachedEvent && isFresh(cachedEvent.fetchedAt)) {
    return cachedEvent.data;
  }

  try {
    const q = query(Collections.events(), where("isLive", "==", true));
    const snapshot = await getDocs(q);
    if (!snapshot.empty) {
      const docSnap = snapshot.docs[0]!;
      const event = normalizeEvent(docSnap.id, docSnap.data() as Record<string, unknown>);
      cachedEvent = { data: event, fetchedAt: Date.now() };
      return event;
    }
  } catch {
    // Firestore unavailable — fall through to mock
  }

  const event = mockEvent as Event;
  cachedEvent = { data: event, fetchedAt: Date.now() };
  return event;
}

/** Fetch a specific event by ID */
export async function fetchEventById(eventId: string): Promise<Event | null> {
  const docRef = doc(Collections.events(), eventId);
  const docSnap = await getDoc(docRef);
  if (!docSnap.exists()) return null;
  return normalizeEvent(docSnap.id, docSnap.data() as Record<string, unknown>);
}
