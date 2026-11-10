import type { Event } from "@/types";
import mockEvent from "@/data/mock/event.json";

/** Return the static event data. No network calls needed — data is bundled at build time. */
export function getLiveEvent(): Event {
  return mockEvent as Event;
}
