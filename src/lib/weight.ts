const UNIT_TO_KG: Record<string, number> = {
  kg: 1,
  kgs: 1,
  kilogram: 1,
  kilograms: 1,
  กก: 1,
  "กก.": 1,
  กิโล: 1,
  กิโลกรัม: 1,

  g: 0.001,
  gram: 0.001,
  grams: 0.001,
  กรัม: 0.001,

  lb: 0.45359237,
  lbs: 0.45359237,
  pound: 0.45359237,
  pounds: 0.45359237,
  ปอนด์: 0.45359237,

  oz: 0.0283495231,
  ounce: 0.0283495231,
  ounces: 0.0283495231,
  ออนซ์: 0.0283495231,
};

export type WeightConversionResult = { kg: number };

// Requires an explicit unit — there is no sensible default to fall back to,
// so an unrecognized or missing unit must be treated as "ask the user",
// never guessed.
export function convertWeightToKg(value: number, unit: string): WeightConversionResult | null {
  if (!Number.isFinite(value) || value <= 0) return null;

  const factor = UNIT_TO_KG[unit.trim().toLowerCase()];
  if (factor === undefined) return null;

  return { kg: Math.round(value * factor * 1000) / 1000 };
}
