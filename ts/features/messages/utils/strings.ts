import { pipe } from "fp-ts/lib/function";
import * as A from "fp-ts/lib/Array";
import * as O from "fp-ts/lib/Option";
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
    case "in-progress":
      return I18n.t("global.modules.paymentNotice.badges.inprogress");
    default:
      return "";
  }
};

export const getHeaderByKey = (headers: Record<string, string>, key: string) =>
  pipe(
    Object.entries(headers),
    A.findFirstMap(([k, v]) => (k.toLowerCase() === key ? O.some(v) : O.none)),
    O.toUndefined
  );
