# Foundation Layer Design — Deepam 2026

## Intent

Build the data layer, configuration, and utilities that every screen in the Deepam app depends on. This foundation must be **reusable across events** — Karthigai Deepam (annual, November) and Girivalam (every full moon, monthly). Admin sets up an event, toggles it live, and the guest app auto-adapts.

## Why

Every UI screen needs help-point data, event context, and user location. Building UI without this layer means rework. The booking app proves that a solid service/hook/type separation pays off — we follow the same conventions but much simpler (no auth for guests, no backend API server, static data from Firestore).

## Goals

- Firestore schema that supports multiple events and reusable help points
- Data service layer following booking app conventions (services → hooks → components)
- Event config system: admin toggles which event is "live"
- Geolocation utility for proximity-based sorting
- Caching strategy for static help-point data (changes maybe once per event)
- Type-safe throughout

## Non-Goals

- Admin authentication (later)
- Hotel booking integration (later)
- AI/LLM assistant (not needed — keyword search on static data)
- Offline/PWA service worker (later, after UI is built)
- Complex error handling — no backend API server, just Firestore reads

## Anti-Goals

- Over-engineering: no auth token managers, no axios interceptors, no retry logic. This is a Firestore-direct app, not a backend-API app.
- Runtime config injection: not needed. We deploy on Vercel free tier, not Cloud Run. `NEXT_PUBLIC_` env vars are fine here.

## Constraints

- Zero cost: Firestore free tier (50k reads/day), Vercel free tier
- pnpm, Next.js App Router, TypeScript
- Follow izivar-booking-app conventions for file organization (services/, hooks/, types/, constants/)
- Use `@izivar/ux` components and design tokens

---

## Firestore Schema

### Collections

#### `events`
Top-level collection. Each document is one event instance.

```typescript
interface Event {
  id: string;                    // e.g., "deepam-2026", "girivalam-2026-12"
  name: string;                  // "Karthigai Deepam 2026"
  nameTamil: string;             // "கார்த்திகை தீபம் 2026"
  type: "deepam" | "girivalam";
  date: string;                  // "2026-11-10" (primary date)
  startDate: string;             // "2026-11-08" (event period start)
  endDate: string;               // "2026-11-12" (event period end)
  isLive: boolean;               // only ONE event is live at a time
  categories: HelpPointCategory[]; // which categories are active for this event
  bannerImage?: string;          // event-specific hero image
  announcements: Announcement[];
  emergencyContacts: EmergencyContact[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

interface Announcement {
  id: string;
  title: string;
  titleTamil: string;
  body: string;
  bodyTamil: string;
  priority: "normal" | "urgent";
  createdAt: Timestamp;
}

interface EmergencyContact {
  label: string;
  labelTamil: string;
  phone: string;
  description: string;
}
```

#### `helpPoints`
Top-level collection. Help points are **shared across events** — they exist independently and get linked to events via the `eventIds` field.

```typescript
interface HelpPoint {
  id: string;                    // auto-generated
  name: string;
  nameTamil: string;
  category: HelpPointCategory;   // "police" | "medical" | "toilet" | "water" | "hotel" | "helpdesk"
  address: string;
  addressTamil: string;
  lat: number;
  lng: number;
  phone: string;
  hours: string;                 // "24 x 7" or "6 AM - 10 PM"
  hoursTamil: string;
  status: "active" | "inactive";
  eventIds: string[];            // which events this point is active for
  tags: string[];                // searchable keywords: ["girivalam", "east car street", "கிழக்கு"]
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

type HelpPointCategory = "police" | "medical" | "toilet" | "water" | "hotel" | "helpdesk";
```

#### `qrScans`
Top-level collection. One document per scan. Write-only from guest, read from admin.

```typescript
interface QRScan {
  id: string;
  eventId: string;
  scannedAt: Timestamp;
  locationLabel?: string;        // QR board location (encoded in QR URL param)
  userAgent: string;
  language: Language;
}
```

#### `assistanceRequests`
Top-level collection. When a pilgrim reports an issue.

```typescript
interface AssistanceRequest {
  id: string;
  eventId: string;
  helpPointId?: string;
  message: string;
  category: HelpPointCategory;
  status: "pending" | "resolved";
  createdAt: Timestamp;
  resolvedAt?: Timestamp;
}
```

### Why This Schema

