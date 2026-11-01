"use client";

import { createContext, useContext } from "react";
import type { Event } from "@/types";

interface EventContextValue {
  event: Event | null;
  loading: boolean;
  error: string | null;
}

const EventContext = createContext<EventContextValue | null>(null);

export function EventProvider({
  value,
  children,
}: {
  value: EventContextValue;
  children: React.ReactNode;
}) {
  return (
    <EventContext.Provider value={value}>{children}</EventContext.Provider>
  );
}

export function useEventContext(): EventContextValue {
  const ctx = useContext(EventContext);
  if (!ctx) throw new Error("useEventContext must be used within EventProvider");
  return ctx;
}
