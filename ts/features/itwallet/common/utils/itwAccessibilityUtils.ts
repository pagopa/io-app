import I18n from "i18next";
import { TranslationKeys } from "../../../../i18n";
import { ItwCredentialStatus } from "./itwTypesUtils";

const accessibilityLabelKeyByStatus: Partial<
  Record<ItwCredentialStatus, TranslationKeys | undefined>
> = {
  invalid: "features.itWallet.card.status.invalid",
  expired: "features.itWallet.card.status.expired",
  jwtExpired: "features.itWallet.card.status.verificationExpired",
  expiring: "features.itWallet.card.status.expiring",
  jwtExpiring: "features.itWallet.card.status.verificationExpiring"
};

export const getAccessibilityLabelByStatus = (status: ItwCredentialStatus) => {
  const labelKey = accessibilityLabelKeyByStatus[status];

  return labelKey ? I18n.t(labelKey) : undefined;
};
