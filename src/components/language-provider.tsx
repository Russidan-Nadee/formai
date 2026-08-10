"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { defaultLocale, dictionaries, locales, type Dictionary, type Locale } from "@/lib/i18n";

const STORAGE_KEY = "formai-locale";

type LanguageContextValue = {
  locale: Locale;
  t: Dictionary;
  setLocale: (locale: Locale) => void;
  toggleLocale: () => void;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocale] = useState<Locale>(defaultLocale);

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored && locales.includes(stored as Locale)) {
      // Deliberately deferred past mount: reading localStorage during render
      // would mismatch the server-rendered defaultLocale and trigger a
      // hydration error.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLocale(stored as Locale);
    }
  }, []);

  useEffect(() => {
    document.documentElement.lang = locale;
    window.localStorage.setItem(STORAGE_KEY, locale);
  }, [locale]);

  const toggleLocale = () => setLocale((current) => (current === "en" ? "th" : "en"));

  return (
    <LanguageContext.Provider value={{ locale, t: dictionaries[locale], setLocale, toggleLocale }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
