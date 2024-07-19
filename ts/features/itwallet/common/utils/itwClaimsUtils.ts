/**
 * Utility functions for working with credential claims.
 */

import * as t from "io-ts";
import { PatternString } from "@pagopa/ts-commons/lib/strings";
import { patternDateFromString } from "@pagopa/ts-commons/lib/dates";
import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import * as E from "fp-ts/lib/Either";
import { Locales } from "../../../../../locales/locales";
import I18n from "../../../../i18n";
import { ParsedCredential, StoredCredential } from "./itwTypesUtils";
import { CredentialCatalogDisplay } from "./itwMocksUtils";

/**
 *
 *
 *
 * CLAIMS MANIPULATION UTILS
 *
 *
 *
 */

/**
 * Retrieves the organization name from the evidence claim of the given credential.
 * If the evidence claim is not present or cannot be decoded, a fallback value is returned.
 * @param credential - The parsed credential object.
 * @returns The organization name from the evidence claim or a fallback value.
 */
export const getEvidenceOrganizationName = (credential: ParsedCredential) =>
  pipe(
    credential.evidence,
    O.fromNullable,
    O.fold(
      () => I18n.t("features.itWallet.generic.placeholders.organizationName"),
      evidence =>
        pipe(
          evidence.value,
          EvidenceClaim.decode,
          E.fold(
            () =>
              I18n.t("features.itWallet.generic.placeholders.organizationName"),
            some => some[0].record.source.organization_name
          )
        )
    )
  );

/**
 * Type for each claim to be displayed.
 */
export type ClaimDisplayFormat = {
  id: string;
  label: string;
  value: unknown;
};

/**
 * Parses the claims from the credential.
 * For each Record entry it maps the key and the attribute value to a label and a value.
 * The label is taken from the attribute name which is either a string or a record of locale and string.
 * If the type of the attribute name is string then when take it's value because locales have not been set.
 * If the type of the attribute name is record then we take the value of the locale that matches the current locale.
 * If there's no locale that matches the current locale then we take the attribute key as the name.
 * The value is taken from the attribute value.
 * @param parsedCredential - the parsed credential.
 * @returns the array of {@link ClaimDisplayFormat} of the credential contained in its configuration schema.
 */
export const parseClaims = (
  parsedCredential: ParsedCredential
): Array<ClaimDisplayFormat> =>
  Object.entries(parsedCredential).map(([key, attribute]) => {
    const attributeName =
      typeof attribute.name === "string"
        ? attribute.name
        : attribute.name?.[getClaimsFullLocale()] || key;

    return { label: attributeName, value: attribute.value, id: key };
  });

/**
 * Sorts the parsedCredential according to the order of the displayData.
 * If the order is not available, the schema is returned as is.
 * @param parsedCredential - the parsed credential.
 * @param order - the order of the displayData.
 * @returns a new parsedCredential sorted according to the order of the displayData.
 */
export const sortClaims = (
  order: CredentialCatalogDisplay["order"],
  parsedCredential: ParsedCredential
) =>
  order
    ? Object.fromEntries(
        Object.entries(parsedCredential)
          .slice()
          .sort(([key1], [key2]) => order.indexOf(key1) - order.indexOf(key2))
      )
    : parsedCredential;

/**
 *
 *
 *
 * CLAIMS LOCALE UTILS
 *
 *
 *
 */

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
 *
 *
 *
 * IO-TS DECODER FOR THE CLAIMS
 *
 *
 *
 */

/**
 * Regex for the date format which is used to validate the date claim as ISO 8601:2004 YYYY-MM-DD format.
 */
const DATE_FORMAT_REGEX = "^\\d{4}-\\d{2}-\\d{2}$";

/**
 * Regex for the picture URL format which is used to validate the image claim as a base64 encoded png image.
 */
const PICTURE_URL_REGEX = "^data:image\\/png;base64,";

/**
 * io-ts decoder for the date claim field of the credential.
 * The date format is checked against the regex dateFormatRegex, which is currenlty mocked.
 * This is needed because a generic date decoder would accept invalid dates like numbers,
 * thus decoding properly and returning a wrong claim item to be displayed.
 */
export const DateClaim = patternDateFromString(DATE_FORMAT_REGEX, "DateClaim");

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
export type PlaceOfBirthClaimType = t.TypeOf<typeof PlaceOfBirthClaim>;

/**
 * io-ts decoder for the mDL driving privileges
 */
export const DrivingPrivilegesClaim = t.type({
  issue_date: t.string,
  vehicle_category_code: t.string,
  expiry_date: t.string
});
export type DrivingPrivilegesClaimType = t.TypeOf<
  typeof DrivingPrivilegesClaim
>;

/**
 * Alias for the string fallback of the claim field of the credential.
 */
export const PlainTextClaim = t.string;

export const ImageClaim = PatternString(PICTURE_URL_REGEX);

/**
 * Decoder type for the claim field of the credential.
 * It includes all the possible types of claims and fallbacks to string.
 * To add more custom objects to the union:
 * t.string.pipe(JsonFromString).pipe(t.union([PlaceOfBirthClaim, PlaceOfBirthClaim]))
 */
export const ClaimValue = t.union([
  // Parse an object representing the place of birth
  PlaceOfBirthClaim,
  // Parse an object representing a mDL driving privileges
  DrivingPrivilegesClaim,
  // Parse an object representing the claim evidence
  EvidenceClaim,
  // Otherwise parse a date
  DateClaim,
  // Otherwise parse an image
  ImageClaim,
  // Otherwise fallback to string
  PlainTextClaim
]);

type ClaimSection =
  | "personalData"
  | "documentData"
  | "licenseData"
  | "noSection";

export type DateClaimConfig = Partial<{
  iconVisible: boolean;
  expirationBadgeVisible: boolean;
}>;

/**
 * Hardcoded claims sections: currently it's not possible to determine how to group claims from the credential.
 * The order of the claims doesn't matter here, the credential's `displayData` order wins.
 * Claims that are present here but not in the credential are safely ignored.
 */
const sectionsByClaim: Record<string, ClaimSection> = {
  // Personal data claims
  given_name: "personalData",
  family_name: "personalData",
  birthdate: "personalData",
  place_of_birth: "personalData",
  tax_id_code: "personalData",
  tax_id_number: "personalData",
  portrait: "personalData",
  sex: "personalData",

  // Document data claims
  issue_date: "documentData",
  expiry_date: "documentData",
  expiration_date: "documentData",
  document_number: "documentData",

  // Driving license claims
  driving_privileges: "licenseData"
};

export const dateClaimsConfig: Record<string, DateClaimConfig> = {
  issue_date: { iconVisible: true },
  expiry_date: { iconVisible: true, expirationBadgeVisible: true },
  expiration_date: { iconVisible: true, expirationBadgeVisible: true }
};

export const previewDateClaimsConfig: DateClaimConfig = {
  iconVisible: false,
  expirationBadgeVisible: false
};

/**
 * Groups claims in a credential according to {@link sectionsByClaim}.
 * Claims are assigned to the designated section in the order specified by the credential's `displayData`.
 * Claims without a section are assigned to the key `noSection` so they can be rendered separately.
 * @param credential
 * @returns
 */
export const groupCredentialClaims = (credential: StoredCredential) => {
  const claims = parseClaims(credential.parsedCredential);

  return claims.reduce((acc, claim) => {
    const section = sectionsByClaim[claim.id] || "noSection";
    return {
      ...acc,
      [section]: (acc[section] || []).concat(claim)
    };
  }, {} as Record<ClaimSection, ReadonlyArray<ClaimDisplayFormat>>);
};
