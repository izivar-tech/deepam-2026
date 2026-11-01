"use client";

import { useState, useEffect } from "react";
import type { Coordinates } from "@/lib/geo";

export interface UseGeolocationResult {
  location: Coordinates | null;
  loading: boolean;
  error: string | null;
  supported: boolean;
}

export function useGeolocation(): UseGeolocationResult {
  const supported = typeof navigator !== "undefined" && "geolocation" in navigator;
  const [location, setLocation] = useState<Coordinates | null>(null);
  const [loading, setLoading] = useState(supported);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!supported) return;

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLoading(false);
      },
      () => {
        setError("Location access denied. Showing all help points.");
        setLoading(false);
      },
      { timeout: 8000, maximumAge: 60_000 },
    );
  }, [supported]);

  return { location, loading, error, supported };
}
