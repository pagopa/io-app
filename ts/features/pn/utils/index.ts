import I18n from "../../../i18n";
import { NotificationStatus } from "../store/types/types";

export function getNotificationStatusInfo(status: NotificationStatus): {
  label: string;
} {
  switch (status) {
    case "DELIVERED":
      return {
        label: I18n.t("features.pn.details.timeline.status.DELIVERED")
      };
    case "DELIVERING":
      return {
        label: I18n.t("features.pn.details.timeline.status.DELIVERING")
      };
    case "UNREACHABLE":
      return {
        label: I18n.t("features.pn.details.timeline.status.UNREACHABLE")
      };
    case "PAID":
      return {
        label: I18n.t("features.pn.details.timeline.status.PAID")
      };
    case "ACCEPTED":
      return {
        label: I18n.t("features.pn.details.timeline.status.ACCEPTED")
      };
    case "EFFECTIVE_DATE":
      return {
        label: I18n.t("features.pn.details.timeline.status.EFFECTIVE_DATE")
      };
    case "VIEWED":
      return {
        label: I18n.t("features.pn.details.timeline.status.VIEWED")
      };
    case "CANCELLED":
      return {
        label: I18n.t("features.pn.details.timeline.status.CANCELLED")
      };
    default:
      return {
        label: status
      };
  }
}
