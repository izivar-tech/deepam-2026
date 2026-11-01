"use client";

import { useState, useEffect } from "react";
import {
  fetchHelpPointsByEvent,
  fetchHelpPointsByCategory,
} from "@/services/help-point-service";
import type { Event, HelpPoint, HelpPointCategory } from "@/types";

export interface UseHelpPointsResult {
  helpPoints: HelpPoint[];
  loading: boolean;
  error: string | null;
}

export function useHelpPoints(
  event: Event | null,
  category?: HelpPointCategory,
): UseHelpPointsResult {
  const [helpPoints, setHelpPoints] = useState<HelpPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!event) {
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    const fetch = category
      ? fetchHelpPointsByCategory(event, category)
      : fetchHelpPointsByEvent(event);

    fetch
      .then((data) => {
        if (!cancelled) {
          setHelpPoints(data);
          setLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setError("Could not load help points.");
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [event?.id, category]); // eslint-disable-line react-hooks/exhaustive-deps

  return { helpPoints, loading, error };
}
