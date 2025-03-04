import { captureException, captureMessage } from "@sentry/react-native";
import { v4 as uuid } from "uuid";
import { PermissionsAndroid } from "react-native";
import PushNotificationIOS from "@react-native-community/push-notification-ios";
import PushNotification from "react-native-push-notification";
import NotificationsUtils from "react-native-notifications-utils";
import { isIos } from "../../../utils/platform";

export enum AuthorizationStatus {
  NotDetermined = 0,
  StatusDenied = 1,
  Authorized = 2,
  Provisional = 3,
  Ephemeral = 4 // This is a state that may be returned by iOS (as a number) but it is not mapped in the iOS library
}

export const checkNotificationPermissions = () =>
  new Promise<boolean>(resolve => {
    try {
      if (isIos) {
        PushNotificationIOS.checkPermissions(({ authorizationStatus }) => {
          // On iOS, 'authorizationStatus' is the parameter that
          // reflects the notification permission status ('alert'
          // is just one of the presentation's options)
          resolve(
            authorizationStatus !== undefined &&
              authorizationStatus !== AuthorizationStatus.NotDetermined &&
              authorizationStatus !== AuthorizationStatus.StatusDenied
          );
        });
      } else {
        PushNotification.checkPermissions(data => {
          // On Android, only 'alert' has a value
          resolve(!!data.alert);
        });
      }
    } catch (e) {
      captureException(e);
      captureMessage(
        `[PushNotifications] 'checkNotificationPermissions' has thrown an exception on ${
          isIos ? "iOS" : "Android"
        }`
      );
      resolve(false);
    }
  });

export const requestNotificationPermissions = async () => {
  try {
    if (isIos) {
      const pushNotificationPermissions =
        await PushNotificationIOS.requestPermissions({
          alert: true,
          badge: true,
          sound: true
        });
      return (
        pushNotificationPermissions.authorizationStatus ===
        AuthorizationStatus.Authorized
      );
    } else {
      const permissionStatus = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
      );
      return permissionStatus === PermissionsAndroid.RESULTS.GRANTED;
    }
  } catch (e) {
    captureException(e);
    captureMessage(
      `[PushNotifications] 'requestNotificationPermissions' has thrown an exception on ${
        isIos ? "iOS" : "Android"
      }`
    );
    return false;
  }
};

/**
 * Remove all the local notifications related to authentication with spid.
 *
 * With the previous library version (7.3.1 - now 8.1.1), cancelLocalNotifications
 * did not work. At the moment, the "first access spid" is the only kind of
 * scheduled notification and for this reason it is safe to use
 * PushNotification.cancelAllLocalNotifications();
 * If we add more scheduled notifications, we need to investigate if
 * cancelLocalNotifications works with the new library version
 */
export const cancellAllLocalNotifications = () =>
  PushNotification.cancelAllLocalNotifications();

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
