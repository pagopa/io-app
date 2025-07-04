import { IOColors, Tag, useIOTheme } from "@pagopa/io-app-design-system";
import { decode } from "@pagopa/io-react-native-jwt";
import * as E from "fp-ts/lib/Either";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/function";
import I18n from "../../../../i18n";
import { CredentialType } from "./itwMocksUtils";
import { ItwCredentialStatus, StoredCredential } from "./itwTypesUtils";

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
  [CredentialType.DEGREE_CERTIFICATES]: I18n.t(
    "features.itWallet.credentialName.dgc"
  ),
  [CredentialType.MDL]: I18n.t("features.itWallet.credentialName.mdl")
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

/**
 * Checks if a credential is an ITW enabled credential by checking the
 * JWT header's typ parameter.
 * @param credential - The credential to check
 * @returns boolean indicating if the credential is an ITW credential (L3)
 */
export const isItwCredential = (credential: StoredCredential): boolean =>
  pipe(
    E.tryCatch(() => decode(credential.credential), E.toError),
    E.map(({ protectedHeader }) => protectedHeader.typ === "dc+sd-jwt"),
    E.getOrElse(() => false)
  );

/**
 * Credential types that support the L3 design
 */
const credentialsWithL3Design: ReadonlyArray<string> = [
  CredentialType.DRIVING_LICENSE,
  CredentialType.PID
];

/**
 * Checks if a credential has L3 design.
 * It checks if the credential type is in the list of credentials with L3 design
 * and if it is an ITW credential.
 * @param credential - The stored credential to check
 * @returns boolean indicating if the credential supports L3 design
 */
export const hasL3Design = (credential: StoredCredential): boolean =>
  credentialsWithL3Design.includes(credential.credentialType) &&
  isItwCredential(credential);
