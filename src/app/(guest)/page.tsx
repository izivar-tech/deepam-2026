"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@izivar/ux";
import { useTranslation } from "@/hooks/use-translation";

export default function SplashPage() {
  const { t } = useTranslation();

  return (
    <div className="relative min-h-screen flex flex-col">
      {/* Hero background */}
      <div className="absolute inset-0">
        <Image
          src="/Golden_Temple_Chariot_Sunset.png"
          alt="Tiruvannamalai Temple"
          fill
          className="object-cover object-bottom"
          priority
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to bottom, rgba(10,20,35,0.35) 0%, rgba(10,20,35,0.65) 60%, rgba(10,20,35,0.85) 100%)",
          }}
        />
      </div>

      {/* Language toggle */}
      <div className="relative z-10 flex justify-end p-4">
        <Link
          href="/language"
          className="text-xs font-semibold text-white bg-white/20 backdrop-blur-sm border border-white/30 rounded-full px-3 py-1.5 no-underline"
        >
          {t("splash.langToggle")}
        </Link>
      </div>

      {/* Center content */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 text-center">
        {/* Temple icon */}
        <div className="w-16 h-16 mb-4 rounded-full bg-accent-gold/20 border-2 border-accent-gold flex items-center justify-center">
          <span className="text-2xl">🪔</span>
        </div>

        <h1 className="headline-large font-bold text-white">
          {t("splash.title")}
        </h1>
        <p className="title-small text-white/70 mt-1">{t("splash.subtitle")}</p>
        <p className="paragraph-small text-white/50 mt-3">
          {t("splash.tagline")}
        </p>

        {/* CTA */}
        <div
          className="mt-10"
          style={{ "--color-primary": "var(--color-accent-gold)", "--color-primary-foreground": "var(--color-foreground)" } as React.CSSProperties}
        >
          <Button asChild size="lg" className="rounded-full px-10 py-4 text-base font-bold shadow-xl">
            <Link href="/services" className="no-underline">{t("splash.cta")}</Link>
          </Button>
        </div>
      </div>

      {/* Bottom brand */}
      <div className="relative z-10 flex items-center justify-center pb-6 pt-4">
        <span className="text-xs text-white/60">{t("splash.powered")}</span>
      </div>
    </div>
  );
}
