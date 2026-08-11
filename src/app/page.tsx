"use client";

import { useEffect, useState, type SVGProps } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { LanguageToggle } from "@/components/language-toggle";
import { useLanguage } from "@/components/language-provider";
import { ThinkingOrb } from "@/components/thinking-orb";
import { LandingDemo } from "@/components/landing-demo";

const GITHUB_URL = "https://github.com/Russidan-Nadee/formai";

function GithubIcon(props: Readonly<SVGProps<SVGSVGElement>>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.09 3.29 9.4 7.86 10.93.57.1.79-.25.79-.55 0-.27-.01-1.16-.02-2.11-3.2.7-3.88-1.36-3.88-1.36-.52-1.33-1.28-1.68-1.28-1.68-1.04-.72.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.76 2.7 1.25 3.36.96.1-.75.4-1.25.73-1.54-2.55-.29-5.24-1.28-5.24-5.69 0-1.26.45-2.29 1.19-3.09-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.18 1.18a11 11 0 0 1 5.79 0c2.2-1.49 3.17-1.18 3.17-1.18.64 1.59.24 2.76.12 3.05.74.8 1.19 1.83 1.19 3.09 0 4.42-2.69 5.4-5.25 5.68.41.36.78 1.06.78 2.15 0 1.55-.01 2.8-.01 3.18 0 .3.21.66.8.55A10.99 10.99 0 0 0 23.5 12c0-6.35-5.15-11.5-11.5-11.5Z" />
    </svg>
  );
}

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

  const orbTransition = { duration: 0.5, delay: 0.5, ease: [0.16, 1, 0.3, 1] as const };
  // The rest of the page shouldn't fade in until the orb has finished
  // settling into its final spot — text and buttons appearing mid-flight
  // would fight for attention with the orb still moving.
  const contentDelayMs = (orbTransition.delay + orbTransition.duration) * 1000;
  const fadeInClass = "animate-in fade-in duration-700";
  const fadeInStyle = { animationDelay: `${contentDelayMs}ms`, animationFillMode: "both" as const };

  return (
    <AnimatePresence>
      {loading ? (
        <motion.div
          key="loading"
          className="fixed inset-0 z-50 flex items-center justify-center bg-background"
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <motion.div layoutId="hero-orb" transition={orbTransition}>
            <ThinkingOrb className="h-40 w-40 sm:h-56 sm:w-56" />
          </motion.div>
        </motion.div>
      ) : (
        <div key="loaded" className="flex flex-1 flex-col bg-background text-foreground">
          <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col items-center justify-center gap-10 px-8 pt-8 pb-24 text-center">
            <div
              className={`flex w-full items-center justify-between gap-4 ${fadeInClass}`}
              style={fadeInStyle}
            >
              <span className="font-mono text-sm uppercase tracking-widest text-muted-foreground">
                FormAI
              </span>
              <div className="flex items-center gap-4">
                <a
                  href={GITHUB_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="GitHub repository"
                  className="text-muted-foreground transition-colors hover:text-foreground"
                >
                  <GithubIcon className="h-5 w-5" />
                </a>
                <LanguageToggle />
              </div>
            </div>

            <div className="flex flex-col items-center gap-2">
              <motion.div layoutId="hero-orb" transition={orbTransition}>
                <ThinkingOrb className="h-24 w-24 sm:h-32 sm:w-32" />
              </motion.div>

              <div
                className={`flex flex-col items-center gap-2 ${fadeInClass}`}
                style={fadeInStyle}
              >
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
            </div>

            <p
              className={`max-w-xl text-lg leading-8 text-muted-foreground ${fadeInClass}`}
              style={fadeInStyle}
            >
              {t.description}
            </p>

            <Link
              href="/profile"
              className={`flex h-12 w-fit items-center justify-center bg-primary px-6 text-base font-medium text-primary-foreground transition-colors hover:bg-primary/90 ${fadeInClass}`}
              style={fadeInStyle}
            >
              {t.ctaPrimary}
            </Link>
          </main>

          <section
            className={`mx-auto w-full max-w-3xl px-8 pb-24 sm:pb-32 ${fadeInClass}`}
            style={fadeInStyle}
          >
            <LandingDemo />
          </section>

          <section
            className={`mx-auto w-full max-w-3xl px-8 pb-24 sm:pb-32 ${fadeInClass}`}
            style={fadeInStyle}
          >
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

          <footer
            className={`border-t border-border px-8 py-6 text-center text-xs text-muted-foreground ${fadeInClass}`}
            style={fadeInStyle}
          >
            © {new Date().getFullYear()} FormAI. {t.footerNote}
          </footer>
        </div>
      )}
    </AnimatePresence>
  );
}
