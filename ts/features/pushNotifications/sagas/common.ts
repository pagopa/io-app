import { call, put, select } from "typed-redux-saga/macro";
import { trackNotificationPermissionsStatus } from "../analytics";
import { updateSystemNotificationsEnabled } from "../store/actions/environment";
import { areNotificationPermissionsEnabledSelector } from "../store/reducers/environment";
import { checkNotificationPermissions } from "../utils";

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
