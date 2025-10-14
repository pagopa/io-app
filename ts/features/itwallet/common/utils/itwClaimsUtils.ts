/**
 * Utility functions for working with credential claims.
 */

import { NonEmptyString, PatternString } from "@pagopa/ts-commons/lib/strings";
import { differenceInCalendarDays, isValid } from "date-fns";
import * as E from "fp-ts/lib/Either";
import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import * as t from "io-ts";
import { truncate } from "lodash";
import I18n from "i18next";
import { Locales } from "../../../../../locales/locales";
import { JsonFromString } from "./ItwCodecUtils";
import { ParsedCredential, StoredCredential } from "./itwTypesUtils";

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
 * We strongly discourage direct claim manipulation, but some special cases must be addressed with direct access
 */
export enum WellKnownClaim {
  /**
   * Unique ID must be excluded from every credential and should not rendered in the claims list
   */
  unique_id = "unique_id",
  /**
   * Claim used to extract expiry date from a credential. This is used to display how many days are left for
   * the credential expiration or to know if the credential is expired
   */
  expiry_date = "expiry_date",
  /**
   * Claim used to display a QR Code for the Disability Card. It must be excluded from the common claims list
   * and rendered using a {@link QRCodeImage} (currently used for the European Disability Card)
   */
  link_qr_code = "link_qr_code",
  /**
   * Claim used to display the attachments of a credential (currently used for the European Health Insurance Card)
   */
  content = "content",
  /**
   * Claim that contains the fiscal code, used for checks based on the user's identity.
   */
  tax_id_code = "tax_id_code",
  /**
   * Claims that contains the document number, if applicable for the credential
   */
  document_number = "document_number",
  /**
   * Claim that contains the first name, if applicable for the credential
   */
  given_name = "given_name",
  /**
   * Claim that contains the family name, if applicable for the credential
   */
  family_name = "family_name",
  /**
   * Claim that contains the portrait image
   */
  portrait = "portrait",
  /**
   * Claim that contains the driving privilege within the new nested structure
   */
  driving_privileges = "driving_privileges"
}

/**
 * Type for disclosable claims.
 */
export type DisclosureClaim = {
  claim: ClaimDisplayFormat;
  source: string;
};

/**
 * Flat claim that contains a primitive value or an array of primitives
 */
export type FlatClaimDisplayFormat = {
  id: string;
  label: string;
  value: unknown;
};

/**
 * Nested claim that contains an array of objects (ParsedCredential)
 */
export type NestedArrayClaimDisplayFormat = {
  id: string;
  label: string;
  value: Array<ParsedCredential>;
};

/**
 * Union type for claim display format, either flat or nested
 */
export type ClaimDisplayFormat =
  | FlatClaimDisplayFormat
  | NestedArrayClaimDisplayFormat;

/**
 * Parses the claims from the credential, including nested claims.
 * For each Record entry, it maps the key and the attribute value to a label and a value.
 * If a claim's value is an array of objects, it recursively parses each object.
 * The label is taken from the attribute name which is either a string or a record of locale and string.
 * If the type of the attribute name is string then we take its value because locales have not been set.
 * If the type of the attribute name is a record then we take the value of the locale that matches the current locale.
 * If there's no locale that matches the current locale then we take the attribute key as the name.
 * The value is taken from the attribute value.
 * @param parsedCredential - the parsed credential.
 * @param options.exclude - an array of keys to exclude from the claims. TODO [SIW-1383]: remove this dirty hack
 * @returns the array of {@link ClaimDisplayFormat} of the credential contained in its configuration schema.
 */
export const parseClaims = (
  parsedCredential: ParsedCredential,
  options: { exclude?: Array<string> } = {}
): Array<ClaimDisplayFormat> => {
  const { exclude = [] } = options;

  return Object.entries(parsedCredential)
    .filter(([key]) => !exclude.includes(key))
    .map(([key, attribute]) => {
      const attributeName =
        typeof attribute.name === "string"
          ? attribute.name
          : attribute.name?.[getClaimsFullLocale()] || key;

      return {
        id: key,
        label: attributeName,
        value: attribute.value
      };
    });
};

/**
 *
 *
 *
 * CLAIMS LOCALE UTILS
 *
 *
 *
 */

