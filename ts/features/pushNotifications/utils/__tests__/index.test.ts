import { PermissionsAndroid, PermissionStatus } from "react-native";
import PushNotificationIOS, {
  AuthorizationStatus,
  PushNotificationPermissions
} from "@react-native-community/push-notification-ios";
import * as Sentry from "@sentry/react-native";
import PushNotification from "react-native-push-notification";
import NotificationsUtils from "react-native-notifications-utils";
import {
  AuthorizationStatus as AS,
  cancellAllLocalNotifications,
  checkNotificationPermissions,
  generateInstallationId,
  generateTokenRegistrationTime,
  openSystemNotificationSettingsScreen,
  requestNotificationPermissions
} from "..";

// This is needed since the library is mocked as an empty function
// at global jest setup (jestSetup.js). By overriding it here, we
// ensure that the 'checkPermissions' function exists and can be
// later spiedOn
jest.mock("@react-native-community/push-notification-ios", () => ({
  checkPermissions: (
    callback: (permissions: PushNotificationPermissions) => void
  ) => callback({}),
  requestPermissions: () => undefined
}));

// As above
jest.mock("@sentry/react-native", () => ({
  captureException: jest.fn(),
  captureMessage: jest.fn()
}));

// As above
const mockUUID = "1896a22a-978b-49e9-856b-1cd74f2de3d8";
jest.mock("uuid", () => ({ v4: () => mockUUID }));

// eslint-disable-next-line functional/no-let
let mockisIOS: boolean = false;
jest.mock("../../../../utils/platform", () => ({
  get isIos() {
    return mockisIOS;
  }
}));

const booleanOrUndefinedToFixedLengthString = (input: boolean | undefined) =>
  input !== undefined ? (input ? "true     " : "false    ") : "undefined";
const booleanToFixedLengthString = (input: boolean) =>
  input ? "true " : "false";

describe("AuthorizationStatus", () => {
  it("should match expected values", () => {
    expect(AS.Authorized).toBe(2);
    expect(AS.Ephemeral).toBe(4);
    expect(AS.NotDetermined).toBe(0);
    expect(AS.Provisional).toBe(3);
    expect(AS.StatusDenied).toBe(1);
  });
});

const testCheckNotificationPermissionsThrowsiOS = () => {
  it("should return 'false' if the library throws on iOS", async () => {
    mockisIOS = true;
    jest
      .spyOn(PushNotificationIOS, "checkPermissions")
      .mockImplementation(_fn => {
        throw Error("Test error");
      });

    const hasPermission = await checkNotificationPermissions();

    expect(Sentry.captureException).toHaveBeenCalledTimes(1);
    expect(Sentry.captureException).toHaveBeenCalledWith(Error("Test error"));

    expect(Sentry.captureMessage).toHaveBeenCalledTimes(1);
    expect(Sentry.captureMessage).toHaveBeenCalledWith(
      "[PushNotifications] 'checkNotificationPermissions' has thrown an exception on iOS"
    );

    expect(hasPermission).toBe(false);
  });
};

const testCheckNotificationPermissionsThrowsAndroid = () => {
  it("should return 'false' if the library throws on Android", async () => {
    mockisIOS = false;
    jest.spyOn(PushNotification, "checkPermissions").mockImplementation(_fn => {
      throw Error("Test error");
    });

    const hasPermission = await checkNotificationPermissions();

    expect(Sentry.captureException).toHaveBeenCalledTimes(1);
    expect(Sentry.captureException).toHaveBeenCalledWith(Error("Test error"));
    expect(Sentry.captureMessage).toHaveBeenCalledTimes(1);
    expect(Sentry.captureMessage).toHaveBeenCalledWith(
      "[PushNotifications] 'checkNotificationPermissions' has thrown an exception on Android"
    );

    expect(hasPermission).toBe(false);
  });
};

