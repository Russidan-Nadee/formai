"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { LanguageToggle } from "@/components/language-toggle";
import { useLanguage } from "@/components/language-provider";
import { ThinkingOrb } from "@/components/thinking-orb";

export default function Home() {
  const { t, locale } = useLanguage();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    document.fonts.ready.then(() => {
      if (!cancelled) setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center bg-background text-foreground">
        <ThinkingOrb className="h-40 w-40 sm:h-56 sm:w-56" />
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col bg-background text-foreground">
      <main className="animate-in fade-in mx-auto flex w-full max-w-3xl flex-1 flex-col items-center justify-center gap-10 px-8 pt-8 pb-24 text-center duration-700">
        <div className="flex w-full items-center justify-end">
          {/* <span className="font-mono text-sm uppercase tracking-widest text-muted-foreground">
            {t.kicker}
          </span> */}
          <LanguageToggle />
        </div>

        <div className="flex flex-col items-center gap-2">
          <ThinkingOrb className="h-24 w-24 sm:h-32 sm:w-32" />

          <div
            className={`font-heading text-3xl leading-[1.05] tracking-tight sm:text-5xl md:text-6xl ${
              locale === "th" ? "font-bold" : ""
            }`}
          >
            <h1 className="inline">{t.heading[0]}</h1>
          </div>

          {t.heading.length > 1 && (
            <h2 className="text-lg font-normal text-muted-foreground sm:text-xl">
              {t.heading.slice(1).map((line, i) => (
                <span key={line}>
                  {i > 0 && <br />}
                  {line}
                </span>
              ))}
            </h2>
          )}
        </div>

        {/* <p className="max-w-xl text-lg leading-8 text-muted-foreground">{t.description}</p> */}

        <div className="flex flex-col gap-4 sm:flex-row">
          <Link
            href="/profile"
            className="flex h-12 items-center justify-center bg-primary px-6 text-base font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            {t.ctaPrimary}
          </Link>
          <a
            href="#how-it-works"
            className="flex h-12 items-center justify-center border border-border px-6 text-base font-medium transition-colors hover:bg-accent"
          >
            {t.ctaSecondary}
          </a>
        </div>
      </main>

      <section id="how-it-works" className="mx-auto w-full max-w-3xl px-8 pb-24 sm:pb-32">
        <h2 className="mb-10 text-center font-heading text-2xl sm:text-3xl">
          {t.howItWorks.title}
        </h2>
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
          {t.howItWorks.steps.map((step, i) => (
            <div key={step.title} className="border border-border p-6">
              <span className="font-mono text-sm text-muted-foreground">
                {String(i + 1).padStart(2, "0")}
              </span>
              <h3 className="mt-2 font-heading text-lg">{step.title}</h3>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{step.description}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
