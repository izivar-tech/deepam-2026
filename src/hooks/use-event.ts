"use client";

import { useState, useEffect } from "react";
import { fetchLiveEvent } from "@/services/event-service";
import type { Event } from "@/types";

export interface UseEventResult {
  event: Event | null;
  loading: boolean;
  error: string | null;
}

export function useEvent(): UseEventResult {
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetchLiveEvent()
      .then((data) => {
        if (!cancelled) {
          setEvent(data);
          setLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setError("Could not load event information.");
          setLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return { event, loading, error };
}
