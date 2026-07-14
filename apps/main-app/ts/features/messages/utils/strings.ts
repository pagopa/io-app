import { PaymentNoticeStatus } from "@io-app/design-system";
import I18n from "i18next";

export const getBadgeTextByPaymentNoticeStatus = (
  paymentNoticeStatus: Exclude<PaymentNoticeStatus, "default">
): string => {
  switch (paymentNoticeStatus) {
    case "canceled":
      return I18n.t("global.modules.paymentNotice.badges.canceled");
    case "error":
      return I18n.t("global.modules.paymentNotice.badges.error");
    case "expired":
      return I18n.t("global.modules.paymentNotice.badges.expired");
    case "in-progress":
      return I18n.t("global.modules.paymentNotice.badges.inprogress");
    case "paid":
      return I18n.t("global.modules.paymentNotice.badges.paid");
    case "revoked":
      return I18n.t("global.modules.paymentNotice.badges.revoked");
    default:
      return "";
  }
};
