"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useEffect, useRef, useState, type SubmitEvent } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { LanguageToggle } from "@/components/language-toggle";
import { useLanguage } from "@/components/language-provider";
import { ThinkingOrb } from "@/components/thinking-orb";
import type { ModelMessage } from "ai";
import {
  SHIPMENT_FIELD_KEYS,
  SENDER_FIELD_COUNT,
  type ShipmentFieldKey,
} from "@/lib/shipment-fields";

const EASE = [0.16, 1, 0.3, 1] as const;

// Splits by grapheme cluster (not raw code point) so Thai combining marks
// stay attached to their base consonant instead of animating separately.
function graphemes(text: string): string[] {
  if (typeof Intl !== "undefined" && "Segmenter" in Intl) {
    const segmenter = new Intl.Segmenter(undefined, { granularity: "grapheme" });
    return Array.from(segmenter.segment(text), (s) => s.segment);
  }
  return Array.from(text);
}

function WaveText({ text, className }: Readonly<{ text: string; className?: string }>) {
  return (
    <span className={className}>
      {graphemes(text).map((char, i) => (
        <span
          key={i}
          className="inline-block animate-[wave_1.2s_ease-in-out_infinite]"
          style={{ animationDelay: `${i * 80}ms` }}
        >
          {char}
        </span>
      ))}
    </span>
  );
}

type Message = {
  id: number;
  role: "user" | "agent";
  text: string;
};

type FieldValues = Record<ShipmentFieldKey, string | null>;

function FieldInput({
  label,
  value,
  flashing,
  onChange,
  containerRef,
}: Readonly<{
  label: string;
  value: string | null;
  flashing: boolean;
  onChange: (value: string) => void;
  containerRef?: (el: HTMLLabelElement | null) => void;
}>) {
  return (
    <motion.label
      ref={containerRef}
      animate={{ scale: flashing ? [1, 1.03, 1] : 1 }}
      transition={{ duration: 0.6, ease: EASE }}
      className="flex flex-col gap-1.5 text-sm"
    >
      <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </span>
      <input
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
        placeholder="—"
        className={`h-11 border border-border px-3 text-sm text-foreground outline-none transition-colors duration-700 focus:border-foreground ${
          flashing ? "bg-accent" : "bg-background"
        }`}
      />
    </motion.label>
  );
}

