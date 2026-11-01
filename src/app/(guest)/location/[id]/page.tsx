"use client";

import { use, useEffect, useState } from "react";
import { fetchHelpPointById } from "@/services/help-point-service";
import { PageHeader } from "@/components/guest/PageHeader";
import { BottomBrand } from "@/components/guest/BottomBrand";
import { Button, Badge } from "@izivar/ux";
import { PhoneIcon, LocationIcon, ClockIcon, ExternalLinkIcon, AlertCircleIcon } from "@izivar/ux";
import { CATEGORY_MAP } from "@/constants/categories";
import type { HelpPoint } from "@/types";

export default function LocationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [helpPoint, setHelpPoint] = useState<HelpPoint | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHelpPointById(id)
      .then(setHelpPoint)
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-muted">
        <div className="h-14 bg-white border-b border-border animate-pulse" />
        <div className="p-4 space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl h-20 animate-pulse border border-border" />
          ))}
        </div>
      </div>
    );
  }

  if (!helpPoint) {
    return (
      <div className="min-h-screen bg-muted flex flex-col">
        <PageHeader title="Not Found" />
        <div className="flex-1 flex items-center justify-center">
          <p className="paragraph-medium text-muted-foreground">Help point not found.</p>
        </div>
      </div>
    );
  }

  const cat = CATEGORY_MAP[helpPoint.category];
  const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${helpPoint.lat},${helpPoint.lng}`;

  return (
    <div className="min-h-screen flex flex-col bg-muted">
      <PageHeader
        title={helpPoint.name}
        backHref={`/services/${helpPoint.category}`}
      />

      {/* Map preview placeholder */}
      <div
        className="relative h-44 flex items-center justify-center"
        style={{ backgroundColor: cat?.bgColor ?? "#f0f0f0" }}
      >
        <div className="text-center">
          <span className="text-4xl">{getCategoryEmoji(helpPoint.category)}</span>
          <p className="label-small font-semibold mt-2" style={{ color: cat?.color }}>
            {helpPoint.name}
          </p>
          {/* Mapbox map will go here — lazy loaded */}
        </div>

        {/* Status badge */}
        <div className="absolute top-3 right-3">
          <Badge variant="success" size="sm">Active</Badge>
        </div>
      </div>

      {/* Detail cards */}
      <div className="flex-1 px-4 py-4 space-y-3">

        {/* Address */}
        <div className="bg-white border border-border rounded-xl p-4">
          <div className="flex items-start gap-3">
            <LocationIcon className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
            <div>
              <p className="label-xs text-muted-foreground uppercase tracking-wide">Address</p>
              <p className="paragraph-medium text-foreground mt-0.5">{helpPoint.address}</p>
              {helpPoint.addressTamil && (
                <p className="paragraph-small text-muted-foreground mt-0.5">{helpPoint.addressTamil}</p>
              )}
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
                  <p className="label-xs text-muted-foreground uppercase tracking-wide">Phone</p>
                  <p className="title-small font-semibold text-foreground mt-0.5">
                    {helpPoint.phone}
                  </p>
                </div>
              </div>
              <Button asChild size="sm">
                <a href={`tel:${helpPoint.phone}`}>
                  <PhoneIcon className="w-4 h-4 mr-1" />
                  Call
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
              <p className="label-xs text-muted-foreground uppercase tracking-wide">Hours</p>
              <p className="paragraph-medium text-foreground mt-0.5">{helpPoint.hours}</p>
              {helpPoint.hoursTamil && (
                <p className="paragraph-small text-muted-foreground mt-0.5">{helpPoint.hoursTamil}</p>
              )}
            </div>
          </div>
        </div>

        {/* Directions */}
        <Button asChild variant="outline" className="w-full">
          <a href={mapsUrl} target="_blank" rel="noopener noreferrer">
            <ExternalLinkIcon className="w-4 h-4 mr-2" />
            Open in Maps
          </a>
        </Button>

        {/* Report issue */}
        <button className="w-full flex items-center justify-center gap-2 py-3 text-muted-foreground hover:text-foreground transition-colors">
          <AlertCircleIcon className="w-4 h-4" />
          <span className="label-small">Report an Issue</span>
        </button>
      </div>

      <div className="border-t border-border">
        <BottomBrand />
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
