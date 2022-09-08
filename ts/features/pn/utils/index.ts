import I18n from "../../../i18n";
import { NotificationStatusEnum } from "../store/types/types";

export function getNotificationStatusInfo(status: string): {
  label: string;
} {
  switch (status) {
    case NotificationStatusEnum.DELIVERED:
      return {
        label: I18n.t("features.pn.details.timeline.status.DELIVERED")
      };
    case NotificationStatusEnum.DELIVERING:
      return {
        label: I18n.t("features.pn.details.timeline.status.DELIVERING")
      };
    case NotificationStatusEnum.UNREACHABLE:
      return {
        label: I18n.t("features.pn.details.timeline.status.UNREACHABLE")
      };
    case NotificationStatusEnum.PAID:
      return {
        label: I18n.t("features.pn.details.timeline.status.PAID")
      };
    case NotificationStatusEnum.ACCEPTED:
      return {
        label: I18n.t("features.pn.details.timeline.status.ACCEPTED")
      };
    case NotificationStatusEnum.EFFECTIVE_DATE:
      return {
        label: I18n.t("features.pn.details.timeline.status.EFFECTIVE_DATE")
      };
    case NotificationStatusEnum.VIEWED:
      return {
        label: I18n.t("features.pn.details.timeline.status.VIEWED")
      };
    case NotificationStatusEnum.CANCELLED:
      return {
        label: I18n.t("features.pn.details.timeline.status.CANCELLED")
      };
    default:
      return {
        label: status
      };
  }
}
