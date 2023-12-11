import * as t from "io-ts";
import * as E from "fp-ts/lib/Either";
import { pipe } from "fp-ts/lib/function";
import { Locales } from "../../../../locales/locales";
import I18n from "../../../i18n";
import { dateFormatRegex } from "./mocks";

/**
 * Enum for the claims locales.
 * This is used to get the correct locale for the claims.
 * Currently the only supported locales are it-IT and en-US.
 */
enum ClaimsLocales {
  it = "it-IT",
  en = "en-US"
}

/**
 * Map from the app locales to the claims locales.
 * Currently en is mapped to en-US and it to it-IT.
 */
const localeToClaimsLocales = new Map<Locales, ClaimsLocales>([
  ["it", ClaimsLocales.it],
  ["en", ClaimsLocales.en]
]);

/**
 * Helper function to get a full claims locale locale from the current app locale.
 * @returns a enum value for the claims locale.
 */
export const getClaimsFullLocale = (): ClaimsLocales =>
  localeToClaimsLocales.get(I18n.currentLocale()) ?? ClaimsLocales.it;

/**
 * io-ts decoder for the date claim field of the credential.
 * The date format is checked against the regex dateFormatRegex, which is currenlty mocked.
 * This is needed because a generic date decoder would accept invalid dates like numbers,
 * thus decoding properly and returning a wrong claim item to be displayed.
 */
const DateClaim = new t.Type<Date, string, unknown>(
  "DateClaim",
  (u): u is Date => u instanceof Date,
  (u, c) =>
    pipe(
      t.string.validate(u, c),
      E.chain(str => {
        const regex = dateFormatRegex.test(str);
        if (!regex) {
          return t.failure(u, c);
        }
        const d = new Date(str);
        return isNaN(d.getTime()) ? t.failure(u, c) : t.success(d);
      })
    ),
  a => a.toString()
);

/**
 * io-ts decoder for the evidence claim field of the credential.
 */
export const EvidenceClaim = t.array(
  t.type({
    type: t.string,
    record: t.type({
      type: t.string,
      source: t.type({
        organization_name: t.string,
        organization_id: t.string,
        country_code: t.string
      })
    })
  })
);

/**
 * io-ts decoder for the place of birth claim field of the credential.
 */
export const PlaceOfBirthClaim = t.type({
  country: t.string,
  locality: t.string
});

/**
 * Alias for the place of birth claim type.
 */
export type PlaceOfBirthClaimType = t.TypeOf<typeof PlaceOfBirthClaim>;
/**
 * Alias for the string fallback of the claim field of the credential.
 */
export const TextClaim = t.string;

/**
 * Decoder type for the claim field of the credential.
 * It includes all the possible types of claims and fallbacks to string.
 * To add more custom objects to the union:
 * t.string.pipe(JsonFromString).pipe(t.union([PlaceOfBirthClaim, PlaceOfBirthClaim]))
 */
export const ClaimValue = t.union([
  // Parse an object representing the place of birth
  PlaceOfBirthClaim,
  // Parse an object representing the claim evidence
  EvidenceClaim,
  // Otherwise parse a date
  DateClaim,
  // Otherwise fallback to string
  TextClaim
]);
