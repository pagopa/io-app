import PushNotificationIOS, {
  AuthorizationStatus,
  PushNotificationPermissions
} from "@react-native-community/push-notification-ios";
import PushNotification from "react-native-push-notification";
import NotificationsUtils from "react-native-notifications-utils";
import * as index from "..";

// This is needed since the library is mocked as an empty function
// at global jest setup (jestSetup.js). By overriding it here, we
// ensure that the 'checkPermissions' function exists and can be
// later spiedOn
jest.mock("@react-native-community/push-notification-ios", () => ({
  checkPermissions: (
    callback: (permissions: PushNotificationPermissions) => void
  ) => callback({})
}));

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
    expect(index.AuthorizationStatus.Authorized).toBe(2);
    expect(index.AuthorizationStatus.Ephemeral).toBe(4);
    expect(index.AuthorizationStatus.NotDetermined).toBe(0);
    expect(index.AuthorizationStatus.Provisional).toBe(3);
    expect(index.AuthorizationStatus.StatusDenied).toBe(1);
  });
});

describe("openSystemNotificationSettingsScreen", () => {
  it("should call NotificationsUtils.openSettings with proper parameters", () => {
    const openSettingsSpy = jest
      .spyOn(NotificationsUtils, "openSettings")
      .mockImplementation(_channelId => undefined);
    index.openSystemNotificationSettingsScreen();
    expect(openSettingsSpy.mock.calls.length).toBe(1);
    expect(openSettingsSpy.mock.calls[0].length).toBe(0);
  });
});

describe("checkPermissionAndroid", () => {
  beforeEach(() => {
    jest.resetAllMocks();
    jest.clearAllMocks();
  });
  [undefined, false, true].forEach(alertValue =>
    [undefined, false, true].forEach(badgeValue =>
      [undefined, false, true].forEach(soundValue =>
        it(`should return '${booleanToFixedLengthString(
          !!alertValue
        )}' when callback input object is '{ alert: ${booleanOrUndefinedToFixedLengthString(
          alertValue
        )}, badge: ${booleanOrUndefinedToFixedLengthString(
          badgeValue
        )}, sound: ${booleanOrUndefinedToFixedLengthString(
          soundValue
        )} }'`, async () => {
          jest
            .spyOn(PushNotification, "checkPermissions")
            .mockImplementation(fn =>
              fn({ alert: alertValue, badge: badgeValue, sound: soundValue })
            );
          const hasPermission = await index.checkPermissionAndroid();
          expect(hasPermission).toBe(!!alertValue);
        })
      )
    )
  );
});

describe("checkPermissioniOS", () => {
  beforeEach(() => {
    jest.resetAllMocks();
    jest.clearAllMocks();
  });
  [undefined, false, true].forEach(alertValue =>
    [undefined, false, true].forEach(badgeValue =>
      [undefined, false, true].forEach(soundValue =>
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
              it(`should return '${booleanToFixedLengthString(
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
                const hasPermission = await index.checkPermissioniOS();
                expect(hasPermission).toBe(expectedValue);
              });
            })
          )
        )
      )
    )
  );
});

describe("checkNotificationPermissions", () => {
  beforeEach(() => {
    jest.resetAllMocks();
    jest.clearAllMocks();
  });
  [false, true].forEach(isIOS => {
    [false, true].forEach(hasPermission =>
      it(`should return ${booleanToFixedLengthString(hasPermission)} when on ${
        isIOS ? "iOS    " : "Android"
      }`, async () => {
        mockisIOS = isIOS;
        jest
          .spyOn(index, "checkPermissionAndroid")
          .mockImplementation(
            () =>
              new Promise<boolean>(resolve =>
                resolve(isIOS ? !hasPermission : hasPermission)
              )
          );
        jest
          .spyOn(index, "checkPermissioniOS")
          .mockImplementation(
            () =>
              new Promise<boolean>(resolve =>
                resolve(isIOS ? hasPermission : !hasPermission)
              )
          );
        const value = await index.checkNotificationPermissions();
        expect(value).toBe(hasPermission);
      })
    );
  });
});