describe("checkNotificationPermissions", () => {
  beforeEach(() => {
    jest.resetAllMocks();
    jest.clearAllMocks();
  });
  [false, true].forEach(isIOS =>
    [undefined, false, true].forEach(alertValue =>
      [undefined, false, true].forEach(badgeValue =>
        [undefined, false, true].forEach(soundValue => {
          if (isIOS) {
            [undefined, false, true].forEach(lockScreenValue =>
              [undefined, false, true].forEach(notificationCenterValue =>
                [
                  undefined,
                  0,
                  1,
                  2,
                  3,
                  4 // ephemeral, not mapped in the library, see https://developer.apple.com/documentation/usernotifications/unauthorizationstatus/ephemeral
                ].forEach(authorizationStatusValue => {
                  const expectedValue =
                    authorizationStatusValue !== undefined &&
                    authorizationStatusValue !== 0 &&
                    authorizationStatusValue !== 1;
                  it(`on iOS    , should return '${booleanToFixedLengthString(
                    expectedValue
                  )}' when callback input object is '{ alert: ${booleanOrUndefinedToFixedLengthString(
                    alertValue
                  )}, badge: ${booleanOrUndefinedToFixedLengthString(
                    badgeValue
                  )}, sound: ${booleanOrUndefinedToFixedLengthString(
                    soundValue
                  )}, lockScreen: ${booleanOrUndefinedToFixedLengthString(
                    lockScreenValue
                  )}, notificationCenter: ${booleanOrUndefinedToFixedLengthString(
                    notificationCenterValue
                  )}, authorizationStatus: ${authorizationStatusValue}}'`, async () => {
                    mockisIOS = isIOS;
                    jest
                      .spyOn(PushNotificationIOS, "checkPermissions")
                      .mockImplementation(fn =>
                        fn({
                          alert: alertValue,
                          badge: badgeValue,
                          sound: soundValue,
                          lockScreen: lockScreenValue,
                          notificationCenter: notificationCenterValue,
                          authorizationStatus:
                            authorizationStatusValue as unknown as AuthorizationStatus[keyof AuthorizationStatus]
                        })
                      );

                    const hasPermission = await checkNotificationPermissions();

                    expect(hasPermission).toBe(expectedValue);
                  });
                })
              )
            );
          } else {
            it(`on Android, should return '${booleanToFixedLengthString(
              !!alertValue
            )}' when callback input object is '{ alert: ${booleanOrUndefinedToFixedLengthString(
              alertValue
            )}, badge: ${booleanOrUndefinedToFixedLengthString(
              badgeValue
            )}, sound: ${booleanOrUndefinedToFixedLengthString(
              soundValue
            )} }'`, async () => {
              mockisIOS = isIOS;
              jest
                .spyOn(PushNotification, "checkPermissions")
                .mockImplementation(fn =>
                  fn({
                    alert: alertValue,
                    badge: badgeValue,
                    sound: soundValue
                  })
                );
              const hasPermission = await checkNotificationPermissions();
              expect(hasPermission).toBe(!!alertValue);
            });
          }
        })
      )
    )
  );
  testCheckNotificationPermissionsThrowsiOS();
  testCheckNotificationPermissionsThrowsAndroid();
});

const testRequestNotificationPermissionsOniOS = () => {
  [
    undefined,
    0,
    1,
    2,
    3,
    4 // ephemeral, not mapped in the library, see https://developer.apple.com/documentation/usernotifications/unauthorizationstatus/ephemeral
  ].forEach(authorizationStatus => {
    const expectedResult = authorizationStatus === AS.Authorized;
    it(`on iOS    , should return '${booleanToFixedLengthString(
      expectedResult
    )}' when authorization status is '${authorizationStatus}'`, async () => {
      mockisIOS = true;
      jest.spyOn(PushNotificationIOS, "requestPermissions").mockImplementation(
        permissions =>
          new Promise<PushNotificationPermissions>((resolve, reject) => {
            if (
              permissions === undefined ||
              permissions.constructor === Array
            ) {
              reject("Bad instance type");
              return;
            }
            const permission = permissions as PushNotificationPermissions;
            if (!permission.alert || !permission.badge || !permission.sound) {
              reject("Bad input parameter");
              return;
            }
            resolve({
              alert: true,
              badge: true,
              sound: true,
              lockScreen: true,
              notificationCenter: true,
              authorizationStatus:
                authorizationStatus as unknown as AuthorizationStatus[keyof AuthorizationStatus]
            });
          })
      );

      const permissionHasBeenGiven = await requestNotificationPermissions();

      expect(Sentry.captureException).toHaveBeenCalledTimes(0);
      expect(Sentry.captureMessage).toHaveBeenCalledTimes(0);
      expect(permissionHasBeenGiven).toBe(expectedResult);
    });
  });
};

