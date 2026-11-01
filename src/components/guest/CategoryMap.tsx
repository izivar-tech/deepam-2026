"use client";

import { useEffect, useRef } from "react";
import { importLibrary, setOptions } from "@googlemaps/js-api-loader";
import translations from "@/constants/translations";
import type { HelpPoint } from "@/types";
import type { Language } from "@/types";

const TEMPLE_LAT = 12.2304;
const TEMPLE_LNG = 79.0747;
const MAP_ID = process.env.NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID!;

setOptions({ key: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!, v: "weekly", mapIds: [MAP_ID] });

interface Props {
  helpPoints: HelpPoint[];
  userLat?: number;
  userLng?: number;
  catColor: string;
  catEmoji: string;
  lang?: Language;
}

/** Simple translation lookup for map component (no hook — not reactive) */
function t(lang: Language, key: string): string {
  return translations[lang]?.[key] ?? translations.en[key] ?? key;
}

/** Pick localized field from a data object */
function localize(obj: Record<string, unknown>, field: string, lang: Language): string {
  const suffix: Record<Language, string> = { en: "", ta: "Tamil", hi: "Hindi", te: "Telugu", kn: "Kannada", ml: "Malayalam" };
  const s = suffix[lang];
  if (s) {
    const val = obj[`${field}${s}`];
    if (typeof val === "string" && val) return val;
  }
  const val = obj[field];
  return typeof val === "string" ? val : "";
}

/** Fetch walking route from OSRM (free, no API key needed) */
async function fetchWalkingRoute(
  fromLat: number, fromLng: number,
  toLat: number, toLng: number,
): Promise<google.maps.LatLngLiteral[]> {
  const url =
    `https://router.project-osrm.org/route/v1/walking/` +
    `${fromLng},${fromLat};${toLng},${toLat}?overview=full&geometries=geojson`;
  const res = await fetch(url);
  const json = await res.json();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (json.routes?.[0]?.geometry?.coordinates ?? []).map((c: any) => ({
    lat: c[1] as number,
    lng: c[0] as number,
  }));
}