- **Help points are independent of events** — a police post exists year-round. The `eventIds` array links them to specific events. Admin can reuse the same help points across Deepam and monthly Girivalam without re-entering data.
- **Events are lightweight** — just config + announcements. The heavy data (help points) lives separately.
- **QR scans are write-heavy, read-rarely** — only admin dashboard reads them. Firestore handles write throughput fine.
- **No subcollections** — keeps queries simple, avoids collection group queries.

---

## File Structure

```
src/
├── lib/
│   ├── firebase.ts              # Firebase init (NEXT_PUBLIC_ env vars)
│   ├── firestore.ts             # Firestore instance + typed collection refs
│   ├── geo.ts                   # Geolocation utilities
│   └── search.ts                # Keyword search logic on help points
├── services/
│   ├── event-service.ts         # Fetch live event, event by ID
│   ├── help-point-service.ts    # Fetch help points by event/category, by ID
│   ├── qr-scan-service.ts       # Log QR scan
│   └── assistance-service.ts    # Submit/fetch assistance requests
├── hooks/
│   ├── use-event.ts             # Current live event
│   ├── use-help-points.ts       # Help points with filtering/sorting
│   ├── use-geolocation.ts       # Browser geolocation
│   └── use-search.ts            # Keyword search
├── types/
│   └── index.ts                 # All domain types (Event, HelpPoint, etc.)
├── constants/
│   ├── categories.ts            # Category metadata (labels, icons, colors)
│   └── languages.ts             # Supported languages
└── data/
    └── seed.ts                  # Seed data for development/testing
```

### Convention Alignment with Booking App

| Booking App | Deepam App | Why Different |
|---|---|---|
| `lib/api/client.ts` (axios) | `lib/firestore.ts` (Firestore SDK) | No backend API, direct Firestore |
| `lib/services/*.ts` | `services/*.ts` | Same pattern: typed functions, normalization |
| `hooks/use*.ts` | `hooks/use*.ts` | Same pattern: state + fetch + refresh |
| `types/*.ts` | `types/index.ts` | Single file is enough for this app size |
| `constants/api.ts` | `constants/categories.ts` | No API endpoints, just app constants |
| Runtime config provider | `NEXT_PUBLIC_` env vars | Vercel deploy, not Cloud Run |

---

## Data Service Layer

### Firebase Init (`lib/firebase.ts`)

```typescript
import { initializeApp, getApps } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN!,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET!,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID!,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID!,
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
export const db = getFirestore(app);
```

### Service Pattern (`services/help-point-service.ts`)

Following the booking app's normalize + fetch pattern, but simpler (no axios, no error wrapping):

```typescript
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { HelpPoint, HelpPointCategory } from "@/types";

export async function fetchHelpPointsByEvent(eventId: string): Promise<HelpPoint[]> {
  const q = query(
    collection(db, "helpPoints"),
    where("eventIds", "array-contains", eventId),
    where("status", "==", "active"),
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as HelpPoint));
}

export async function fetchHelpPointsByCategory(
  eventId: string,
  category: HelpPointCategory,
): Promise<HelpPoint[]> {
  const q = query(
    collection(db, "helpPoints"),
    where("eventIds", "array-contains", eventId),
    where("category", "==", category),
    where("status", "==", "active"),
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as HelpPoint));
}
```

### Hook Pattern (`hooks/use-help-points.ts`)

Following the booking app's simple state pattern (Pattern B from coupons):

```typescript
export function useHelpPoints(eventId: string, category?: HelpPointCategory) {
  const [helpPoints, setHelpPoints] = useState<HelpPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const data = category
          ? await fetchHelpPointsByCategory(eventId, category)
          : await fetchHelpPointsByEvent(eventId);
        if (!cancelled) { setHelpPoints(data); setLoading(false); }
      } catch (e) {
        if (!cancelled) { setError("Failed to load help points"); setLoading(false); }
      }
    };
    load();
    return () => { cancelled = true; };
  }, [eventId, category]);

  return { helpPoints, loading, error };
}
```

---

## Caching Strategy

Help-point data is near-static (changes maybe once before each event). Two layers:

1. **Server-side cache** — Wrap Firestore SDK calls with Next.js `"use cache"` directive. Server Components call services directly (no API routes). Revalidate every 30 minutes.

2. **Client-side module cache** — Same pattern as booking app's `hotelsCacheByUser` Map. Cache help points in memory with 5-minute TTL. Since the data rarely changes, this avoids re-reading Firestore on every navigation.

No API routes for data fetching (removed). No Redis, no external cache. Free tier friendly.

---

## Geolocation Utility (`lib/geo.ts`)

