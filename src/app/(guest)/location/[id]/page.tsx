"use client";

import { use } from "react";
import { getHelpPointById } from "@/services/help-point-service";
import { useTranslation } from "@/hooks/use-translation";
import { PageHeader } from "@/components/guest/PageHeader";
import { BottomBrand } from "@/components/guest/BottomBrand";
import { Button, Badge } from "@izivar/ux";
import { PhoneIcon, LocationIcon, ClockIcon, ExternalLinkIcon, AlertCircleIcon } from "@izivar/ux";
import { CATEGORY_MAP } from "@/constants/categories";
import { logPhoneCall } from "@/services/qr-scan-service";

const CATEGORY_EMOJI: Record<string, string> = {
  police: "🛡️", medical: "🏥", toilet: "🚻",
  water: "💧", hotel: "🏨", helpdesk: "❓",
  parking: "🅿️", "bus-stand": "🚌", "bike-ambulance": "🏍️",
};

export default function LocationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { t, localize } = useTranslation();
  const helpPoint = getHelpPointById(id);

  if (!helpPoint) {
    return (
      <div className="min-h-screen bg-muted flex flex-col">
        <PageHeader title={t("cat.notFound") ?? "Not Found"} />
        <div className="flex-1 flex items-center justify-center">
          <p className="paragraph-medium text-muted-foreground">Help point not found.</p>
        </div>
      </div>
    );
  }

  const cat = CATEGORY_MAP[helpPoint.category];
  const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${helpPoint.lat},${helpPoint.lng}`;
  const hpRecord = helpPoint as unknown as Record<string, unknown>;

  return (
    <div className="min-h-screen flex flex-col bg-muted">
      <PageHeader
        title={localize(hpRecord, "name")}
        backHref={`/services/${helpPoint.category}`}
      />

      {/* Category header */}
      <div
        className="relative h-36 flex items-center justify-center"
        style={{ backgroundColor: cat?.bgColor ?? "#f0f0f0" }}
      >
        <div className="text-center">
          <span className="text-4xl">{CATEGORY_EMOJI[helpPoint.category] ?? "📍"}</span>
          <p className="label-small font-semibold mt-2" style={{ color: cat?.color }}>
            {localize(hpRecord, "name")}
          </p>
        </div>
        <div className="absolute top-3 right-3">
          <Badge variant="success" size="sm">{t("cat.active") ?? "Active"}</Badge>
        </div>
      </div>

      {/* Detail cards */}
      <div className="flex-1 px-4 py-4 space-y-3">
        {/* Address */}
        <div className="bg-white border border-border rounded-xl p-4">
          <div className="flex items-start gap-3">
            <LocationIcon className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
            <div>
              <p className="label-xs text-muted-foreground uppercase tracking-wide">{t("cat.address") ?? "Address"}</p>
              <p className="paragraph-medium text-foreground mt-0.5">{localize(hpRecord, "address")}</p>
            </div>
          </div>
        </div>

        {/* Phone */}
        {helpPoint.phone && (
          <div className="bg-white border border-border rounded-xl p-4">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <PhoneIcon className="w-5 h-5 text-primary flex-shrink-0" />
                <div>
                  <p className="label-xs text-muted-foreground uppercase tracking-wide">{t("cat.phone") ?? "Phone"}</p>
                  <p className="title-small font-semibold text-foreground mt-0.5">
                    {helpPoint.phone}
                  </p>
                </div>
              </div>
              <Button asChild size="sm">
                <a
                  href={`tel:${helpPoint.phone}`}
                  onClick={() => logPhoneCall(helpPoint.phone, helpPoint.category)}
                >
                  <PhoneIcon className="w-4 h-4 mr-1" />
                  {t("cat.call") ?? "Call"}
                </a>
              </Button>
            </div>
          </div>
        )}

        {/* Hours */}
        <div className="bg-white border border-border rounded-xl p-4">
          <div className="flex items-center gap-3">
            <ClockIcon className="w-5 h-5 text-primary flex-shrink-0" />
            <div>
              <p className="label-xs text-muted-foreground uppercase tracking-wide">{t("cat.hours") ?? "Hours"}</p>
              <p className="paragraph-medium text-foreground mt-0.5">{localize(hpRecord, "hours")}</p>
            </div>
          </div>
        </div>

        {/* Directions */}
        <Button asChild variant="outline" className="w-full">
          <a href={mapsUrl} target="_blank" rel="noopener noreferrer">
            <ExternalLinkIcon className="w-4 h-4 mr-2" />
            {t("cat.openMaps") ?? "Open in Maps"}
          </a>
        </Button>

        {/* Report issue */}
        <button className="w-full flex items-center justify-center gap-2 py-3 text-muted-foreground hover:text-foreground transition-colors">
          <AlertCircleIcon className="w-4 h-4" />
          <span className="label-small">{t("cat.reportIssue") ?? "Report an Issue"}</span>
        </button>
      </div>

      <div className="border-t border-border">
        <BottomBrand />
      </div>
    </div>
  );
}
