import { call, put, select } from "typed-redux-saga/macro";
import { areNotificationPermissionsEnabled } from "../store/reducers/environment";
import { updateSystemNotificationsEnabled } from "../store/actions/environment";
import { checkNotificationPermissions } from "../utils";
import { pendingMessageStateSelector } from "../store/reducers/pendingMessage";
import { clearNotificationPendingMessage } from "../store/actions/pendingMessage";
import { navigateToMainNavigatorAction } from "../../../store/actions/navigation";
import { isArchivingDisabledSelector } from "../../messages/store/reducers/archiving";
import { resetMessageArchivingAction } from "../../messages/store/actions/archiving";
import NavigationService from "../../../navigation/NavigationService";
import { navigateToMessageRouterAction } from "../utils/navigation";
import { UIMessageId } from "../../messages/types";
import { trackNotificationPermissionsStatus } from "../analytics";

export function* checkAndUpdateNotificationPermissionsIfNeeded(
  skipAnalyticsTracking: boolean = false
) {
  // Retrieve system notification receival permission
  const systemNotificationPermissions = yield* call(
    checkNotificationPermissions
  );
  // Update the in-memory redux value if needed
  yield* call(
    updateNotificationPermissionsIfNeeded,
    systemNotificationPermissions,
    skipAnalyticsTracking
  );
  return systemNotificationPermissions;
}

export function* updateNotificationPermissionsIfNeeded(
  systemNotificationPermissions: boolean,
  skipAnalyticsTracking: boolean = false
) {
  // Retrieve the in-memory redux value of the
  // notification receival permission
  const storedNotificationPermissions = yield* select(
    areNotificationPermissionsEnabled
  );
  // If it is different, compared to the input one
  if (systemNotificationPermissions !== storedNotificationPermissions) {
    // Track the new status if allowed
    if (!skipAnalyticsTracking) {
      yield* call(
        trackNotificationPermissionsStatus,
        systemNotificationPermissions
      );
    }
    // Update the in-memory redux value
    yield* put(updateSystemNotificationsEnabled(systemNotificationPermissions));
  }
}

export function* handlePendingMessageStateIfAllowed(
  shouldResetToMainNavigator: boolean = false
) {
  // Check if we have a pending notification message
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
        messageId: messageId as UIMessageId,
        fromNotification: true
      })
    );
  }
}
