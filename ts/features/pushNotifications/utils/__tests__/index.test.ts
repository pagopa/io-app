import { Linking } from "react-native";
import * as Notifications from "expo-notifications";
import * as analytics from "../../../../utils/analytics";
import {
  cancellAllLocalNotifications,
  checkNotificationPermissions,
  generateInstallationId,
  generateTokenRegistrationTime,
  openSystemNotificationSettingsScreen,
  requestNotificationPermissions
} from "..";

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

describe("checkNotificationPermissions", () => {
  it.each([
    {
      name: "expo status is 'granted'",
      response: { granted: true, status: "granted" },
      expected: true
    },
    {
      name: "expo status is 'denied'",
      response: { granted: false, status: "denied" },
      expected: false
    },
    {
      name: "expo status is 'undetermined'",
      response: { granted: false, status: "undetermined" },
      expected: false
    },
    {
      name: "iOS status is AUTHORIZED",
      response: {
        granted: false,
        ios: { status: Notifications.IosAuthorizationStatus.AUTHORIZED }
      },
      expected: true
    },
    {
      name: "iOS status is DENIED",
      response: {
        granted: false,
        ios: { status: Notifications.IosAuthorizationStatus.DENIED }
      },
      expected: false
    },
    {
      name: "iOS status is NOT_DETERMINED",
      response: {
        granted: false,
        ios: { status: Notifications.IosAuthorizationStatus.NOT_DETERMINED }
      },
      expected: false
    }
  ])("returns $expected when $name", async ({ response, expected }) => {
    jest
      .spyOn(Notifications, "getPermissionsAsync")
      .mockResolvedValue(response as any);
    const result = await checkNotificationPermissions();
    expect(result).toBe(expected);
  });

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
  it.each([
    {
      name: "expo status is 'granted'",
      response: { granted: true, status: "granted" },
      expected: true
    },
    {
      name: "expo status is 'denied'",
      response: { granted: false, status: "denied" },
      expected: false
    },
    {
      name: "iOS status is AUTHORIZED",
      response: {
        granted: false,
        ios: { status: Notifications.IosAuthorizationStatus.AUTHORIZED }
      },
      expected: true
    }
  ])("returns $expected when $name", async ({ response, expected }) => {
    jest
      .spyOn(Notifications, "requestPermissionsAsync")
      .mockResolvedValue(response as any);
    const result = await requestNotificationPermissions();
    expect(result).toBe(expected);
  });

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

describe("cancellAllLocalNotifications", () => {
  it("calls Notifications.cancelAllScheduledNotificationsAsync()", async () => {
    const spy = jest
      .spyOn(Notifications, "cancelAllScheduledNotificationsAsync")
      .mockResolvedValue(undefined);
    await cancellAllLocalNotifications();
    expect(spy).toHaveBeenCalledTimes(1);
  });
});

describe("openSystemNotificationSettingsScreen", () => {
  it("calls Linking.openSettings()", () => {
    const spy = jest
      .spyOn(Linking, "openSettings")
      .mockResolvedValue(undefined);
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
