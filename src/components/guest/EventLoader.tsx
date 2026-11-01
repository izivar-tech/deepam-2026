"use client";

import { useEvent } from "@/hooks/use-event";
import { EventProvider } from "@/contexts/event-context";

export function EventLoader({ children }: { children: React.ReactNode }) {
  const { event, loading, error } = useEvent();
  return (
    <EventProvider value={{ event, loading, error }}>
      {children}
    </EventProvider>
  );
}
