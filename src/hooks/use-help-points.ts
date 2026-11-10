"use client";

import {
  getHelpPointsByEvent,
  getHelpPointsByCategory,
} from "@/services/help-point-service";
import type { Event, HelpPoint, HelpPointCategory } from "@/types";

export interface UseHelpPointsResult {
  helpPoints: HelpPoint[];
  loading: false;
  error: null;
}

/** Returns help points from static JSON. No async, no loading states. */
export function useHelpPoints(
  event: Event | null,
  category?: HelpPointCategory,
): UseHelpPointsResult {
  if (!event) return { helpPoints: [], loading: false, error: null };

  const helpPoints = category
    ? getHelpPointsByCategory(event, category)
    : getHelpPointsByEvent(event);

  return { helpPoints, loading: false, error: null };
}
