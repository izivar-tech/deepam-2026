// ── Categories ────────────────────────────────────────────────────────────────

export type HelpPointCategory =
  | "police"
  | "medical"
  | "toilet"
  | "water"
  | "hotel"
  | "parking"
  | "helpdesk"
  | "bus-stand"
  | "bike-ambulance";

// ── Language ──────────────────────────────────────────────────────────────────

export type Language = "en" | "ta" | "hi" | "te" | "kn" | "ml";

// ── Event ─────────────────────────────────────────────────────────────────────

export interface Announcement {
  id: string;
  title: string;
  titleTamil: string;
  body: string;
  bodyTamil: string;
  priority: "normal" | "high" | "urgent";
  createdAt: string; // ISO 8601
}

export interface EmergencyContact {
  label: string;
  labelTamil: string;
  phone: string;
  description: string;
  descriptionTamil: string;
}

export interface Event {
  id: string; // e.g. "deepam-2026", "girivalam-2026-12"
  name: string; // "Karthigai Deepam 2026"
  nameTamil: string; // "கார்த்திகை தீபம் 2026"
  type: "deepam" | "girivalam";
  date: string; // "2026-11-10" primary date
  startDate: string; // "2026-11-08"
  endDate: string; // "2026-11-12"
  isLive: boolean; // only ONE event is live at a time
  categories: HelpPointCategory[]; // active categories for this event
  bannerImage?: string;
  announcements: Announcement[];
  emergencyContacts: EmergencyContact[];
  createdAt: string;
  updatedAt: string;
}

// ── HelpPoint ─────────────────────────────────────────────────────────────────

export interface HelpPoint {
  id: string;
  name: string;
  nameTamil: string;
  category: HelpPointCategory;
  address: string;
  addressTamil: string;
  lat: number;
  lng: number;
  phone: string;
  hours: string; // "24 x 7" or "6 AM - 10 PM"
  hoursTamil: string;
  status: "active" | "inactive";
  eventIds: string[]; // events this point is active for
  tags: string[]; // searchable: ["east car street", "கிழக்கு கார் தெரு"]
  createdAt: string;
  updatedAt: string;
}

// HelpPoint enriched with computed distance from user location
export interface HelpPointWithDistance extends HelpPoint {
  distance: number; // km
}

// ── QR Scan ───────────────────────────────────────────────────────────────────

export interface QRScan {
  id: string;
  eventId: string;
  scannedAt: string;
  locationLabel?: string; // encoded in QR URL param, e.g. "north-gate"
  userAgent: string;
  language: Language;
}

// ── Assistance Request ────────────────────────────────────────────────────────

export interface AssistanceRequest {
  id: string;
  eventId: string;
  helpPointId?: string;
  message: string;
  category: HelpPointCategory;
  status: "pending" | "resolved";
  createdAt: string;
  resolvedAt?: string;
}
