import { tool } from "ai";
import { z } from "zod";
import { lookupCountry } from "@/lib/countries";

export const lookupCountryTool = tool({
  description:
    "Validate a country name or code and resolve it to its canonical English name. Matching is exact (case-insensitive) against English names, alpha-2, alpha-3, and numeric ISO codes only — no fuzzy matching. Before calling, translate the country to English and fix obvious spelling first (e.g. correct a typo or a non-English name to its standard English name); if it still comes back not found, treat that as a real unknown and ask the user to clarify rather than guessing. Call this before filling shippingCountry, using the country name or code from the message — if it returns not found, ask the user to clarify instead of filling the field.",
  inputSchema: z.object({ query: z.string() }),
  execute: async ({ query }) => {
    const result = lookupCountry(query);
    return result ? { found: true, ...result } : { found: false };
  },
});
