import { call, put, select } from "typed-redux-saga/macro";
import { areNotificationPermissionsEnabledSelector } from "../store/reducers/environment";
import { updateSystemNotificationsEnabled } from "../store/actions/environment";
import { checkNotificationPermissions } from "../utils";
import { pendingMessageStateSelector } from "../store/reducers/pendingMessage";
import { clearNotificationPendingMessage } from "../store/actions/pendingMessage";
import { navigateToMainNavigatorAction } from "../../../store/actions/navigation";
import { isArchivingDisabledSelector } from "../../messages/store/reducers/archiving";
import { resetMessageArchivingAction } from "../../messages/store/actions/archiving";
import NavigationService from "../../../navigation/NavigationService";
import { navigateToMessageRouterAction } from "../utils/navigation";
import { trackNotificationPermissionsStatus } from "../analytics";
import { storedLinkingUrlSelector } from "../../linking/reducers";
import { isSendAARLink } from "../../pn/aar/utils/deepLinking";
import { MESSAGES_ROUTES } from "../../messages/navigation/routes";
import PN_ROUTES from "../../pn/navigation/routes";
import { clearLinkingUrl } from "../../linking/actions";

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
    areNotificationPermissionsEnabledSelector
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

/**
 * this method is used to handle all actions that
 * are triggered when the app is not running, and also need
 * to be handled later on in the app's life cycle.
 *
 * two examples are Universal Links and Push Notifications, which
 * can open the app from a closed state and need to be handled
 * once the app has finished loading/initializing.
 */
export function* maybeHandlePendingBackgroundActions(
  shouldResetToMainNavigator: boolean = false
) {
  // check if we have a stored linking URL to process
  const storedLinkingUrl = yield* select(storedLinkingUrlSelector);
  if (storedLinkingUrl !== undefined) {
    const shouldNavigateToAAR = yield* select(isSendAARLink, storedLinkingUrl);
    if (shouldNavigateToAAR) {
      yield* call(
        NavigationService.navigate,
        MESSAGES_ROUTES.MESSAGES_NAVIGATOR,
        {
          screen: PN_ROUTES.MAIN,
          params: {
            screen: PN_ROUTES.QR_SCAN_FLOW,
            params: { aarUrl: storedLinkingUrl }
          }
        }
      );
      yield* put(clearLinkingUrl());
      return;
    }
  }

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
        messageId,
        fromNotification: true
      })
    );
  }
}
