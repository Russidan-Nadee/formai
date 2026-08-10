import type { Metadata } from "next";
import { Archivo_Black, Noto_Sans_Thai, Space_Mono } from "next/font/google";
import localFont from "next/font/local";
import { LanguageProvider } from "@/components/language-provider";
import "./globals.css";

const archivoBlack = Archivo_Black({
  variable: "--font-archivo",
  weight: "400",
  subsets: ["latin"],
});

// Self-hosted Satoshi — Fontshare has no Thai glyphs for it, so Noto Sans
// Thai below covers Thai text (see the language toggle in language-provider.tsx).
const satoshi = localFont({
  src: [
    { path: "./fonts/satoshi-400.woff2", weight: "400", style: "normal" },
    { path: "./fonts/satoshi-500.woff2", weight: "500", style: "normal" },
    { path: "./fonts/satoshi-700.woff2", weight: "700", style: "normal" },
  ],
  variable: "--font-satoshi",
});

const notoSansThai = Noto_Sans_Thai({
  subsets: ["thai"],
  weight: ["400", "500", "700"],
  variable: "--font-thai",
});

const spaceMono = Space_Mono({
  variable: "--font-space-mono",
  weight: ["400", "700"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "FormAI",
  description: "Agentic prefill assistant",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${archivoBlack.variable} ${satoshi.variable} ${notoSansThai.variable} ${spaceMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <LanguageProvider>{children}</LanguageProvider>
      </body>
    </html>
  );
}
