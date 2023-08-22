import { pipe } from "fp-ts/lib/function";
import * as B from "fp-ts/lib/boolean";
import * as E from "fp-ts/lib/Either";
import * as T from "fp-ts/lib/Task";
import * as TE from "fp-ts/lib/TaskEither";
import { Platform, PermissionsAndroid } from "react-native";
import PushNotificationIOS from "@react-native-community/push-notification-ios";
import { isIos } from "./platform";

export enum AuthorizationStatus {
  NotDetermined = 0,
  StatusDenied = 1,
  Authorized = 2,
  Provisional = 3
}

const isAndroid7NougatAPI24OrMore = (Platform.Version as number) >= 24;
const successfulBooleanTaskEither = () => TE.fromEither(E.right(true));

const checkPermissionAndroid = () =>
  pipe(
    isAndroid7NougatAPI24OrMore,
    B.fold(successfulBooleanTaskEither, () =>
      TE.tryCatch(
        () =>
          PermissionsAndroid.check(
            PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
          ),
        E.toError
      )
    )
  );

const checkPermissioniOS = () =>
  pipe(
    () =>
      new Promise<boolean>((resolve, _) => {
        PushNotificationIOS.checkPermissions(({ authorizationStatus }) => {
          resolve(
            authorizationStatus === AuthorizationStatus.Authorized ||
              authorizationStatus === AuthorizationStatus.Provisional
          );
        });
      }),
    TE.fromTask
  );

export const checkNotificationPermissions = () =>
  pipe(
    isIos,
    B.fold(
      () => checkPermissionAndroid(),
      () => checkPermissioniOS()
    ),
    TE.getOrElse(() => T.of(false))
  )();

const requestPermissioniOS = () =>
  pipe(
    TE.tryCatch(
      () =>
        PushNotificationIOS.requestPermissions({
          alert: true,
          badge: true,
          sound: true
        }),
      E.toError
    ),
    TE.map(
      ({ authorizationStatus }) =>
        authorizationStatus === AuthorizationStatus.Authorized
    )
  );

const requestPermissionAndroid = () =>
  pipe(
    isAndroid7NougatAPI24OrMore,
    B.fold(successfulBooleanTaskEither, () =>
      pipe(
        TE.tryCatch(
          () =>
            PermissionsAndroid.request(
              PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
            ),
          E.toError
        ),
        TE.map(
          permissionStatus =>
            permissionStatus === PermissionsAndroid.RESULTS.GRANTED
        )
      )
    )
  );

export const requestNotificationPermissions = () =>
  pipe(
    isIos,
    B.fold(
      () => requestPermissionAndroid(),
      () => requestPermissioniOS()
    ),
    TE.getOrElse(() => T.of(false))
  )();
