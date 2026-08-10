import { tool } from "ai";
import { z } from "zod";
import { lookupPostcode } from "@/lib/geonames";

export const lookupPostcodeTool = tool({
  description:
    "Resolve a postal/zip code to its city and state/province, within a known country. Requires the country to already be known — postcode formats overlap across countries.",
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
