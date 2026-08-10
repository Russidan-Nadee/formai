"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import { LanguageToggle } from "@/components/language-toggle";
import { useLanguage } from "@/components/language-provider";

const EASE = [0.16, 1, 0.3, 1] as const;

const cardListVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.2 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: EASE } },
};

export default function ProfilePicker() {
  const { t } = useLanguage();

  return (
    <div className="flex min-h-dvh flex-col bg-background text-foreground">
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
        <LanguageToggle />
      </motion.div>

      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col justify-center gap-10 px-8 py-16">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: EASE }}
          className="text-center"
        >
          <h1 className="font-heading text-3xl sm:text-4xl">{t.profilePicker.title}</h1>
          <p className="mt-3 text-muted-foreground">{t.profilePicker.subtitle}</p>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 gap-4 sm:grid-cols-2"
          variants={cardListVariants}
          initial="hidden"
          animate="show"
        >
          {t.profilePicker.profiles.map((profile, i) => (
            <motion.div
              key={profile.name}
              variants={cardVariants}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Link
                href={`/workspace?profile=${i}`}
                className="flex h-full flex-col gap-1 border border-border p-6 text-left transition-colors hover:bg-accent"
              >
                <span className="font-heading text-lg">{profile.name}</span>
                <span className="text-sm text-muted-foreground">{profile.business}</span>
                <span className="mt-1 text-xs text-muted-foreground">{profile.address}</span>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </main>
    </div>
  );
}
