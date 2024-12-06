import { GlobalState } from "../../../../store/reducers/types";
import { userFromSuccessLoginSelector } from "../../../login/info/store/selectors";
import { messageListForCategorySelector } from "../../../messages/store/reducers/allPaginated";
import { UIMessage } from "../../../messages/types";
import { areNotificationPermissionsEnabled } from "../reducers/environment";

const NEW_MESSAGES_COUNT_TO_RESET_FORCE_DISMISS = 4;

export const hasUserSeenSystemNotificationsPromptSelector = (
  state: GlobalState
) => {
  const requestDuration =
    state.notifications.environment.pushNotificationPermissionsRequestDuration;

  /*
    tested requestDuration timings (in ms) using physical devices:
    ----
    android: motorola edge 30 neo
    iOS: iphone 13 mini
    ----
    android popupShown fast tap  : 946
    android popupShown normal tap: 4000
    android no popup             : 165
    ios popupshown fast tap      : 874
    ios popupshown normal tap    : 2402
    ios no popup                 : 9
  */

  if (requestDuration !== undefined) {
    return requestDuration > 750;
  }
  return false;
};
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
      new Date(message.createdAt) > new Date(forceDismissDate) &&
      !message.isRead
  ).length;

  return newUnreadCount >= NEW_MESSAGES_COUNT_TO_RESET_FORCE_DISMISS;
};

export const isPushNotificationsBannerRenderableSelector = (
  state: GlobalState
) => {
  // the banner should not be renedered *only* when force dismissed and there are not enough new messages
  const isForceDismissed =
    state.notifications.userBehaviour.pushNotificationsBanner
      .isForceDismissed &&
    !shouldResetNotificationBannerDismissStateSelector(state);

  const notificationsEnabled = areNotificationPermissionsEnabled(state);
  // user has seen the full SPID/CIE login flow,
  // so is not logged with fasLogin during this session
  const isFullLogin = userFromSuccessLoginSelector(state);

  const hasUserSeenSystemNotificationsPrompt =
    hasUserSeenSystemNotificationsPromptSelector(state);

  return (
    !isForceDismissed &&
    !isFullLogin &&
    !notificationsEnabled &&
    !hasUserSeenSystemNotificationsPrompt
  );
};
