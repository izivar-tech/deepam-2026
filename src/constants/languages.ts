import type { Language } from "@/types";

export interface LanguageMeta {
  code: Language;
  label: string; // native script
  labelEnglish: string;
  flag: string; // emoji flag
}

export const LANGUAGES: LanguageMeta[] = [
  { code: "en", label: "English", labelEnglish: "English", flag: "🇬🇧" },
  { code: "ta", label: "தமிழ்", labelEnglish: "Tamil", flag: "🇮🇳" },
  { code: "hi", label: "हिन्दी", labelEnglish: "Hindi", flag: "🇮🇳" },
  { code: "te", label: "తెలుగు", labelEnglish: "Telugu", flag: "🇮🇳" },
  { code: "kn", label: "ಕನ್ನಡ", labelEnglish: "Kannada", flag: "🇮🇳" },
  { code: "ml", label: "മലയാളം", labelEnglish: "Malayalam", flag: "🇮🇳" },
];

export const DEFAULT_LANGUAGE: Language = "en";
