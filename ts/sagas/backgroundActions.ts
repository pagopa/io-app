import { call } from "typed-redux-saga/macro";
import { handleStoredLinkingUrlIfNeeded } from "../features/linking/sagas";
import { handlePushNotificationIfNeeded } from "../features/pushNotifications/sagas/common";

/**
 * this method is used to handle all actions that
 * are triggered when the app is resumed from scratch or transitions from
 * background to foreground, and also need to be handled
 * later on in the app's life cycle.
 *
 * two examples are Universal/App Links and Push Notifications, which
 * can transition the app from background or from a closed state to foreground,
 *  and need to be handled once the app has finished loading/initializing.
 */
export function* maybeHandlePendingBackgroundActions(
  shouldResetToMainNavigator: boolean = false
) {
  // check if we have a stored linking URL to process
  if (yield* call(handleStoredLinkingUrlIfNeeded)) {
    return true;
  }
  // Check if we have a pending notification message
  if (yield* call(handlePushNotificationIfNeeded, shouldResetToMainNavigator)) {
    return true;
  }

  return false;
}
