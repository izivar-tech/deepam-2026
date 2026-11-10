"use client";

import { getLiveEvent } from "@/services/event-service";
import type { Event } from "@/types";

export interface UseEventResult {
  event: Event;
  loading: false;
  error: null;
}

/** Returns the static event data. No async, no loading states. */
export function useEvent(): UseEventResult {
  return { event: getLiveEvent(), loading: false, error: null };
}
