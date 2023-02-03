import { PushNotificationPermissions } from "@react-native-community/push-notification-ios";

// Disable notification request on UI regression (or e2e) testing.
export const requestNotificationPermissions =
  (): Promise<PushNotificationPermissions> =>
    new Promise((resolve, _) => {
      resolve({
        alert: false,
        badge: false,
        sound: false,
        authorizationStatus: 2
      });
    });
