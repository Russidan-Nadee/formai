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

// Resolves a postcode to its city + state, scoped to a known country.
// GeoNames postcode formats overlap across countries (e.g. "6000" matches
// Denmark, Australia, Hungary...), so country must be known first — never
// call this to guess the country from the postcode alone.
export async function lookupPostcode(
  postcode: string,
  countryCode: string,
): Promise<PostcodeLookupResult | null> {
  const params = new URLSearchParams({
    postalcode: postcode.trim(),
    country: countryCode.toUpperCase(),
    maxRows: "1",
    username: getUsername(),
  });

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 5000);

  try {
    const res = await fetch(`${BASE_URL}/postalCodeSearchJSON?${params}`, {
      signal: controller.signal,
    });
    if (!res.ok) return null;

    const data = (await res.json()) as { postalCodes?: GeonamesPostalResult[] };
    const match = data.postalCodes?.[0];
    if (!match) return null;

    return { placeName: match.placeName, adminName1: match.adminName1 };
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}
