import Link from "next/link";
import { Badge, Button } from "@izivar/ux";
import { PhoneIcon, LocationIcon, ChevronRightIcon } from "@izivar/ux";
import { formatDistance, estimateWalkTime } from "@/lib/geo";
import { CATEGORY_MAP } from "@/constants/categories";
import type { HelpPoint, HelpPointWithDistance } from "@/types";

interface HelpPointCardProps {
  helpPoint: HelpPoint | HelpPointWithDistance;
  language?: "en" | "ta";
}

function hasDistance(hp: HelpPoint | HelpPointWithDistance): hp is HelpPointWithDistance {
  return "distance" in hp;
}

export function HelpPointCard({ helpPoint, language = "en" }: HelpPointCardProps) {
  const cat = CATEGORY_MAP[helpPoint.category];
  const name = language === "ta" ? helpPoint.nameTamil : helpPoint.name;
  const address = language === "ta" ? helpPoint.addressTamil : helpPoint.address;
  const hours = language === "ta" ? helpPoint.hoursTamil : helpPoint.hours;
  const dist = hasDistance(helpPoint) ? helpPoint.distance : null;

  return (
    <Link
      href={`/location/${helpPoint.id}`}
      className="block bg-white border border-border rounded-xl p-4 hover:shadow-md transition-shadow active:scale-[0.99]"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          {/* Category icon dot */}
          <div
            className="mt-0.5 w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: cat.bgColor }}
          >
            <LocationIcon className="w-4 h-4" style={{ color: cat.color }} />
          </div>

          <div className="flex-1 min-w-0">
            <p className="title-small font-semibold text-foreground truncate">{name}</p>
            <p className="paragraph-small text-muted-foreground mt-0.5 line-clamp-1">{address}</p>

            <div className="flex items-center gap-3 mt-2">
              {dist !== null && (
                <span className="label-xs text-primary font-semibold">
                  {formatDistance(dist)} · {estimateWalkTime(dist)}
                </span>
              )}
              {hours && (
                <Badge variant="muted" size="sm">{hours}</Badge>
              )}
            </div>

            {helpPoint.phone && (
              <div className="flex items-center gap-1.5 mt-2">
                <PhoneIcon className="w-3.5 h-3.5 text-muted-foreground" />
                <span className="label-xs text-muted-foreground">{helpPoint.phone}</span>
              </div>
            )}
          </div>
        </div>

        <ChevronRightIcon className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-1" />
      </div>
    </Link>
  );
}

// Compact call card for location detail page
export function HelpPointCallCard({ helpPoint }: { helpPoint: HelpPoint }) {
  return (
    <div className="bg-white border border-border rounded-xl p-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="label-xs text-muted-foreground uppercase tracking-wide">Phone</p>
          <p className="title-medium font-semibold text-foreground mt-0.5">{helpPoint.phone}</p>
        </div>
        <Button asChild size="default">
          <a href={`tel:${helpPoint.phone}`}>Call</a>
        </Button>
      </div>
    </div>
  );
}
