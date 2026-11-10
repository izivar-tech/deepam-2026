"use client";

import { use, useEffect } from "react";
import dynamic from "next/dynamic";
import { useEventContext } from "@/contexts/event-context";
import { useHelpPoints } from "@/hooks/use-help-points";
import { useGeolocation } from "@/hooks/use-geolocation";
import { useTranslation } from "@/hooks/use-translation";
import { PageHeader } from "@/components/guest/PageHeader";
import { CATEGORY_MAP } from "@/constants/categories";
import { distanceKm, formatDistance, estimateWalkTime, sortByProximity } from "@/lib/geo";
import { logCategoryView } from "@/services/qr-scan-service";
import type { HelpPointCategory, HelpPoint } from "@/types";

const CategoryMap = dynamic(() => import("@/components/guest/CategoryMap"), {
  ssr: false,
  loading: () => (
    <div className="flex-1 flex items-center justify-center bg-muted">
      <p className="text-muted-foreground paragraph-small">Loading map...</p>
    </div>
  ),
});

const CATEGORY_EMOJI: Record<string, string> = {
  police: "🛡️",
  medical: "🏥",
  toilet: "🚻",
  water: "💧",
  hotel: "🏨",
  parking: "🅿️",
  "bus-stand": "🚌",
  "bike-ambulance": "🏍️",
};

const CATEGORY_CALL_PHONE: Record<string, string> = {
  police: "112",
  medical: "108",
  "bike-ambulance": "108",
};

const CATEGORY_CALL_BG: Record<string, string> = {
  police: "#1e3a5f",
  medical: "#dc2626",
  "bike-ambulance": "#e11d48",
};

export default function ServiceListPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category } = use(params);
  const { event } = useEventContext();
  const { helpPoints } = useHelpPoints(event, category as HelpPointCategory);
  const { location } = useGeolocation();
  const { t, lang } = useTranslation();

  const cat = CATEGORY_MAP[category as HelpPointCategory];
  const emoji = CATEGORY_EMOJI[category] ?? "📍";
  const callPhone = CATEGORY_CALL_PHONE[category];
  const callBg = CATEGORY_CALL_BG[category];
  const callLabel = category === "police" ? t("cat.callPolice") : t("cat.callAmbulance");

  useEffect(() => {
    logCategoryView(category, lang);
  }, [category, lang]);

  const sorted: HelpPoint[] = location
    ? sortByProximity(helpPoints, location)
    : helpPoints;

  const nearest = location && sorted.length > 0 ? sorted[0]! : null;

  return (
    <div className="h-screen flex flex-col">
      <PageHeader title={t(`cat.${category}`) || cat?.label || t("cat.helpPoints")} backHref="/services" />

      {/* Category strip with nearest info */}
      <div
        className="px-4 py-2.5 flex items-center gap-3 shrink-0"
        style={{ backgroundColor: cat?.bgColor ?? "#f5f5f5" }}
      >
        <span className="text-xl">{emoji}</span>
        <div className="flex-1 min-w-0">
          <p className="label-small font-semibold" style={{ color: cat?.color }}>
            {t(`cat.${category}`)}
          </p>
          {nearest && location ? (
            <p className="label-xs text-muted-foreground truncate">
              <span className="font-semibold" style={{ color: cat?.color }}>
                {t("cat.nearest")}{" "}
              </span>
              {nearest.name} — {formatDistance(distanceKm(location, nearest))},{" "}
              {estimateWalkTime(distanceKm(location, nearest))}
            </p>
          ) : (
            <p className="label-xs text-muted-foreground">
              {helpPoints.length} {t("cat.helpPointsCount")}
            </p>
          )}
        </div>
      </div>

      {/* Map fills remaining screen */}
      <div className="flex-1 relative">
        <CategoryMap
          helpPoints={sorted}
          userLat={location?.lat}
          userLng={location?.lng}
          catColor={cat?.color ?? "#25ab5a"}
          catEmoji={emoji}
          lang={lang}
        />
      </div>

      {/* Emergency call button */}
      {callPhone && (
        <div className="shrink-0 px-4 pt-3 pb-2" style={{ backgroundColor: callBg }}>
          <a
            href={`tel:${callPhone}`}
            className="no-underline flex items-center justify-center gap-3"
          >
            <span className="text-white text-xl">📞</span>
            <div className="text-center">
              <p className="label-small font-bold text-white">{callLabel}</p>
              <p className="label-xs text-white/80 font-semibold tracking-wide">
                {callPhone}
              </p>
            </div>
          </a>
        </div>
      )}
    </div>
  );
}