const testRequestNotificationPermissionsOnAndroid = () => {
  [
    "granted" as PermissionStatus,
    "denied" as PermissionStatus,
    "never_ask_again" as PermissionStatus
  ].forEach(permissionStatus => {
    const expectedResult = permissionStatus === "granted";
    it(`on Android, should return '${booleanToFixedLengthString(
      expectedResult
    )}' when permission result is '${permissionStatus}'`, async () => {
      mockisIOS = false;
      jest.spyOn(PermissionsAndroid, "request").mockImplementation(
        (requestedPermission, _) =>
          new Promise<PermissionStatus>((resolve, reject) => {
            if (
              requestedPermission !==
              PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
            ) {
              reject("Wrong permission asked");
              return;
            }
            resolve(permissionStatus);
          })
      );

      const permissionHasBeenGiven = await requestNotificationPermissions();

      expect(Sentry.captureException).toHaveBeenCalledTimes(0);
      expect(Sentry.captureMessage).toHaveBeenCalledTimes(0);
      expect(permissionHasBeenGiven).toBe(expectedResult);
    });
  });
};

const testRequestNotificationPermissionsOniOSThrows = () => {
  it("should throw on iOS     if the internal promise is rejected and return 'false'", async () => {
    mockisIOS = true;
    jest.spyOn(PushNotificationIOS, "requestPermissions").mockImplementation(
      _permissions =>
        new Promise<PushNotificationPermissions>((_resolve, reject) => {
          reject("Test rejection");
        })
    );

    const permissionHasBeenGiven = await requestNotificationPermissions();

    expect(Sentry.captureException).toHaveBeenCalledTimes(1);
    expect(Sentry.captureException).toHaveBeenCalledWith("Test rejection");

    expect(Sentry.captureMessage).toHaveBeenCalledTimes(1);
    expect(Sentry.captureMessage).toHaveBeenCalledWith(
      "[PushNotifications] 'requestNotificationPermissions' has thrown an exception on iOS"
    );

    expect(permissionHasBeenGiven).toBe(false);
  });
};

const testRequestNotificationPermissionsOnAndroidThrows = () => {
  it("should throw on Android if the internal promise is rejected and return 'false'", async () => {
    mockisIOS = false;
    jest.spyOn(PermissionsAndroid, "request").mockImplementation(
      (_requestedPermission, _) =>
        new Promise<PermissionStatus>((_resolve, reject) => {
          reject("Test rejection");
        })
    );

    const permissionHasBeenGiven = await requestNotificationPermissions();

    expect(Sentry.captureException).toHaveBeenCalledTimes(1);
    expect(Sentry.captureException).toHaveBeenCalledWith("Test rejection");

    expect(Sentry.captureMessage).toHaveBeenCalledTimes(1);
    expect(Sentry.captureMessage).toHaveBeenCalledWith(
      "[PushNotifications] 'requestNotificationPermissions' has thrown an exception on Android"
    );

    expect(permissionHasBeenGiven).toBe(false);
  });
};

describe("requestNotificationPermissions", () => {
  beforeEach(() => {
    jest.resetAllMocks();
    jest.clearAllMocks();
  });
  testRequestNotificationPermissionsOniOS();
  testRequestNotificationPermissionsOnAndroid();
  testRequestNotificationPermissionsOniOSThrows();
  testRequestNotificationPermissionsOnAndroidThrows();
});

describe("cancellAllLocalNotifications", () => {
  it("should call 'PushNotification.cancelAllLocalNotifications()'", () => {
    const cancellAllLocalNotificationsMock = jest
      .spyOn(PushNotification, "cancelAllLocalNotifications")
      .mockImplementation(() => undefined);

    cancellAllLocalNotifications();

    expect(cancellAllLocalNotificationsMock.mock.calls.length).toBe(1);
  });
});

describe("generateInstallationId", () => {
  it("should return an UUID without dashes, prefixed with '001'", () => {
    const generatedUUID = generateInstallationId();

    const noDashUUID = "1896a22a978b49e9856b1cd74f2de3d8";
    expect(generatedUUID).toEqual(`001${noDashUUID}`);
  });
});

describe("openSystemNotificationSettingsScreen", () => {
  it("should call NotificationsUtils.openSettings with proper parameters", () => {
    const openSettingsSpy = jest
      .spyOn(NotificationsUtils, "openSettings")
      .mockImplementation(_channelId => undefined);
    openSystemNotificationSettingsScreen();
    expect(openSettingsSpy.mock.calls.length).toBe(1);
    expect(openSettingsSpy.mock.calls[0].length).toBe(0);
  });
});

describe("generateTokenRegistrationTime", () => {
  it("should return 'new Date().getTime()'s value", () => {
    const generationDate = new Date("2025-03-03T14:02:14+01:00");
    jest.useFakeTimers().setSystemTime(generationDate);
    const tokenRegistrationTime = generateTokenRegistrationTime();
    expect(tokenRegistrationTime).toBe(generationDate.getTime());
    jest.useRealTimers();
  });
});
