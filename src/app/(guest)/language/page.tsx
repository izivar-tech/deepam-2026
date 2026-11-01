"use client";

import { useRouter } from "next/navigation";
import { Button } from "@izivar/ux";
import { useLanguage } from "@/contexts/language-context";
import { useTranslation } from "@/hooks/use-translation";
import { LANGUAGES } from "@/constants/languages";

export default function LanguagePage() {
  const router = useRouter();
  const { lang, setLang } = useLanguage();
  const { t } = useTranslation();

  function handleContinue() {
    router.push("/services");
  }

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Header */}
      <div className="px-5 pt-10 pb-6">
        <h1 className="headline-medium font-bold text-foreground">
          {t("lang.title")}
        </h1>
        <p className="paragraph-medium text-muted-foreground mt-1">
          {t("lang.subtitle")}
        </p>
      </div>

      {/* Language list */}
      <div className="flex-1 px-4 space-y-2">
        {LANGUAGES.map((l) => {
          const isSelected = lang === l.code;
          return (
            <button
              key={l.code}
              onClick={() => setLang(l.code)}
              className={`w-full flex items-center justify-between px-4 py-4 rounded-xl border-2 transition-all ${
                isSelected
                  ? "border-primary bg-primary/5"
                  : "border-border bg-white hover:border-primary/40"
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-xl">{l.flag}</span>
                <span
                  className={`title-small font-semibold ${
                    isSelected ? "text-primary" : "text-foreground"
                  }`}
                >
                  {l.label}
                </span>
              </div>
              <div
                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                  isSelected ? "border-primary" : "border-border"
                }`}
              >
                {isSelected && (
                  <div className="w-2.5 h-2.5 rounded-full bg-primary" />
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Continue button */}
      <div className="p-4 pb-8">
        <Button onClick={handleContinue} className="w-full" size="lg">
          {t("lang.continue")}
        </Button>
      </div>
    </div>
  );
}
