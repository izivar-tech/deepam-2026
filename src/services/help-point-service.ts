import type { Event, HelpPoint, HelpPointCategory } from "@/types";
import mockHelpPoints from "@/data/mock/help-points.json";

const allHelpPoints = mockHelpPoints as HelpPoint[];

/** Get all active help points for an event, filtered by active categories. */
export function getHelpPointsByEvent(event: Event): HelpPoint[] {
  const activeCategories = new Set(event.categories);
  return allHelpPoints.filter(
    (hp) => hp.status === "active" && activeCategories.has(hp.category),
  );
}

/** Get active help points for a specific category within an event. */
export function getHelpPointsByCategory(
  event: Event,
  category: HelpPointCategory,
): HelpPoint[] {
  return allHelpPoints.filter(
    (hp) => hp.category === category && hp.status === "active",
  );
}

/** Get a single help point by ID. */
export function getHelpPointById(id: string): HelpPoint | null {
  return allHelpPoints.find((hp) => hp.id === id) ?? null;
}
