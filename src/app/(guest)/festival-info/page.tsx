"use client";

import { useEventContext } from "@/contexts/event-context";
import { PageHeader } from "@/components/guest/PageHeader";
import { BottomBrand } from "@/components/guest/BottomBrand";
import { Badge } from "@izivar/ux";
import { PhoneIcon, AlertCircleIcon } from "@izivar/ux";

export default function FestivalInfoPage() {
  const { event, loading } = useEventContext();

  const INFO_SECTIONS = [
    { icon: "🚦", label: "Route & Traffic Updates", sublabel: "Diversions, road closures", href: "#traffic" },
    { icon: "🅿️", label: "Parking Areas", sublabel: "Nearby parking locations", href: "#parking" },
    { icon: "🚌", label: "Bus Stands", sublabel: "Temporary bus services", href: "#bus" },
    { icon: "📢", label: "General Announcements", sublabel: "Important updates", href: "#announcements" },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-muted">
      <PageHeader title="Festival Information" backHref="/services" />

      {/* Banner */}
      <div
        className="px-4 py-5"
        style={{ background: "linear-gradient(135deg, #192b3d 0%, #1e3a5f 100%)" }}
      >
        <div className="flex items-center gap-3">
          <span className="text-3xl">🪔</span>
          <div>
            <p className="title-medium font-bold text-white">
              {event?.name ?? "Karthigai Deepam 2026"}
            </p>
            <p className="label-small text-white/60">
              {event?.date ? `Festival Date: ${event.date}` : "Important Information"}
            </p>
          </div>
        </div>
      </div>

      <div className="flex-1 px-4 py-4 space-y-3">

        {/* Emergency contacts — always visible */}
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <AlertCircleIcon className="w-5 h-5 text-red-600" />
            <p className="label-small font-bold text-red-700">Emergency Contacts</p>
          </div>
          <div className="space-y-2">
            {(event?.emergencyContacts ?? DEFAULT_EMERGENCY).map((contact, i) => (
              <a
                key={i}
                href={`tel:${contact.phone}`}
                className="flex items-center justify-between py-2 border-b border-red-100 last:border-0"
              >
                <div>
                  <p className="label-small font-semibold text-foreground">{contact.label}</p>
                  <p className="paragraph-small text-muted-foreground">{contact.description}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="title-medium font-bold text-red-600">{contact.phone}</span>
                  <PhoneIcon className="w-4 h-4 text-red-600" />
                </div>
              </a>
            ))}
          </div>
        </div>

        {/* Announcements from event */}
        {!loading && event?.announcements && event.announcements.length > 0 && (
          <div className="space-y-2">
            <p className="label-xs text-muted-foreground uppercase tracking-wide px-1">
              Announcements
            </p>
            {event.announcements.map((ann) => (
              <div
                key={ann.id}
                className={`bg-white border rounded-xl p-4 ${
                  ann.priority === "urgent"
                    ? "border-warning/40 bg-warning/5"
                    : "border-border"
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="label-small font-semibold text-foreground">{ann.title}</p>
                  {ann.priority === "urgent" && (
                    <Badge variant="warning" size="sm">Urgent</Badge>
                  )}
                </div>
                <p className="paragraph-small text-muted-foreground mt-1">{ann.body}</p>
              </div>
            ))}
          </div>
        )}

        {/* Info sections */}
        <p className="label-xs text-muted-foreground uppercase tracking-wide px-1 pt-1">
          Information
        </p>
        {INFO_SECTIONS.map((section) => (
          <div
            key={section.href}
            className="bg-white border border-border rounded-xl px-4 py-3 flex items-center gap-3"
          >
            <span className="text-xl">{section.icon}</span>
            <div className="flex-1">
              <p className="label-small font-semibold text-foreground">{section.label}</p>
              <p className="paragraph-small text-muted-foreground">{section.sublabel}</p>
            </div>
            <span className="text-muted-foreground text-sm">›</span>
          </div>
        ))}

        {/* In case of emergency notice */}
        <div className="bg-muted border border-border rounded-xl px-4 py-3 text-center">
          <p className="paragraph-small text-muted-foreground">
            In case of emergency, call{" "}
            <a href="tel:112" className="font-bold text-foreground">112</a> (Police) or{" "}
            <a href="tel:108" className="font-bold text-foreground">108</a> (Ambulance).
          </p>
        </div>
      </div>

      <div className="border-t border-border">
        <BottomBrand />
      </div>
    </div>
  );
}

const DEFAULT_EMERGENCY = [
  { label: "Police", phone: "112", description: "Emergency police", labelTamil: "காவல்", descriptionTamil: "அவசர காவல்" },
  { label: "Ambulance", phone: "108", description: "Emergency medical", labelTamil: "ஆம்புலன்ஸ்", descriptionTamil: "அவசர மருத்துவம்" },
];
