"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useState, type FormEvent } from "react";
import { LanguageToggle } from "@/components/language-toggle";
import { useLanguage } from "@/components/language-provider";
import { ThinkingOrb } from "@/components/thinking-orb";
import { SHIPMENT_FIELD_KEYS, type ShipmentFieldKey } from "@/lib/shipment-fields";

type Message = {
  id: number;
  role: "user" | "agent";
  text: string;
};

type FieldValues = Record<ShipmentFieldKey, string | null>;

const EMPTY_VALUES: FieldValues = {
  recipientName: null,
  destinationCountry: null,
  shippingAddress: null,
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
  const [values, setValues] = useState<FieldValues>(EMPTY_VALUES);
  const [replyLocale, setReplyLocale] = useState<"th" | "en" | null>(null);

  async function handleSend(e: FormEvent) {
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
        body: JSON.stringify({ message: text, replyLocale: locale }),
      });
      const data = await res.json();

      if (Array.isArray(data.updates)) {
        setValues((prev) => {
          const next = { ...prev };
          for (const update of data.updates as { field: string; value: string }[]) {
            if ((SHIPMENT_FIELD_KEYS as readonly string[]).includes(update.field)) {
              next[update.field as ShipmentFieldKey] = update.value;
            }
          }
          return next;
        });
      }

      setMessages((prev) => [
        ...prev,
        { id: prev.length, role: "agent", text: data.reply || t.workspace.cannedReply },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { id: prev.length, role: "agent", text: t.workspace.cannedReply },
      ]);
    } finally {
      setIsThinking(false);
    }
  }

  return (
    <div className="flex min-h-dvh flex-col bg-background text-foreground">
      <div className="flex items-center justify-between border-b border-border px-6 py-4">
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
      </div>

      <div className="flex flex-1 flex-col md:flex-row">
        <div className="flex flex-1 flex-col border-b border-border md:border-b-0 md:border-r">
          <h2 className="border-b border-border px-6 py-4 font-heading text-lg">
            {t.workspace.chatTitle}
          </h2>

          <div className="flex flex-1 flex-col gap-3 overflow-y-auto p-6">
            {messages.length === 0 && (
              <p className="text-sm text-muted-foreground">{t.workspace.chatEmpty}</p>
            )}

            {messages.map((m) => (
              <div
                key={m.id}
                className={
                  m.role === "user"
                    ? "ml-auto max-w-[80%] bg-primary px-4 py-2 text-sm text-primary-foreground"
                    : "mr-auto max-w-[80%] bg-muted px-4 py-2 text-sm text-foreground"
                }
              >
                {m.text}
              </div>
            ))}

            {isThinking && (
              <div className="mr-auto h-10 w-10">
                <ThinkingOrb className="block h-full w-full" />
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
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={t.workspace.chatPlaceholder}
              className="h-11 flex-1 border border-border bg-background px-3 text-sm outline-none focus:border-foreground"
            />
            <button
              type="submit"
              className="h-11 bg-primary px-5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              {t.workspace.send}
            </button>
          </form>
        </div>

        <div className="flex-1 p-6">
          <h2 className="mb-4 font-heading text-lg">{t.workspace.formTitle}</h2>
          <div className="flex flex-col gap-4">
            {t.workspace.fields.map((label, i) => {
              const key = SHIPMENT_FIELD_KEYS[i];
              return (
                <label key={key} className="flex flex-col gap-1.5 text-sm">
                  <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    {label}
                  </span>
                  <input
                    value={values[key] ?? ""}
                    onChange={(e) =>
                      setValues((prev) => ({
                        ...prev,
                        [key]: e.target.value || null,
                      }))
                    }
                    placeholder="—"
                    className="h-11 border border-border bg-background px-3 text-sm text-foreground outline-none focus:border-foreground"
                  />
                </label>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
