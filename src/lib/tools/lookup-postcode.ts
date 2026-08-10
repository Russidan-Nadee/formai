import { tool } from "ai";
import { z } from "zod";
import { lookupPostcode } from "@/lib/geonames";
import type { PostcodeGate } from "@/lib/tools/fill-form-field";

export function createLookupPostcodeTool(postcodeGate: PostcodeGate) {
  return tool({
    description:
      "Resolve a postal/zip code to its city and state/province, within a known country. Requires the country to already be known — postcode formats overlap across countries. Only call this once shippingCountry is known: pass that country's ISO code along with the postcode, and use the result to fill shippingCity and shippingState if they're not already known. Never use this to guess the country, and never fill shippingCity/shippingState from your own memory of what a postcode maps to — always resolve them through this tool.",
    inputSchema: z.object({
      postcode: z.string(),
      countryCode: z.string().describe("ISO alpha-2 country code, e.g. from lookup_country"),
    }),
    execute: async ({ postcode, countryCode }) => {
      const result = await lookupPostcode(postcode, countryCode);
      if (!result) return { found: false };
      postcodeGate.postcodeLookupSucceeded = true;
      return { found: true, city: result.placeName, state: result.adminName1 };
    },
  });
}
