const BASE_URL = "https://secure.geonames.org";

type GeonamesPostalResult = {
  postalCode: string;
  countryCode: string;
  placeName: string;
  adminName1?: string;
};

export type PostcodeLookupResult = {
  placeName: string;
  adminName1?: string;
};

function getUsername(): string {
  const username = process.env.GEONAMES_USERNAME;
  if (!username) throw new Error("GEONAMES_USERNAME is not configured");
  return username;
}

// Strips accents/diacritics so a result is safe to drop straight into a
// plain-text form field regardless of source script.
function normalizeText(text: string): string {
  if (!text) return text;
  return text.normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/\s+/g, " ").trim();
}

// Resolves a postcode to its city + state, scoped to a known country.
// GeoNames postcode formats overlap across countries (e.g. "6000" matches
// Denmark, Australia, Hungary...), so country must be known first — never
// call this to guess the country.
export async function lookupPostcode(
  postcode: string,
  countryCode: string,
): Promise<PostcodeLookupResult | null> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 5000);

  try {
    const params = new URLSearchParams({
      postalcode: postcode.trim(),
      country: countryCode.toUpperCase(),
      maxRows: "50",
      username: getUsername(),
    });

    const res = await fetch(`${BASE_URL}/postalCodeSearchJSON?${params}`, {
      signal: controller.signal,
    });
    if (!res.ok) return null;

    const data = (await res.json()) as { postalCodes?: GeonamesPostalResult[] };
    const rows = data.postalCodes ?? [];
    if (!rows.length) return null;

    // A single postcode can come back as several rows (one per district it
    // spans), each possibly with a slightly different admin name — take
    // whichever state name most rows agree on rather than trusting
    // whichever one happens to be first.
    const stateVotes = new Map<string, number>();
    for (const row of rows) {
      const name = normalizeText(row.adminName1 || "");
      if (name) stateVotes.set(name, (stateVotes.get(name) ?? 0) + 1);
    }
    const state = [...stateVotes.entries()].sort((a, b) => b[1] - a[1])[0]?.[0];

    return { placeName: normalizeText(rows[0].placeName || ""), adminName1: state };
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}
