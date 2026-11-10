"use client";

import { useEffect, useRef } from "react";
import type { HelpPoint } from "@/types";
import type { Language } from "@/types";
import translations from "@/constants/translations";

const TEMPLE_LAT = 12.2304;
const TEMPLE_LNG = 79.0747;

interface Props {
  helpPoints: HelpPoint[];
  userLat?: number;
  userLng?: number;
  catColor: string;
  catEmoji: string;
  lang?: Language;
}

function t(lang: Language, key: string): string {
  return translations[lang]?.[key] ?? translations.en[key] ?? key;
}

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

async function fetchWalkingRoute(
  fromLat: number, fromLng: number,
  toLat: number, toLng: number,
): Promise<[number, number][]> {
  const url =
    `https://router.project-osrm.org/route/v1/walking/` +
    `${fromLng},${fromLat};${toLng},${toLat}?overview=full&geometries=geojson`;
  const res = await fetch(url);
  const json = await res.json();
  const coords = json.routes?.[0]?.geometry?.coordinates ?? [];
  return coords.map((c: [number, number]) => [c[1], c[0]] as [number, number]);
}

export default function CategoryMap({ helpPoints, userLat, userLng, catColor, catEmoji, lang = "en" }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<unknown>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    let cancelled = false;

    // Dynamic import — Leaflet needs `window`
    import("leaflet").then((L) => {
      if (cancelled || !containerRef.current) return;

      // Clean up previous map instance
      if (mapRef.current) {
        (mapRef.current as L.Map).remove();
        mapRef.current = null;
      }

      const centerLat = userLat ?? helpPoints[0]?.lat ?? TEMPLE_LAT;
      const centerLng = userLng ?? helpPoints[0]?.lng ?? TEMPLE_LNG;

      const map = L.map(containerRef.current!, {
        center: [centerLat, centerLng],
        zoom: 14,
        zoomControl: true,
        attributionControl: false,
        fadeAnimation: false,
        zoomAnimation: false,
        markerZoomAnimation: false,
      });

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
      }).addTo(map);

      mapRef.current = map;

      let routeLine: L.Polyline | null = null;
      const bounds = L.latLngBounds([]);

      // User location
      if (userLat && userLng) {
        const userIcon = L.divIcon({
          className: "",
          html: `<div style="width:18px;height:18px;border-radius:50%;background:#25ab5a;border:3px solid white;box-shadow:0 0 0 4px rgba(37,171,90,0.3);"></div>`,
          iconSize: [18, 18],
          iconAnchor: [9, 9],
        });
        L.marker([userLat, userLng], { icon: userIcon, zIndexOffset: 1000 })
          .addTo(map)
          .bindPopup(`<b style="color:#25ab5a">${t(lang, "map.youAreHere")}</b>`);
        bounds.extend([userLat, userLng]);
      }

      // Help point pins
      const pinIcon = L.divIcon({
        className: "",
        html: `<div style="width:40px;height:40px;border-radius:50%;background:${catColor};border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.3);display:flex;align-items:center;justify-content:center;font-size:18px;cursor:pointer;">${catEmoji}</div>`,
        iconSize: [40, 40],
        iconAnchor: [20, 20],
      });

      helpPoints.forEach((hp) => {
        const hpRecord = hp as unknown as Record<string, unknown>;
        const name = localize(hpRecord, "name", lang);
        const address = localize(hpRecord, "address", lang);
        const hours = localize(hpRecord, "hours", lang);

        let popupHtml = `<div style="min-width:200px;font-family:sans-serif;">`;
        popupHtml += `<b style="font-size:14px;display:block;margin-bottom:4px;">${name}</b>`;
        popupHtml += `<p style="color:#666;font-size:11px;margin:0 0 6px;">${address}</p>`;
        if (hours) {
          popupHtml += `<span style="background:#fef3c7;color:#92400e;font-size:10px;padding:2px 6px;border-radius:4px;">${t(lang, "map.hours")} ${hours}</span>`;
        }
        if (hp.phone) {
          popupHtml += `<a href="tel:${hp.phone}" style="display:block;margin-top:8px;padding:8px 12px;background:${catColor};color:white;border-radius:8px;text-align:center;font-weight:700;text-decoration:none;font-size:14px;">${t(lang, "map.call")} ${hp.phone}</a>`;
        }
        popupHtml += `</div>`;

        const marker = L.marker([hp.lat, hp.lng], { icon: pinIcon })
          .addTo(map)
          .bindPopup(popupHtml, { autoPan: false });

        marker.on("click", () => {
          if (!userLat || !userLng) return;
          if (routeLine) {
            map.removeLayer(routeLine);
            routeLine = null;
          }
          fetchWalkingRoute(userLat, userLng, hp.lat, hp.lng)
            .then((path) => {
              if (path.length > 0 && mapRef.current) {
                routeLine = L.polyline(path, {
                  color: "#25ab5a",
                  weight: 5,
                  opacity: 0.85,
                }).addTo(map);
                // Close popup so route is visible
                setTimeout(() => {
                  if (!mapRef.current) return;
                  map.closePopup();
                  try {
                    if (routeLine) {
                      map.fitBounds(routeLine.getBounds(), { padding: [50, 50], animate: false });
                    }
                  } catch {
                    // Leaflet DOM timing issue — safe to ignore
                  }
                }, 1500);
              }
            })
            .catch(() => {});
        });

        bounds.extend([hp.lat, hp.lng]);
      });

      if (bounds.isValid()) {
        map.fitBounds(bounds, { padding: [40, 40], maxZoom: 16 });
      }
    });

    return () => {
      cancelled = true;
      if (mapRef.current) {
        (mapRef.current as { remove: () => void }).remove();
        mapRef.current = null;
      }
    };
  }, [helpPoints, userLat, userLng, catColor, catEmoji, lang]);

  return <div ref={containerRef} style={{ width: "100%", height: "100%" }} />;
}
