export type Locale = "en" | "th";

export const locales: Locale[] = ["en", "th"];

export const defaultLocale: Locale = "en";

export type Dictionary = {
  kicker: string;
  heading: string[];
  description: string;
  ctaPrimary: string;
  ctaSecondary: string;
  workspace: {
    back: string;
    chatTitle: string;
    chatEmpty: string;
    chatPlaceholder: string;
    cannedReply: string;
    send: string;
    formTitle: string;
    fields: string[];
  };
};

export const dictionaries: Record<Locale, Dictionary> = {
  en: {
    kicker: "FormAI, agentic prefill assistant",
    heading: ["AI assistant", "that fills forms automatically."],
    description:
      "An agent that reads your data, and prefills the form for you. You only show up to confirm.",
    ctaPrimary: "Get started",
    ctaSecondary: "How it works",
    workspace: {
      back: "FormAI",
      chatTitle: "Chat with the agent",
      chatEmpty: "Tell the agent what you're trying to fill out.",
      chatPlaceholder: "Type a message...",
      cannedReply: "Got it — I'll factor that into the form.",
      send: "Send",
      formTitle: "Form preview",
      fields: ["Full name", "Email", "Phone", "Notes"],
    },
  },
  th: {
    kicker: "FormAI, ผู้ช่วยกรอกฟอร์มอัตโนมัติ",
    heading: ["AI ผู้ช่วย", "กรอกฟอร์ม", "โดยอัตโนมัติ"],
    description: "เอเจนต์ที่อ่านข้อมูลของคุณ แล้วกรอกฟอร์มให้ล่วงหน้า คุณแค่มายืนยันอีกครั้ง",
    ctaPrimary: "เริ่มต้นใช้งาน",
    ctaSecondary: "วิธีการทำงาน",
    workspace: {
      back: "FormAI",
      chatTitle: "คุยกับ Agent",
      chatEmpty: "บอก agent ว่าคุณอยากกรอกฟอร์มอะไร",
      chatPlaceholder: "พิมพ์ข้อความ...",
      cannedReply: "รับทราบครับ จะเอาไปใช้กรอกฟอร์มให้",
      send: "ส่ง",
      formTitle: "พรีวิวฟอร์ม",
      fields: ["ชื่อ-นามสกุล", "อีเมล", "เบอร์โทร", "หมายเหตุ"],
    },
  },
};
