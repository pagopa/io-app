import I18n from "i18next";
import { ItwCredentialStatus } from "./itwTypesUtils";

export const accessibilityLabelByStatus = (status: ItwCredentialStatus) => {
  switch (status) {
    case "invalid":
      return I18n.t("features.itWallet.card.status.invalid");
    case "expired":
      return I18n.t("features.itWallet.card.status.expired");
    case "jwtExpired":
      return I18n.t("features.itWallet.card.status.verificationExpired");
    case "expiring":
      return I18n.t("features.itWallet.card.status.expiring");
    case "jwtExpiring":
      return I18n.t("features.itWallet.card.status.verificationExpiring");
    default:
      return undefined;
  }
};
