import { IOColors, Tag, useIOTheme } from "@io-app/design-system";
import { SdJwt, Mdoc } from "@pagopa/io-react-native-wallet";
import I18n from "i18next";
import { isBefore } from "date-fns";
import { ItwIridescentBorderVariant } from "../components/ItwBrandedSkiaBorder";
import { CredentialType } from "./itwMocksUtils";
import {
  CredentialBundle,
  CredentialFormat,
  CredentialMetadata,
  ItwCredentialStatus,
  StoredVerification
} from "./itwTypesUtils";

/**
 * A credential is a batch when it tracks its copies through the `keyTags` array (e.g. one-time-use
 * credentials obtained in batch). A batch credential stays a batch even when down to a single
 * remaining copy, so any non-empty `keyTags` array marks it as such.
 */
export const isBatchCredential = (
  credential: Pick<CredentialMetadata, "keyTags">
): boolean => Boolean(credential.keyTags?.length);

/**
 * Returns every cryptographic key tag owned by a credential: the whole batch for a batch
 * credential, or the single `keyTag` for a non-batch one. Used to delete the device crypto keys.
 */
export const getCredentialKeyTags = (
  credential: Pick<CredentialMetadata, "keyTag" | "keyTags">
): ReadonlyArray<string> => credential.keyTags ?? [credential.keyTag];

/**
 * Returns the vault ids of every copy of a credential. A non-batch credential maps to a single
 * vault id (its `credentialId`); a batch credential maps to one vault id per copy (each copy's
 * `keyTag`). See {@link CredentialsVault} for the vault id namespacing.
 */
export const getCredentialVaultIds = (
  credential: Pick<CredentialMetadata, "credentialId" | "keyTags">
): ReadonlyArray<string> =>
  isBatchCredential(credential)
    ? (credential.keyTags ?? [])
    : [credential.credentialId];

/**
 * Returns the vault id of the representative copy of a credential, i.e. the one exposed for
 * display and presentation. For a batch credential it is the first copy (`keyTags[0]`), for a
 * non-batch credential it is the `credentialId`. Falls back to `credentialId` if the batch array
 * is unexpectedly empty (e.g. corrupted state) to avoid returning an invalid vault id.
 */
export const getRepresentativeVaultId = (
  credential: Pick<CredentialMetadata, "credentialId" | "keyTags">
): string => credential.keyTags?.[0] ?? credential.credentialId;

// Credentials that can be obtained with valid a Documenti su IO instance
export const l2Credentials = [
  CredentialType.DRIVING_LICENSE,
  CredentialType.EUROPEAN_DISABILITY_CARD,
  CredentialType.EUROPEAN_HEALTH_INSURANCE_CARD
] as const;

// New credentials that can be actively requested and obtained by the user
export const newCredentials = [
  CredentialType.PROOF_OF_AGE,
  CredentialType.EDUCATION_DEGREE,
  CredentialType.EDUCATION_ENROLLMENT,
  CredentialType.RESIDENCY,
  CredentialType.EDUCATION_DIPLOMA,
  CredentialType.EDUCATION_ATTENDANCE
] as const;

export type NewCredential = (typeof newCredentials)[number];

export type L2Credential = (typeof l2Credentials)[number];

// Credentials that will be available in the future
export const upcomingCredentials = [] as ReadonlyArray<string>;

export const isUpcomingCredential = (type: string): boolean =>
  upcomingCredentials.includes(type);

export const isNewCredential = (type: string): type is NewCredential =>
  newCredentials.includes(type as NewCredential);

export const isL2Credential = (
  type: string | undefined
): type is L2Credential => l2Credentials.includes(type as L2Credential);

const getCredentialNameByType = (
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
  [CredentialType.PROOF_OF_AGE]: I18n.t("features.itWallet.credentialName.av"),
  [CredentialType.EDUCATION_DEGREE]: I18n.t(
    "features.itWallet.credentialName.ed"
  ),
  [CredentialType.EDUCATION_ENROLLMENT]: I18n.t(
    "features.itWallet.credentialName.ee"
  ),
  [CredentialType.RESIDENCY]: I18n.t("features.itWallet.credentialName.res"),
  [CredentialType.EDUCATION_DIPLOMA]: I18n.t(
    "features.itWallet.credentialName.edip"
  ),
  [CredentialType.EDUCATION_ATTENDANCE]: I18n.t(
    "features.itWallet.credentialName.edat"
  )
});

export const getCredentialNameFromType = (
  type: string | undefined,
  isItwCredential = false,
  withDefault = ""
): string => {
  if (!type) {
    return withDefault;
  }
  const name = type && getCredentialNameByType(isItwCredential)[type];
  return name || withDefault || type;
};

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

export const borderVariantByStatus: {
  [key in ItwCredentialStatus]: ItwIridescentBorderVariant;
} = {
  valid: "default",
  expiring: "warning",
  jwtExpiring: "warning",
  expired: "error",
  jwtExpired: "error",
  invalid: "error",
  unknown: "default"
};

export const useTagPropsByStatus = (): {
  [key in ItwCredentialStatus]?: Tag;
} => ({
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
});

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
}) => StoredVerification | undefined;

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
    const verification = (() => {
      switch (format) {
        case CredentialFormat.SD_JWT:
          return SdJwt.getVerification(credential);
        case CredentialFormat.MDOC:
          return Mdoc.getVerificationFromParsedCredential(parsedCredential);
        default:
          return undefined;
      }
    })();
    if (!verification) {
      return undefined;
    }
    const { trust_framework, assurance_level } = verification;
    return { trust_framework, assurance_level };
  } catch {
    return undefined;
  }
};

/**
 * Checks whether the `assurance_level` field includes `"high"` or the
 * `trust_framework` field is equal to `"it_l2+document_proof"`,
 * and returns `true` only if one of these conditions is met.
 *
 * v1.0 credentials DO NOT belong to IT-Wallet, even when their assurance level is high/L2+.
 *
 * `"it_l2+document_proof"` indicates that the credential has been issued with
 * a substantial authentication (SPID, CieID) plus an MRTD PoP verification.
 *
 * @param metadata - The metadata of the credential to check
 * @returns boolean indicating if the credential is an ITW credential (L3)
 */
export const isItwCredential = ({
  verification,
  spec_version
}: CredentialMetadata): boolean => {
  if (spec_version === "1.0.0") {
    return false;
  }
  return (
    verification?.assurance_level.includes("high") ||
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
