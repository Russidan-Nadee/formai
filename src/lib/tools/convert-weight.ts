import { tool } from "ai";
import { z } from "zod";
import { convertWeightToKg } from "@/lib/weight";

export const convertWeightTool = tool({
  description:
    "Convert a weight with an explicit unit (kg, g, lb/lbs, oz, or their Thai equivalents like กิโล/กรัม/ปอนด์/ออนซ์) into kilograms. Never call this with a guessed unit — if the user gave a bare number with no unit, ask them what unit it's in first instead of calling this tool or filling weightKg.",
  inputSchema: z.object({
    value: z.number().describe("The numeric weight amount, e.g. 2.5"),
    unit: z.string().describe("The unit the user specified, e.g. 'kg', 'lbs', 'g', 'กิโล'"),
  }),
  execute: async ({ value, unit }) => {
    const result = convertWeightToKg(value, unit);
    return result ? { found: true, kg: result.kg } : { found: false };
  },
});
