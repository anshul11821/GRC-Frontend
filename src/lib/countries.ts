import { getCountries, getCountryCallingCode } from "libphonenumber-js/min";

const names = new Intl.DisplayNames(["en"], { type: "region" });

export type Country = { iso: string; name: string; dial: string };

/**
 * Canonical country list: ISO 3166-1 alpha-2 codes with ITU-T E.164 calling codes.
 *
 * ponytail: derived at import rather than checked in as a data blob — libphonenumber
 * ships the calling codes, Intl.DisplayNames ships the localised names. Nothing to
 * keep in sync when a country or a dial code changes.
 */
export const COUNTRIES: Country[] = getCountries()
  .map((iso) => ({ iso, name: names.of(iso) ?? iso, dial: `+${getCountryCallingCode(iso)}` }))
  .sort((a, b) => a.name.localeCompare(b.name));

/**
 * One option per distinct calling code — we only ever store the code itself, so listing
 * +1 twenty-two times would be noise. Codes owned by a single country get its name
 * appended; shared ones (+1, +7, +44) stand alone rather than pick a winner.
 *
 * ponytail: no curated "primary country per code" table to maintain. The shared codes
 * are the famous ones nobody needs a hint for; the obscure codes are the unique ones.
 */
export const DIAL_CODES: { dial: string; label: string }[] = (() => {
  const owners = new Map<string, string[]>();
  for (const c of COUNTRIES) owners.set(c.dial, [...(owners.get(c.dial) ?? []), c.name]);
  return [...owners.entries()]
    .map(([dial, names]) => ({ dial, label: names.length === 1 ? `${dial} · ${names[0]}` : dial }))
    .sort((a, b) => Number(a.dial.slice(1)) - Number(b.dial.slice(1)));
})();

const BY_NAME = new Map(COUNTRIES.map((c) => [c.name.toLowerCase(), c]));

/**
 * Resolve a stored country value back to the canonical entry. Accepts the country
 * name (what we store) or a legacy free-text ISO code, so profiles saved before the
 * picker existed still preselect instead of showing blank.
 */
export function findCountry(value: string | null | undefined): Country | undefined {
  const v = (value ?? "").trim();
  if (!v) return undefined;
  return BY_NAME.get(v.toLowerCase()) ?? COUNTRIES.find((c) => c.iso === v.toUpperCase());
}
