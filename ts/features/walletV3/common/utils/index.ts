import { ListItemTransactionStatusWithBadge } from "@pagopa/io-app-design-system";
import I18n from "i18n-js";

/**
 * A simple function to get the corresponding translated badge text,
 * based on the transaction status.
 */

export const getBadgeTextByTransactionStatus = (
  transactionStatus: ListItemTransactionStatusWithBadge
) => {
  switch (transactionStatus) {
    case "failure":
      return I18n.t("global.badges.failed");
    case "cancelled":
      return I18n.t("global.badges.cancelled");
    case "reversal":
      return I18n.t("global.badges.reversal");
    case "pending":
      return I18n.t("global.badges.onGoing");
    default:
      return "";
  }
};
