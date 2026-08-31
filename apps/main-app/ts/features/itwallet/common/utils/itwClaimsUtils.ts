/**
 * Utility functions for working with credential claims.
 */

import { addPadding } from "@pagopa/io-react-native-jwt";
import { differenceInCalendarDays, isValid } from "date-fns";
import I18n from "i18next";
import { truncate } from "lodash";
import { Result } from "neverthrow";
import { z } from "zod";

import { Locales } from "../../../../i18n";
import { parseWithSchema } from "./itwSchemaUtils";
import { CredentialMetadata, ParsedCredential } from "./itwTypesUtils";

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
   * Claim used to display the attachments of a credential (currently used for the European Health Insurance Card)
   */
  content = "content",
  date_of_expiry = "date_of_expiry",
  /**
   * Claims that contains the document number, if applicable for the credential
   */
  document_number = "document_number",
  /**
   * Claim that contains the driving privilege within the new nested structure
   */
  driving_privileges = "driving_privileges",
  /**
   * Claim used to extract expiry date from a credential. This is used to display how many days are left for
   * the credential expiration or to know if the credential is expired
   */
  expiry_date = "expiry_date",
  /**
   * Claim that contains the family name, if applicable for the credential
   */
  family_name = "family_name",
  /**
   * Claim that contains the first name, if applicable for the credential
   */
  given_name = "given_name",
  /**
   * Claim used to display the QR Code on the back of the European Disability Card.
   * It must be excluded from common claims lists.
   */
  link_qr_code = "link_qr_code",
  /**
   * Claim that contains the portrait image
   */
  portrait = "portrait",
  /**
   * Claim that contains the fiscal code, used for checks based on the user's identity.
   */
  tax_id_code = "tax_id_code",
  /**
   * Unique ID must be excluded from every credential and should not rendered in the claims list
   */
  unique_id = "unique_id"
}

/**
 * Union type for claim display format, either flat or nested
 */
export type ClaimDisplayFormat =
  | FlatClaimDisplayFormat
  | NestedArrayClaimDisplayFormat;

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

/**
 * Enum for the claims locales.
 * This is used to get the correct locale for the claims.
 * Currently the only supported locales are it-IT and en-US.
 */
