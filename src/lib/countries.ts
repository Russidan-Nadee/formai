import countries from "i18n-iso-countries";
import en from "i18n-iso-countries/langs/en.json";

countries.registerLocale(en);

export type CountryLookupResult = { code: string; name: string };

// Accepts a country name, alpha-2, or alpha-3 code in any casing and
// resolves it to a canonical ISO alpha-2 code + English name, or null
// if it doesn't match a real country.
export function lookupCountry(query: string): CountryLookupResult | null {
  const trimmed = query.trim();
  if (!trimmed) return null;

  const upper = trimmed.toUpperCase();
  const code = countries.isValid(upper)
    ? countries.alpha3ToAlpha2(upper) || upper
    : countries.getAlpha2Code(trimmed, "en");

  if (!code) return null;

  const name = countries.getName(code, "en");
  if (!name) return null;

  return { code, name };
}