export default function CategoryMap({ helpPoints, userLat, userLng, catColor, catEmoji, lang = "en" }: Props) {
  const mapRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mapInstanceRef = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const markersRef = useRef<any[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const infoWindowRef = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const routeLineRef = useRef<any>(null);

  // ── Init map once ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;
    let cancelled = false;

    importLibrary("maps").then((lib) => {
      if (cancelled || !mapRef.current || mapInstanceRef.current) return;
      const { Map, InfoWindow, Polyline } = lib as google.maps.MapsLibrary;

      const map = new Map(mapRef.current, {
        center: { lat: userLat ?? TEMPLE_LAT, lng: userLng ?? TEMPLE_LNG },
        zoom: 14,
        mapId: MAP_ID,
        zoomControl: true,
        streetViewControl: false,
        mapTypeControl: false,
        fullscreenControl: false,
      });

      mapInstanceRef.current = map;
      infoWindowRef.current = new InfoWindow();

      routeLineRef.current = new Polyline({
        map,
        path: [],
        strokeColor: "#25ab5a",
        strokeWeight: 5,
        strokeOpacity: 0.85,
      });
    });

    return () => {
      cancelled = true;
      markersRef.current.forEach((m) => (m.map = null));
      markersRef.current = [];
      routeLineRef.current?.setMap(null);
      mapInstanceRef.current = null;
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Update markers when data / location changes ───────────────────────────
  useEffect(() => {
    if (!mapInstanceRef.current) {
      const timer = setTimeout(() => { if (mapInstanceRef.current) updateMarkers(); }, 600);
      return () => clearTimeout(timer);
    }
    updateMarkers();

    function updateMarkers() {
      const map = mapInstanceRef.current;
      if (!map) return;

      importLibrary("marker").then((lib) => {
        if (!mapInstanceRef.current) return;
        const { AdvancedMarkerElement } = lib as google.maps.MarkerLibrary;

        // Clear markers + route
        markersRef.current.forEach((m) => (m.map = null));
        markersRef.current = [];
        routeLineRef.current?.setPath([]);

        const bounds = new google.maps.LatLngBounds();

        // YOU ARE HERE
        if (userLat && userLng) {
          const wrapper = document.createElement("div");
          Object.assign(wrapper.style, { display: "flex", flexDirection: "column", alignItems: "center", filter: "drop-shadow(0 2px 6px rgba(0,0,0,0.4))" });
          const label = document.createElement("div");
          label.textContent = t(lang, "map.youAreHere");
          Object.assign(label.style, { background: "#25ab5a", color: "white", fontWeight: "700", fontSize: "13px", padding: "5px 12px", borderRadius: "20px", whiteSpace: "nowrap", border: "2px solid white" });
          const caret = document.createElement("div");
          Object.assign(caret.style, { width: "0", height: "0", borderLeft: "8px solid transparent", borderRight: "8px solid transparent", borderTop: "10px solid #25ab5a" });
          wrapper.appendChild(label);
          wrapper.appendChild(caret);
          markersRef.current.push(new AdvancedMarkerElement({ map, position: { lat: userLat, lng: userLng }, content: wrapper, zIndex: 999 }));
          bounds.extend({ lat: userLat, lng: userLng });
        }

        // Help point pins
        helpPoints.forEach((hp) => {
          const pin = document.createElement("div");
          Object.assign(pin.style, { width: "40px", height: "40px", borderRadius: "50%", background: catColor, border: "3px solid white", boxShadow: "0 2px 8px rgba(0,0,0,0.3)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px", cursor: "pointer" });
          pin.textContent = catEmoji;

          const hpRecord = hp as unknown as Record<string, unknown>;
          const marker = new AdvancedMarkerElement({ map, position: { lat: hp.lat, lng: hp.lng }, content: pin, title: localize(hpRecord, "name", lang) });

          marker.addListener("click", () => {
            infoWindowRef.current?.setContent(buildPopup(hp, catColor, lang));
            infoWindowRef.current?.open({ anchor: marker, map });

            if (userLat && userLng) {
              fetchWalkingRoute(userLat, userLng, hp.lat, hp.lng)
                .then((path) => routeLineRef.current?.setPath(path))
                .catch(() => {/* silent */});
            }
          });

          markersRef.current.push(marker);
          bounds.extend({ lat: hp.lat, lng: hp.lng });
        });

        // Fit bounds
        if (!bounds.isEmpty()) {
          map.fitBounds(bounds, 56);
          google.maps.event.addListenerOnce(map, "idle", () => {
            if ((map.getZoom() ?? 0) > 16) map.setZoom(16);
          });
        }
      });
    }
  }, [helpPoints, userLat, userLng, catColor, catEmoji, lang]);

  return <div ref={mapRef} style={{ width: "100%", height: "100%" }} />;
}

function buildPopup(hp: HelpPoint, catColor: string, lang: Language): HTMLElement {
  const hpRecord = hp as unknown as Record<string, unknown>;
  const popup = document.createElement("div");
  popup.style.cssText = "min-width:220px;font-family:sans-serif;";

  const name = document.createElement("b");
  name.textContent = localize(hpRecord, "name", lang);
  name.style.cssText = "font-size:15px;display:block;margin-bottom:4px;";

  const addr = document.createElement("p");
  addr.textContent = localize(hpRecord, "address", lang);
  addr.style.cssText = "color:#555;font-size:12px;margin:0 0 6px;";

  const hours = document.createElement("span");
  hours.textContent = `${t(lang, "map.hours")} ${localize(hpRecord, "hours", lang)}`;
  hours.style.cssText = "background:#fef3c7;color:#92400e;font-size:11px;padding:2px 8px;border-radius:4px;";

  popup.appendChild(name);
  popup.appendChild(addr);
  popup.appendChild(hours);

  if (hp.phone) {
    const callBtn = document.createElement("a");
    callBtn.href = `tel:${hp.phone}`;
    callBtn.textContent = `${t(lang, "map.call")} ${hp.phone}`;
    callBtn.style.cssText = `display:block;margin-top:8px;padding:8px 12px;background:${catColor};color:white;border-radius:8px;text-align:center;font-weight:700;text-decoration:none;font-size:14px;`;
    popup.appendChild(callBtn);
  }

  return popup;
}
