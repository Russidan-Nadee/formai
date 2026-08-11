"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useLanguage } from "@/components/language-provider";
import { ThinkingOrb } from "@/components/thinking-orb";
import { WaveText } from "@/components/wave-text";

const TYPE_MS_PER_CHAR = 22;
const THINK_MS = 900;
const REPLY_PAUSE_MS = 400;
const FIELD_STAGGER_MS = 600;
const HOLD_MS = 2200;
const RESET_MS = 500;

type Phase = "typing" | "thinking" | "filling" | "hold" | "reset";

// A scripted (not live) replay of the workspace chat-to-form flow, looping
// on a timer so visitors see the product's core behavior before they ever
// click through to /profile.
export function LandingDemo() {
  const { t } = useLanguage();
  const demo = t.landingDemo;
  const [phase, setPhase] = useState<Phase>("typing");
  const [typedChars, setTypedChars] = useState(0);
  const [filledCount, setFilledCount] = useState(0);
  const [flashIndex, setFlashIndex] = useState(-1);

  useEffect(() => {
    let cancelled = false;
    const timeouts: ReturnType<typeof setTimeout>[] = [];
    const after = (ms: number, fn: () => void) => {
      timeouts.push(
        setTimeout(() => {
          if (!cancelled) fn();
        }, ms),
      );
    };

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) {
      after(0, () => {
        setPhase("hold");
        setTypedChars(demo.userMessage.length);
        setFilledCount(demo.fields.length);
      });
      return () => {
        cancelled = true;
        timeouts.forEach(clearTimeout);
      };
    }

    function run() {
      setPhase("typing");
      setTypedChars(0);
      setFilledCount(0);
      setFlashIndex(-1);

      const typeMs = demo.userMessage.length * TYPE_MS_PER_CHAR;
      for (let i = 1; i <= demo.userMessage.length; i++) {
        after(i * TYPE_MS_PER_CHAR, () => setTypedChars(i));
      }

      const thinkStart = typeMs + 200;
      after(thinkStart, () => setPhase("thinking"));

      const fillStart = thinkStart + THINK_MS + REPLY_PAUSE_MS;
      after(fillStart, () => setPhase("filling"));
      demo.fields.forEach((_, i) => {
        after(fillStart + i * FIELD_STAGGER_MS, () => {
          setFlashIndex(i);
          setFilledCount(i + 1);
        });
      });

      const fillEnd = fillStart + demo.fields.length * FIELD_STAGGER_MS;
      after(fillEnd + 300, () => setFlashIndex(-1));
      after(fillEnd + HOLD_MS, () => setPhase("reset"));
      after(fillEnd + HOLD_MS + RESET_MS, run);
    }

    run();
    return () => {
      cancelled = true;
      timeouts.forEach(clearTimeout);
    };
  }, [demo]);

  const showReply = phase === "filling" || phase === "hold";

  return (
    <div className="mx-auto w-full max-w-3xl border border-border shadow-[6px_6px_0_0_var(--foreground)]">
      <motion.div
        animate={{ opacity: phase === "reset" ? 0 : 1 }}
        transition={{ duration: RESET_MS / 1000 }}
        className="flex flex-col sm:flex-row"
      >
        <div className="flex flex-1 flex-col gap-3 border-b border-border p-5 sm:border-r sm:border-b-0">
          <div className="flex items-center gap-2 font-mono text-xs tracking-widest text-muted-foreground uppercase">
            <ThinkingOrb className="h-6 w-6 shrink-0" intensity={phase === "thinking" ? 1.8 : 1} />
            {t.workspace.chatTitle}
          </div>

          <div className="flex min-h-[110px] flex-col justify-end gap-2 text-sm">
            {typedChars > 0 && (
              <div className="ml-auto max-w-[85%] bg-primary px-3 py-2 text-primary-foreground">
                {demo.userMessage.slice(0, typedChars)}
                {phase === "typing" && (
                  <span className="ml-0.5 inline-block h-4 w-[2px] animate-[blink_1s_step-end_infinite] bg-primary-foreground align-middle" />
                )}
              </div>
            )}

            {phase === "thinking" && (
              <div className="mr-auto flex items-center gap-2">
                <div className="h-6 w-6 shrink-0">
                  <ThinkingOrb className="block h-full w-full" />
                </div>
                <span className="flex items-center gap-1 text-muted-foreground">
                  <WaveText text={t.workspace.thinking} />
                  <span className="inline-block h-4 w-[2px] animate-[blink_1s_step-end_infinite] bg-muted-foreground" />
                </span>
              </div>
            )}

            {showReply && (
              <div className="mr-auto max-w-[85%] bg-muted px-3 py-2 text-foreground">
                {demo.agentReply}
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-1 flex-col gap-3 p-5">
          <span className="font-mono text-xs tracking-widest text-muted-foreground uppercase">
            {t.workspace.formTitle}
          </span>
          <div className="flex flex-col gap-3">
            {demo.fields.map((field, i) => (
              <label key={field.label} className="flex flex-col gap-1.5 text-sm">
                <span className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                  {field.label}
                </span>
                <div
                  className={`flex h-10 items-center border border-border px-3 text-sm transition-colors duration-700 ${
                    flashIndex === i ? "bg-accent" : "bg-background"
                  }`}
                >
                  {i < filledCount ? field.value : ""}
                </div>
              </label>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
