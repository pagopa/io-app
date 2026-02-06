import { IOColors, Tag, useIOTheme } from "@pagopa/io-app-design-system";
import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import { SdJwt, Mdoc } from "@pagopa/io-react-native-wallet";
import I18n from "i18next";
import { isBefore } from "date-fns";
import { CredentialType } from "./itwMocksUtils";
import {
  CredentialBundle,
  CredentialFormat,
  CredentialMetadata,
  ItwCredentialStatus,
  Verification
} from "./itwTypesUtils";

// Credentials that can be actively requested and obtained by the user
export const availableCredentials = [
  CredentialType.DRIVING_LICENSE,
  CredentialType.EUROPEAN_DISABILITY_CARD,
  CredentialType.EUROPEAN_HEALTH_INSURANCE_CARD
] as const;

// New credentials that can be actively requested and obtained by the user
export const newCredentials = [
  CredentialType.EDUCATION_DEGREE,
  CredentialType.EDUCATION_ENROLLMENT,
  CredentialType.RESIDENCY
] as const;

export type NewCredential = (typeof newCredentials)[number];

// Credentials that will be available in the future
export const upcomingCredentials = [] as ReadonlyArray<string>;

export const isUpcomingCredential = (type: string): boolean =>
  upcomingCredentials.includes(type);

export const isNewCredential = (type: string): type is NewCredential =>
  newCredentials.includes(type as NewCredential);

export const itwGetCredentialNameByCredentialType = (
  isItwCredential: boolean
): Record<string, string> => ({
  [CredentialType.EUROPEAN_DISABILITY_CARD]: I18n.t(
    "features.itWallet.credentialName.dc"
  ),
  [CredentialType.EUROPEAN_HEALTH_INSURANCE_CARD]: I18n.t(
    "features.itWallet.credentialName.ts"
  ),
  [CredentialType.DRIVING_LICENSE]: I18n.t(
    "features.itWallet.credentialName.mdl"
  ),
  [CredentialType.PID]: I18n.t(
    isItwCredential
      ? "features.itWallet.credentialName.pid"
      : "features.itWallet.credentialName.eid"
  ),
  [CredentialType.EDUCATION_DEGREE]: I18n.t(
    "features.itWallet.credentialName.ed"
  ),
  [CredentialType.EDUCATION_ENROLLMENT]: I18n.t(
    "features.itWallet.credentialName.ee"
  ),
  [CredentialType.RESIDENCY]: I18n.t("features.itWallet.credentialName.res")
});

export const getCredentialNameFromType = (
  credentialType: string | undefined,
  withDefault: string = "",
  isItwCredential: boolean = false
): string =>
  pipe(
    O.fromNullable(credentialType),
    O.map(type => itwGetCredentialNameByCredentialType(isItwCredential)[type]),
    O.getOrElse(() => withDefault)
  );

export const useBorderColorByStatus: () => {
  [key in ItwCredentialStatus]: string;
} = () => {
  const theme = useIOTheme();

  return {
    valid: IOColors[theme["appBackground-primary"]],
    invalid: IOColors["error-600"],
    expired: IOColors["error-600"],
    expiring: IOColors["warning-700"],
    jwtExpired: IOColors["error-600"],
    jwtExpiring: IOColors["warning-700"],
    unknown: IOColors["grey-300"]
  };
};

export const tagPropsByStatus: { [key in ItwCredentialStatus]?: Tag } = {
  invalid: {
    variant: "error",
    text: I18n.t("features.itWallet.card.status.invalid")
  },
  expired: {
    variant: "error",
    text: I18n.t("features.itWallet.card.status.expired")
  },
  jwtExpired: {
    variant: "error",
    text: I18n.t("features.itWallet.card.status.verificationExpired")
  },
  expiring: {
    variant: "warning",
    text: I18n.t("features.itWallet.card.status.expiring")
  },
  jwtExpiring: {
    variant: "warning",
    text: I18n.t("features.itWallet.card.status.verificationExpiring")
  },
  unknown: {
    variant: "custom",
    icon: { name: "infoFilled", color: "grey-450" },
    text: I18n.t("features.itWallet.card.status.unknown")
  }
};

/**
 * List of statuses that make a credential valid, especially for UI purposes.
 */
export const validCredentialStatuses: Array<ItwCredentialStatus> = [
  "valid",
  "expiring",
  "jwtExpiring"
];

type ExtractVerification = (args: {
  format: CredentialMetadata["format"];
  parsedCredential: CredentialMetadata["parsedCredential"];
  credential: CredentialBundle["credential"];
}) => Verification | undefined;

/**
 * Extracts the verification object from a stored credential based on its format.
 * @param credential - The stored credential fields needed to extract verification
 * @returns The verification object or undefined if extraction fails
 */
export const extractVerification: ExtractVerification = ({
  format,
  parsedCredential,
  credential
}) => {
  try {
    switch (format) {
      case CredentialFormat.SD_JWT:
        return SdJwt.getVerification(credential);
      case CredentialFormat.MDOC:
        return Mdoc.getVerificationFromParsedCredential(parsedCredential);
      default:
        return undefined;
    }
  } catch {
    return undefined;
  }
};

/**
 * Checks whether the `assurance_level` field is equal to `"high"` or the
 * `trust_framework` field is equal to `"it_l2+document_proof"`,
 * and returns `true` only if one of these conditions is met.
 *
 * `"it_l2+document_proof"` indicates that the credential has been issued with
 * a substantial authentication (SPID, CieID) plus an MRTD PoP verification,
 *
 * @param metadata - The metadata of the credential to check
 * @returns boolean indicating if the credential is an ITW credential (L3)
 */
export const isItwCredential = (metadata: CredentialMetadata): boolean => {
  const verification = metadata.verification;
  return (
    verification?.assurance_level === "high" ||
    verification?.trust_framework === "it_l2+document_proof"
  );
};

/**
 * Checks if the credential was issued before the PID.
 * @param credentialIssuedAt - Credential issuance date
 * @param pidIssuedAt - PID issuance date
 * @returns true if credential was issued before PID, false otherwise
 */
export const isCredentialIssuedBeforePid = (
  credentialIssuedAt?: string,
  pidIssuedAt?: string
): boolean => {
  if (!credentialIssuedAt || !pidIssuedAt) {
    return false;
  }

  return isBefore(new Date(credentialIssuedAt), new Date(pidIssuedAt));
};
