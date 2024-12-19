import { IOColors, Tag } from "@pagopa/io-app-design-system";
import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import I18n from "../../../../i18n";
import { CredentialType } from "./itwMocksUtils";
import { ItwCredentialStatus } from "./itwTypesUtils";

export const itwCredentialNameByCredentialType: {
  [type: string]: string;
} = {
  [CredentialType.EUROPEAN_DISABILITY_CARD]: I18n.t(
    "features.itWallet.credentialName.dc"
  ),
  [CredentialType.EUROPEAN_HEALTH_INSURANCE_CARD]: I18n.t(
    "features.itWallet.credentialName.ts"
  ),
  [CredentialType.DRIVING_LICENSE]: I18n.t(
    "features.itWallet.credentialName.mdl"
  ),
  [CredentialType.PID]: I18n.t("features.itWallet.credentialName.eid")
};

export const getCredentialNameFromType = (
  credentialType: string | undefined,
  withDefault: string = ""
): string =>
  pipe(
    O.fromNullable(credentialType),
    O.map(type => itwCredentialNameByCredentialType[type]),
    O.getOrElse(() => withDefault)
  );

export const borderColorByStatus: { [key in ItwCredentialStatus]: string } = {
  valid: IOColors.white,
  invalid: IOColors["error-600"],
  expired: IOColors["error-600"],
  expiring: IOColors["warning-700"],
  jwtExpired: IOColors["error-600"],
  jwtExpiring: IOColors["warning-700"],
  unknown: IOColors["grey-300"]
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
    icon: { name: "warningFilled", color: IOColors["grey-300"] },
    iconAccessibilityLabel: "warning"
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
