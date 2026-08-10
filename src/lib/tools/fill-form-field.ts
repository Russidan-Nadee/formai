import { tool } from "ai";
import { z } from "zod";
import { SHIPMENT_FIELD_KEYS } from "@/lib/shipment-fields";
import { lookupCountry } from "@/lib/countries";

export type FieldUpdate = { field: string; value: string };

// Takes the request-scoped `updates` array to push into, since the AI SDK
// tool object itself is stateless — the caller owns collecting results.
export function createFillFormFieldTool(updates: FieldUpdate[]) {
  return tool({
    description:
      "Fill one field of the shipment form. For shippingCountry: translate to English and fix obvious spelling before calling — only an exact English name or ISO code is accepted, and an unrecognized value is rejected instead of being filled. For weightKg: call convert_weight first if the user gave a unit, or ask the user for the unit if none was given — only a plain numeric kg value is accepted here, never a number with a unit attached.",
    inputSchema: z.object({
      field: z.enum(SHIPMENT_FIELD_KEYS),
      value: z.string(),
    }),
    execute: async ({ field, value }) => {
      // Enforced here rather than only asked for in the system prompt —
      // a misspelled or untranslated country name (e.g. a typo, or a
      // non-English name) must never reach the form as-is.
      if (field === "shippingCountry") {
        const resolved = lookupCountry(value);
        if (!resolved) {
          return {
            ok: false,
            error: `"${value}" is not a recognized country name or code. Ask the user to confirm the destination country instead of filling this field.`,
          };
        }
        updates.push({ field, value: resolved.name });
        return { ok: true, value: resolved.name };
      }

      // Same idea as shippingCountry: a weight with letters still attached
      // (a stray unit, or non-numeric junk) means it was never normalized
      // through convert_weight — reject rather than store it as-is.
      if (field === "weightKg") {
        const numeric = Number(value);
        if (!Number.isFinite(numeric) || numeric <= 0 || /[a-zA-Zก-๙]/.test(value)) {
          return {
            ok: false,
            error: `"${value}" is not a plain numeric kg value. Call convert_weight first if the user gave a unit, or ask the user for the weight's unit if none was given.`,
          };
        }
        updates.push({ field, value: String(numeric) });
        return { ok: true, value: String(numeric) };
      }

      updates.push({ field, value });
      return { ok: true };
    },
  });
}
