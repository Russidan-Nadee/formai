"use client";

import { useLanguage } from "@/components/language-provider";

export function LanguageToggle() {
  const { locale, toggleLocale } = useLanguage();

  return (
    <button
      type="button"
      onClick={toggleLocale}
      className="font-mono text-sm uppercase tracking-widest text-muted-foreground transition-colors hover:text-foreground"
    >
      {locale === "en" ? "TH" : "EN"}
    </button>
  );
}
