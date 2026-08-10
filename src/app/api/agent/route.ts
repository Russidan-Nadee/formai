import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { groq } from "@ai-sdk/groq";
import { APICallError, generateText, stepCountIs, type LanguageModel, type ModelMessage } from "ai";
import { NextResponse } from "next/server";
import { SHIPMENT_FIELD_KEYS } from "@/lib/shipment-fields";
import { dictionaries, type Locale } from "@/lib/i18n";
import {
  createFillFormFieldTool,
  createPostcodeGate,
  type FieldUpdate,
} from "@/lib/tools/fill-form-field";
import { lookupCountryTool } from "@/lib/tools/lookup-country";
import { createLookupPostcodeTool } from "@/lib/tools/lookup-postcode";
import { convertWeightTool } from "@/lib/tools/convert-weight";
import { lookupCountry } from "@/lib/countries";
import { lookupPostcode } from "@/lib/geonames";

const google = createGoogleGenerativeAI({ apiKey: process.env.GEMINI_API_KEY });

// Distinguishes "every provider is rate-limited / out of quota" from other
// failures (bad API key, network error, etc.) so the client can show the
// user an accurate message instead of a generic one.
function isRateLimitError(error: unknown): boolean {
  return APICallError.isInstance(error) && error.statusCode === 429;
}

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
  const postcodeGate = createPostcodeGate();

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

After filling what you can, reply with one short sentence confirming what you filled in. Only mention a field in that sentence if you actually called fill_form_field for it this turn — never describe a value as filled from memory or assumption, even if you're confident what it should be (e.g. a well-known postcode's city). If recipientName, shippingCountry, or shippingAddress1 is still missing, ask a brief follow-up question for it.

Always reply in ${replyLanguage}, regardless of what language the user's message is in.`,

    messages: [...history, userMessage],
    tools: {
      fill_form_field: createFillFormFieldTool(updates, postcodeGate),
      lookup_country: lookupCountryTool,
      lookup_postcode: createLookupPostcodeTool(postcodeGate),
      convert_weight: convertWeightTool,
    },
    // A message that needs country + postcode + weight lookups plus several
    // fill_form_field calls can easily take 6+ steps end-to-end — leave
    // headroom so the final text reply doesn't get cut off mid-chain.
    stopWhen: stepCountIs(10),
  });

  // Deterministic backstop, not another thing to ask the model nicely for:
  // if this turn resolved both a postcode and a country but never landed on
  // city/state (the model skipped lookup_postcode, or tried to recall them
  // from memory and got rejected by the gate above), resolve them directly
  // here so the form still ends up correct regardless of what the model did.
  const postcodeUpdate = updates.find((u) => u.field === "shippingPostCode");
  const countryUpdate = updates.find((u) => u.field === "shippingCountry");
  const hasCity = updates.some((u) => u.field === "shippingCity");
  const hasState = updates.some((u) => u.field === "shippingState");

  if (postcodeUpdate && countryUpdate && (!hasCity || !hasState)) {
    const country = lookupCountry(countryUpdate.value);
    const resolved = country ? await lookupPostcode(postcodeUpdate.value, country.code) : null;
    if (resolved) {
      if (!hasCity) updates.push({ field: "shippingCity", value: resolved.placeName });
      if (!hasState && resolved.adminName1) {
        updates.push({ field: "shippingState", value: resolved.adminName1 });
      }
    }
  }

  // The caller persists this turn's messages (user + assistant/tool) as the
  // history to send back on the next turn — the route itself holds no state.
  return { reply: result.text, updates, messages: [userMessage, ...result.responseMessages] };
}

// Tried in order — gemini-2.5-flash-lite has a separate quota from
// gemini-2.5-flash, so it's worth a shot before falling back to Groq.
const MODEL_CHAIN: { name: string; model: LanguageModel }[] = [
  { name: "gemini-2.5-flash", model: google("gemini-2.5-flash") },
  { name: "gemini-2.5-flash-lite", model: google("gemini-2.5-flash-lite") },
  { name: "groq llama-3.3-70b-versatile", model: groq("llama-3.3-70b-versatile") },
];

export async function POST(req: Request) {
  const { message, replyLocale, profile, history } = await req.json();
  const locale: Locale = replyLocale === "th" ? "th" : "en";
  const replyLanguage = locale === "th" ? "Thai" : "English";
  const conversationHistory: ModelMessage[] = Array.isArray(history) ? history : [];

  const errors: unknown[] = [];
  for (const { name, model } of MODEL_CHAIN) {
    try {
      const data = await runAgent(
        model,
        conversationHistory,
        message,
        replyLanguage,
        locale,
        profile,
      );
      return NextResponse.json(data);
    } catch (error) {
      console.error(`${name} failed:`, error);
      errors.push(error);
    }
  }

  // Only report "quota_exceeded" if every provider actually hit a rate
  // limit — a mix (e.g. Groq failing for an unrelated reason) is a genuine
  // outage, not something waiting a bit will fix.
  const allRateLimited = errors.every(isRateLimitError);
  return NextResponse.json(
    { error: allRateLimited ? "quota_exceeded" : "agent_unavailable" },
    { status: allRateLimited ? 429 : 502 },
  );
}