export const SimpleDateFormat = {
  DDMMYYYY: "DD/MM/YYYY",
  DDMMYY: "DD/MM/YY"
} as const;

export type SimpleDateFormat =
  (typeof SimpleDateFormat)[keyof typeof SimpleDateFormat];

/**
 * A simpler Date class with day, month and year properties
 * It simplifies dates handling by removing Date overhead
 * @property year - the year
 * @property month - the month (0-11)
 * @property day - the day (1-31)
 * @function toDate - returns a Date object
 * @function toString - returns a string in the format "DD/MM/YYYY"
 */
export class SimpleDate {
  private year: number;
  private month: number;
  private day: number;

  constructor(year: number, month: number, day: number) {
    this.year = year;
    this.month = month;
    this.day = day;
  }

  /**
   * Returns a string in the format specified by the format parameter
   */
  toString(format: SimpleDateFormat = "DD/MM/YYYY"): string {
    const dayString = this.day.toString().padStart(2, "0");
    const monthString = (this.month + 1).toString().padStart(2, "0");
    const yearString = this.year.toString();
    return format
      .replace("DD", dayString)
      .replace("MM", monthString)
      .replace("YYYY", yearString)
      .replace("YY", yearString.slice(-2));
  }

  /**
   * Returns a Date object
   */
  toDate(): Date {
    return new Date(this.year, this.month, this.day);
  }

  toDateWithoutTimezone(): Date {
    return new Date(Date.UTC(this.year, this.month, this.day));
  }

  /**
   * Returns the year
   */
  getFullYear(): number {
    return this.year;
  }

  /**
   * Returns the month (0-11)
   */
  getMonth(): number {
    return this.month;
  }

  /**
   * Returns the day (1-31)
   */
  getDate(): number {
    return this.day;
  }
}

/**
 * Enum for the claims locales.
 * This is used to get the correct locale for the claims.
 * Currently the only supported locales are it-IT and en-US.
 */
