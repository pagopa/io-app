import { getTime } from "date-fns";
import { GlobalState } from "../../../../store/reducers/types";
import { messageListForCategorySelector } from "../../../messages/store/reducers/allPaginated";
import { UIMessage } from "../../../messages/types";

const NEW_MESSAGES_COUNT_TO_RESET_FORCE_DISMISS = 4;

export const timesPushNotificationBannerDismissedSelector = (
  state: GlobalState
) => state.notifications.userBehaviour.pushNotificationsBanner.timesDismissed;

export const shouldResetNotificationBannerDismissStateSelector = (
  state: GlobalState
) => {
  const forceDismissDate =
    state.notifications.userBehaviour.pushNotificationsBanner
      .forceDismissionDate;
  const messagesList = messageListForCategorySelector(state, "INBOX");

  if (messagesList === undefined || forceDismissDate === undefined) {
    return false;
  }

  const newUnreadCount = messagesList.filter(
    (message: UIMessage) =>
      getTime(message.createdAt) > getTime(forceDismissDate) && !message.isRead
  ).length;

  return newUnreadCount >= NEW_MESSAGES_COUNT_TO_RESET_FORCE_DISMISS;
};
