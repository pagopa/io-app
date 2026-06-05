import * as Notifications from "expo-notifications";
import NotificationsUtils from "react-native-notifications-utils";
import {
  checkNotificationPermissions,
  generateInstallationId,
  generateTokenRegistrationTime,
  openSystemNotificationSettingsScreen,
  requestNotificationPermissions,
  testable
} from "..";
import * as analytics from "../../../../utils/analytics";

jest.mock("expo-notifications", () => ({
  IosAuthorizationStatus: {
    NOT_DETERMINED: 0,
    DENIED: 1,
    AUTHORIZED: 2,
    PROVISIONAL: 3,
    EPHEMERAL: 4
  },
  getPermissionsAsync: jest.fn(),
  requestPermissionsAsync: jest.fn(),
  cancelAllScheduledNotificationsAsync: jest.fn()
}));

const mockUUID = "1896a22a-978b-49e9-856b-1cd74f2de3d8";
jest.mock("uuid", () => ({ v4: () => mockUUID }));

beforeEach(() => {
  jest.resetAllMocks();
});

const NOTIFICATION_PERMISSION_CASES = [
  {
    name: "expo status is 'granted'",
    permissions: { granted: true, status: "granted" },
    expected: true
  },
  {
    name: "expo status is 'denied'",
    permissions: { granted: false, status: "denied" },
    expected: false
  },
  {
    name: "expo status is 'undetermined'",
    permissions: { granted: false, status: "undetermined" },
    expected: false
  },
  {
    name: "iOS status is AUTHORIZED",
    permissions: {
      granted: false,
      ios: { status: Notifications.IosAuthorizationStatus.AUTHORIZED }
    },
    expected: true
  },
  {
    name: "iOS status is DENIED",
    permissions: {
      granted: false,
      ios: { status: Notifications.IosAuthorizationStatus.DENIED }
    },
    expected: false
  },
  {
    name: "iOS status is NOT_DETERMINED",
    permissions: {
      granted: false,
      ios: { status: Notifications.IosAuthorizationStatus.NOT_DETERMINED }
    },
    expected: false
  },
  {
    name: "iOS status is PROVISIONAL",
    permissions: {
      granted: false,
      ios: { status: Notifications.IosAuthorizationStatus.PROVISIONAL }
    },
    expected: true
  },
  {
    name: "iOS status is EPHEMERAL",
    permissions: {
      granted: false,
      ios: { status: Notifications.IosAuthorizationStatus.EPHEMERAL }
    },
    expected: true
  },
  {
    name: "iOS status is undefined",
    permissions: { granted: false, ios: { status: undefined } },
    expected: false
  },
  {
    name: "ios property is absent",
    permissions: { granted: false },
    expected: false
  }
];

describe.each(NOTIFICATION_PERMISSION_CASES)(
  "when $name",
  ({ permissions, expected }) => {
    it(`checkNotificationPermissions returns ${expected}`, async () => {
      jest
        .spyOn(Notifications, "getPermissionsAsync")
        .mockResolvedValue(permissions as any);
      const result = await checkNotificationPermissions();
      expect(result).toBe(expected);
    });

    it(`requestNotificationPermissions returns ${expected}`, async () => {
      jest
        .spyOn(Notifications, "requestPermissionsAsync")
        .mockResolvedValue(permissions as any);
      const result = await requestNotificationPermissions();
      expect(result).toBe(expected);
    });

    it(`areNotificationsEnabled returns ${expected}`, () => {
      const result = testable!.areNotificationsEnabled(permissions as any);
      expect(result).toBe(expected);
    });
  }
);

describe("checkNotificationPermissions", () => {
  it("returns false and tracks error if getPermissionsAsync throws", async () => {
    const trackSpy = jest
      .spyOn(analytics, "trackAppCaughtError")
      .mockImplementation(() => undefined);
    jest
      .spyOn(Notifications, "getPermissionsAsync")
      .mockRejectedValue(new Error("Test error"));

    const result = await checkNotificationPermissions();

    expect(result).toBe(false);
    expect(trackSpy).toHaveBeenCalledWith(
      "checkNotificationPermissions",
      expect.stringContaining("exception thrown on"),
      expect.stringContaining("Test error")
    );
  });
});

describe("requestNotificationPermissions", () => {
  it("returns false and tracks error if requestPermissionsAsync throws", async () => {
    const trackSpy = jest
      .spyOn(analytics, "trackAppCaughtError")
      .mockImplementation(() => undefined);
    jest
      .spyOn(Notifications, "requestPermissionsAsync")
      .mockRejectedValue(new Error("Test rejection"));

    const result = await requestNotificationPermissions();

    expect(result).toBe(false);
    expect(trackSpy).toHaveBeenCalledWith(
      "requestNotificationPermissions",
      expect.stringContaining("exception thrown on"),
      expect.stringContaining("Test rejection")
    );
  });
});

describe("openSystemNotificationSettingsScreen", () => {
  it("calls NotificationUtils.openSettings()", () => {
    const spy = jest
      .spyOn(NotificationsUtils, "openSettings")
      .mockImplementation(() => undefined);
    expect(spy).toHaveBeenCalledTimes(0);
    openSystemNotificationSettingsScreen();
    expect(spy).toHaveBeenCalledTimes(1);
  });
});

describe("generateInstallationId", () => {
  it("returns a UUID without dashes prefixed with '001'", () => {
    const result = generateInstallationId();
    const noDashUUID = "1896a22a978b49e9856b1cd74f2de3d8";
    expect(result).toEqual(`001${noDashUUID}`);
  });
});

describe("generateTokenRegistrationTime", () => {
  afterEach(() => jest.useRealTimers());

  it("returns new Date().getTime()", () => {
    const d = new Date("2025-03-03T14:02:14+01:00");
    jest.useFakeTimers().setSystemTime(d);
    expect(generateTokenRegistrationTime()).toBe(d.getTime());
  });
});
