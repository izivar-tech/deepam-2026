import type { HelpPoint, HelpPointCategory } from "@/types";

/** Map common pilgrim queries (English + Tamil) to help point categories */
const KEYWORD_MAP: Record<string, HelpPointCategory> = {
  // Police
  police: "police",
  காவல்: "police",
  காவலர்: "police",
  // Medical
  doctor: "medical",
  hospital: "medical",
  ambulance: "medical",
  medical: "medical",
  மருத்துவம்: "medical",
  மருத்துவமனை: "medical",
  // Toilet
  toilet: "toilet",
  restroom: "toilet",
  washroom: "toilet",
  கழிவறை: "toilet",
  கக்கூஸ்: "toilet",
  // Water
  water: "water",
  drinking: "water",
  தண்ணீர்: "water",
  குடிநீர்: "water",
  // Hotel
  hotel: "hotel",
  lodge: "hotel",
  room: "hotel",
  stay: "hotel",
  accommodation: "hotel",
  தங்கும்: "hotel",
  விடுதி: "hotel",
  // Help Desk
  help: "helpdesk",
  helpdesk: "helpdesk",
  information: "helpdesk",
  உதவி: "helpdesk",
  தகவல்: "helpdesk",
};

/**
 * Search help points by query string.
 * Uses word-boundary matching for keyword map, substring fallback for free text.
 */
export function searchHelpPoints(
  rawQuery: string,
  helpPoints: HelpPoint[],
): HelpPoint[] {
  const q = rawQuery.toLowerCase().trim();
  if (!q) return [];

  // Word-boundary check: split query into words, check if any word matches a keyword
  const words = q.split(/\s+/);
  for (const word of words) {
    const mapped = KEYWORD_MAP[word];
    if (mapped) {
      return helpPoints.filter((hp) => hp.category === mapped);
    }
  }

  // Fallback: substring match on name, nameTamil, tags, address
  return helpPoints.filter(
    (hp) =>
      hp.name.toLowerCase().includes(q) ||
      hp.nameTamil.includes(q) ||
      hp.address.toLowerCase().includes(q) ||
      hp.addressTamil.includes(q) ||
      hp.tags.some((tag) => tag.toLowerCase().includes(q)),
  );
}
