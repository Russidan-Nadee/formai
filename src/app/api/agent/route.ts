import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { groq } from "@ai-sdk/groq";
import { generateText, stepCountIs, type LanguageModel, type ModelMessage } from "ai";
import { NextResponse } from "next/server";
import { SHIPMENT_FIELD_KEYS } from "@/lib/shipment-fields";
import { dictionaries, type Locale } from "@/lib/i18n";
import { createFillFormFieldTool, type FieldUpdate } from "@/lib/tools/fill-form-field";
import { lookupCountryTool } from "@/lib/tools/lookup-country";
import { lookupPostcodeTool } from "@/lib/tools/lookup-postcode";
import { convertWeightTool } from "@/lib/tools/convert-weight";

const google = createGoogleGenerativeAI({ apiKey: process.env.GEMINI_API_KEY });

type SenderProfile = { name: string; business: string; address: string } | undefined;

async function runAgent(
  model: LanguageModel,
  history: ModelMessage[],
  message: string,
  replyLanguage: string,
  locale: Locale,
  profile: SenderProfile,
) {
  const updates: FieldUpdate[] = [];

  const senderContext = profile
    ? `The sender is ${profile.name}, who runs a ${profile.business}, based at ${profile.address}. senderName and senderAddress are already filled in with this information — do not ask about them or refill them unless the message explicitly gives different sender details.`
    : "The sender's identity is not known yet.";

  const fieldLabels = SHIPMENT_FIELD_KEYS.map(
    (key, i) => `${key} = "${dictionaries[locale].workspace.fields[i]}"`,
  ).join(", ");

  const userMessage: ModelMessage = { role: "user", content: message };

  const result = await generateText({
    model,
    // Gemini free-tier quota is per-day, not per-minute — retrying within
    // the same request can never succeed once it's exhausted, so fail fast
    // and let the fallback chain in POST() move to the next model instead.
    maxRetries: 0,
    system: `You are FormAI, an agent that reads a customer's message about an international shipment and fills out a form by calling the fill_form_field tool.

The only fields that exist, with their internal key and user-facing label, are: ${fieldLabels}.

Use the internal key (e.g. shippingAddress2) only when calling fill_form_field. When talking to the user — confirming what you filled in, or asking a follow-up question — always refer to a field by its user-facing label (e.g. "Address 2"), never by its internal key name.

${senderContext}

This is an ongoing conversation — earlier messages and what you already filled in are in the message history. Do not re-ask about or re-fill something already established there unless the user contradicts it.

After filling what you can, reply with one short sentence confirming what you filled in. If recipientName, shippingCountry, or shippingAddress1 is still missing, ask a brief follow-up question for it.

Always reply in ${replyLanguage}, regardless of what language the user's message is in.`,

    messages: [...history, userMessage],
    tools: {
      fill_form_field: createFillFormFieldTool(updates),
      lookup_country: lookupCountryTool,
      lookup_postcode: lookupPostcodeTool,
      convert_weight: convertWeightTool,
    },
    // A message that needs country + postcode + weight lookups plus several
    // fill_form_field calls can easily take 6+ steps end-to-end — leave
    // headroom so the final text reply doesn't get cut off mid-chain.
    stopWhen: stepCountIs(10),
  });

  // The caller persists this turn's messages (user + assistant/tool) as the
  // history to send back on the next turn — the route itself holds no state.
  return { reply: result.text, updates, messages: [userMessage, ...result.responseMessages] };
}

export async function POST(req: Request) {
  const { message, replyLocale, profile, history } = await req.json();
  const locale: Locale = replyLocale === "th" ? "th" : "en";
  const replyLanguage = locale === "th" ? "Thai" : "English";
  const conversationHistory: ModelMessage[] = Array.isArray(history) ? history : [];

  //ลองใช้โมเดล Gemini ก่อน
  try {
    const data = await runAgent(
      google("gemini-2.5-flash"),
      conversationHistory,
      message,
      replyLanguage,
      locale,
      profile,
    );
    return NextResponse.json(data);
  } catch (error) {
    console.error("Gemini flash failed, falling back to Gemini flash-lite:", error);
    // gemini-2.5-flash-lite has a separate quota from gemini-2.5-flash
    try {
      const data = await runAgent(
        google("gemini-2.5-flash-lite"),
        conversationHistory,
        message,
        replyLanguage,
        locale,
        profile,
      );
      return NextResponse.json(data);
    } catch (liteError) {
      console.error("Gemini flash-lite failed, falling back to Groq:", liteError);
      // ถ้า Gemini error ลองใช้โมเดล Groq แทน
      try {
        const data = await runAgent(
          groq("llama-3.3-70b-versatile"),
          conversationHistory,
          message,
          replyLanguage,
          locale,
          profile,
        );
        return NextResponse.json(data);
      } catch (fallbackError) {
        console.error("Groq fallback also failed:", fallbackError);
        return NextResponse.json({ error: "agent_unavailable" }, { status: 502 });
      }
    }
  }
}
