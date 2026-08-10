export type Locale = "en" | "th";

export const locales: Locale[] = ["en", "th"];

export const defaultLocale: Locale = "en";

export type Dictionary = {
  kicker: string;
  heading: [string, string];
  description: string;
  ctaPrimary: string;
  ctaSecondary: string;
};

export const dictionaries: Record<Locale, Dictionary> = {
  en: {
    kicker: "FormAI, agentic prefill assistant",
    heading: ["Fill forms", "without filling them."],
    description:
      "An agent that reads your data, decides what goes where, and prefills the form for you. You only show up to confirm.",
    ctaPrimary: "Get started",
    ctaSecondary: "How it works",
  },
  th: {
    kicker: "FormAI, ผู้ช่วยกรอกฟอร์มอัตโนมัติ",
    heading: ["AI ผู้ช่วย", "กรอกฟอร์มโดยอัตโนมัติ"],
    description:
      "เอเจนต์ที่อ่านข้อมูลของคุณ ตัดสินใจว่าข้อมูลไหนไปช่องไหน แล้วกรอกฟอร์มให้ล่วงหน้า คุณแค่มายืนยันอีกครั้ง",
    ctaPrimary: "เริ่มต้นใช้งาน",
    ctaSecondary: "วิธีการทำงาน",
  },
};
