import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { groq } from "@ai-sdk/groq";
import { generateText, tool, stepCountIs, type LanguageModel } from "ai";
import { NextResponse } from "next/server";
import { z } from "zod";
import { SHIPMENT_FIELD_KEYS } from "@/lib/shipment-fields";

const google = createGoogleGenerativeAI({ apiKey: process.env.GEMINI_API_KEY });

type SenderProfile = { name: string; business: string; address: string } | undefined;

async function runAgent(
  model: LanguageModel,
  message: string,
  replyLanguage: string,
  profile: SenderProfile,
) {
  const updates: { field: string; value: string }[] = [];

  const senderContext = profile
    ? `The sender is ${profile.name}, who runs a ${profile.business}, based at ${profile.address}. senderName and senderAddress are already filled in with this information — do not ask about them or refill them unless the message explicitly gives different sender details.`
    : "The sender's identity is not known yet.";

  const result = await generateText({
    model,
    system: `You are FormAI, an agent that reads a customer's message about an international shipment and fills out a form by calling the fill_form_field tool.

The only fields that exist are: ${SHIPMENT_FIELD_KEYS.join(", ")}.

${senderContext}

Call fill_form_field once for each field you can confidently determine from the message. Do not guess or invent values.

After filling what you can, reply with one short sentence confirming what you filled in. If recipientName, destinationCountry, or shippingAddress is still missing, ask a brief follow-up question for it.

Always reply in ${replyLanguage}, regardless of what language the user's message is in.`,

    tools: {
      fill_form_field: tool({
        description: "Fill one field of the shipment form.",
        inputSchema: z.object({
          field: z.enum(SHIPMENT_FIELD_KEYS),
          value: z.string(),
        }),
        execute: async ({ field, value }) => {
          updates.push({ field, value });
          return { ok: true };
        },
      }),
    },
    stopWhen: stepCountIs(4),
    prompt: message,
  });

  return { reply: result.text, updates };
}

export async function POST(req: Request) {
  const { message, replyLocale, profile } = await req.json();
  const replyLanguage = replyLocale === "th" ? "Thai" : "English";

  //ลองใช้โมเดล Gemini ก่อน
  try {
    const data = await runAgent(google("gemini-2.5-flash"), message, replyLanguage, profile);
    return NextResponse.json(data);
  } catch (error) {
    console.error("Gemini failed, falling back to Groq:", error);
    // ถ้า Gemini error ลองใช้โมเดล Groq แทน
    try {
      const data = await runAgent(groq("llama-3.3-70b-versatile"), message, replyLanguage, profile);
      return NextResponse.json(data);
    } catch (fallbackError) {
      console.error("Groq fallback also failed:", fallbackError);
      return NextResponse.json({ error: "agent_unavailable" }, { status: 502 });
    }
  }
}
