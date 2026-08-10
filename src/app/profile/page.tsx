"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { LanguageToggle } from "@/components/language-toggle";
import { useLanguage } from "@/components/language-provider";

export default function ProfilePicker() {
  const { t } = useLanguage();

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
        <LanguageToggle />
      </div>

      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col justify-center gap-10 px-8 py-16">
        <div className="text-center">
          <h1 className="font-heading text-3xl sm:text-4xl">{t.profilePicker.title}</h1>
          <p className="mt-3 text-muted-foreground">{t.profilePicker.subtitle}</p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {t.profilePicker.profiles.map((profile, i) => (
            <Link
              key={profile.name}
              href={`/workspace?profile=${i}`}
              className="flex flex-col gap-1 border border-border p-6 text-left transition-colors hover:bg-accent"
            >
              <span className="font-heading text-lg">{profile.name}</span>
              <span className="text-sm text-muted-foreground">{profile.business}</span>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
