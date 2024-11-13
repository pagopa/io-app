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
  const isFastLogin = !userFromSuccessLoginSelector(state);
  const hasUserSeenSystemNotificationsPrompt =
    pushNotificationPermissionsRequestDurationSelector(state);

  return (
    !notificationsEnabled &&
    isFastLogin &&
    !hasUserSeenSystemNotificationsPrompt
  );
};
