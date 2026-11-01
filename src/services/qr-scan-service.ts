import { addDoc, serverTimestamp } from "firebase/firestore";
import { Collections } from "@/lib/firestore";
import type { Language } from "@/types";

export interface LogQRScanParams {
  eventId: string;
  locationLabel?: string;
  language: Language;
}

/** Log a QR scan event. Fire-and-forget — do not await in UI. */
export async function logQRScan(params: LogQRScanParams): Promise<void> {
  await addDoc(Collections.qrScans(), {
    eventId: params.eventId,
    locationLabel: params.locationLabel ?? null,
    language: params.language,
    userAgent:
      typeof navigator !== "undefined" ? navigator.userAgent : "unknown",
    scannedAt: serverTimestamp(),
  });
}
