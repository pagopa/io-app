import { PaymentNoticeStatus } from "@pagopa/io-app-design-system";
import I18n from "../../../i18n";

export const getBadgeTextByPaymentNoticeStatus = (
  paymentNoticeStatus: Exclude<PaymentNoticeStatus, "default">
): string => {
  switch (paymentNoticeStatus) {
    case "paid":
      return I18n.t("global.modules.paymentNotice.badges.paid");
    case "error":
      return I18n.t("global.modules.paymentNotice.badges.error");
    case "expired":
      return I18n.t("global.modules.paymentNotice.badges.expired");
    case "revoked":
      return I18n.t("global.modules.paymentNotice.badges.revoked");
    case "canceled":
      return I18n.t("global.modules.paymentNotice.badges.canceled");
    default:
      return "";
  }
};
