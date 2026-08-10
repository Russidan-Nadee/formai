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
    exampleLabel: string;
    exampleText: string;
    cannedReply: string;
    send: string;
    formTitle: string;
    fields: string[];
  };
  howItWorks: {
    title: string;
    steps: { title: string; description: string }[];
  };
  profilePicker: {
    title: string;
    subtitle: string;
    sendingAs: string;
    profiles: { name: string; business: string }[];
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
      exampleLabel: "Example",
      exampleText:
        "Shipping clothes to John Doe in the US, at 123 Main St, New York. Worth about 2000 baht, weighs a bit over a kilo.",
      cannedReply: "Got it — I'll factor that into the form.",
      send: "Send",
      formTitle: "Form preview",
      fields: [
        "Recipient name",
        "Destination country",
        "Shipping address",
        "Item description",
        "Weight (kg)",
        "Declared value",
      ],
    },
    howItWorks: {
      title: "How it works",
      steps: [
        {
          title: "Tell the agent",
          description: "Type what you're trying to fill out, in plain text.",
        },
        {
          title: "It reads and decides",
          description: "The agent maps what you said onto the right fields.",
        },
        {
          title: "You confirm",
          description: "Check the prefilled form and send it — that's it.",
        },
      ],
    },
    profilePicker: {
      title: "Who's sending?",
      subtitle: "Pick a profile — the agent will already know your details.",
      sendingAs: "Sending as",
      profiles: [
        { name: "John Doe", business: "Online clothing shop" },
        { name: "Jane Doe", business: "Premium gift shop" },
        { name: "Acme Trading Co.", business: "Industrial parts supplier" },
        { name: "Alex Doe", business: "Cosmetics seller" },
      ],
    },
  },
  th: {
    kicker: "FormAI, ผู้ช่วยกรอกฟอร์มอัตโนมัติ",
    heading: ["AI ผู้ช่วย", "กรอกฟอร์มโดยอัตโนมัติ"],
    description: "เอเจนต์ที่อ่านข้อมูลของคุณ แล้วกรอกฟอร์มให้ล่วงหน้า คุณแค่มายืนยันอีกครั้ง",
    ctaPrimary: "เริ่มต้นใช้งาน",
    ctaSecondary: "วิธีการทำงาน",
    workspace: {
      back: "FormAI",
      chatTitle: "คุยกับ Agent",
      chatEmpty: "บอก agent ว่าคุณอยากกรอกฟอร์มอะไร",
      chatPlaceholder: "พิมพ์ข้อความ...",
      exampleLabel: "ตัวอย่าง",
      exampleText:
        "ส่งเสื้อผ้าไปหา John Doe ที่อเมริกา อยู่ 123 Main St, New York มูลค่าประมาณ 2000 บาท หนักสักกิโลกว่าๆ",
      cannedReply: "รับทราบครับ จะเอาไปใช้กรอกฟอร์มให้",
      send: "ส่ง",
      formTitle: "พรีวิวฟอร์ม",
      fields: [
        "ชื่อผู้รับ",
        "ประเทศปลายทาง",
        "ที่อยู่จัดส่ง",
        "รายละเอียดสินค้า",
        "น้ำหนัก (กก.)",
        "มูลค่าสินค้า",
      ],
    },
    howItWorks: {
      title: "วิธีการทำงาน",
      steps: [
        {
          title: "บอก agent",
          description: "พิมพ์สิ่งที่คุณอยากกรอก เป็นข้อความธรรมดา",
        },
        {
          title: "agent ตัดสินใจ",
          description: "agent จับคู่สิ่งที่คุณพิมพ์เข้ากับช่องที่ถูกต้อง",
        },
        {
          title: "คุณแค่ยืนยัน",
          description: "ตรวจฟอร์มที่กรอกไว้ให้แล้วส่ง แค่นั้นเอง",
        },
      ],
    },
    profilePicker: {
      title: "ใครเป็นคนส่ง?",
      subtitle: "เลือกโปรไฟล์ — agent จะรู้ข้อมูลของคุณไว้ล่วงหน้าเลย",
      sendingAs: "ส่งในนาม",
      profiles: [
        { name: "สมชาย ตัวอย่าง", business: "ร้านเสื้อผ้าออนไลน์" },
        { name: "กมล ตัวอย่าง", business: "ร้านของฝากพรีเมียม" },
        { name: "บริษัท ตัวอย่าง จำกัด", business: "ผู้จัดจำหน่ายอะไหล่อุตสาหกรรม" },
        { name: "ปิยะ ตัวอย่าง", business: "ขายเครื่องสำอาง" },
      ],
    },
  },
};
