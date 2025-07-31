import { IOColors, Tag, useIOTheme } from "@pagopa/io-app-design-system";
import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import { SdJwt } from "@pagopa/io-react-native-wallet-v2";
import I18n from "../../../../i18n";
import { CredentialType } from "./itwMocksUtils";
import { ItwCredentialStatus } from "./itwTypesUtils";

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
 * Extracts the verification claim from the SD-JWT,
 * checks whether the `assurance_level` field is equal to `"high"`,
 * and returns `true` only in that case.
 *
 * This must be used **only for eID**, since credentials obtained
 * with the old eID always have `assurance_level` set to `"high"`.
 *
 * @param sdJwt - The SD-JWT string to check
 * @returns boolean indicating if the credential is an ITW credential (L3)
 */
export const isItwCredential = (sdJwt: string): boolean =>
  pipe(
    O.tryCatch(() => SdJwt.getVerification(sdJwt)),
    O.chain(O.fromNullable),
    O.chainNullableK(({ assurance_level }) => assurance_level === "high"),
    O.getOrElse(() => false)
  );
