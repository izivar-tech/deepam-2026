"use client";

import { useCallback } from "react";
import { useLanguage } from "@/contexts/language-context";
import translations from "@/constants/translations";
import type { Language } from "@/types";

/**
 * Returns a `t()` function that resolves UI string keys for the current language.
 * Falls back to English if a key is missing in the selected language.
 *
 * Also returns `lang` and `localize()` for data field resolution.
 */
export function useTranslation() {
  const { lang, setLang } = useLanguage();

  const t = useCallback(
    (key: string): string => {
      return translations[lang]?.[key] ?? translations.en[key] ?? key;
    },
    [lang],
  );

  /**
   * Pick the right field from a data object based on language.
   * e.g. localize(helpPoint, "name") → helpPoint.nameTamil when lang=ta, else helpPoint.name
   */
  const localize = useCallback(
    <T extends Record<string, unknown>>(obj: T, field: string): string => {
      const suffix = LANG_SUFFIX[lang];
      if (suffix) {
        const localizedField = `${field}${suffix}`;
        const val = obj[localizedField];
        if (typeof val === "string" && val) return val;
      }
      // Fallback to base field (English)
      const val = obj[field];
      return typeof val === "string" ? val : "";
    },
    [lang],
  );

  return { t, lang, setLang, localize };
}

/** Maps language code to the suffix used in data objects (e.g. nameTamil) */
const LANG_SUFFIX: Record<Language, string> = {
  en: "",
  ta: "Tamil",
  hi: "Hindi",
  te: "Telugu",
  kn: "Kannada",
  ml: "Malayalam",
};
