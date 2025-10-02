import { IOColors, Tag, useIOTheme } from "@pagopa/io-app-design-system";
import { constNull, pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import { SdJwt, Mdoc } from "@pagopa/io-react-native-wallet";
import I18n from "i18next";
import { CredentialType } from "./itwMocksUtils";
import {
  CredentialFormat,
  ItwCredentialStatus,
  StoredCredential
} from "./itwTypesUtils";

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

/**
 * Extracts the verification claim from the SD-JWT,
 * checks whether the `assurance_level` field is equal to `"high"`,
 * and returns `true` only in that case.
 *
 * @param sdJwt - The SD-JWT string to check
 * @returns boolean indicating if the credential is an ITW credential (L3)
 */
export const isItwCredential = ({
  format,
  credential,
  parsedCredential
}: StoredCredential): boolean => {
  const getVerificationByFormat = {
    [CredentialFormat.SD_JWT]: () => SdJwt.getVerification(credential),
    [CredentialFormat.MDOC]: () =>
      Mdoc.getVerificationFromParsedCredential(parsedCredential),
    [CredentialFormat.LEGACY_SD_JWT]: constNull
  };
  return pipe(
    O.tryCatch(getVerificationByFormat[format as CredentialFormat]),
    O.chain(O.fromNullable),
    O.chainNullableK(({ assurance_level }) => assurance_level === "high"),
    O.getOrElse(() => false)
  );
};
