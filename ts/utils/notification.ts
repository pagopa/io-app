import PushNotificationIOS, {
  PushNotificationPermissions
} from "@react-native-community/push-notification-ios";
import { isIos } from "./platform";

export enum AuthorizationStatus {
  NotDetermined = 0,
  StatusDenied = 1,
  Authorized = 2,
  Provisional = 3
}

export const checkNotificationPermissions = (): Promise<boolean> =>
  new Promise((resolve, _) => {
    if (isIos) {
      PushNotificationIOS.checkPermissions(
        ({ authorizationStatus = AuthorizationStatus.NotDetermined }) => {
          resolve(
            authorizationStatus === AuthorizationStatus.Authorized ||
              authorizationStatus === AuthorizationStatus.Provisional
          );
        }
      );
    } else {
      // TODO: Proper Android logic when targeting sdk 33
      resolve(true);
    }
  });

export const requestNotificationPermissions =
  (): Promise<PushNotificationPermissions> => {
    if (isIos) {
      return PushNotificationIOS.requestPermissions({
        alert: true,
        badge: true,
        sound: true
      });
    } else {
      return new Promise((resolve, _) => {
        resolve({
          alert: true,
          badge: true,
          sound: true,
          authorizationStatus: 2
        });
      });
    }
  };