```typescript
export interface Coordinates {
  lat: number;
  lng: number;
}

/** Haversine distance in km */
export function distanceKm(a: Coordinates, b: Coordinates): number {
  const R = 6371;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const x = Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
}

/** Sort help points by proximity to user */
export function sortByProximity<T extends Coordinates>(
  items: T[],
  userLocation: Coordinates,
): (T & { distance: number })[] {
  return items
    .map((item) => ({ ...item, distance: distanceKm(userLocation, item) }))
    .sort((a, b) => a.distance - b.distance);
}

/** Format distance for display: "0.4 km" or "350 m" */
export function formatDistance(km: number): string {
  return km < 1 ? `${Math.round(km * 1000)} m` : `${km.toFixed(1)} km`;
}

/** Estimate walk time: ~5 km/h average */
export function estimateWalkTime(km: number): string {
  const minutes = Math.round((km / 5) * 60);
  return minutes < 60 ? `${minutes} min walk` : `${Math.floor(minutes / 60)}h ${minutes % 60}m walk`;
}
```

---

## Keyword Search (`lib/search.ts`)

No LLM. Simple keyword matching on help-point `tags` + `name` + `category`:

```typescript
/** Map common queries to categories */
const KEYWORD_MAP: Record<string, HelpPointCategory> = {
  "police": "police",
  "காவல்": "police",
  "doctor": "medical",
  "hospital": "medical",
  "மருத்துவம்": "medical",
  "toilet": "toilet",
  "restroom": "toilet",
  "கழிவறை": "toilet",
  "water": "water",
  "தண்ணீர்": "water",
  "hotel": "hotel",
  "lodge": "hotel",
  "room": "hotel",
  "தங்கும்": "hotel",
  "help": "helpdesk",
  "உதவி": "helpdesk",
  // ... extend as needed
};

export function searchHelpPoints(query: string, helpPoints: HelpPoint[]): HelpPoint[] {
  const q = query.toLowerCase().trim();

  // Check keyword map first
  const mappedCategory = Object.entries(KEYWORD_MAP)
    .find(([keyword]) => q.includes(keyword))?.[1];
  if (mappedCategory) {
    return helpPoints.filter((hp) => hp.category === mappedCategory);
  }

  // Fallback: match against name, tags, address
  return helpPoints.filter((hp) =>
    hp.name.toLowerCase().includes(q) ||
    hp.nameTamil.includes(q) ||
    hp.tags.some((tag) => tag.toLowerCase().includes(q)) ||
    hp.address.toLowerCase().includes(q)
  );
}
```

---

## Seed Data (`data/seed.ts`)

Development/testing data with real Tiruvannamalai locations. Includes:
- 3-4 police posts along Girivalam route
- 2-3 medical help points
- 4-5 toilet locations
- 3-4 water points
- 2-3 hotels (placeholder, no Tavix integration yet)
- 1-2 help desks
- 1 sample event (Deepam 2026)

---

## Resolved Decisions

- **Firebase SDK**: Install latest modular v11
- **Types**: Spec types replace existing `types/index.ts`. Update `sample-help-points.ts` and `categories.ts` to match
- **Date fields**: Use `string` (ISO 8601) in TypeScript interfaces, convert from Firestore `Timestamp` at service layer (cleaner for RSC serialization)
- **File structure**: Create `src/services/` and `src/constants/`, move `categories.ts` to `constants/`, keep `src/data/` for seed only
- **Firestore indexes**: Create `firestore.indexes.json` for composite indexes
- **API routes**: Remove `/api/help-points` and `/api/search` — Server Components call services directly
- **Event category filtering**: `fetchHelpPointsByEvent` filters by `event.categories` — if Girivalam has no hotels, hotels are hidden
- **Caching**: Use `"use cache"` for server-side, module-level Map for client-side
- **EmergencyContact**: Add `descriptionTamil` field
- **useEvent**: Provides live event via context in `(guest)/layout.tsx`
- **Search keyword matching**: Word-boundary matching for keyword map, `includes` for fallback
- **Seed data**: Static TypeScript, not a Firestore script
- **Manual hooks** over TanStack Query (simpler for this app size)
- **Language type**: Keep existing as-is

## What's Left to the Builder

- Exact seed data coordinates (use Google Maps to get real lat/lng for Girivalam route locations)
- Firestore security rules (open read for guests, authenticated write for admin — implement with admin auth later)
- Walk time estimate calibration (5 km/h is standard, but Girivalam route is crowded during festivals — could be slower)
