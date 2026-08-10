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
    senderSection: string;
    shipmentSection: string;
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
    profiles: { name: string; business: string; address: string }[];
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
        "Shipping clothes to John Doe in the US, zip code 10001, at 123 Main St. Contact +1 212 555 0100. Worth about 2000 baht, weighs 5 lbs.",
      cannedReply: "Got it — I'll factor that into the form.",
      send: "Send",
      formTitle: "Form preview",
      senderSection: "Sender",
      shipmentSection: "Recipient & shipment",
      fields: [
        "Sender name",
        "Sender address",
        "Recipient name",
        "Address 1",
        "Address 2",
        "City",
        "State",
        "Post code",
        "Country",
        "Contact",
        "Item description",
        "Weight (kg)",
        "Declared value (THB)",
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
      subtitle: "Pick a profile, The agent will already know your details.",
      sendingAs: "Sending as",
      profiles: [
        {
          name: "John Doe",
          business: "Online clothing shop",
          address: "88 Sukhumvit Road, Bangkok 10110, Thailand",
        },
        {
          name: "Jane Doe",
          business: "Premium gift shop",
          address: "12 Nimman Road, Chiang Mai 50200, Thailand",
        },
        {
          name: "Acme Trading Co.",
          business: "Industrial parts supplier",
          address: "199 Bang Na-Trat Road, Bangkok 10260, Thailand",
        },
        {
          name: "Alex Doe",
          business: "Cosmetics seller",
          address: "45 Rama IX Road, Bangkok 10310, Thailand",
        },
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
        "ส่งเสื้อผ้าไปหา John Doe ที่สหรัฐอเมริกา รหัสไปรษณีย์ 10001 อยู่ 123 Main St เบอร์ติดต่อ +1 212 555 0100 มูลค่าประมาณ 2000 บาท หนัก 5 ปอนด์",
      cannedReply: "รับทราบครับ จะเอาไปใช้กรอกฟอร์มให้",
      send: "ส่ง",
      formTitle: "พรีวิวฟอร์ม",
      senderSection: "ผู้ส่ง",
      shipmentSection: "ผู้รับ & พัสดุ",
      fields: [
        "ชื่อผู้ส่ง",
        "ที่อยู่ผู้ส่ง",
        "ชื่อผู้รับ",
        "ที่อยู่ 1",
        "ที่อยู่ 2",
        "เมือง",
        "รัฐ/จังหวัด",
        "รหัสไปรษณีย์",
        "ประเทศ",
        "ติดต่อ",
        "รายละเอียดสินค้า",
        "น้ำหนัก (กก.)",
        "มูลค่าสินค้า (บาท)",
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
      subtitle: "เลือกโปรไฟล์ agent จะรู้ข้อมูลของคุณไว้ล่วงหน้าเลย",
      sendingAs: "ส่งในนาม",
      profiles: [
        {
          name: "สมชาย ตัวอย่าง",
          business: "ร้านเสื้อผ้าออนไลน์",
          address: "88 ถนนสุขุมวิท กรุงเทพฯ 10110",
        },
        {
          name: "กมล ตัวอย่าง",
          business: "ร้านของฝากพรีเมียม",
          address: "12 ถนนนิมมานเหมินทร์ เชียงใหม่ 50200",
        },
        {
          name: "บริษัท ตัวอย่าง จำกัด",
          business: "ผู้จัดจำหน่ายอะไหล่อุตสาหกรรม",
          address: "199 ถนนบางนา-ตราด กรุงเทพฯ 10260",
        },
        {
          name: "ปิยะ ตัวอย่าง",
          business: "ขายเครื่องสำอาง",
          address: "45 ถนนพระราม 9 กรุงเทพฯ 10310",
        },
      ],
    },
  },
};