export enum ClaimsLocales {
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
  localeToClaimsLocales.get(I18n.language as Locales) ?? ClaimsLocales.it;

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
const PICTURE_URL_REGEX = "^data:image\\/(png|jpg|jpeg|bmp);base64,";

/**
 * Regex for the PDF data format which is used to validate the PDF file claim as a base64 encoded PDF.
 */
const PDF_DATA_REGEX = "^data:application/pdf;base64,";

/**
 * Regex for a generic URL
 */
const URL_REGEX = "^https?://";

/**
 * Regex for the fiscal code
 */
const FISCAL_CODE_WITH_PREFIX =
  "(TINIT-[A-Z]{6}[0-9LMNPQRSTUV]{2}[ABCDEHLMPRST][0-9LMNPQRSTUV]{2}[A-Z][0-9LMNPQRSTUV]{3}[A-Z])";

const LocaleName = t.union([t.string, t.record(t.string, t.string)]);

/**
 * Decoder for a nested array of claims.
 * Each object in the array is a record of string keys and ParsedAttribute values.
 * The ParsedAttribute is an object with a value and a name, where the name can be either a string or a record of locale and string.
 */

const ParsedAttribute = t.type({
  value: t.string,
  name: LocaleName
});

/**
 * io-ts decoder for the date claim field of the credential.
 * The date format is checked against the regex dateFormatRegex, which is currenlty mocked.
 * This is needed because a generic date decoder would accept invalid dates like numbers,
 * thus decoding properly and returning a wrong claim item to be displayed.
 * The returned date is a SimpleDate object, which is a simpler date class with day, month and year properties.
 */
export const SimpleDateClaim = new t.Type<SimpleDate, string, unknown>(
  "SimpleDateClaim",
  (input: unknown): input is SimpleDate => input instanceof SimpleDate,
  (input, context) =>
    pipe(
      PatternString(DATE_FORMAT_REGEX).validate(input, context),
      E.fold(
        () => t.failure(input, context, "Date is not in the correct format"),
        str => {
          const date = new SimpleDate(
            +str.slice(0, 4),
            +str.slice(5, 7) - 1,
            +str.slice(8, 10)
          );
          return t.success(date);
        }
      )
    ),
  (date: SimpleDate) =>
    `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
      2,
      "0"
    )}-${String(date.getDate()).padStart(2, "0")}`
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
const DrivingPrivilegeClaim = t.type({
  driving_privilege: t.string,
  issue_date: SimpleDateClaim,
  expiry_date: SimpleDateClaim,
  restrictions_conditions: t.union([t.string, t.null])
});

export type DrivingPrivilegeClaimType = t.TypeOf<typeof DrivingPrivilegeClaim>;

export const DrivingPrivilegesClaim = t.string
  .pipe(JsonFromString)
  .pipe(t.array(DrivingPrivilegeClaim));

export type DrivingPrivilegesClaimType = t.TypeOf<
  typeof DrivingPrivilegesClaim
>;

/**
 * Decoder for the raw driving privileges array used to parse the mdoc claim format of the mDL driving privileges.
 */
const DrivingPrivilegesItemFlatRaw = t.type({
  vehicle_category_code: t.string,
  issue_date: SimpleDateClaim,
  expiry_date: SimpleDateClaim
});
const DrivingPrivilegesFlatRaw = t.array(DrivingPrivilegesItemFlatRaw);

const DrivingPrivilegesFromFlatRaw = new t.Type<
  DrivingPrivilegesClaimType,
  t.TypeOf<typeof DrivingPrivilegesFlatRaw>,
  t.TypeOf<typeof DrivingPrivilegesFlatRaw>
>(
  "DrivingPrivilegesFromFlatRaw",
  DrivingPrivilegesClaim.is,
  (input, c) => {
    try {
      return t.success(
        input.map(item => ({
          driving_privilege: item.vehicle_category_code,
          issue_date: item.issue_date,
          expiry_date: item.expiry_date,
          restrictions_conditions: null
        }))
      );
    } catch (e) {
      return t.failure(input, c);
    }
  },
  output =>
    output.map(item => ({
      vehicle_category_code: item.driving_privilege,
      issue_date: item.issue_date,
      expiry_date: item.expiry_date
    }))
);

/**
 * Decoder for the raw driving privileges array, used to parse the new format of the mDL driving privileges.
 * This is needed to support the new format of the mDL driving privileges, which is an array of objects with
 * vehicle_category_code, issue_date and expiry_date fields.
 */
const DrivingPrivilegesItemRaw = t.intersection([
  t.type({
    vehicle_category_code: t.type({
      name: LocaleName,
      value: t.string
    }),
    issue_date: t.type({
      name: LocaleName,
      value: SimpleDateClaim
    }),
    expiry_date: t.type({
      name: LocaleName,
      value: SimpleDateClaim
    })
  }),
  // Optional properties
  t.partial({
    codes: t.type({
      name: LocaleName,
      value: t.array(t.type({ code: ParsedAttribute }))
    })
  })
]);

/**
 * Array of driving privileges in the raw format
 */
export const DrivingPrivilegesValueRaw = t.array(DrivingPrivilegesItemRaw);

export type DrivingPrivilegesValueRawType = t.TypeOf<
  typeof DrivingPrivilegesValueRaw
>;

export const DrivingPrivilegesFromRaw = new t.Type<
  DrivingPrivilegesClaimType,
  DrivingPrivilegesValueRawType,
  DrivingPrivilegesValueRawType
>(
  "DrivingPrivilegesFromRaw",
  DrivingPrivilegesClaim.is,
  (input, c) => {
    try {
      return t.success(
        input.map(item => ({
          driving_privilege: item.vehicle_category_code.value,
          issue_date: item.issue_date.value,
          expiry_date: item.expiry_date.value,
          restrictions_conditions:
            item.codes?.value.map(({ code }) => code.value).join(", ") ?? null
        }))
      );
    } catch (e) {
      return t.failure(input, c);
    }
  },
  output =>
    output.map(item => ({
      vehicle_category_code: {
        name: "",
        value: item.driving_privilege
      },
      issue_date: {
        name: "",
        value: item.issue_date
      },
      expiry_date: {
        name: "",
        value: item.expiry_date
      }
    }))
);

export const DrivingPrivilegesCustomClaim = t.union([
  DrivingPrivilegesValueRaw.pipe(DrivingPrivilegesFromRaw),
  DrivingPrivilegesFlatRaw.pipe(DrivingPrivilegesFromFlatRaw)
]);

/**
 * Decoder for the fiscal code. This is needed since we have to remove the INIT prefix when rendering it.
 */
export const FiscalCodeClaim = PatternString(FISCAL_CODE_WITH_PREFIX);

/**
 * Decoder for a generic URL
 */
export const UrlClaim = PatternString(URL_REGEX);

/**
 * Alias for a boolean claim
 */
export const BoolClaim = t.boolean;

/**
 * Empty string fallback of the claim field of the credential.
 */
export const EmptyStringClaim = new t.Type<string, string, unknown>(
  "EmptyString",
  (input: unknown): input is string => input === "", // Type guard
  (input, context) =>
    typeof input === "string" && input === ""
      ? t.success(input)
      : t.failure(input, context, "Expected an empty string"),
  t.identity
);

/**
 * Alias for the string claim field of the credential.
 */
export const StringClaim = NonEmptyString;

/**
 * Decoder for an URL image in base64 format
 */
export const ImageClaim = PatternString(PICTURE_URL_REGEX);

export const PdfClaim = PatternString(PDF_DATA_REGEX);

/**
 * Decoder for a simple list of string claims (for instance, nationality codes)
 */
export const SimpleListClaim = t.array(t.string);

/**
 * Record of string keys and ParsedAttribute values.
 * This is used to parse nested claims.
 */
export const NestedObjectClaim = t.record(t.string, ParsedAttribute);

/**
 * Array of records of string keys and ParsedAttribute values.
 * This is used to parse nested claims.
 */
export const NestedArrayClaim = t.array(NestedObjectClaim);

/**
 * Union type for nested claims, either an object or an array of objects.
 */
export const NestedClaim = t.union([NestedObjectClaim, NestedArrayClaim]);

/**
 * Decoder type for the claim field of the credential.
 * It includes all the possible types of claims and fallbacks to string.
 * To add more custom objects to the union:
 * t.string.pipe(JsonFromString).pipe(t.union([PlaceOfBirthClaim, PlaceOfBirthClaim]))
 */
export const ClaimValue = t.union([
  // Parse an object representing the place of birth
  PlaceOfBirthClaim,
  // Parse a custom object representing a mDL driving privileges
  DrivingPrivilegesCustomClaim,
  // Parse an object representing a mDL driving privileges
  DrivingPrivilegesClaim,
  // Parse an object representing a nested claim (the nested claim needs to be re-parsed again)
  NestedObjectClaim,
  // Parse an array of nested claims (the nested claims needs to be re-parsed again)
  NestedArrayClaim,
  // Otherwise parse a date as string
  SimpleDateClaim,
  // Otherwise parse an image
  ImageClaim,
  // Otherwise parse a PDF
  PdfClaim,
  // Otherwise parse a fiscal code
  FiscalCodeClaim,
  // Otherwise parse bool value
  BoolClaim,
  // Otherwise parse an url value
  UrlClaim,
  // Otherwise parse a list of strings
  SimpleListClaim,
  // Otherwise fallback to string
  StringClaim,
  // Otherwise fallback to empty string
  EmptyStringClaim
]);

/**
 *
 *
 * Expiration date and status
 *
 *
 */

/**
 * Returns the expiration date from a {@see ParsedCredential}, if present
 * @param credential the parsed credential claims
 * @returns a Date if found, undefined if not
 */
export const getCredentialExpireDate = (
  credential: ParsedCredential
): Date | undefined => {
  // A credential could contain its expiration date in `expiry_date`
  const expireDate = credential[WellKnownClaim.expiry_date];

  if (!expireDate?.value) {
    return undefined;
  }

  const date = new Date(expireDate.value as string);
  return isValid(date) ? date : undefined;
};

/**
 * Returns the remaining days until the expiration a {@see ParsedCredential}
 * @param credential the parsed credential claims
 * @returns the number of days until the expiration date, undefined if no expire date is found
 */
export const getCredentialExpireDays = (
  credential: ParsedCredential
): number | undefined => {
  const expireDate = getCredentialExpireDate(credential);

  if (expireDate === undefined) {
    return undefined;
  }

  return differenceInCalendarDays(expireDate, Date.now());
};

const FISCAL_CODE_REGEX =
  /([A-Z]{6}[0-9LMNPQRSTUV]{2}[ABCDEHLMPRST][0-9LMNPQRSTUV]{2}[A-Z][0-9LMNPQRSTUV]{3}[A-Z])/g;

/**
 * Extract a fiscal code from any string.
 * @param s - the input string
 * @returns An option with the extracted fiscal code
 */
export const extractFiscalCode = (s: string) =>
  pipe(s.match(FISCAL_CODE_REGEX), match => O.fromNullable(match?.[0]));

/**
 * Truncate long strings to avoid performance issues when rendering claims.
 */
export const getSafeText = (text: string) => truncate(text, { length: 128 });

export const isExpirationDateClaim = (claim: ClaimDisplayFormat) =>
  claim.id === WellKnownClaim.expiry_date;

/**
 *
 *
 * Claim extractors
 *
 *
 */

/**
 * Function that extracts a claim from a credential.
 * @param claimId - the claim id / name to extract
 * @param decoder - optional decoder for the claim value, defaults to decoding a string
 * @returns a function that extracts a claim from a credential
 */
export const extractClaim =
  <T = string>(
    claimId: string,
    decoder: (i: unknown) => t.Validation<T> = t.string.decode as (
      i: unknown
    ) => t.Validation<T>
  ) =>
  (credential: ParsedCredential): O.Option<T> =>
    pipe(
      credential,
      O.fromNullable,
      O.chainNullableK(x => x[claimId]?.value),
      O.map(decoder),
      O.chain(O.fromEither)
    );

/**
 * Returns the fiscal code from a credential (if applicable)
 * @param credential - the credential
 * @returns the fiscal code
 */
export const getFiscalCodeFromCredential = (
  credential: StoredCredential | undefined
) =>
  pipe(
    O.fromNullable(credential?.parsedCredential),
    O.chain(extractClaim(WellKnownClaim.tax_id_code)),
    O.chain(extractFiscalCode),
    O.getOrElse(() => "")
  );

/**
 * Returns the first name from a credential (if applicable)
 * @param credential - the credential
 * @returns the first name
 */
export const getFirstNameFromCredential = (
  credential: StoredCredential | undefined
) =>
  pipe(
    O.fromNullable(credential?.parsedCredential),
    O.chain(extractClaim(WellKnownClaim.given_name)),
    O.getOrElse(() => "")
  );

/**
 * Returns the family name from a credential (if applicable)
 * @param credential - the credential
 * @returns the family name
 */
export const getFamilyNameFromCredential = (
  credential: StoredCredential | undefined
) =>
  pipe(
    O.fromNullable(credential?.parsedCredential),
    O.chain(extractClaim(WellKnownClaim.family_name)),
    O.getOrElse(() => "")
  );

/**
 * Get the display value of a claim without being coupled to a specific UI component
 * @param claim The claim in {@link ClaimDisplayFormat}
 * @returns The display value as a string or an array of strings
 */
export const getClaimDisplayValue = (
  claim: ClaimDisplayFormat
): string | Array<string> =>
  pipe(
    claim.value,
    ClaimValue.decode,
    E.fold(
      () => I18n.t("features.itWallet.generic.placeholders.claimNotAvailable"),
      decoded => {
        if (PlaceOfBirthClaim.is(decoded)) {
          return `${decoded.locality} (${decoded.country})`;
        }
        if (SimpleDateClaim.is(decoded)) {
          return decoded.toString();
        }
        if (ImageClaim.is(decoded)) {
          return decoded;
        }
        if (DrivingPrivilegesClaim.is(decoded)) {
          return decoded.map(e => e.driving_privilege);
        }
        if (FiscalCodeClaim.is(decoded)) {
          return pipe(
            decoded,
            extractFiscalCode,
            O.getOrElseW(() => decoded)
          );
        }
        if (BoolClaim.is(decoded)) {
          return I18n.t(
            `features.itWallet.presentation.credentialDetails.boolClaim.${decoded}`
          );
        }
        if (
          SimpleListClaim.is(decoded) ||
          StringClaim.is(decoded) ||
          EmptyStringClaim.is(decoded)
        ) {
          return decoded; // must be the last one to be checked due to overlap with IPatternStringTag
        }

        return I18n.t(
          "features.itWallet.generic.placeholders.claimNotAvailable"
        );
      }
    )
  );
