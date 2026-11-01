import { collection } from "firebase/firestore";
import { db } from "@/lib/firebase";

// Typed collection references — use these everywhere instead of raw strings
export const Collections = {
  events: () => collection(db, "events"),
  helpPoints: () => collection(db, "helpPoints"),
  qrScans: () => collection(db, "qrScans"),
  assistanceRequests: () => collection(db, "assistanceRequests"),
} as const;
