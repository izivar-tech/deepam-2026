import type { Language } from "@/types";

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

export interface LogQRScanParams {
  locationLabel?: string;
  language: Language;
}

/** Log a QR scan event via GA4. Fire-and-forget — no database writes. */
export function logQRScan(params: LogQRScanParams): void {
  if (typeof window === "undefined" || !window.gtag) return;
  window.gtag("event", "qr_scan", {
    location_label: params.locationLabel ?? "direct",
    language: params.language,
  });
}

/** Log a category view via GA4. */
export function logCategoryView(category: string, language: Language): void {
  if (typeof window === "undefined" || !window.gtag) return;
  window.gtag("event", "category_view", {
    category,
    language,
  });
}

/** Log a phone call tap via GA4. */
export function logPhoneCall(phone: string, category: string): void {
  if (typeof window === "undefined" || !window.gtag) return;
  window.gtag("event", "phone_call", {
    phone_number: phone,
    category,
  });
}

/** Log Tavix promo link click via GA4. */
export function logTavixClick(): void {
  if (typeof window === "undefined" || !window.gtag) return;
  window.gtag("event", "tavix_click", {
    source: "services_page",
  });
}
