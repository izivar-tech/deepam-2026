"use client";

import { useEventContext } from "@/contexts/event-context";
import { useHelpPoints } from "@/hooks/use-help-points";
import { useGeolocation } from "@/hooks/use-geolocation";
import { PageHeader } from "@/components/guest/PageHeader";
import { CATEGORIES, CATEGORY_MAP } from "@/constants/categories";
import Link from "next/link";
import { useState } from "react";
import type { HelpPointCategory } from "@/types";

export default function MapPage() {
  const { event } = useEventContext();
  const { helpPoints, loading } = useHelpPoints(event);
  const { location } = useGeolocation();
  const [activeFilter, setActiveFilter] = useState<HelpPointCategory | "all">("all");

  const filtered =
    activeFilter === "all"
      ? helpPoints
      : helpPoints.filter((hp) => hp.category === activeFilter);

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <PageHeader title="Nearby Help Points" backHref="/services" />

      {/* Map placeholder — Mapbox loads here */}
      <div className="relative flex-1 bg-muted flex items-center justify-center" style={{ minHeight: 360 }}>
        {loading ? (
          <div className="text-center">
            <div className="w-10 h-10 rounded-full border-4 border-primary border-t-transparent animate-spin mx-auto mb-3" />
            <p className="paragraph-small text-muted-foreground">Loading map...</p>
          </div>
        ) : (
          <div className="text-center px-6">
            <span className="text-5xl">🗺️</span>
            <p className="paragraph-medium text-muted-foreground mt-3">
              Interactive map coming soon
            </p>
            <p className="paragraph-small text-muted-foreground mt-1">
              {filtered.length} help points loaded
            </p>
            {/* Mapbox MapGL will be lazy-loaded here */}
          </div>
        )}

        {/* User location indicator */}
        {location && (
          <div className="absolute top-3 right-3 bg-white border border-border rounded-full px-3 py-1.5 shadow-sm flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span className="label-xs text-foreground font-semibold">You are here</span>
          </div>
        )}
      </div>

      {/* Category filter legend */}
      <div className="bg-white border-t border-border px-4 py-3">
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          <button
            onClick={() => setActiveFilter("all")}
            className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full label-xs font-semibold border transition-all ${
              activeFilter === "all"
                ? "bg-foreground text-background border-foreground"
                : "bg-white text-muted-foreground border-border"
            }`}
          >
            All
          </button>
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() =>
                setActiveFilter(activeFilter === cat.id ? "all" : cat.id)
              }
              className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full label-xs font-semibold border transition-all`}
              style={
                activeFilter === cat.id
                  ? { backgroundColor: cat.color, color: "#fff", borderColor: cat.color }
                  : { backgroundColor: cat.bgColor, color: cat.color, borderColor: cat.bgColor }
              }
            >
              {getCategoryEmoji(cat.id)} {cat.label.split(" ")[0]}
            </button>
          ))}
        </div>
      </div>

      {/* Help points list below map */}
      <div className="px-4 py-3 space-y-2 max-h-60 overflow-y-auto border-t border-border bg-white">
        {filtered.map((hp) => {
          const cat = CATEGORY_MAP[hp.category];
          return (
            <Link
              key={hp.id}
              href={`/location/${hp.id}`}
              className="flex items-center gap-3 py-2 border-b border-border/60 last:border-0"
            >
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: cat.bgColor }}
              >
                <span className="text-sm">{getCategoryEmoji(hp.category)}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="label-small font-semibold text-foreground truncate">{hp.name}</p>
                <p className="paragraph-small text-muted-foreground truncate">{hp.address}</p>
              </div>
              <span className="label-xs text-primary font-semibold flex-shrink-0">›</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

function getCategoryEmoji(id: string): string {
  const map: Record<string, string> = {
    police: "🛡️", medical: "🏥", toilet: "🚻",
    water: "💧", hotel: "🏨", helpdesk: "❓",
  };
  return map[id] ?? "📍";
}
