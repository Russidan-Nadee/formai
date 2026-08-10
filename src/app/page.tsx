"use client";

import { LanguageToggle } from "@/components/language-toggle";
import { useLanguage } from "@/components/language-provider";

export default function Home() {
  const { t, locale } = useLanguage();

  return (
    <div className="flex flex-1 flex-col bg-background text-foreground">
      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col justify-center gap-10 px-8 py-24">
        <div className="flex items-center justify-between">
          <span className="font-mono text-sm uppercase tracking-widest text-muted-foreground">
            {t.kicker}
          </span>
          <LanguageToggle />
        </div>

        <h1
          className={`font-heading text-5xl leading-[1.05] tracking-tight sm:text-7xl ${
            locale === "th" ? "font-bold" : ""
          }`}
        >
          {t.heading[0]}
          <br />
          {t.heading[1]}
        </h1>

        <p className="max-w-xl text-lg leading-8 text-muted-foreground">{t.description}</p>

        <div className="flex flex-col gap-4 sm:flex-row">
          <button
            type="button"
            className="flex h-12 items-center justify-center bg-primary px-6 text-base font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            {t.ctaPrimary}
          </button>
          <button
            type="button"
            className="flex h-12 items-center justify-center border border-border px-6 text-base font-medium transition-colors hover:bg-accent"
          >
            {t.ctaSecondary}
          </button>
        </div>
      </main>
    </div>
  );
}
