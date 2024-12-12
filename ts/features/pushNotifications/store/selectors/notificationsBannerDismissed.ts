import * as pot from "@pagopa/ts-commons/lib/pot";
import { getTime } from "date-fns";
import { GlobalState } from "../../../../store/reducers/types";
import { UIMessage } from "../../../messages/types";

const NEW_MESSAGES_COUNT_TO_RESET_FORCE_DISMISS = 4;

export const pushNotificationsBannerForceDismissionDateSelector = (
  state: GlobalState
) =>
  state.notifications.userBehaviour.pushNotificationsBanner.forceDismissionDate;

export const timesPushNotificationBannerDismissedSelector = (
  state: GlobalState
) => state.notifications.userBehaviour.pushNotificationsBanner.timesDismissed;

export const shouldResetNotificationBannerDismissStateSelector = (
  state: GlobalState
) => {
  const forceDismissDate =
    pushNotificationsBannerForceDismissionDateSelector(state);

  const messagesList = pot.toUndefined(
    state.entities.messages.allPaginated.inbox.data
  )?.page;

  if (messagesList === undefined || forceDismissDate === undefined) {
    return false;
  }

  const newUnreadCount = messagesList.filter(
    (message: UIMessage) =>
      getTime(message.createdAt) > forceDismissDate && !message.isRead
  ).length;

  return newUnreadCount >= NEW_MESSAGES_COUNT_TO_RESET_FORCE_DISMISS;
};
