"use client";

import { useRef, useSyncExternalStore } from "react";
import Link from "next/link";
import Image from "next/image";
import { useEventContext } from "@/contexts/event-context";
import { useTranslation } from "@/hooks/use-translation";
import { CATEGORIES } from "@/constants/categories";
import { LANGUAGES } from "@/constants/languages";
import { BottomBrand } from "@/components/guest/BottomBrand";

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

// Deepam lighting: Nov 24 2026, 6:00 PM IST (UTC+5:30)
const DEEPAM_TIME = new Date("2026-11-24T18:00:00+05:30").getTime();

function useCountdown(target: number) {
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const now = useSyncExternalStore(
    (onStoreChange) => {
      intervalRef.current = setInterval(onStoreChange, 1000);
      return () => {
        if (intervalRef.current) clearInterval(intervalRef.current);
      };
    },
    () => Date.now(),       // client
    () => target,           // server — renders "00:00:00" (no mismatch)
  );

  const diff = Math.max(0, target - now);
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const mins = Math.floor((diff / (1000 * 60)) % 60);
  const secs = Math.floor((diff / 1000) % 60);
  const mounted = now !== target;

  return { days, hours, mins, secs, isLive: diff === 0, mounted };
}

export default function ServicesPage() {
  const { event } = useEventContext();
  const { t, lang } = useTranslation();
  const countdown = useCountdown(DEEPAM_TIME);

  const langMeta = LANGUAGES.find((l) => l.code === lang);

  const activeCategories = event
    ? CATEGORIES.filter((c) => event.categories.includes(c.id))
    : CATEGORIES;

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Hero banner */}
      <div
        className="relative px-5 pt-8 pb-6"
        style={{
          background: "linear-gradient(135deg, #192b3d 0%, #1e3a5f 100%)",
        }}
      >
        {/* Top bar */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="text-lg">🪔</span>
            <div>
              <p className="label-xs text-white/60 uppercase tracking-wider">
                {t("services.festivalLabel")}
              </p>
              <p className="label-small font-bold text-white">
                {t("services.helpCenter")}
              </p>
            </div>
          </div>
          <Link
            href="/language"
            className="text-xs font-semibold text-white/80 bg-white/10 rounded-full px-3 py-1 no-underline"
          >
            {langMeta?.label ?? "EN"}
          </Link>
        </div>

        {/* Welcome */}
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/10">
          <p className="headline-small font-bold text-white">
            {t("services.welcome")}{" "}
            <span className="text-accent-gold">{t("services.city")}</span>
          </p>
          <p className="paragraph-small text-white/70 mt-1">
            {t("services.safetyMsg")}
          </p>
        </div>
      </div>

      {/* Deepam countdown card */}
      <div className="mx-4 mt-4 rounded-2xl overflow-hidden p-4" style={{ background: "linear-gradient(135deg, #192b3d 0%, #1e3a5f 100%)" }}>
        <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-accent-gold">
          🪔 {t("services.deepamTitle")}
        </p>
        <p className="text-xs text-white/60 mt-0.5">
          {t("services.deepamDate")}
        </p>

        {!countdown.mounted ? (
          <div className="flex gap-2 mt-3">
            {[t("services.days"), t("services.hours"), t("services.mins"), t("services.secs")].map((label) => (
              <div key={label} className="text-center">
                <div className="bg-white/10 rounded-lg px-2.5 py-1.5 min-w-[36px]">
                  <p className="text-lg font-bold text-white leading-none">--</p>
                </div>
                <p className="text-[9px] text-white/50 mt-1 font-semibold">{label}</p>
              </div>
            ))}
          </div>
        ) : countdown.isLive ? (
          <p className="title-small font-bold text-accent-gold mt-3 animate-pulse">
            {t("services.deepamLive")}
          </p>
        ) : (
          <div className="flex gap-2 mt-3">
            {[
              { val: countdown.days, label: t("services.days") },
              { val: countdown.hours, label: t("services.hours") },
              { val: countdown.mins, label: t("services.mins") },
              { val: countdown.secs, label: t("services.secs") },
            ].map((item) => (
              <div key={item.label} className="text-center">
                <div className="bg-white/10 rounded-lg px-2.5 py-1.5 min-w-[36px]">
                  <p className="text-lg font-bold text-white leading-none">
                    {String(item.val).padStart(2, "0")}
                  </p>
                </div>
                <p className="text-[9px] text-white/50 mt-1 font-semibold">
                  {item.label}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 px-4 pt-4 pb-4">
        <div className="grid grid-cols-3 gap-3">
          {activeCategories.map((cat) => (
            <Link
              key={cat.id}
              href={`/services/${cat.id}`}
              className="bg-[#faf9f6] rounded-2xl p-3 border border-[#ede9e0] hover:shadow-md active:scale-[0.97] transition-all flex flex-col items-center gap-2 text-center no-underline relative"
            >
              <div
                className="w-11 h-11 rounded-full flex items-center justify-center"
                style={{ backgroundColor: cat.bgColor }}
              >
                <span className="text-xl">{CATEGORY_EMOJI[cat.id]}</span>
              </div>
              <p className="label-xs font-semibold text-foreground leading-tight normal-case">
                {t(`cat.${cat.id}`)}
              </p>
              {/* TODO: Uncomment when Tavix hotel booking is ready for Deepam */}
              {/* {cat.id === "hotel" && (
                <span className="absolute top-2 right-2 text-[9px] font-bold text-primary bg-primary/10 rounded-full px-1.5 py-0.5 leading-none">
                  Tavix
                </span>
              )} */}
            </Link>
          ))}
        </div>

        {/* TODO: Uncomment when announcements are ready */}
        {/* {event && event.announcements.length > 0 && (
          <div className="mt-5">
            <p className="label-small font-bold text-foreground mb-2.5 normal-case">
              {t("services.announcements")}
            </p>
            <div className="space-y-2.5">
              {event.announcements.map((ann) => (
                <div
                  key={ann.id}
                  className={`rounded-xl p-3.5 border ${
                    ann.priority === "high" || ann.priority === "urgent"
                      ? "bg-red-50 border-red-200"
                      : "bg-amber-50 border-amber-200"
                  }`}
                >
                  <div className="flex items-start gap-2.5">
                    <span className="text-base mt-0.5">
                      {ann.priority === "high" || ann.priority === "urgent" ? "🔴" : "📢"}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="label-small font-bold text-foreground leading-snug normal-case">
                        {lang === "ta" && ann.titleTamil ? ann.titleTamil : ann.title}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                        {lang === "ta" && ann.bodyTamil ? ann.bodyTamil : ann.body}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )} */}
      </div>

      {/* Tavix promo card — pinned to bottom */}
      <div className="px-4 pb-2">
        <a
          href="https://tavix.in"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-4 rounded-2xl border border-[#ede9e0] bg-[#faf9f6] px-5 py-4 no-underline"
        >
          {/* Logo */}
          <div className="shrink-0">
            <Image
              src="/Tavix_Primary.png"
              alt="Tavix"
              width={48}
              height={48}
            />
          </div>

          {/* Text */}
          <div className="flex-1 min-w-0">
            <p className="text-base font-bold" style={{ color: "#192b3d" }}>
              Tavix
            </p>
            <p className="text-xs text-muted-foreground mt-0.5 leading-snug">
              Home, Anywhere You Go.
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Tiruvannamalai&apos;s hotel booking app
            </p>
          </div>

          {/* Arrow */}
          <div className="shrink-0 w-8 h-8 rounded-full bg-[#192b3d]/10 flex items-center justify-center">
            <span className="text-sm" style={{ color: "#192b3d" }}>&#8250;</span>
          </div>
        </a>
      </div>

      {/* Brand */}
      <div className="px-4 border-t border-[#ede9e0]">
        <BottomBrand />
      </div>
    </div>
  );
}
