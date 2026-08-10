"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { LanguageToggle } from "@/components/language-toggle";
import { useLanguage } from "@/components/language-provider";
import { ThinkingOrb } from "@/components/thinking-orb";

type Message = {
  id: number;
  role: "user" | "agent";
  text: string;
};

export default function Workspace() {
  const { t } = useLanguage();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isThinking, setIsThinking] = useState(false);

  function handleSend(e: FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text) return;

    setMessages((prev) => [...prev, { id: prev.length, role: "user", text }]);
    setInput("");
    setIsThinking(true);

    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        { id: prev.length, role: "agent", text: t.workspace.cannedReply },
      ]);
      setIsThinking(false);
    }, 1200);
  }

  return (
    <div className="flex min-h-dvh flex-col bg-background text-foreground">
      <div className="flex items-center justify-between border-b border-border px-6 py-4">
        <Link
          href="/"
          className="font-mono text-sm uppercase tracking-widest text-muted-foreground transition-colors hover:text-foreground"
        >
          ← {t.workspace.back}
        </Link>
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
            {t.workspace.fields.map((field) => (
              <label key={field} className="flex flex-col gap-1 text-sm">
                <span className="text-muted-foreground">{field}</span>
                <input
                  disabled
                  placeholder="—"
                  className="h-11 border border-border bg-muted px-3 text-sm text-muted-foreground"
                />
              </label>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
