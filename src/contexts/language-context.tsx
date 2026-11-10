"use client";

import { createContext, useContext, useCallback, useSyncExternalStore } from "react";
import type { Language } from "@/types";
import { DEFAULT_LANGUAGE } from "@/constants/languages";

interface LanguageContextValue {
  lang: Language;
  setLang: (lang: Language) => void;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

const STORAGE_KEY = "lang";

// Shared mutable state + listeners for useSyncExternalStore
let currentLang: Language = DEFAULT_LANGUAGE;
const listeners = new Set<() => void>();

function subscribe(onStoreChange: () => void) {
  listeners.add(onStoreChange);
  return () => listeners.delete(onStoreChange);
}

function getSnapshot(): Language {
  if (typeof window === "undefined") return DEFAULT_LANGUAGE;
  // Read from localStorage on first call
  if (currentLang === DEFAULT_LANGUAGE) {
    const stored = localStorage.getItem(STORAGE_KEY) as Language | null;
    if (stored) currentLang = stored;
  }
  return currentLang;
}

function getServerSnapshot(): Language {
  return DEFAULT_LANGUAGE;
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const lang = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const setLang = useCallback((newLang: Language) => {
    currentLang = newLang;
    localStorage.setItem(STORAGE_KEY, newLang);
    listeners.forEach((fn) => fn());
  }, []);

  return (
    <LanguageContext.Provider value={{ lang, setLang }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage(): LanguageContextValue {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within LanguageProvider");
  return ctx;
}
