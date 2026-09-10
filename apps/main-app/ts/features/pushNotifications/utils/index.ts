import * as Notifications from "expo-notifications";
import NotificationsUtils from "react-native-notifications-utils";
import { v4 as uuid } from "uuid";

import { trackAppCaughtError } from "../../../utils/analytics";
import { isTestEnv } from "../../../utils/environment";
import { unknownToString } from "../../../utils/errors";
import { isIos } from "../../../utils/platform";

const areNotificationsEnabled = (
  permissions: Notifications.NotificationPermissionsStatus
) => {
  const areNotificationsDisabled = [
    Notifications.IosAuthorizationStatus.DENIED,
    Notifications.IosAuthorizationStatus.NOT_DETERMINED,
    undefined
  ].includes(permissions.ios?.status);
  return permissions.granted || !areNotificationsDisabled;
};

export const checkNotificationPermissions = async (): Promise<boolean> => {
  try {
    const permissions = await Notifications.getPermissionsAsync();

    const notificationEnabledState = areNotificationsEnabled(permissions);
    return notificationEnabledState;
  } catch (e) {
    trackAppCaughtError(
      "checkNotificationPermissions",
      `exception thrown on ${isIos ? "iOS" : "Android"}`,
      unknownToString(e)
    );
    return false;
  }
};
/**
 * Requests the system-level push notification permission.
 * On iOS, also enables alert, badge, and sound presentation options.
 * Returns false on error to avoid blocking the calling flow.
 */
export const requestNotificationPermissions = async (): Promise<boolean> => {
  try {
    const permissions = await Notifications.requestPermissionsAsync({
      ios: {
        allowAlert: true,
        allowBadge: true,
        allowSound: true
      },
      android: {}
    });

    const notificationEnabledState = areNotificationsEnabled(permissions);
    return notificationEnabledState;
  } catch (e) {
    trackAppCaughtError(
      "requestNotificationPermissions",
      `exception thrown on ${isIos ? "iOS" : "Android"}`,
      unknownToString(e)
    );
    return false;
  }
};

/**
 * This is a legacy code that was used to generate a unique Id
 * from client side. It is still used because the backend API
 * requires it as part of the URL's path but it is later not
 * used in any way.
 * When the backend API spec will remove it, it can also be
 * unlinked and deleted here
 */
export const generateInstallationId = () => `001${uuid().replace(/-/g, "")}`;

export const openSystemNotificationSettingsScreen = () =>
  NotificationsUtils.openSettings();

export const generateTokenRegistrationTime = () => new Date().getTime();

export const testable = isTestEnv
  ? {
      areNotificationsEnabled
    }
  : undefined;
