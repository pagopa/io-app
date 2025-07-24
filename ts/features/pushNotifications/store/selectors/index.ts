import { GlobalState } from "../../../../store/reducers/types";
import { userFromSuccessLoginSelector } from "../../../authentication/loginInfo/store/selectors";
import { areNotificationPermissionsEnabledSelector } from "../reducers/environment";
import {
  pushNotificationsBannerForceDismissionDateSelector,
  shouldResetNotificationBannerDismissStateSelector
} from "./notificationsBannerDismissed";

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

export const isPushNotificationsBannerRenderableSelector = (
  state: GlobalState
) => {
  const isForceDismissed =
    pushNotificationsBannerForceDismissionDateSelector(state) !== undefined &&
    !shouldResetNotificationBannerDismissStateSelector(state);

  const notificationsEnabled = areNotificationPermissionsEnabledSelector(state);
  // user has seen the full SPID/CIE login flow,
  // so is not logged with fasLogin during this session
  const isFullLogin = userFromSuccessLoginSelector(state);

  const hasUserSeenSystemNotificationsPrompt =
    hasUserSeenSystemNotificationsPromptSelector(state);

  const engagementScreenShownThisSession =
    state.notifications.environment.engagementScreenShownThisSession;

  return (
    !isForceDismissed &&
    !isFullLogin &&
    !engagementScreenShownThisSession &&
    !notificationsEnabled &&
    !hasUserSeenSystemNotificationsPrompt
  );
};
