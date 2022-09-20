import I18n from "../../../i18n";
import { NotificationStatus } from "../store/types/types";

export function getNotificationStatusInfo(status: NotificationStatus) {
  return I18n.t(`features.pn.details.timeline.status.${status}`, {
    defaultValue: status
  });
}
