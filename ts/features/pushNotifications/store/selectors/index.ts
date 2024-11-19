import { GlobalState } from "../../../../store/reducers/types";
import { userFromSuccessLoginSelector } from "../../../login/info/store/selectors";
import { areNotificationPermissionsEnabled } from "../reducers/environment";

const pushNotificationPermissionsRequestDurationSelector = (
  state: GlobalState
) =>
  state.notifications.userBehaviour.pushNotificationPermissionsRequestDuration;

export const isPushNotificationsBannerRenderableSelector = (
  state: GlobalState
) => {
  const notificationsEnabled = areNotificationPermissionsEnabled(state);
  // user has seen the full SPID/CIE login flow,
  // so is not logged with fasLogin during this session
  const isFullLogin = userFromSuccessLoginSelector(state);
  const requestDuration =
    pushNotificationPermissionsRequestDurationSelector(state);
  const hasUserSeenSystemNotificationsPrompt =
    requestDuration !== undefined ? requestDuration > 750 : false;
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

  return (
    !isFullLogin &&
    !notificationsEnabled &&
    !hasUserSeenSystemNotificationsPrompt
  );
};
