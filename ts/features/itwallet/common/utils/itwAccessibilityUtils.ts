import I18n from "i18next";
import { ItwCredentialStatus } from "./itwTypesUtils";

export const accessibilityLabelByStatus: {
  [key in ItwCredentialStatus]?: string;
} = {
  invalid: I18n.t("features.itWallet.card.status.invalid"),
  expired: I18n.t("features.itWallet.card.status.expired"),
  jwtExpired: I18n.t("features.itWallet.card.status.verificationExpired"),
  expiring: I18n.t("features.itWallet.card.status.expiring"),
  jwtExpiring: I18n.t("features.itWallet.card.status.verificationExpiring")
};