export enum ClaimsLocales {
  en = "en-US",
  it = "it-IT"
}

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
  private day: number;
  private month: number;
  private year: number;

  constructor(year: number, month: number, day: number) {
    this.year = year;
    this.month = month;
    this.day = day;
  }

  /**
   * Returns the day (1-31)
   */
  getDate(): number {
    return this.day;
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
   * Returns a Date object
   */
  toDate(): Date {
    return new Date(this.year, this.month, this.day);
  }

  toDateWithoutTimezone(): Date {
    return new Date(Date.UTC(this.year, this.month, this.day));
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
}

/**
 * Map from the app locales to the claims locales.
 * Currently en is mapped to en-US and it to it-IT.
 */
const localeToClaimsLocales = new Map<Locales, ClaimsLocales>([
  ["en", ClaimsLocales.en],
  ["it", ClaimsLocales.it]
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
 * CLAIM SCHEMAS
 *
 *
 *
 */

/**
 * Regex for the date format which is used to validate the date claim as ISO 8601:2004 YYYY-MM-DD format.
 */
const DATE_FORMAT_REGEX = /^\d{4}-\d{2}-\d{2}$/;

/**
 * Regex for the picture URL format which is used to validate the image claim as a base64 encoded png image.
 */
const PICTURE_URL_REGEX = /^data:image\/(png|jpg|jpeg|bmp);base64,/;

/**
 * Regex for the PDF data format which is used to validate the PDF file claim as a base64 encoded PDF.
 */
const PDF_DATA_REGEX = /^data:application\/pdf;base64,/;

/**
 * Regex for a generic URL
 */
const URL_REGEX = /^https?:\/\//;

/**
 * Regex for the fiscal code
 */
const FISCAL_CODE_WITH_PREFIX =
  /(TINIT-[A-Z]{6}[0-9LMNPQRSTUV]{2}[ABCDEHLMPRST][0-9LMNPQRSTUV]{2}[A-Z][0-9LMNPQRSTUV]{3}[A-Z])/;

/**
 * The name of a claim, either a plain string or a map of locale to translated name.
 */
const LocaleName = z.union([z.string(), z.record(z.string(), z.string())]);

/**
 * A single attribute of a parsed credential: the raw value plus its display name.
 */
const ParsedAttribute = z.object({
  value: z.string(),
  name: LocaleName
});

/**
 * Parses a JSON-encoded string into its decoded value.
 * Some claims (e.g. the legacy mDL driving privileges) are transported as a JSON string.
 */
const JsonFromString = z.string().transform((input, ctx): unknown => {
  try {
    return JSON.parse(input);
  } catch {
    ctx.addIssue({ code: "custom", message: "Invalid JSON string" });
    return z.NEVER;
  }
});

/**
 * Schema for the date claim field of the credential.
 * The date format is checked against {@link DATE_FORMAT_REGEX}. This is needed because a generic date
 * schema would accept invalid dates like numbers, thus decoding properly and returning a wrong claim
 * item to be displayed. The parsed value is a {@link SimpleDate}, a simpler date class with day,
 * month and year properties.
 */
export const SimpleDateClaim = z
  .string()
  .regex(DATE_FORMAT_REGEX)
  .transform(
    input =>
      new SimpleDate(
        +input.slice(0, 4),
        +input.slice(5, 7) - 1,
        +input.slice(8, 10)
      )
  );

/**
 * Schema for the place of birth claim field of the credential.
 */
export const PlaceOfBirthClaim = z.object({
  country: z.string(),
  locality: z.string()
});
export type PlaceOfBirthClaimType = z.infer<typeof PlaceOfBirthClaim>;

/**
 * A single mDL driving privilege, in the shape consumed by the UI.
 */
const DrivingPrivilegeClaim = z.object({
  driving_privilege: z.string(),
  issue_date: SimpleDateClaim,
  expiry_date: SimpleDateClaim,
  restrictions_conditions: z.union([z.string(), z.null()])
});

export type DrivingPrivilegeClaimType = z.infer<typeof DrivingPrivilegeClaim>;

/**
 * Legacy mDL driving privileges, transported as a JSON-encoded string.
 */
export const DrivingPrivilegesClaim = JsonFromString.pipe(
  z.array(DrivingPrivilegeClaim)
);

export type DrivingPrivilegesClaimType = Array<DrivingPrivilegeClaimType>;

/**
 * mDoc format of the mDL driving privileges: a flat array without display names.
 */
export const DrivingPrivilegesFlatRaw = z.array(
  z.object({
    vehicle_category_code: z.string(),
    issue_date: SimpleDateClaim,
    expiry_date: SimpleDateClaim
  })
);

/**
 * Current format of the mDL driving privileges: an array of objects where every field carries
 * both its display name and its value.
 */
export const DrivingPrivilegesValueRaw = z.array(
  z.object({
    vehicle_category_code: z.object({
      name: LocaleName,
      value: z.string()
    }),
    issue_date: z.object({
      name: LocaleName,
      value: SimpleDateClaim
    }),
    expiry_date: z.object({
      name: LocaleName,
      value: SimpleDateClaim
    }),
    codes: z
      .object({
        name: LocaleName,
        value: z.array(z.object({ code: ParsedAttribute }))
      })
      .optional()
  })
);

/**
 * Both mDL driving privileges raw formats, normalised into the shape consumed by the UI.
 * Restriction codes, when present, are joined into a single string.
 */
export const DrivingPrivilegesCustomClaim = z.union([
  DrivingPrivilegesValueRaw.transform(
    (items): DrivingPrivilegesClaimType =>
      items.map(item => ({
        driving_privilege: item.vehicle_category_code.value,
        issue_date: item.issue_date.value,
        expiry_date: item.expiry_date.value,
        restrictions_conditions:
          item.codes?.value.map(({ code }) => code.value).join(", ") ?? null
      }))
  ),
  DrivingPrivilegesFlatRaw.transform(
    (items): DrivingPrivilegesClaimType =>
      items.map(item => ({
        driving_privilege: item.vehicle_category_code,
        issue_date: item.issue_date,
        expiry_date: item.expiry_date,
        restrictions_conditions: null
      }))
  )
]);

/**
 * Schema for the fiscal code. This is needed since we have to remove the INIT prefix when rendering it.
 */
export const FiscalCodeClaim = z.string().regex(FISCAL_CODE_WITH_PREFIX);

/**
 * Schema for a generic URL
 */
export const UrlClaim = z.string().regex(URL_REGEX);

/**
 * Alias for a boolean claim
 */
export const BoolClaim = z.boolean();

/**
 * Empty string fallback of the claim field of the credential.
 */
export const EmptyStringClaim = z.literal("");

/**
 * Alias for the string claim field of the credential.
 */
export const StringClaim = z.string().min(1);

/**
 * Schema for an URL image in base64 format
 */
export const ImageClaim = z.string().regex(PICTURE_URL_REGEX);

export const PdfClaim = z.string().regex(PDF_DATA_REGEX);

/**
 * Schema for a simple list of string claims (for instance, nationality codes)
 */
export const SimpleListClaim = z.array(z.string());

/**
 * Record of string keys and ParsedAttribute values.
 * This is used to parse nested claims.
 */
export const NestedObjectClaim = z.record(z.string(), ParsedAttribute);

/**
 * Array of records of string keys and ParsedAttribute values.
 * This is used to parse nested claims.
 */
export const NestedArrayClaim = z.array(NestedObjectClaim);

/**
 * Tags a schema output so that the claim kind can be resolved with a `switch` by the consumers,
 * instead of re-checking the decoded value against every schema.
 */
const tagged = <K extends string, S extends z.ZodType>(kind: K, schema: S) =>
  schema.transform(
    value => ({ kind, value }) as { kind: K; value: z.output<S> }
  );

/**
 * Schema for the claim field of the credential.
 * It includes all the possible kinds of claims and falls back to string.
 * The order of the union members is significant: the first one that matches wins.
 */
export const ClaimValue = z.union([
  // Parse an object representing the place of birth
  tagged("placeOfBirth", PlaceOfBirthClaim),
  // Parse a custom object representing a mDL driving privileges
  tagged("drivingPrivileges", DrivingPrivilegesCustomClaim),
  // Parse an object representing a mDL driving privileges
  tagged("drivingPrivileges", DrivingPrivilegesClaim),
  // Parse an object representing a nested claim (the nested claim needs to be re-parsed again)
  tagged("nestedObject", NestedObjectClaim),
  // Parse an array of nested claims (the nested claims needs to be re-parsed again)
  tagged("nestedArray", NestedArrayClaim),
  // Otherwise parse a date as string
  tagged("date", SimpleDateClaim),
  // Otherwise parse an image
  tagged("image", ImageClaim),
  // Otherwise parse a PDF
  tagged("pdf", PdfClaim),
  // Otherwise parse a fiscal code
  tagged("fiscalCode", FiscalCodeClaim),
  // Otherwise parse bool value
  tagged("bool", BoolClaim),
  // Otherwise parse an url value
  tagged("url", UrlClaim),
  // Otherwise parse a list of strings
  tagged("list", SimpleListClaim),
  // Otherwise fallback to string
  tagged("string", StringClaim),
  // Otherwise fallback to empty string
  tagged("emptyString", EmptyStringClaim)
]);

/**
 * A claim value that was successfully recognised, tagged with the kind that determines
 * how it must be rendered.
 */
export type ClaimValue = z.output<typeof ClaimValue>;

export type ClaimValueKind = ClaimValue["kind"];

/**
 * The parsed value carried by the claim kinds `K`.
 */
export type ClaimValueOfKind<K extends ClaimValueKind> = Extract<
  ClaimValue,
  { kind: K }
>["value"];

/**
 * Parses a raw claim value into a tagged {@link ClaimValue}.
 *
 * @param value - The raw claim value, as read from the parsed credential.
 * @returns Ok with the tagged value, Err with the validation issues when no kind matches.
 */
export const parseClaimValue = (
  value: unknown
): Result<ClaimValue, z.ZodError> => parseWithSchema(ClaimValue, value);

/**
 * Whether the given raw claim value is a base64 encoded PDF attachment.
 */
export const isPdfClaim = (value: unknown): boolean =>
  PdfClaim.safeParse(value).success;

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
  // A credential could contain its expiration date in `expiry_date` or `date_of_expiry`
  const expireDate =
    credential[WellKnownClaim.expiry_date] ||
    credential[WellKnownClaim.date_of_expiry];

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
 * @returns The extracted fiscal code, `undefined` when the string does not contain one
 */
export const extractFiscalCode = (s: string): string | undefined =>
  s.match(FISCAL_CODE_REGEX)?.[0];

/**
 * Truncate long strings to avoid performance issues when rendering claims.
 */
export const getSafeText = (text: string) => truncate(text, { length: 128 });

export const isExpirationDateClaim = (claim: ClaimDisplayFormat) =>
  claim.id === WellKnownClaim.expiry_date ||
  claim.id === WellKnownClaim.date_of_expiry;

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
 * @param schema - optional schema for the claim value, defaults to a plain string
 * @returns a function that extracts a claim from a credential, `undefined` when it is missing or invalid
 */
export const extractClaim =
  <S extends z.ZodType = z.ZodString>(
    claimId: string,
    schema: S = z.string() as unknown as S
  ) =>
  (credential: ParsedCredential | undefined): undefined | z.output<S> => {
    const value = credential?.[claimId]?.value;
    return value === undefined
      ? undefined
      : parseWithSchema(schema, value).unwrapOr(undefined);
  };

/**
 * Returns the fiscal code from a credential (if applicable)
 * @param credential - the credential
 * @returns the fiscal code
 */
export const getFiscalCodeFromCredential = (
  credential: CredentialMetadata | undefined
): string => {
  const taxIdCode = extractClaim(WellKnownClaim.tax_id_code)(
    credential?.parsedCredential
  );
  return (taxIdCode && extractFiscalCode(taxIdCode)) ?? "";
};

/**
 * Returns the first name from a credential (if applicable)
 * @param credential - the credential
 * @returns the first name
 */
export const getFirstNameFromCredential = (
  credential: CredentialMetadata | undefined
): string =>
  extractClaim(WellKnownClaim.given_name)(credential?.parsedCredential) ?? "";

/**
 * Returns the family name from a credential (if applicable)
 * @param credential - the credential
 * @returns the family name
 */
export const getFamilyNameFromCredential = (
  credential: CredentialMetadata | undefined
): string =>
  extractClaim(WellKnownClaim.family_name)(credential?.parsedCredential) ?? "";

type ClaimDisplayValue =
  | {
      renderAs: "drivingPrivileges";
      value: Array<DrivingPrivilegeClaimType>;
    }
  | { renderAs: "image"; value: string }
  | { renderAs: "list"; value: Array<string> }
  | {
      renderAs: "nestedObject";
      value: Array<ClaimDisplayFormat>;
    }
  | {
      renderAs: "nestedObjectArray";
      value: Array<Array<ClaimDisplayFormat>>;
    }
  | { renderAs: "text"; value: string };

/**
 * Converts a driving privilege claim into a list of displayable claims.
 * This is used to present detailed information in the claim details bottom sheet.
 * @param drivingPrivilege - The driving privilege claim to convert.
 * @returns A list of claims formatted for display purposes.
 */
export const drivingPrivilegeToClaims = (
  drivingPrivilege: DrivingPrivilegeClaimType
): Array<ClaimDisplayFormat> => [
  {
    id: "issue_date",
    label: I18n.t(
      "features.itWallet.verifiableCredentials.claims.mdl.issuedDate"
    ),
    value: drivingPrivilege.issue_date.toString("DD/MM/YYYY")
  },
  {
    id: "expiry_date",
    label: I18n.t(
      "features.itWallet.verifiableCredentials.claims.mdl.expirationDate"
    ),
    value: drivingPrivilege.expiry_date.toString("DD/MM/YYYY")
  },
  ...(drivingPrivilege.restrictions_conditions
    ? [
        {
          id: "restrictions_conditions",
          label: I18n.t(
            "features.itWallet.verifiableCredentials.claims.mdl.restrictionConditions"
          ),
          value: drivingPrivilege.restrictions_conditions
        }
      ]
    : [])
];

/**
 * Get the display value of a claim without being coupled to a specific UI component
 * @param claim - The claim to resolve, in {@link ClaimDisplayFormat}.
 * @returns A {@link ClaimDisplayValue} describing how the claim should be displayed.
 */
export const getClaimDisplayValue = (
  claim: ClaimDisplayFormat
): ClaimDisplayValue => {
  const notAvailable: ClaimDisplayValue = {
    renderAs: "text",
    value: I18n.t("features.itWallet.generic.placeholders.claimNotAvailable")
  };

  return parseClaimValue(claim.value).match<ClaimDisplayValue>(
    parsed => {
      switch (parsed.kind) {
        case "bool":
          return {
            renderAs: "text",
            value: I18n.t(
              parsed.value
                ? "features.itWallet.presentation.credentialDetails.boolClaim.true"
                : "features.itWallet.presentation.credentialDetails.boolClaim.false"
            )
          };
        case "date":
          return { renderAs: "text", value: parsed.value.toString() };
        case "drivingPrivileges":
          return { renderAs: "drivingPrivileges", value: parsed.value };
        case "emptyString":
        case "pdf":
        case "url":
          return { renderAs: "text", value: parsed.value };
        case "fiscalCode":
          return {
            renderAs: "text",
            value: extractFiscalCode(parsed.value) ?? parsed.value
          };
        case "image":
          return { renderAs: "image", value: parsed.value };
        case "list":
          return { renderAs: "list", value: parsed.value };
        case "nestedArray":
          return {
            renderAs: "nestedObjectArray",
            value: parsed.value.map(obj => parseClaims(obj))
          };
        case "nestedObject":
          return { renderAs: "nestedObject", value: parseClaims(parsed.value) };
        case "placeOfBirth":
          return {
            renderAs: "text",
            value: `${parsed.value.locality} (${parsed.value.country})`
          };
        case "string":
          // The portrait is transported as a raw base64 payload, without the data URL prefix
          return claim.id.includes(WellKnownClaim.portrait)
            ? {
                renderAs: "image",
                value: `data:image/jpeg;base64,${addPadding(parsed.value)}`
              }
            : { renderAs: "text", value: parsed.value };
      }
    },
    () => notAvailable
  );
};
