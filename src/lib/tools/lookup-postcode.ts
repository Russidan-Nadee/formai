import { tool } from "ai";
import { z } from "zod";
import { lookupPostcode } from "@/lib/geonames";

export const lookupPostcodeTool = tool({
  description:
    "Resolve a postal/zip code to its city and state/province, within a known country. Requires the country to already be known — postcode formats overlap across countries. Only call this once shippingCountry is known: pass that country's ISO code along with the postcode, and use the result to fill shippingCity and shippingState if they're not already known. Never use this to guess the country.",
  inputSchema: z.object({
    postcode: z.string(),
    countryCode: z.string().describe("ISO alpha-2 country code, e.g. from lookup_country"),
  }),
  execute: async ({ postcode, countryCode }) => {
    const result = await lookupPostcode(postcode, countryCode);
    return result
      ? { found: true, city: result.placeName, state: result.adminName1 }
      : { found: false };
  },
});
