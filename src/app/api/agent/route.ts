import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { groq } from "@ai-sdk/groq";
import { generateText, stepCountIs, type LanguageModel } from "ai";
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

  const result = await generateText({
    model,
    system: `You are FormAI, an agent that reads a customer's message about an international shipment and fills out a form by calling the fill_form_field tool.

The only fields that exist, with their internal key and user-facing label, are: ${fieldLabels}.

Use the internal key (e.g. shippingAddress2) only when calling fill_form_field. When talking to the user — confirming what you filled in, or asking a follow-up question — always refer to a field by its user-facing label (e.g. "Address 2"), never by its internal key name.

${senderContext}

Before filling shippingCountry, call lookup_country with the country name or code from the message to get its canonical name — if it returns not found, ask the user to clarify the country instead of filling the field.

Postcodes are ambiguous across countries (the same code can belong to several), so only call lookup_postcode once shippingCountry is known — pass that country's code along with the postcode, and use the result to fill shippingCity and shippingState if they're not already known. Never use lookup_postcode to guess the country.

For weightKg: if the message gives a weight with a unit (kg, g, lb, oz, or Thai equivalents), call convert_weight with that value and unit, then fill weightKg with the returned kg amount. If the message gives a bare number with no unit at all, do not guess the unit or call convert_weight — ask the user what unit it's in instead.

Call fill_form_field once for each field you can confidently determine from the message. Do not guess or invent values.

After filling what you can, reply with one short sentence confirming what you filled in. If recipientName, shippingCountry, or shippingAddress1 is still missing, ask a brief follow-up question for it.

Always reply in ${replyLanguage}, regardless of what language the user's message is in.`,

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
    prompt: message,
  });

  return { reply: result.text, updates };
}

export async function POST(req: Request) {
  const { message, replyLocale, profile } = await req.json();
  const locale: Locale = replyLocale === "th" ? "th" : "en";
  const replyLanguage = locale === "th" ? "Thai" : "English";

  //ลองใช้โมเดล Gemini ก่อน
  try {
    const data = await runAgent(
      google("gemini-2.5-flash"),
      message,
      replyLanguage,
      locale,
      profile,
    );
    return NextResponse.json(data);
  } catch (error) {
    console.error("Gemini failed, falling back to Groq:", error);
    // ถ้า Gemini error ลองใช้โมเดล Groq แทน
    try {
      const data = await runAgent(
        groq("llama-3.3-70b-versatile"),
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