function ReceiptRow({ label, value }: Readonly<{ label: string; value: string | null }>) {
  if (!value) return null;
  return (
    <div className="flex justify-between gap-4 py-1.5 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right font-medium">{value}</span>
    </div>
  );
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const EMPTY_VALUES: FieldValues = {
  senderName: null,
  senderAddress: null,
  recipientName: null,
  shippingAddress1: null,
  shippingAddress2: null,
  shippingCity: null,
  shippingState: null,
  shippingPostCode: null,
  shippingCountry: null,
  recipientContact: null,
  itemDescription: null,
  weightKg: null,
  declaredValue: null,
};

export default function Workspace() {
  const { t } = useLanguage();
  const searchParams = useSearchParams();
  const profile = t.profilePicker.profiles[Number(searchParams.get("profile"))];
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  // The sender's own name and address are already known from the profile
  // they picked before entering the chat — no reason to make them (or the
  // agent) fill those in again.
  const [values, setValues] = useState<FieldValues>(() => ({
    ...EMPTY_VALUES,
    senderName: profile?.name ?? null,
    senderAddress: profile?.address ?? null,
  }));
  const [replyLocale, setReplyLocale] = useState<"th" | "en" | null>(null);
  const [submitted, setSubmitted] = useState(false);
  // Mirrors the fields the agent's system prompt treats as required —
  // it won't stop asking follow-up questions until these are filled either.
  const canSubmit = Boolean(
    values.recipientName && values.shippingCountry && values.shippingAddress1,
  );
  const [flashingFields, setFlashingFields] = useState<Set<ShipmentFieldKey>>(new Set());
  // Full conversation history (including tool calls/results) sent back to
  // the route on every turn — the route itself holds no state between
  // requests, so this is the only place the session lives.
  const [history, setHistory] = useState<ModelMessage[]>([]);
  const fieldRefs = useRef<Partial<Record<ShipmentFieldKey, HTMLLabelElement>>>({});
  const chatInputRef = useRef<HTMLTextAreaElement>(null);

  // Grow the textarea to fit its content (up to the max-h cap, where it
  // scrolls instead) — covers typing, the example-text button, and the
  // clear-after-send reset, since all of them just change `input`.
  useEffect(() => {
    const el = chatInputRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  }, [input]);

  // Reveals one field at a time: scroll it into view first (in case the
  // agent filled something the user hasn't scrolled to), then flash it —
  // never flash a field the user can't currently see.
  async function revealUpdatesSequentially(updates: { field: string; value: string }[]) {
    for (const update of updates) {
      const key = update.field;
      if (!(SHIPMENT_FIELD_KEYS as readonly string[]).includes(key)) continue;
      const fieldKey = key as ShipmentFieldKey;

      fieldRefs.current[fieldKey]?.scrollIntoView({ behavior: "smooth", block: "center" });
      await sleep(400);

      setValues((prev) => ({ ...prev, [fieldKey]: update.value }));
      setFlashingFields(new Set([fieldKey]));
      await sleep(700);
      setFlashingFields(new Set());
    }
  }

  async function handleSend(e: SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    const text = input.trim();
    if (!text) return;

    // Detect the reply language once, from the first message, and reuse it
    // for the rest of the session — re-detecting per message would misfire
    // on short follow-up replies like "USA" that carry no script signal.
    const locale = replyLocale ?? (/[฀-๿]/.test(text) ? "th" : "en");
    if (!replyLocale) setReplyLocale(locale);

    setMessages((prev) => [...prev, { id: prev.length, role: "user", text }]);
    setInput("");
    setIsThinking(true);

    try {
      const res = await fetch("/api/agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, replyLocale: locale, profile, history }),
      });
      const data = await res.json();

      if (!res.ok) {
        const errorText =
          data.error === "quota_exceeded"
            ? t.workspace.quotaExceededReply
            : t.workspace.agentUnavailableReply;
        setMessages((prev) => [...prev, { id: prev.length, role: "agent", text: errorText }]);
        setIsThinking(false);
        return;
      }

      if (Array.isArray(data.messages)) {
        setHistory((prev) => [...prev, ...(data.messages as ModelMessage[])]);
      }

      setMessages((prev) => [
        ...prev,
        { id: prev.length, role: "agent", text: data.reply || t.workspace.cannedReply },
      ]);
      setIsThinking(false);

      if (Array.isArray(data.updates)) {
        await revealUpdatesSequentially(data.updates as { field: string; value: string }[]);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        { id: prev.length, role: "agent", text: t.workspace.agentUnavailableReply },
      ]);
      setIsThinking(false);
    }
  }

  return (
    <div className="flex flex-col bg-background text-foreground md:h-dvh md:overflow-hidden">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="flex items-center justify-between border-b border-border px-6 py-4"
      >
        <Link
          href="/"
          className="flex items-center gap-2 font-mono text-sm uppercase tracking-widest text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          {t.workspace.back}
        </Link>

        {profile && (
          <span className="font-mono text-sm text-muted-foreground">
            {t.profilePicker.sendingAs} <span className="text-foreground">{profile.name}</span>
          </span>
        )}

        <LanguageToggle />
      </motion.div>

      <AnimatePresence mode="wait">
        {submitted ? (
          <motion.div
            key="receipt"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: EASE }}
            className="flex-1 overflow-y-auto"
          >
            <div className="mx-auto flex w-full max-w-lg flex-col gap-8 p-6 md:py-16">
              <div className="text-center">
                <ThinkingOrb className="mx-auto h-16 w-16" />
                <h1 className="mt-4 font-heading text-2xl">{t.workspace.receiptTitle}</h1>
                <p className="mt-2 text-sm text-muted-foreground">
                  {t.workspace.shipmentSentMessage}
                </p>
              </div>

              <div className="border border-border">
                <div className="border-b border-border p-4">
                  <h3 className="mb-1 text-xs font-bold uppercase tracking-wide text-muted-foreground">
                    {t.workspace.senderSection}
                  </h3>
                  {SHIPMENT_FIELD_KEYS.slice(0, SENDER_FIELD_COUNT).map((key, i) => (
                    <ReceiptRow key={key} label={t.workspace.fields[i]} value={values[key]} />
                  ))}
                </div>
                <div className="p-4">
                  <h3 className="mb-1 text-xs font-bold uppercase tracking-wide text-muted-foreground">
                    {t.workspace.shipmentSection}
                  </h3>
                  {SHIPMENT_FIELD_KEYS.slice(SENDER_FIELD_COUNT).map((key, i) => (
                    <ReceiptRow
                      key={key}
                      label={t.workspace.fields[SENDER_FIELD_COUNT + i]}
                      value={values[key]}
                    />
                  ))}
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSubmitted(false)}
                className="h-12 w-full border border-border text-sm font-medium transition-colors hover:bg-accent"
              >
                {t.workspace.newShipment}
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="workspace"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="flex flex-1 flex-col md:min-h-0 md:flex-row"
          >
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: EASE, delay: 0.1 }}
              className="flex h-[70dvh] flex-col overflow-hidden border-b border-border md:h-auto md:min-h-0 md:flex-1 md:border-b-0 md:border-r"
            >
              <h2 className="flex items-center gap-2 border-b border-border px-6 py-4 font-heading text-lg">
                <ThinkingOrb className="h-10 w-10 shrink-0" intensity={1.8} />
                {t.workspace.chatTitle}
              </h2>

              <div className="flex flex-1 flex-col gap-3 overflow-y-auto p-6">
                {messages.length === 0 && (
                  <p className="text-sm text-muted-foreground">{t.workspace.chatEmpty}</p>
                )}

                {messages.map((m) => (
                  <motion.div
                    key={m.id}
                    initial={{ opacity: 0, y: 8, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 0.25, ease: EASE }}
                    className={
                      m.role === "user"
                        ? "ml-auto max-w-[80%] bg-primary px-4 py-2 text-sm text-primary-foreground"
                        : "mr-auto max-w-[80%] bg-muted px-4 py-2 text-sm text-foreground"
                    }
                  >
                    {m.text}
                  </motion.div>
                ))}

                {isThinking && (
                  <div className="mr-auto flex items-center gap-2">
                    <div className="h-10 w-10 shrink-0">
                      <ThinkingOrb className="block h-full w-full" />
                    </div>
                    <span className="flex items-center gap-1 text-sm text-muted-foreground">
                      <WaveText text={t.workspace.thinking} />
                      <span className="inline-block h-4 w-[2px] animate-[blink_1s_step-end_infinite] bg-muted-foreground" />
                    </span>
                  </div>
                )}
              </div>

              {messages.length === 0 && (
                <button
                  type="button"
                  onClick={() => setInput(t.workspace.exampleText)}
                  className="mx-4 mt-4 flex flex-col gap-1 border border-border p-3 text-left transition-colors hover:bg-accent"
                >
                  <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    {t.workspace.exampleLabel}
                  </span>
                  <span className="text-sm text-muted-foreground">{t.workspace.exampleText}</span>
                </button>
              )}

              <form onSubmit={handleSend} className="flex gap-2 border-t border-border p-4">
                <textarea
                  ref={chatInputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      e.currentTarget.form?.requestSubmit();
                    }
                  }}
                  placeholder={t.workspace.chatPlaceholder}
                  rows={1}
                  className="max-h-40 min-h-11 flex-1 resize-none overflow-y-auto border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-foreground"
                />
                <button
                  type="submit"
                  className="h-11 bg-primary px-5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                >
                  {t.workspace.send}
                </button>
              </form>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: EASE, delay: 0.2 }}
              className="p-6 md:min-h-0 md:flex-1 md:overflow-y-auto"
            >
              <h2 className="mb-4 font-heading text-lg">{t.workspace.formTitle}</h2>

              <h3 className="mb-3 text-xs font-bold uppercase tracking-wide text-muted-foreground">
                {t.workspace.senderSection}
              </h3>
              <div className="mb-6 flex flex-col gap-4">
                {t.workspace.fields.slice(0, SENDER_FIELD_COUNT).map((label, i) => {
                  const key = SHIPMENT_FIELD_KEYS[i];
                  return (
                    <FieldInput
                      key={key}
                      label={label}
                      value={values[key]}
                      flashing={flashingFields.has(key)}
                      onChange={(value) => setValues((prev) => ({ ...prev, [key]: value || null }))}
                      containerRef={(el) => {
                        fieldRefs.current[key] = el ?? undefined;
                      }}
                    />
                  );
                })}
              </div>

              <h3 className="mb-3 text-xs font-bold uppercase tracking-wide text-muted-foreground">
                {t.workspace.shipmentSection}
              </h3>
              <div className="flex flex-col gap-4">
                {t.workspace.fields.slice(SENDER_FIELD_COUNT).map((label, i) => {
                  const key = SHIPMENT_FIELD_KEYS[SENDER_FIELD_COUNT + i];
                  return (
                    <FieldInput
                      key={key}
                      label={label}
                      value={values[key]}
                      flashing={flashingFields.has(key)}
                      onChange={(value) => setValues((prev) => ({ ...prev, [key]: value || null }))}
                      containerRef={(el) => {
                        fieldRefs.current[key] = el ?? undefined;
                      }}
                    />
                  );
                })}
              </div>

              <div className="mt-8">
                <button
                  type="button"
                  disabled={!canSubmit}
                  onClick={() => setSubmitted(true)}
                  className="h-12 w-full bg-primary text-base font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {t.workspace.sendShipment}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
