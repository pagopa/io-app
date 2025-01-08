import * as pot from "@pagopa/ts-commons/lib/pot";
import { GlobalState } from "../../../../store/reducers/types";
import { UIMessage } from "../../../messages/types";

export const NEW_MESSAGES_COUNT_TO_RESET_FORCE_DISMISS = 4;

export const pushNotificationsBannerForceDismissionDateSelector = (
  state: GlobalState
) =>
  state.notifications.userBehaviour.pushNotificationBannerForceDismissionDate;

export const timesPushNotificationBannerDismissedSelector = (
  state: GlobalState
) => state.notifications.userBehaviour.pushNotificationBannerDismissalCount;

export const unreadMessagesCountAfterForceDismissionSelector = (
  state: GlobalState
) => {
  const forceDismissDate =
    pushNotificationsBannerForceDismissionDateSelector(state);
  if (forceDismissDate === undefined) {
    return undefined;
  }

  const messagesList = pot.toUndefined(
    state.entities.messages.allPaginated.inbox.data
  )?.page;
  if (!messagesList) {
    return undefined;
  }

  return messagesList.filter(
    (message: UIMessage) =>
      message.createdAt.getTime() > forceDismissDate && !message.isRead
  ).length;
};

export const isForceDismissAndNotUnreadMessagesHiddenSelector = (
  state: GlobalState
) => {
  const unreadMessageCountAfterForceDismissionMaybe =
    unreadMessagesCountAfterForceDismissionSelector(state);
  if (unreadMessageCountAfterForceDismissionMaybe == null) {
    return false;
  }
  return (
    unreadMessageCountAfterForceDismissionMaybe <
    NEW_MESSAGES_COUNT_TO_RESET_FORCE_DISMISS
  );
};

export const shouldResetNotificationBannerDismissStateSelector = (
  state: GlobalState
) => {
  const unreadMessageCountAfterForceDismissionMaybe =
    unreadMessagesCountAfterForceDismissionSelector(state);
  if (unreadMessageCountAfterForceDismissionMaybe == null) {
    return false;
  }
  return (
    unreadMessageCountAfterForceDismissionMaybe >=
    NEW_MESSAGES_COUNT_TO_RESET_FORCE_DISMISS
  );
};
