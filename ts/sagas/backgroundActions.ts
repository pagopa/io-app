import { call, put, select } from "typed-redux-saga/macro";
import NavigationService from "../navigation/NavigationService";
import { navigateToMainNavigatorAction } from "../store/actions/navigation";
import { isTestEnv } from "../utils/environment";
import { handleStoredLinkingUrlIfNeeded } from "../features/linking/sagas";
import { resetMessageArchivingAction } from "../features/messages/store/actions/archiving";
import { isArchivingDisabledSelector } from "../features/messages/store/reducers/archiving";
import { clearNotificationPendingMessage } from "../features/pushNotifications/store/actions/pendingMessage";
import { pendingMessageStateSelector } from "../features/pushNotifications/store/reducers/pendingMessage";
import { navigateToMessageRouterAction } from "../features/pushNotifications/utils/navigation";

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

function* handlePushNotificationIfNeeded(
  shouldResetToMainNavigator: boolean = false
) {
  const pendingMessageState = yield* select(pendingMessageStateSelector);
  if (pendingMessageState) {
    // We have a pending notification message to handle
    const messageId = pendingMessageState.id;

    // Remove the pending message from the notification state
    yield* put(clearNotificationPendingMessage());

    if (shouldResetToMainNavigator) {
      yield* call(navigateToMainNavigatorAction);
    }

    // It the archiving/restoring of messages is not disabled, make
    // sure to cancel it, whatever status it may be in (since it
    // hides the bottom tab bar and we cannot trigger a navigation
    // flow that may later deliver the user back to a main tab bar
    // screen where such tab bar is hidden)
    const isArchivingDisabled = yield* select(isArchivingDisabledSelector);
    if (!isArchivingDisabled) {
      // Auto-reset does not provide feedback to the user
      yield* put(resetMessageArchivingAction(undefined));
    }

    // Navigate to message router screen
    yield* call(
      NavigationService.dispatchNavigationAction,
      navigateToMessageRouterAction({
        messageId,
        fromNotification: true
      })
    );
    return true;
  }
  return false;
}

export const testable = isTestEnv
  ? {
      handlePushNotificationIfNeeded
    }
  : undefined;
